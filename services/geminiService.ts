import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatConfig, Message } from "../types";

// Initialize the client strictly with the environment variable as requested
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamChatResponse = async function* (
  history: Message[],
  newMessage: string,
  attachments: { mimeType: string; data: string }[],
  config: ChatConfig
): AsyncGenerator<string, void, unknown> {
  
  try {
    // 1. Prepare the model configuration
    const modelConfig: any = {
      systemInstruction: config.systemInstruction || undefined,
      temperature: config.temperature,
    };

    // Add thinking budget if supported (Gemini 2.5 series) and set > 0
    if (config.model.includes('2.5') && config.thinkingBudget > 0) {
      modelConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
    }

    // 2. Initialize the chat session
    // Note: We are reconstructing the history for the 'chat' abstraction or sending a single generateContent call.
    // To support multimodal inputs easily in the current turn, generateContentStream is often simpler 
    // than maintaining a stateful Chat object when we manage history manually in the frontend.
    // However, to keep "chat" context, we should pass previous history.
    // The @google/genai SDK chat helper is good, but let's manually construct the `contents` array 
    // to have full control over multimodal history if needed.

    const contents = history
      .filter(msg => msg.role !== 'system') // System instruction is in config
      .map(msg => ({
        role: msg.role,
        parts: [
          ...(msg.attachments || []).map(att => ({
            inlineData: { mimeType: att.mimeType, data: att.data }
          })),
          { text: msg.content }
        ]
      }));

    // Add the new message
    const newParts: any[] = [{ text: newMessage }];
    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        newParts.unshift({
          inlineData: { mimeType: att.mimeType, data: att.data }
        });
      });
    }
    
    contents.push({ role: 'user', parts: newParts });

    // 3. Call the API
    const responseStream = await ai.models.generateContentStream({
      model: config.model,
      contents: contents,
      config: modelConfig,
    });

    // 4. Yield chunks
    for await (const chunk of responseStream) {
      // Correct extraction based on SDK guidelines: chunk.text
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    yield `\n\n**Error details:** ${error.message || "Unknown error occurred."}`;
    throw error;
  }
};
