"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AdminLawyersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pendingLawyers, setPendingLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingLawyers();
  }, []);

  const loadPendingLawyers = async () => {
    try {
      const { data } = await api.get("/admin/lawyers/pending");
      setPendingLawyers(data.lawyers);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load pending lawyers");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, decision: "VERIFIED" | "REJECTED") => {
    try {
        await api.put(`/admin/lawyers/${id}/decision`, { status: decision });
        toast.success(`Lawyer profile ${decision.toLowerCase()}`);
        loadPendingLawyers(); // refresh list
    } catch (error) {
        console.error(error);
        toast.error(`Failed to ${decision.toLowerCase()} lawyer`);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lawyer Verifications</h1>
        <p className="text-muted-foreground">Approve or reject pending lawyer registration requests.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Bar Council Info</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Registered At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingLawyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No pending lawyer approvals.
                </TableCell>
              </TableRow>
            ) : (
                pendingLawyers.map((layer) => (
                <TableRow key={layer.id}>
                    <TableCell>
                        <div className="font-medium">{layer.user.name}</div>
                        <div className="text-xs text-muted-foreground">{layer.user.email}</div>
                    </TableCell>
                    <TableCell>
                        <div>{layer.barCouncilNumber}</div>
                        <div className="text-xs text-muted-foreground">{layer.barCouncilState}</div>
                    </TableCell>
                    <TableCell>
                         <Badge variant="outline">{layer.experienceYears} Years</Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                           {layer.certificateOfPracticeUrl ? <a href={layer.certificateOfPracticeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Bar Cert</a> : <span className="text-muted-foreground line-through">Bar Cert</span>}
                           {layer.degreeDocumentUrl ? <a href={layer.degreeDocumentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Degree</a> : <span className="text-muted-foreground line-through">Degree</span>}
                           {layer.govtIdUrl ? <a href={layer.govtIdUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Govt ID</a> : <span className="text-muted-foreground line-through">Govt ID</span>}
                        </div>
                    </TableCell>
                     <TableCell>
                         <div className="text-sm">
                             {format(new Date(layer.createdAt), "MMM d, yyyy")}
                         </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                        <Button 
                            variant="default" 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleDecision(layer.id, "VERIFIED")}
                        >
                            Approve
                        </Button>
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDecision(layer.id, "REJECTED")}
                        >
                            Reject
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
