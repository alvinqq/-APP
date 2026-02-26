import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Safety check for process.env in browser environments
const getApiKey = () => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env.API_KEY || '';
    }
  } catch (e) {
    return '';
  }
  return '';
};

const apiKey = getApiKey();

// Initialize lazily or safely
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Failed to initialize GoogleGenAI", e);
  }
}

const SYSTEM_INSTRUCTION = `
You are the AI Assistant for "Juezhi APP" (绝知APP), a retail super app.
Your users are either Store Managers (busy, operational focus) or HQ Managers (strategic, data focus).

The core philosophy of the app is "One Core, Four Wings" with a specific 7-step Closed Loop logic:
1. Data Alert
2. AI Attribution
3. Generate Suggestion
4. Voice Confirmation (simulated by you asking for confirmation)
5. Generate Task
6. Execution Feedback
7. Effect Verification

When a user asks for help:
1. Identify their role (infer from context or ask).
2. Provide concise, actionable advice.
3. If a problem is identified (e.g., "sales are down"), guide them through the loop stages.
4. Keep responses professional yet encouraging.
`;

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  roleContext: string
): Promise<string> => {
  try {
    if (!apiKey || !ai) return "API Key not configured (Env variable missing).";

    const model = 'gemini-3-flash-preview';
    
    // Convert generic history to Gemini format (simplified for one-shot or short context)
    // ideally, we would maintain a chat session. For this stateless demo, we send context + prompt.
    
    const contextPrompt = `
      Current User Role: ${roleContext}
      Context: User is asking: "${newMessage}"
      
      Respond directly to the user.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "I processed that, but couldn't generate a text response.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，AI服务暂时不可用，请稍后再试。";
  }
};