import { Router } from "express";
import { requireAuth, requireClient } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

// Extend express Request to include user
interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

const router = Router();

// ── GET /clients/me — current client profile ──────────────────────
router.get("/me", requireClient, async (req: AuthRequest, res: Response) => {
    try {
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: req.user!.userId },
            include: { user: { select: { name: true, email: true, phone: true, avatar: true, isEmailVerified: true } } }
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

// ── PUT /clients/me — update client profile fields ────────────────
const updateClientSchema = z.object({
    city:  z.string().optional(),
    state: z.string().optional(),
    about: z.string().optional(),
});

router.put("/me", requireClient, async (req: AuthRequest, res: Response) => {
    try {
        const r = updateClientSchema.safeParse(req.body);
        if (!r.success) {
            return res.status(400).json({ errors: r.error.flatten().fieldErrors });
        }

        const profile = await prisma.clientProfile.upsert({
            where: { userId: req.user!.userId },
            create: { userId: req.user!.userId, ...r.data },
            update: r.data
        });

        res.json({ message: "Profile updated successfully", profile });
    } catch (error) {
        console.error("Update client profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ── GET /users/me — get current user's base profile (any role) ────
router.get("/users/me", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true, name: true, email: true, phone: true, avatar: true,
                role: true, isEmailVerified: true, isPhoneVerified: true,
                walletBalance: true, referralCode: true, createdAt: true,
                lawyerProfile: { select: { status: true, plan: true, planExpiresAt: true, avgRating: true } },
                clientProfile: { select: { city: true, state: true, about: true } }
            }
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ user });
    } catch (error) {
        console.error("Get user me error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ── PUT /users/me — update name, phone, avatar (any role) ─────────
const updateUserSchema = z.object({
    name:   z.string().min(2).optional(),
    phone:  z.string().regex(/^\+?[0-9]{10,13}$/, "Invalid phone number").optional(),
    avatar: z.string().url().optional(),
});

router.put("/users/me", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const r = updateUserSchema.safeParse(req.body);
        if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors });

        const user = await prisma.user.update({
            where: { id: req.user!.userId },
            data:  r.data,
            select: { id: true, name: true, email: true, phone: true, avatar: true, role: true }
        });
        res.json({ message: "Profile updated", user });
    } catch (error) {
        console.error("Update user me error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ── PUT /users/me/password — change password (any role) ───────────
const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword:     z.string().min(8, "Password must be at least 8 characters"),
});

router.put("/users/me/password", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const r = passwordSchema.safeParse(req.body);
        if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors });

        const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isValid = await bcrypt.compare(r.data.currentPassword, user.passwordHash);
        if (!isValid) return res.status(400).json({ error: "Current password is incorrect" });

        const hash = await bcrypt.hash(r.data.newPassword, 12);
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

        // Invalidate all refresh tokens for security
        await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

        res.json({ message: "Password changed successfully. Please log in again." });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export const clientRouter = router;
