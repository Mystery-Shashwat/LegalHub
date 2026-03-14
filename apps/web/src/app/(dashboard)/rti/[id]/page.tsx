"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle, FileText } from "lucide-react";

interface RTIApplication {
  id: string;
  authorityName: string;
  subject: string;
  description: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "RESOLVED";
  filedAt: string;
  createdAt: string;
}

export default function ClientRTIDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [application, setApplication] = useState<RTIApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRTI() {
      try {
        const { data } = await api.get(`/rti/${id}`);
        setApplication(data.application);
      } catch (error) {
        console.error("Error fetching RTI", error);
        toast.error("Failed to load RTI details");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRTI();
  }, [id]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading application details...</div>;
  if (!application) return <div className="p-8 text-muted-foreground">RTI Application not found.</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
        case "SUBMITTED": 
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" /> Submitted</Badge>;
        case "IN_PROGRESS": 
            return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
        case "RESOLVED": 
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>;
        default: 
            return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/rti')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">RTI Application Details</h1>
            <p className="text-muted-foreground">Review the status and contents of your filing.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl leading-tight">{application.subject}</CardTitle>
              <CardDescription className="text-sm font-medium text-foreground/80">
                To: {application.authorityName}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
                {getStatusBadge(application.status)}
                <span className="text-xs text-muted-foreground">
                    Filed on {format(new Date(application.filedAt || application.createdAt), "PPP")}
                </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4" /> Application Body
                    </h3>
                    <div className="bg-muted/30 border rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {application.description}
                    </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
                    <h4 className="text-sm font-semibold text-primary mb-1">What happens next?</h4>
                    <p className="text-sm text-muted-foreground">
                        Your application has been received. According to the RTI Act, 2005, a Public Information Officer (PIO) is required to respond within 30 days of receipt. Our admin team will update the status here when a response is received or if further action is needed.
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
