"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import api from "@/lib/api";
import PaymentModal from "@/components/PaymentModal";
import { VideoRoom } from "@/components/VideoRoom";
import { Video, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import RaiseDisputeModal from "@/components/RaiseDisputeModal";
import { AlertTriangle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  lawyerReply: string | null;
  createdAt: string;
}

interface Booking {
  id: string;
  lawyer: { user: { name: string; email: string } };
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  amount: number;
  review: Review | null;
}

export default function ClientBookingConfirmationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  // Review state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeRaised, setDisputeRaised] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const { data } = await api.get(`/bookings`);
        const found = data.bookings.find((b: Booking) => b.id === id);
        if (found) {
          setBooking(found);
        } else {
          toast.error("Booking not found");
        }
      } catch (error) {
        console.error("Error fetching booking", error);
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBooking();
  }, [id]);

  const handlePaymentSuccess = () => {
    setBooking(prev => prev ? { ...prev, status: "CONFIRMED" } : null);
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return toast.error("Please select a star rating");
    setSubmittingReview(true);
    try {
      const { data } = await api.post("/reviews", {
        bookingId: booking!.id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Review submitted — thank you!");
      setBooking(prev => prev ? { ...prev, review: data.review } : null);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!booking) return <div className="p-8 text-muted-foreground">Booking not found.</div>;

  const handleJoinVideo = async () => {
    setIsJoiningRoom(true);
    try {
      const { data } = await api.get(`/bookings/${booking.id}/room`);
      if (data.url) {
        setVideoUrl(data.url);
      } else {
        toast.error("Video room not ready yet.");
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to get video room link");
    } finally {
      setIsJoiningRoom(false);
    }
  };

  if (videoUrl) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Active Consultation</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Video className="w-4 h-4 text-green-500" />
            In session with {booking.lawyer.user.name}
          </p>
        </div>
        <VideoRoom url={videoUrl} onLeave={() => setVideoUrl(null)} />
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    NO_SHOW: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
        <p className="text-muted-foreground">Review your appointment and manage your session.</p>
      </div>

      {/* Booking Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{booking.lawyer.user.name}</CardTitle>
              <CardDescription>{booking.lawyer.user.email}</CardDescription>
            </div>
            <Badge className={cn("font-medium", statusColor[booking.status] || "")} variant="outline">
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date &amp; Time</p>
              <p className="font-semibold">{format(new Date(booking.scheduledAt), "PPP p")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
              <p className="font-semibold">{booking.durationMinutes} minutes</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-2xl font-bold">₹{booking.amount}</p>
            </div>
            {booking.status === "PENDING" ? (
              <PaymentModal bookingId={booking.id} amount={booking.amount} onSuccess={handlePaymentSuccess} />
            ) : (
              <span className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                ✓ Payment Completed
              </span>
            )}
          </div>

          {booking.status === "CONFIRMED" && (
            <div className="pt-2 border-t flex justify-end">
              <Button onClick={handleJoinVideo} disabled={isJoiningRoom} className="w-full sm:w-auto">
                <Video className="w-4 h-4 mr-2" />
                {isJoiningRoom ? "Connecting…" : "Join Video Consultation"}
              </Button>
            </div>
          )}

          {/* Dispute Action */}
          {(booking.status === "COMPLETED" || booking.status === "NO_SHOW") && !disputeRaised && (
            <div className="pt-4 border-t flex flex-col items-center gap-3">
              <p className="text-xs text-muted-foreground text-center">
                Having issues with this session? You can raise a formal dispute for our team to investigate.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowDisputeModal(true)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Raise Dispute
              </Button>
            </div>
          )}

          {disputeRaised && (
             <div className="pt-4 border-t text-center">
                <Badge variant="outline" className="text-amber-600 bg-amber-50">
                   Dispute Under Review
                </Badge>
             </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dispute Modal ── */}
      {showDisputeModal && (
        <RaiseDisputeModal 
          bookingId={booking.id}
          lawyerName={booking.lawyer.user.name}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={() => {
            setDisputeRaised(true);
            setShowDisputeModal(false);
          }}
        />
      )}

      {/* ── Review Section ── */}
      {booking.status === "COMPLETED" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {booking.review ? "Your Review" : "Leave a Review"}
            </CardTitle>
            <CardDescription>
              {booking.review
                ? "You reviewed this consultation."
                : "Share your experience with this lawyer. Your feedback helps other clients."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {booking.review ? (
              /* ─ Already reviewed ─ */
              <div className="space-y-3">
                {/* Stars display */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={cn("w-6 h-6", s <= booking.review!.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground font-medium">{booking.review.rating}/5</span>
                </div>
                {booking.review.comment && (
                  <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3 border">
                    &ldquo;{booking.review.comment}&rdquo;
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Submitted on {format(new Date(booking.review.createdAt), "PPP")}
                </p>
                {/* Lawyer reply */}
                {booking.review.lawyerReply && (
                  <div className="mt-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-primary mb-1">Lawyer&apos;s Reply</p>
                    <p className="text-sm text-foreground">&ldquo;{booking.review.lawyerReply}&rdquo;</p>
                  </div>
                )}
              </div>
            ) : (
              /* ─ Review form ─ */
              <div className="space-y-4">
                {/* Star picker */}
                <div>
                  <p className="text-sm font-medium mb-2">Rating</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-colors",
                            s <= (hoverRating || rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 self-center text-sm text-muted-foreground font-medium">
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-sm font-medium mb-2">Comment <span className="text-muted-foreground font-normal">(optional)</span></p>
                  <Textarea
                    placeholder="Describe your experience with this lawyer…"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">{comment.length}/500</p>
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={rating === 0 || submittingReview}
                  className="w-full sm:w-auto"
                >
                  {submittingReview ? "Submitting…" : "Submit Review"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
