import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const forumRouter = Router();

// Get all questions
forumRouter.get("/", async (req: Request, res: Response) => {
    try {
        const questions = await prisma.forumQuestion.findMany({
            include: {
                author: { select: { name: true, role: true, avatar: true } },
                _count: { select: { answers: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ questions });
    } catch (error) {
        console.error("Get forum questions error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get a specific question with answers
forumRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const question = await prisma.forumQuestion.findUnique({
            where: { id },
            include: {
                author: { select: { name: true, role: true, avatar: true } },
                answers: {
                    include: {
                        author: { select: { name: true, role: true, avatar: true } }
                    },
                    orderBy: [
                        { isAccepted: 'desc' },
                        { upvotes: 'desc' },
                        { createdAt: 'asc' }
                    ]
                }
            }
        });

        if (!question) return res.status(404).json({ error: "Question not found" });

        res.json({ question });
    } catch (error) {
        console.error("Get question error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const createQuestionSchema = z.object({
    title: z.string().min(5),
    content: z.string().min(10),
    category: z.string().min(2)
});

// Create a new question
forumRouter.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const r = createQuestionSchema.safeParse(req.body);

        if (!r.success) {
            return res.status(400).json({ errors: r.error.flatten().fieldErrors });
        }

        const question = await prisma.forumQuestion.create({
            data: {
                authorId: userId,
                title: r.data.title,
                content: r.data.content,
                category: r.data.category
            }
        });

        res.status(201).json({ message: "Question created", question });
    } catch (error) {
        console.error("Create forum question error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const createAnswerSchema = z.object({
    content: z.string().min(10)
});

// Post an answer
forumRouter.post("/:id/answer", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        const r = createAnswerSchema.safeParse(req.body);

        if (!r.success) {
            return res.status(400).json({ errors: r.error.flatten().fieldErrors });
        }

        const question = await prisma.forumQuestion.findUnique({ where: { id } });
        if (!question) return res.status(404).json({ error: "Question not found" });

        const answer = await prisma.forumAnswer.create({
            data: {
                questionId: id,
                authorId: userId,
                content: r.data.content
            }
        });

        res.status(201).json({ message: "Answer posted", answer });
    } catch (error) {
        console.error("Post answer error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Upvote question
forumRouter.post("/:id/upvote", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
         const { id } = req.params;
         const question = await prisma.forumQuestion.update({
             where: { id },
             data: { upvotes: { increment: 1 } }
         });
         res.json({ message: "Upvoted", upvotes: question.upvotes });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Upvote answer
forumRouter.post("/answers/:id/upvote", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
         const { id } = req.params;
         const answer = await prisma.forumAnswer.update({
             where: { id },
             data: { upvotes: { increment: 1 } }
         });
         res.json({ message: "Upvoted", upvotes: answer.upvotes });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Accept answer
forumRouter.post("/answers/:id/accept", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
         const { id } = req.params;
         const answer = await prisma.forumAnswer.findUnique({ where: { id }, include: { question: true } });
         
         if (!answer) return res.status(404).json({ error: "Answer not found" });
         if (answer.question.authorId !== req.user!.userId) {
             return res.status(403).json({ error: "Only the question author can accept answers" });
         }

         const updated = await prisma.forumAnswer.update({
             where: { id },
             data: { isAccepted: true }
         });

         res.json({ message: "Answer accepted", answer: updated });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
