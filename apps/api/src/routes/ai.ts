import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/guards";
import { GoogleGenerativeAI, ChatSession, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const router = Router();

// Store active chat sessions in memory (for MVP; in production, use a database or Redis)
const activeChats = new Map<string, ChatSession>();

const AI_SYSTEM_PROMPT = `
You are LexAI, an Indian legal information assistant. 
You explain rights under Indian law, cite relevant acts (like Transfer of Property Act, IPC, Consumer Protection Act, etc.), and suggest practical next steps. 
Always refer users to a verified lawyer on the LegalHub platform for specific representation.
MANDATORY DISCLAIMER: Always include a short disclaimer in your first message or responses stating that you provide general legal information, not professional legal advice, and that users should consult a lawyer.
`;

interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string; id?: string };
}

router.post("/chat", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { message, conversationId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not set.");
            return res.status(503).json({ error: "AI service is currently unavailable" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // We will use gemini-1.5-pro or gemini-1.5-flash. Flash is faster and cheaper, Pro is better reasoning.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: AI_SYSTEM_PROMPT });

        // Generate a new conversation ID if one isn't provided
        const chatId = conversationId || `${userId}_${Date.now()}`;
        
        let chatSession = activeChats.get(chatId);

        if (!chatSession) {
            // Initialize a new chat session
            chatSession = model.startChat({
                generationConfig: {
                    maxOutputTokens: 1024,
                    temperature: 0.2, // Low temperature for more factual, legal responses
                },
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        // Legal queries might trigger dangerous content filters (e.g. criminal law), so we might need to be careful
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    }
                ]
            });
            activeChats.set(chatId, chatSession);

            // Housekeeping: remove chat after 2 hours to prevent memory leaks in this simple MVP implementation
            setTimeout(() => activeChats.delete(chatId), 2 * 60 * 60 * 1000);
        }

        const result = await chatSession.sendMessage(message);
        const responseText = result.response.text();

        return res.json({
            conversationId: chatId,
            message: responseText
        });

    } catch (error: any) {
        console.error("error in /ai/chat:", error);
        return res.status(500).json({ error: "Failed to process AI request" });
    }
});

router.delete("/chat/:conversationId", requireAuth, (req: AuthRequest, res: Response) => {
    const { conversationId } = req.params;
    activeChats.delete(conversationId);
    return res.json({ success: true });
});

export const aiRouter = router;
