import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { processReferralReward } from "../lib/referrals";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const templateRouter = Router();

// 1. Get List of Active Templates
templateRouter.get("/", async (req: Request, res: Response) => {
    try {
        const { search, category } = req.query;
        const whereClause: any = { isActive: true };

        if (search) {
            whereClause.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } }
            ];
        }

        if (category && category !== "All") {
            whereClause.category = String(category);
        }

        const templates = await prisma.documentTemplate.findMany({
            where: whereClause,
            orderBy: { downloads: "desc" },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                category: true,
                previewUrl: true,
                downloads: true,
                createdAt: true,
            }
        });

        res.json({ templates });
    } catch (error) {
        console.error("Get templates error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. Get Single Template Details
templateRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const template = await prisma.documentTemplate.findUnique({
            where: { id },
             select: {
                id: true,
                title: true,
                description: true,
                price: true,
                category: true,
                previewUrl: true,
                downloads: true,
                createdAt: true,
                isActive: true
            }
        });

        if (!template || !template.isActive) {
            return res.status(404).json({ error: "Template not found" });
        }

        res.json({ template });
    } catch (error) {
        console.error("Get template details error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 3. Purchase a Template
templateRouter.post("/:id/purchase", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        const template = await prisma.documentTemplate.findUnique({
            where: { id, isActive: true }
        });

        if (!template) {
            return res.status(404).json({ error: "Template not available" });
        }

        // Check if user already purchased
        const existingPurchase = await prisma.templatePurchase.findFirst({
            where: {
                userId,
                templateId: id,
                status: "PAID"
            }
        });

        if (existingPurchase) {
            return res.status(400).json({ error: "You already own this template." });
        }

        // Create purchase record (simulating instant success for templates)
        const purchase = await prisma.templatePurchase.create({
            data: {
                userId,
                templateId: id,
                amountPaid: template.price,
                status: "PAID", 
                paymentId: `sim_tpl_${Date.now()}` // Simulated payment ID
            }
        });

        // Increment download counter
        await prisma.documentTemplate.update({
            where: { id },
            data: { downloads: { increment: 1 } }
        });

        // Trigger referral reward
        await processReferralReward(userId, 200, "First Template Purchased");

        res.status(201).json({ 
            message: "Template purchased successfully", 
            purchase,
            downloadUrl: `/api/templates/${id}/download` 
        });

    } catch (error) {
        console.error("Purchase template error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 4. Download a Purchased Template
templateRouter.get("/:id/download", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        // Verify the user actually purchased it (or is admin)
        const purchase = await prisma.templatePurchase.findFirst({
            where: {
                userId,
                templateId: id,
                status: "PAID"
            }
        });

        if (!purchase && req.user!.role !== "ADMIN") {
            return res.status(403).json({ error: "You have not purchased this template." });
        }

        const template = await prisma.documentTemplate.findUnique({
            where: { id }
        });

        if (!template) {
             return res.status(404).json({ error: "Template not found" });
        }

        // Return the secure file URL
        res.json({
            fileUrl: template.fileUrl,
            fileName: `${template.title}.pdf`
        });

    } catch (error) {
        console.error("Download template error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 5. Client Dashboard: Get Purchased Templates
templateRouter.get("/client/purchases", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;

        const purchases = await prisma.templatePurchase.findMany({
            where: { userId, status: "PAID" },
            include: {
                template: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        category: true,
                        previewUrl: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json({ purchases });
    } catch (error) {
        console.error("Get my purchases error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
