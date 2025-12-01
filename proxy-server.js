// proxy-server.js
// Reverse proxy that rewrites HTML to force navigation through the proxy
// DISCLAIMER: Use responsibly. Do not run as an open proxy on the public internet.

const express = require('express');
const fetch = require('node-fetch'); // v2
const cheerio = require('cheerio');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic logging
app.use(morgan('tiny'));

// Basic security headers for our server (not the proxied site)
app.use(helmet({
  contentSecurityPolicy: false // we'll serve proxied HTML and don't want helmet to conflict
}));

// Simple rate limiter — tweak as needed
const limiter = rateLimit({
  windowMs: 10 * 1000, // 10s window
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many requests, slow down.'
});
app.use(limiter);

// Small helper: encode/decode url -> base64url
const enc = (s) => Buffer.from(s).toString('base64url');
const dec = (s) => Buffer.from(s, 'base64url').toString();

// NO LOGIN REQUIRED
const requireKey = (req, res, next) => {
  next();
};

// Sanitize function for attributes (quick)
function sanitizeAttr(val) {
  if (!val) return val;
  return val.replace(/javascript:/gi, '');
}

// Helper to resolve relative URLs against a base
function resolveUrl(base, link) {
  try {
    return new URL(link, base).toString();
  } catch (e) {
    return link;
  }
}

// Helper to rewrite a single URL for the proxy
function rewriteUrl(base, url) {
    try {
        const abs = resolveUrl(base, url);
        return `/proxy?u=${enc(abs)}`;
    } catch(e) {
        return url;
    }
}

// Main proxy route: /proxy?u=<base64url>
app.get('/proxy', requireKey, async (req, res) => {
  const u = req.query.u;
  if (!u) return res.status(400).send('Missing u parameter (base64url)');

  let target;
  try {
    target = dec(u);
  } catch (e) {
    return res.status(400).send('Invalid u parameter (base64url expected)');
  }

  // Basic URL validation
  let targetUrl;
  try {
    targetUrl = new URL(target);
  } catch (e) {
    return res.status(400).send('Invalid target URL');
  }

  // Optional: block dangerous schemes
  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return res.status(400).send('Unsupported protocol');
  }

  // Build headers to look like a real browser (Fixes 403s)
  const fetchHeaders = {
    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': req.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.9',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  };

  // Forward cookie header if present
  if (req.headers.cookie) {
    fetchHeaders['Cookie'] = req.headers.cookie;
  } 
  // Inject Google Consent Cookie to avoid redirects/blocks if no cookie exists
  else if (targetUrl.hostname.includes('google.com')) {
    fetchHeaders['Cookie'] = 'CONSENT=YES+'; 
  }

  // Optional: forward referer as the proxy domain (or original referer)
  if (req.query.ref) {
    fetchHeaders['Referer'] = req.query.ref;
  } else {
    // Some sites block requests with different referers, some block empty.
    // Sending the target itself is usually safest for "direct" access simulation.
    fetchHeaders['Referer'] = target;
  }

  try {
    // fetch remote resource
    const upstream = await fetch(target, {
      method: 'GET',
      headers: fetchHeaders,
      redirect: 'manual', // handle redirects ourselves
      compress: true
    });

    // Forward Set-Cookie headers (CRITICAL FOR LOGIN)
    // node-fetch v2 handles raw headers via upstream.headers.raw()
    const setCookie = upstream.headers.raw()['set-cookie'];
    if (setCookie) {
        res.setHeader('Set-Cookie', setCookie.map(c => {
            // Optional: Rewrite cookie domain/path if strictly necessary, 
            // but often browsers handle it if we are on same origin or just rely on the proxy.
            // For simple proxying, forwarding might be enough if the client respects it.
            // We might need to strip 'Secure' if we are on http, or 'Domain'.
            return c.replace(/Domain=[^;]*;/gi, '').replace(/Secure/gi, ''); 
        }));
    }

    // If remote sent a redirect location, rewrite it to our proxy so navigation stays inside
    if (upstream.status >= 300 && upstream.status < 400) {
      const loc = upstream.headers.get('location');
      if (loc) {
        const absolute = resolveUrl(target, loc);
        const prox = `/proxy?u=${enc(absolute)}`;
        res.status(upstream.status);
        res.setHeader('Location', prox);
        return res.send(`Redirecting via proxy to ${prox}`);
      }
    }

    // Relay content-type
    const contentType = upstream.headers.get('content-type') || '';

    // For HTML: parse and rewrite
    if (contentType.includes('text/html')) {
      let body = await upstream.text();

      // Load into cheerio
      const $ = cheerio.load(body, { decodeEntities: false });

      // Remove or neutralize frame-busting headers/meta
      $('meta[http-equiv="Content-Security-Policy"]').each((i, el) => {
        $(el).remove();
      });

      $('script').each((i, el) => {
        const script = $(el).html() || '';
        if (/frameElement|parent.location|top.location|window.top|X-Frame-Options/i.test(script)) {
          $(el).remove();
        }
      });

      // Rewrite all anchors to route via proxy
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        if (href.startsWith('mailto:') || href.startsWith('javascript:') || href.startsWith('#')) {
          $(el).attr('href', sanitizeAttr(href));
          return;
        }
        try {
          const abs = resolveUrl(target, href);
          const prox = `/proxy?u=${enc(abs)}`;
          $(el).attr('href', prox);
          $(el).attr('target', '_self'); // keep inside frame
        } catch (e) {
          // ignore
        }
      });

      // Rewrite forms to submit through proxy (GET only)
      $('form').each((i, el) => {
        const action = $(el).attr('action') || '';
        try {
          const abs = resolveUrl(target, action || target);
          const prox = `/proxy?u=${enc(abs)}`;
          $(el).attr('action', prox);
          // Keep original method if possible, but our proxy is GET only primarily.
          // For login forms (POST), this simple proxy might fail. 
          // However, we enforce GET which breaks login.
          // LET'S ALLOW POST by NOT forcing GET, but the proxy route is GET.
          // So we actually convert POST to GET for the proxy? No, that breaks login.
          // Login fix: Force GET for now as we don't support POST proxying yet.
          $(el).attr('method', 'GET'); 
        } catch (e) {}
      });

      // Rewrite resource URLs: images, scripts, stylesheets
      $('img').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
           $(el).attr('src', rewriteUrl(target, src));
        }
        
        // Handle srcset for responsive images
        const srcset = $(el).attr('srcset');
        if (srcset) {
            const newSrcset = srcset.split(',').map(part => {
                const [url, desc] = part.trim().split(/\s+/);
                if (url) {
                    return `${rewriteUrl(target, url)} ${desc || ''}`;
                }
                return part;
            }).join(', ');
            $(el).attr('srcset', newSrcset);
        }
      });

      $('link[rel="stylesheet"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href) $(el).attr('href', rewriteUrl(target, href));
      });
      
      $('script').each((i, el) => {
        const src = $(el).attr('src');
        if (src) $(el).attr('src', rewriteUrl(target, src));
      });

      // Remove X-Frame-Options meta tags
      $('meta').each((i, el) => {
        const httpEq = $(el).attr('http-equiv') || '';
        if (/x-frame-options/i.test(httpEq)) {
          $(el).remove();
        }
      });

      // Basic injection: add a small header
      $('body').prepend(`<div style="background:#111;color:#888;padding:4px 8px;font-size:11px;border-bottom:1px solid #333;text-align:center;font-family:monospace;">
        Secure View: ${targetUrl.hostname}
      </div>`);

      // Return rewritten HTML
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send($.html());
    }

    // For non-HTML content: stream it back with original content-type and most headers
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);

    const cl = upstream.headers.get('content-length');
    if (cl) res.setHeader('Content-Length', cl);

    const upstreamBody = upstream.body;
    upstreamBody.pipe(res);
  } catch (err) {
    console.error('Proxy error:', err && err.stack ? err.stack : err);
    res.status(502).send('Proxy fetch error');
  }
});

// Small helper page to generate proxied links easily
app.get('/', (req, res) => {
  res.send(`
    <h3>Proxy Server</h3>
    <p>Use <code>/proxy?u=BASE64URL</code></p >
    <form onsubmit="event.preventDefault(); go()">
      <input id="url" style="width:60%" placeholder="https://example.com"/>
      <button type="submit">Open via proxy</button>
    </form>
    <script>
      function go(){
        const u = btoa(unescape(encodeURIComponent(document.getElementById('url').value)));
        window.location.href = '/proxy?u=' + u;
      }
    </script>
  `);
});

app.listen(PORT, () => {
  console.log('Proxy server running on port', PORT);
});