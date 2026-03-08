import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/guards";
import Razorpay from "razorpay";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { processReferralReward } from "../lib/referrals";

export const paymentRouter = Router();

// Ensure keys exist, otherwise stub it to prevent crashes in dev
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_123",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_123",
});

const orderSchema = z.object({
  amount: z.number().positive(),
  bookingId: z.string(),
});

// POST /api/payments/create-order
paymentRouter.post("/create-order", requireAuth, async (req: Request, res: Response) => {
  try {
    const validated = orderSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: validated.bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const options = {
      amount: validated.amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_booking_${validated.bookingId}`,
    };

    const order = await razorpay.orders.create(options);
    
    // Save order ID to the booking for future verification
    await prisma.booking.update({
        where: { id: validated.bookingId },
        data: { paymentId: order.id } // Reusing paymentId field to temporarily hold order ID
    });

    res.json({ order });
  } catch (error) {
    console.error("Payment Order Error:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  bookingId: z.string()
});

// POST /api/payments/verify
paymentRouter.post("/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = verifySchema.parse(req.body);

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "secret_123")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment verified, update booking
      await prisma.booking.update({
          where: { id: bookingId },
          data: { 
              status: "CONFIRMED",
              isPaid: true,
              paymentId: razorpay_payment_id
          }
      });
      
      const bookingRecord = await prisma.booking.findUnique({
          where: { id: bookingId }
      });
      
      if (bookingRecord) {
          const amount = bookingRecord.amount;
          const commissionAmount = amount * 0.10; // 10% platform fee
          const lawyerPayout = amount - commissionAmount; // 90% to lawyer
          
          await prisma.payment.create({
              data: {
                  bookingId,
                  amount,
                  razorpayOrderId: razorpay_order_id,
                  razorpayPaymentId: razorpay_payment_id,
                  status: "PAID",
                  commissionAmount,
                  lawyerPayout,
                  paidAt: new Date()
              }
          });
          
          // Trigger referral reward for first paid booking
          await processReferralReward(bookingRecord.clientId, 500, "First Booking Completed");
      }
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// GET /payments/invoices — client's own invoice history
paymentRouter.get("/invoices", requireAuth, async (req: any, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { booking: { clientId: req.user.userId } },
        include: {
          booking: {
            include: {
              client: { select: { name: true, email: true } },
              lawyer: {
                include: { user: { select: { name: true } } }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({ where: { booking: { clientId: req.user.userId } } })
    ]);

    res.json({ payments, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Invoice list error:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// GET /payments/:id — single payment details (invoice)
paymentRouter.get("/:id", requireAuth, async (req: any, res: Response) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: {
        booking: {
          include: {
            client: { select: { name: true, email: true, phone: true } },
            lawyer: { include: { user: { select: { name: true, email: true } } } }
          }
        }
      }
    });

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // Only the client, lawyer, or admin can view
    const isClient  = payment.booking.clientId === req.user.userId;
    const isLawyer  = payment.booking.lawyer.userId === req.user.userId;
    const isAdmin   = req.user.role === "ADMIN";
    if (!isClient && !isLawyer && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Payment detail error:", error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

// POST /payments/:id/refund — admin initiates refund
paymentRouter.post("/:id/refund", requireAuth, async (req: any, res: Response) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Admin only" });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { booking: true }
    });

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    if (payment.status === "REFUNDED") return res.status(400).json({ error: "Already refunded" });
    if (payment.status !== "PAID") return res.status(400).json({ error: "Can only refund completed payments" });

    // In production, call razorpay.payments.refund(razorpayPaymentId, { amount })
    // For now mark as REFUNDED in DB
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: req.params.id },
        data: { status: "REFUNDED" }
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CANCELLED" }
      })
    ]);

    // Notify the client
    await prisma.notification.create({
      data: {
        userId: payment.booking.clientId,
        type: "PAYMENT",
        title: "Refund Processed",
        body: `Your refund of ₹${payment.amount} has been initiated. It will reflect in 5-7 business days.`,
        link: "/client/bookings"
      }
    });

    res.json({ message: "Refund initiated successfully", payment: updatedPayment });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ error: "Failed to process refund" });
  }
});
