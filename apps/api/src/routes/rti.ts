import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const rtiRouter = Router();

// 1. Get List of RTIs for the user
rtiRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;

        const applications = await prisma.rTIApplication.findMany({
            where: { applicantId: userId },
            orderBy: { createdAt: "desc" }
        });

        res.json({ applications });
    } catch (error) {
        console.error("Get RTIs error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const createRTISchema = z.object({
    authorityName: z.string().min(2),
    subject: z.string().min(5),
    description: z.string().min(10)
});

// 2. Submit a new RTI Application
rtiRouter.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const r = createRTISchema.safeParse(req.body);

        if (!r.success) {
            return res.status(400).json({ errors: r.error.flatten().fieldErrors });
        }

        const application = await prisma.rTIApplication.create({
            data: {
                applicantId: userId,
                authorityName: r.data.authorityName,
                subject: r.data.subject,
                description: r.data.description,
                status: "SUBMITTED",
                filedAt: new Date()
            }
        });

        res.status(201).json({ message: "RTI Application submitted", application });
    } catch (error) {
        console.error("Create RTI error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 3. Get specific RTI Application
rtiRouter.get("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const application = await prisma.rTIApplication.findUnique({
            where: { id }
        });

        if (!application) return res.status(404).json({ error: "RTI Application not found" });

        // Ensure authorization
        if (application.applicantId !== req.user!.userId && req.user!.role !== "ADMIN") {
             return res.status(403).json({ error: "Unauthorized" });
        }

        res.json({ application });
    } catch (error) {
        console.error("Get RTI error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 4. Generate AI Template for RTI (Placeholder)
// In a full implementation, you'd feed this prompt to Google Gemini
rtiRouter.get("/template/generate", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { topic } = req.query;
        if (!topic) return res.status(400).json({ error: "Missing topic" });

        // User name lookup fallback if not fully populated in the JWT request
        let userName = "Applicant";
        if (req.user?.userId) {
            const userRec = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { name: true }});
            if (userRec?.name) userName = userRec.name;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ error: "AI service is currently unavailable for drafting." });
        }

        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: "You are an expert Indian Legal Assistant. Draft a formal Right to Information (RTI) application based on the user's topic. Include placeholder brackets like [Department Name] or [Date] where specific facts are needed. Return ONLY the final text of the draft. Do not include markdown formatting or conversational filler."
        });

        const prompt = `Draft an RTI application requesting information about: "${topic}". The applicant's name is ${userName}. Ensure the format is suitable for Indian government authorities.`;
        
        const result = await model.generateContent(prompt);
        const template = result.response.text();

        res.json({ template });
    } catch (error) {
        console.error("Generate RTI template error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
