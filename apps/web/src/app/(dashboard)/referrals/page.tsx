"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Gift, Users, Wallet } from "lucide-react";
import { toast } from "react-hot-toast";

interface Reward {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
}

interface ReferralInfo {
  referralCode: string;
  walletBalance: number;
  totalReferrals: number;
}

export default function ReferralsDashboardPage() {
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const [infoRes, historyRes] = await Promise.all([
          api.get("/referrals"),
          api.get("/referrals/history")
        ]);
        setInfo(infoRes.data);
        setRewards(historyRes.data.rewards);
      } catch (error: unknown) {
        console.error(error);
        toast.error("Failed to load referral data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferralData();
  }, []);

  const handleCopy = () => {
    if (!info?.referralCode) return;
    navigator.clipboard.writeText(info.referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading your rewards...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Gift className="h-8 w-8 text-primary" />
          Refer & Earn
        </h1>
        <p className="text-muted-foreground mt-1">Invite friends to LegalHub and earn credits towards your legal needs.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
               <Wallet className="w-4 h-4 mr-2" /> Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">₹{info?.walletBalance || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
          </CardContent>
        </Card>
        
        {/* Total Referrals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
               <Users className="w-4 h-4 mr-2" /> Friends Invited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{info?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total registered users</p>
          </CardContent>
        </Card>
        
        {/* Referral Code */}
        <Card className="md:col-span-3 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex space-x-2">
                 <Input value={info?.referralCode || ""} readOnly className="font-mono text-center font-bold tracking-widest bg-muted/50" />
                 <Button onClick={handleCopy} size="icon" variant="secondary"><Copy className="w-4 h-4" /></Button>
             </div>
             <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
               Share this code. You earn ₹500 when they complete their first booking, and ₹200 for templates!
             </p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-bold mb-4">Reward History</h2>
        {rewards.length === 0 ? (
          <Card className="p-12 text-center bg-muted/10 border-dashed">
            <Gift className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-medium text-foreground">No rewards yet</h3>
            <p className="text-muted-foreground mt-1 text-sm">Start inviting friends to see your earnings here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
             {rewards.map((reward) => (
                <Card key={reward.id}>
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-6 gap-4">
                      <div>
                         <div className="font-medium">{reward.reason}</div>
                         <div className="text-sm text-muted-foreground">
                            {format(new Date(reward.createdAt), "MMM d, yyyy 'at' h:mm a")}
                         </div>
                      </div>
                      <Badge variant="default" className="text-lg px-3 py-1 bg-green-500 hover:bg-green-600">
                         +₹{reward.amount}
                      </Badge>
                   </div>
                </Card>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
