import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/guards";
import Razorpay from "razorpay";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";

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
