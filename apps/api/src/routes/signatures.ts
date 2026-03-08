import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/guards";
import { prisma } from "../lib/prisma";
import crypto from "crypto";
import { z } from "zod";

// Extend express Request to include user
interface AuthRequest extends Request {
    user?: { userId: string; role: string; email: string };
}

export const signatureRouter = Router();

const signDocumentSchema = z.object({
    documentId: z.string(),
    signatureDataUrl: z.string() // Base64 encoding of the drawn/uploaded signature
});

signatureRouter.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const r = signDocumentSchema.safeParse(req.body);
        
        if (!r.success) {
            return res.status(400).json({ errors: r.error.flatten().fieldErrors });
        }

        const { documentId, signatureDataUrl } = r.data;

        // Fetch document to ensure it exists
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { case: true }
        });

        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }

        // Generate SHA-256 hash representing the "sealed" document
        // In a real production system, this would hash the actual PDF bytes + the signature overlay.
        // For this implementation, we hash a combination of the Doc ID, timestamp, and signature payload.
        const hashPayload = `${documentId}-${Date.now()}-${signatureDataUrl}`;
        const signatureHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

        // Capture audit data
        const signerIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "0.0.0.0";

        // Update document with digital signature metadata
        const updatedDoc = await prisma.document.update({
            where: { id: documentId },
            data: {
                signatureHash,
                signerId: userId,
                signedAt: new Date(),
                signerIp: String(signerIp)
            }
        });

        return res.status(200).json({
            message: "Document successfully signed.",
            document: updatedDoc
        });

    } catch (error) {
        console.error("Signature processing error:", error);
        return res.status(500).json({ error: "Internal server error during signature processing." });
    }
});
