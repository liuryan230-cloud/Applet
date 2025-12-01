

export type GameCategory = 'Featured' | 'Shooter' | 'Driving' | 'Multiplayer' | 'Puzzle' | 'Arcade';

export interface Game {
  id: string;
  name: string;
  description: string;
  url: string;
  color: string;
  useProxy?: boolean;
  category: GameCategory;
}

const colorPalettes = [
  'from-red-600 to-orange-600',
  'from-orange-500 to-yellow-500',
  'from-yellow-500 to-lime-500',
  'from-lime-500 to-green-600',
  'from-green-600 to-emerald-600',
  'from-emerald-600 to-teal-600',
  'from-teal-600 to-cyan-600',
  'from-cyan-600 to-sky-600',
  'from-sky-600 to-blue-600',
  'from-blue-600 to-indigo-600',
  'from-indigo-600 to-violet-600',
  'from-violet-600 to-purple-600',
  'from-purple-600 to-fuchsia-600',
  'from-fuchsia-600 to-pink-600',
  'from-pink-600 to-rose-600',
  'from-rose-600 to-red-600',
  'from-slate-600 to-gray-600',
  'from-gray-600 to-zinc-600',
  'from-zinc-600 to-neutral-600',
  'from-stone-600 to-red-900',
  'from-indigo-800 to-purple-800',
  'from-blue-800 to-cyan-800',
  'from-teal-800 to-emerald-800',
];

const getRandomColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalettes.length;
    return colorPalettes[index];
};

const createGame = (id: string, name: string, description: string, url: string, category: GameCategory, useProxy = true): Game => ({
    id,
    name,
    description,
    url,
    category,
    color: getRandomColor(id),
    useProxy
});

export const GAMES_LIST: Game[] = [
    // --- FEATURED ---
    createGame('clashroyale_web', 'Clash Royale', 'Playable Scratch Version', 'https://scratch.mit.edu/projects/113880860/embed', 'Featured', false),
    createGame('minecraft', 'Minecraft Classic', 'The original browser version', 'https://classic.minecraft.net/', 'Featured'),
    createGame('geometrydash', 'Geometry Dash', 'Rhythm-based action platformer', 'https://geometry-dash.co/', 'Featured'),
    createGame('monkeymart', 'Monkey Mart', 'Manage your own supermarket', 'https://poki.com/en/g/monkey-mart', 'Featured'),
    createGame('polytrack', 'Poly Track', 'Fast-paced low-poly racing', 'https://polytrack.gg/', 'Featured'),
    createGame('eggycar', 'Eggy Car', 'Don\'t break the egg!', 'https://eggycar.github.io/', 'Featured'),
    createGame('digdig', 'DigDig.io', 'Dig to grow bigger', 'https://digdig.io/', 'Featured'),
    createGame('eaglercraft', 'Eaglercraft', 'Minecraft 1.8 in browser', 'https://launcher.eaglercraft.ru/', 'Featured'),
    createGame('slope', 'Slope', 'Roll down the infinite city', 'https://slopegame.com/', 'Featured'),
    createGame('subwaysurfers', 'Subway Surfers', 'Run on the tracks', 'https://poki.com/en/g/subway-surfers', 'Featured'),

    // --- SHOOTERS & ACTION ---
    createGame('1v1lol', '1v1.LOL', 'Building and shooting sim', 'https://1v1.lol/', 'Shooter'),
    createGame('krunker', 'Krunker.io', 'Pixel fast-paced FPS', 'https://krunker.io/', 'Shooter'),
    createGame('shellshockers', 'Shell Shockers', 'Egg-based shooter', 'https://shellshock.io/', 'Shooter'),
    createGame('smashkarts', 'Smash Karts', 'Kart battle arena', 'https://smashkarts.io/', 'Shooter'),
    createGame('evio', 'Ev.io', 'Futuristic HALO shooter', 'https://ev.io/', 'Shooter'),
    createGame('venge', 'Venge.io', 'Objective FPS', 'https://venge.io/', 'Shooter'),
    createGame('bulletforce', 'Bullet Force', 'Multiplayer FPS', 'https://www.crazygames.com/game/bullet-force-multiplayer', 'Shooter'),
    createGame('combatonline', 'Combat Online', 'Tactical shooter', 'https://combat5.com/', 'Shooter'),
    createGame('forwardassault', 'Forward Assault', 'Counter-Strike style FPS', 'https://www.crazygames.com/game/forward-assault', 'Shooter'),
    createGame('maskedforces', 'Masked Forces', 'Survival shooter', 'https://www.crazygames.com/game/masked-forces', 'Shooter'),
    createGame('stickmerge', 'Stick Merge', 'Merge guns and shoot', 'https://poki.com/en/g/stick-merge', 'Shooter'),
    createGame('timeshooter', 'Time Shooter', 'Time moves when you move', 'https://poki.com/en/g/time-shooter-2', 'Shooter'),
    createGame('recoil', 'Recoil', 'Kill with recoil', 'https://poki.com/en/g/recoil', 'Shooter'),
    createGame('funnyshooter', 'Funny Shooter 2', 'Shoot the funny guys', 'https://poki.com/en/g/funny-shooter-2', 'Shooter'),
    createGame('pixelwarfare', 'Pixel Warfare', 'Blocky FPS', 'https://www.crazygames.com/game/pixel-warfare', 'Shooter'),
    createGame('repuls', 'Repuls.io', 'Vehicle combat', 'https://repuls.io/', 'Shooter'),
    createGame('miniroyale', 'Mini Royale', 'Battle royale', 'https://miniroyale.io/', 'Shooter'),
    createGame('zombsroyale', 'Zombs Royale', '2D battle royale', 'https://zombsroyale.io/', 'Shooter'),
    createGame('rooftopsnipers', 'Rooftop Snipers', 'Chaotic duels', 'https://rooftopsnipers.io/', 'Shooter'),
    createGame('getawayshootout', 'Getaway Shootout', 'Race to the chopper', 'https://getawayshootout.com/', 'Shooter'),
    createGame('stickmanhook', 'Stickman Hook', 'Swing through levels', 'https://stickmanhook.io/', 'Shooter'),
    createGame('superhot', 'SUPERHOT', 'Prototype version', 'https://superhotgame.com/play-prototype/', 'Shooter'),
    createGame('doom', 'DOOM', 'Classic 1993 FPS', 'https://js-dos.com/games/doom.exe.html', 'Shooter'),
    createGame('cs16', 'CS 1.6', 'Counter-Strike Web', 'https://play-cs.com/', 'Shooter'),
    createGame('appleshooter', 'Apple Shooter', 'Don\'t hit the friend', 'https://poki.com/en/g/apple-shooter', 'Shooter'),
    createGame('raftwars', 'Raft Wars', 'Turn based shooting', 'https://poki.com/en/g/raft-wars', 'Shooter'),
    createGame('raftwars2', 'Raft Wars 2', 'More raft battles', 'https://poki.com/en/g/raft-wars-2', 'Shooter'),
    createGame('templeofboom', 'Temple of Boom', 'Platform shooter', 'https://poki.com/en/g/temple-of-boom', 'Shooter'),
    createGame('baconmaydie', 'Bacon May Die', 'Fighting pig', 'https://poki.com/en/g/bacon-may-die', 'Shooter'),
    createGame('iron_snout', 'Iron Snout', 'Wolf fighting', 'https://poki.com/en/g/iron-snout', 'Shooter'),
    createGame('stickman_fighter', 'Stickman Fighter', 'Epic battles', 'https://poki.com/en/g/stickman-fighter-epic-battle', 'Shooter'),
    createGame('sniper3d', 'Sniper 3D', 'Target practice', 'https://poki.com/en/g/sniper-code-2', 'Shooter'),
    createGame('narrow_one', 'Narrow.one', 'Archery FPS', 'https://narrow.one/', 'Shooter'),
    createGame('voxiom', 'Voxiom.io', 'Voxel FPS', 'https://voxiom.io/', 'Shooter'),

    // --- DRIVING ---
    createGame('drivemad', 'Drive Mad', 'Physics puzzle driving', 'https://poki.com/en/g/drive-mad', 'Driving'),
    createGame('motox3m', 'Moto X3M', 'Bike racing stunts', 'https://poki.com/en/g/moto-x3m', 'Driving'),
    createGame('drift_hunters', 'Drift Hunters', 'High quality drifting', 'https://www.crazygames.com/game/drift-hunters', 'Driving'),
    createGame('madalin_stunt_cars', 'Madalin Stunt Cars', 'Multiplayer stunts', 'https://www.crazygames.com/game/madalin-stunt-cars-2', 'Driving'),
    createGame('city_car_driving', 'City Car Driving', 'Realistic simulator', 'https://www.crazygames.com/game/city-car-driving-stunt-master', 'Driving'),
    createGame('hillclimb', 'Hill Climb Racing', 'Physics driving', 'https://poki.com/en/g/hill-climb-racing', 'Driving'),
    createGame('traffic_tour', 'Traffic Tour', 'Highway racing', 'https://poki.com/en/g/traffic-tour', 'Driving'),
    createGame('top_speed', 'Top Speed 3D', 'Drag racing', 'https://poki.com/en/g/top-speed-3d', 'Driving'),
    createGame('cyber_cars', 'Cyber Cars Punk', 'Futuristic racing', 'https://poki.com/en/g/cyber-cars-punk-racing', 'Driving'),
    createGame('crazy_cars', 'Crazy Cars', 'Arcade racing', 'https://poki.com/en/g/crazy-cars', 'Driving'),
    createGame('tiny_cars', 'Tiny Cars', 'Traffic management', 'https://poki.com/en/g/tiny-cars', 'Driving'),
    createGame('parking_fury', 'Parking Fury 3D', 'Night city parking', 'https://poki.com/en/g/parking-fury-3d-night-thief', 'Driving'),
    createGame('burnout_drift', 'Burnout Drift', 'Drift mechanics', 'https://www.crazygames.com/game/burnout-drift', 'Driving'),
    createGame('kart_wars', 'Kart Wars', 'Mario Kart style .io', 'https://kartwars.io/', 'Driving'),

    // --- MULTIPLAYER & IO ---
    createGame('agar', 'Agar.io', 'Eat cells to grow', 'https://agar.io/', 'Multiplayer'),
    createGame('slither', 'Slither.io', 'Snake multiplayer', 'http://slither.io/', 'Multiplayer'),
    createGame('paperio2', 'Paper.io 2', 'Conquer territory', 'https://paper-io.com/', 'Multiplayer'),
    createGame('hole', 'Hole.io', 'Consume the city', 'https://hole-io.com/', 'Multiplayer'),
    createGame('diep', 'Diep.io', 'Tank upgrades battle', 'https://diep.io/', 'Multiplayer'),
    createGame('surviv', 'Surviv.io', '2D Battle Royale', 'https://surviv.io/', 'Multiplayer'),
    createGame('moomoo', 'MooMoo.io', 'Gather and build', 'https://moomoo.io/', 'Multiplayer'),
    createGame('starve', 'Starve.io', 'Survival io', 'https://starve.io/', 'Multiplayer'),
    createGame('devast', 'Devast.io', 'Post-apocalyptic survival', 'https://devast.io/', 'Multiplayer'),
    createGame('wings', 'Wings.io', 'Plane dogfights', 'https://wings.io/', 'Multiplayer'),
    createGame('lordz', 'Lordz.io', 'Army building', 'https://lordz.io/', 'Multiplayer'),
    createGame('splix', 'Splix.io', 'Territory capture', 'https://splix.io/', 'Multiplayer'),
    createGame('deeeep', 'Deeeep.io', 'Underwater evolution', 'https://deeeep.io/', 'Multiplayer'),
    createGame('flyordie', 'FlyOrDie.io', 'Evolution game', 'https://flyordie.io/', 'Multiplayer'),
    createGame('skribbl', 'Skribbl.io', 'Draw and guess', 'https://skribbl.io/', 'Multiplayer'),
    createGame('gartic', 'Gartic.io', 'Drawing game', 'https://gartic.io/', 'Multiplayer'),
    createGame('bonk', 'Bonk.io', 'Physics balls', 'https://bonk.io/', 'Multiplayer'),
    createGame('littlebigsnake', 'Little Big Snake', 'High quality snake', 'https://littlebigsnake.com/', 'Multiplayer'),
    createGame('wormate', 'Wormate.io', 'Sweets snake', 'https://wormate.io/', 'Multiplayer'),
    createGame('mk48', 'Mk48.io', 'Naval combat', 'https://mk48.io/', 'Multiplayer'),
    createGame('airma', 'Airma.sh', 'Plane battle', 'https://airma.sh/', 'Multiplayer'),

    // --- PUZZLE & STRATEGY ---
    createGame('2048', '2048', 'Combine numbers', 'https://play2048.co/', 'Puzzle'),
    createGame('chess', 'Chess.com', 'Play Chess', 'https://www.chess.com/play/computer', 'Puzzle'),
    createGame('tetris', 'Tetris', 'The classic', 'https://tetris.com/play-tetris', 'Puzzle'),
    createGame('sudoku', 'Sudoku', 'Number puzzle', 'https://sudoku.com/', 'Puzzle'),
    createGame('wordle', 'Wordle', 'Guess the word', 'https://www.nytimes.com/games/wordle/index.html', 'Puzzle'),
    createGame('cuttherope', 'Cut The Rope', 'Feed the frog', 'https://poki.com/en/g/cut-the-rope', 'Puzzle'),
    createGame('badpiggies', 'Bad Piggies', 'Build vehicles', 'https://kbhgames.com/game/bad-piggies-online-2018', 'Puzzle'),
    createGame('portal_flash', 'Portal Flash', '2D Portal', 'https://portal.wecreatestuff.com/', 'Puzzle'),
    createGame('world_hardest_game', 'World\'s Hardest Game', 'Avoid blue dots', 'https://www.coolmathgames.com/0-worlds-hardest-game', 'Puzzle'),
    createGame('there_is_no_game', 'There Is No Game', 'Meta puzzle', 'https://poki.com/en/g/there-is-no-game', 'Puzzle'),
    createGame('we_become_what_we_behold', 'We Become What We Behold', 'Social commentary', 'https://poki.com/en/g/we-become-what-we-behold', 'Puzzle'),
    createGame('minesweeper', 'Minesweeper', 'Classic logic', 'https://minesweeper.online/', 'Puzzle'),
    createGame('little_alchemy', 'Little Alchemy 2', 'Combine elements', 'https://littlealchemy2.com/', 'Puzzle'),
    createGame('geoguessr', 'GeoGuessr', 'Guess location (Free)', 'https://www.geoguessr.com/free', 'Puzzle'),
    createGame('bloxorz', 'Bloxorz', 'Block rolling', 'https://www.coolmathgames.com/0-bloxorz', 'Puzzle'),
    createGame('fireboywatergirl', 'Fireboy & Watergirl', 'Co-op puzzle', 'https://poki.com/en/g/fireboy-and-watergirl-1-forest-temple', 'Puzzle'),

    // --- ARCADE & RETRO ---
    createGame('pacman', 'Pac-Man', 'Waka waka', 'https://freepacman.org/', 'Arcade'),
    createGame('supermario', 'Super Mario Bros', 'NES Classic', 'https://supermarioemulator.com/mario.php', 'Arcade'),
    createGame('sonic', 'Sonic The Hedgehog', 'Sega Classic', 'https://www.retrogames.cz/play_001-Genesis.php', 'Arcade'),
    createGame('chrome_dino', 'Chrome Dino', 'Offline runner', 'https://chromedino.com/', 'Arcade'),
    createGame('flappybird', 'Flappy Bird', 'Tap to fly', 'https://flappybird.io/', 'Arcade'),
    createGame('crossyroad', 'Crossy Road', 'Why did the chicken...', 'https://poki.com/en/g/crossy-road', 'Arcade'),
    createGame('jetpackjoyride', 'Jetpack Joyride', 'Fly with guns', 'https://poki.com/en/g/jetpack-joyride', 'Arcade'),
    createGame('fruitninja', 'Fruit Ninja', 'Slice fruit', 'https://poki.com/en/g/fruit-ninja', 'Arcade'),
    createGame('cookieclicker', 'Cookie Clicker', 'Bake cookies', 'https://orteil.dashnet.org/cookieclicker/', 'Arcade'),
    createGame('retrobowl', 'Retro Bowl', 'American football manager', 'https://poki.com/en/g/retro-bowl', 'Arcade'),
    createGame('happywheels', 'Happy Wheels', 'Physics gore', 'https://totaljerkface.com/happy_wheels.tjf', 'Arcade'),
    createGame('fnaf', 'FNAF', 'Five Nights at Freddy\'s', 'https://scratch.mit.edu/projects/21748233/embed', 'Arcade'),
    createGame('geometry_dash_lite', 'Geometry Dash Lite', 'Web version', 'https://poki.com/en/g/geometry-dash', 'Arcade'),
    createGame('helix_jump', 'Helix Jump', 'Fall down', 'https://poki.com/en/g/helix-jump', 'Arcade'),
    createGame('stack', 'Stack', 'Build high', 'https://poki.com/en/g/stack', 'Arcade'),
    createGame('color_switch', 'Color Switch', 'Match colors', 'https://poki.com/en/g/color-switch', 'Arcade'),
    createGame('tomb_of_mask', 'Tomb of the Mask', 'Retro arcade', 'https://poki.com/en/g/tomb-of-the-mask', 'Arcade'),
    createGame('temple_run', 'Temple Run 2', 'Infinite runner', 'https://poki.com/en/g/temple-run-2', 'Arcade'),
    createGame('pacman_3d', 'Pac-Man 3D', 'FPS Pacman', 'https://fpsman.com/', 'Arcade'),
    createGame('breakout', 'Atari Breakout', 'Break bricks', 'https://elgoog.im/breakout/', 'Arcade'),
    createGame('snake_google', 'Google Snake', 'Modern Snake', 'https://www.google.com/fbx?fbx=snake_arcade', 'Arcade'),
    createGame('space_invaders', 'Space Invaders', 'Classic shooter', 'https://freeinvaders.org/', 'Arcade'),
    createGame('asteroids', 'Asteroids', 'Shoot rocks', 'https://www.atari.com/arcade/arcade/asteroids/', 'Arcade'),
];
