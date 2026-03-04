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

      {/* Desktop Table View */}
      <div className="rounded-md border hidden md:block">
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

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {pendingLawyers.length === 0 ? (
          <div className="rounded-md border bg-card text-center py-8 text-muted-foreground shadow-sm">
            No pending lawyer approvals.
          </div>
        ) : (
            pendingLawyers.map((layer) => (
              <div key={layer.id} className="rounded-md border bg-card p-4 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-lg">{layer.user.name}</div>
                        <div className="text-sm text-muted-foreground">{layer.user.email}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div>
                        <div className="text-muted-foreground mb-1">Bar Council</div>
                        <div className="font-medium">{layer.barCouncilNumber}</div>
                        <div className="text-xs text-muted-foreground">{layer.barCouncilState}</div>
                    </div>
                    <div>
                        <div className="text-muted-foreground mb-1">Experience</div>
                        <Badge variant="outline">{layer.experienceYears} Years</Badge>
                    </div>
                </div>

                <div className="pt-2 border-t">
                    <div className="text-muted-foreground mb-2 text-sm">Verification Documents</div>
                    <div className="flex gap-4 text-sm">
                       {layer.certificateOfPracticeUrl ? <a href={layer.certificateOfPracticeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Bar Cert</a> : <span className="text-muted-foreground line-through">Bar Cert</span>}
                       {layer.degreeDocumentUrl ? <a href={layer.degreeDocumentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Degree</a> : <span className="text-muted-foreground line-through">Degree</span>}
                       {layer.govtIdUrl ? <a href={layer.govtIdUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Govt ID</a> : <span className="text-muted-foreground line-through">Govt ID</span>}
                    </div>
                </div>

                 <div className="text-xs text-muted-foreground pt-2 border-t flex justify-between items-center">
                     <span>Registered: {format(new Date(layer.createdAt), "MMM d, yyyy")}</span>
                 </div>
                 
                 <div className="flex gap-2">
                     <Button 
                         variant="default" 
                         className="flex-1 bg-green-600 hover:bg-green-700"
                         onClick={() => handleDecision(layer.id, "VERIFIED")}
                     >
                         Approve
                     </Button>
                     <Button 
                         variant="destructive" 
                         className="flex-1"
                         onClick={() => handleDecision(layer.id, "REJECTED")}
                     >
                         Reject
                     </Button>
                 </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
