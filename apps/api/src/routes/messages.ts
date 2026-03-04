import { Router } from "express";
import { requireAuth } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const messageRouter = Router();

// 1. Get Chat History for a Conversation
messageRouter.get("/:conversationId", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user!.userId;

        // Ensure the current user is part of the conversation (conversationId is sorted: userA_userB)
        if (!conversationId.includes(currentUserId)) {
            return res.status(403).json({ error: "Access denied to this conversation." });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "asc" },
            take: 100 // Limit to last 100 for MVP
        });

        res.json({ messages });
    } catch (error) {
        console.error("Fetch messages error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
