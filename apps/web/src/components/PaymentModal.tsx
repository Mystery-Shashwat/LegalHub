"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

interface PaymentModalProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  buttonLabel?: string;
  disabled?: boolean;
}

export default function PaymentModal({ bookingId, amount, onSuccess, buttonLabel = "Pay Now", disabled = false }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        return;
      }

      // 1. Create order on backend
      const { data: orderData } = await api.post("/payments/create-order", {
        amount,
        bookingId,
      });

      if (!orderData || !orderData.order) {
        toast.error("Failed to initialize payment order");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_123", // Enter the Key ID generated from the Dashboard
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "LegalHub",
        description: "Booking Consultation Payment",
        order_id: orderData.order.id,
        handler: async function (response: Record<string, string>) {
          try {
            // 2. Verify payment on backend
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });
            toast.success("Payment Successful!");
            onSuccess();
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          // You can prefill user data here
          name: "LegalHub Client",
          email: "client@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4f46e5", // Indigo-600 to match primary
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      toast.error("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="lg" onClick={handlePayment} disabled={disabled || loading}>
      {loading ? "Processing..." : buttonLabel}
    </Button>
  );
}
