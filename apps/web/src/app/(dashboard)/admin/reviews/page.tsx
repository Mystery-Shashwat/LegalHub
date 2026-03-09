"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  client: { name: string; email: string };
  lawyer: { user: { name: string } };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchReviews = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/reviews?page=${p}&limit=20`);
      setReviews(data.reviews || []);
      setTotalPages(data.pages || 1);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const Stars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={cn("h-3.5 w-3.5", s <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30")} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Reviews</h1>
        <p className="text-muted-foreground hidden md:block">Monitor and moderate client reviews across the platform.</p>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Lawyer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : reviews.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No reviews found.</TableCell></TableRow>
            ) : reviews.map(r => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium text-sm">{r.client.name}</div>
                  <div className="text-xs text-muted-foreground">{r.client.email}</div>
                </TableCell>
                <TableCell className="font-medium text-sm">{r.lawyer.user.name}</TableCell>
                <TableCell>
                  <Stars rating={r.rating} />
                  <span className="text-xs text-muted-foreground mt-0.5">{r.rating}/5</span>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm text-muted-foreground line-clamp-2 italic">
                    {r.comment ? `"${r.comment}"` : "—"}
                  </p>
                </TableCell>
                <TableCell className="text-sm">{format(new Date(r.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm" variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deletingId === r.id}
                    onClick={() => handleDelete(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading…</p>
        : reviews.length === 0 ? <p className="text-center py-8 text-muted-foreground">No reviews found.</p>
        : reviews.map(r => (
          <div key={r.id} className="border rounded-lg bg-card p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{r.client.name} → {r.lawyer.user.name}</p>
                <Stars rating={r.rating} />
              </div>
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" disabled={deletingId === r.id} onClick={() => handleDelete(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {r.comment && <p className="text-sm text-muted-foreground italic line-clamp-3">&ldquo;{r.comment}&rdquo;</p>}
            <p className="text-xs text-muted-foreground border-t pt-2">{format(new Date(r.createdAt), "PPP")}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchReviews(page - 1); }}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchReviews(page + 1); }}>Next</Button>
        </div>
      )}
    </div>
  );
}
