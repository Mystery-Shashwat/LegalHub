"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, Landmark } from "lucide-react";

interface Payout {
  lawyerProfileId: string;
  lawyerName: string;
  lawyerEmail: string;
  totalPending: number;
  sessionCount: number;
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const { data } = await api.get("/admin/payouts/pending");
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error("Failed to load payouts", error);
      toast.error("Failed to load pending payouts");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;
    if (!transactionId.trim()) {
      toast.error("Please enter a transaction reference ID.");
      return;
    }

    setProcessingId(selectedPayout.lawyerProfileId);
    try {
      await api.post(`/admin/payouts/${selectedPayout.lawyerProfileId}/process`, {
        amount: selectedPayout.totalPending,
        transactionId: transactionId.trim(),
      });
      toast.success(`Successfully processed payout for ${selectedPayout.lawyerName}`);
      setIsDialogOpen(false);
      setTransactionId("");
      setSelectedPayout(null);
      fetchPayouts(); // Refresh the list
    } catch (error) {
      console.error("Failed to process payout", error);
      toast.error("Failed to process payout");
    } finally {
      setProcessingId(null);
    }
  };

  const openDialog = (payout: Payout) => {
    setSelectedPayout(payout);
    setTransactionId("");
    setIsDialogOpen(true);
  };

  const totalOutstanding = payouts.reduce((sum, p) => sum + p.totalPending, 0);

  if (loading) return <div className="p-8 text-muted-foreground">Loading payouts...</div>;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Landmark className="h-8 w-8 text-primary" />
            Pending Payouts
          </h1>
          <p className="text-muted-foreground mt-1">Review and process unpaid earnings to lawyers.</p>
        </div>
        <Card className="p-4 px-6 bg-primary/5 border-primary/20 flex flex-col items-end shrink-0 w-full sm:w-auto">
            <p className="text-sm text-primary font-medium mb-1">Total Outstanding</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </p>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* Hidden trigger since we open it programmatically */}
        <DialogTrigger asChild><span className="hidden"></span></DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Mark {selectedPayout?.lawyerName}&apos;s pending earnings as paid. This will notify the lawyer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Amount to Pay</Label>
              <div className="font-bold text-3xl">
                ₹{selectedPayout?.totalPending.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="txId">
                Transaction Reference ID
              </Label>
              <Input
                id="txId"
                placeholder="e.g., UTR, Cheque No."
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: The actual money transfer (e.g. via Razorpay API or Bank Transfer) must be done outside this system first. This action only records it on LegalHub.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={!!processingId}>Cancel</Button>
            <Button onClick={handleProcessPayout} disabled={!!processingId}>
              {processingId ? "Processing..." : "Confirm & Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm border-border/50">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Lawyer</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="text-center">Unpaid Sessions</TableHead>
              <TableHead className="text-right">Total Owed</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                        <IndianRupee className="h-6 w-6 opacity-50" />
                    </div>
                    Awesome! There are no pending payouts.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              payouts.map((payout) => (
                <TableRow key={payout.lawyerProfileId}>
                  <TableCell className="font-medium whitespace-nowrap">{payout.lawyerName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{payout.lawyerEmail}</TableCell>
                  <TableCell className="text-center">
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                        {payout.sessionCount} sessions
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    ₹{payout.totalPending.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                        size="sm" 
                        onClick={() => openDialog(payout)}
                        disabled={processingId === payout.lawyerProfileId}
                    >
                      Process
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
