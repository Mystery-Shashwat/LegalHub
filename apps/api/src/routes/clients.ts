import { Router } from "express";
import { requireClient } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { Request, Response } from "express";

// Extend express Request to include user
interface AuthRequest extends Request {
    user?: { id: string; role: string; email: string };
}

const router = Router();

// 1. Get current client profile
router.get("/me", requireClient, async (req: AuthRequest, res: Response) => {
    try {
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: req.user!.id },
            include: { user: { select: { name: true, email: true, phone: true } } }
        });

        if (!clientProfile) {
            return res.status(404).json({ error: "Profile not found" });
        }

        res.json({ profile: clientProfile });
    } catch (error) {
        console.error("Get client profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. Update client profile
const updateSchema = z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    about: z.string().optional(),
});

router.put("/me", requireClient, async (req: AuthRequest, res: Response) => {
    try {
        const r = updateSchema.safeParse(req.body);
        if (!r.success) {
            return res.status(400).json({ errors: r.error.flatten().fieldErrors });
        }

        const profile = await prisma.clientProfile.upsert({
            where: { userId: req.user!.id },
            create: {
                userId: req.user!.id,
                ...r.data
            },
            update: r.data
        });

        res.json({ message: "Profile updated successfully", profile });
    } catch (error) {
        console.error("Update client profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export const clientRouter = router;
