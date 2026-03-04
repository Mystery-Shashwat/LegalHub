"use client"

import { useEffect, useState } from "react"
import api from "@/lib/api"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

interface Dispute {
    id: string;
    userId: string;
    reason: string;
    description: string | null;
    status: "OPEN" | "RESOLVED";
    createdAt: string;
    user: {
        name: string;
        email: string;
        role: string;
    };
}

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const { data } = await api.get('/admin/disputes');
            setDisputes(data.disputes || []);
        } catch (error) {
            console.error("Failed to load disputes", error);
            toast.error("Failed to load disputes");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string) => {
        setResolvingId(id);
        try {
            await api.put(`/admin/disputes/${id}/resolve`);
            toast.success("Dispute marked as resolved");
            setDisputes(prev => 
                prev.map(d => d.id === id ? { ...d, status: "RESOLVED" } : d)
            );
        } catch (error) {
            console.error("Failed to resolve dispute", error);
            toast.error("Failed to resolve dispute");
        } finally {
            setResolvingId(null);
        }
    };

    if (loading) return <div className="p-8">Loading disputes...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Disputes</h1>
                <p className="text-muted-foreground mt-2">Manage and resolve user disputes and complaints.</p>
            </div>

            {/* Desktop Table View */}
            <div className="border rounded-lg bg-card hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User / Role</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {disputes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    No disputes found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            disputes.map((dispute) => (
                                <TableRow key={dispute.id}>
                                    <TableCell>
                                        <div className="font-medium">{dispute.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{dispute.user.email} • {dispute.user.role}</div>
                                    </TableCell>
                                    <TableCell className="font-medium">{dispute.reason}</TableCell>
                                    <TableCell className="max-w-xs truncate" title={dispute.description || ""}>
                                        {dispute.description || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(dispute.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={dispute.status === "RESOLVED" ? "secondary" : "destructive"}>
                                            {dispute.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {dispute.status === "OPEN" && (
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleResolve(dispute.id)}
                                                disabled={resolvingId === dispute.id}
                                            >
                                                {resolvingId === dispute.id ? "Resolving..." : "Mark Resolved"}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {disputes.length === 0 ? (
                    <div className="border rounded-lg bg-card text-center py-6 text-muted-foreground shadow-sm">
                        No disputes found.
                    </div>
                ) : (
                    disputes.map((dispute) => (
                        <div key={dispute.id} className="border rounded-lg bg-card p-4 space-y-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-lg">{dispute.user.name}</div>
                                    <div className="text-sm text-muted-foreground">{dispute.user.email} &bull; <span className="uppercase">{dispute.user.role}</span></div>
                                </div>
                                <Badge variant={dispute.status === "RESOLVED" ? "secondary" : "destructive"}>
                                    {dispute.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-2 text-sm pt-2 border-t">
                                <div>
                                    <div className="text-muted-foreground mb-1">Reason: <span className="font-medium text-foreground">{dispute.reason}</span></div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Description:</div>
                                    <div className="text-muted-foreground italic text-xs leading-relaxed max-h-24 overflow-y-auto pr-2">
                                        &quot;{dispute.description || "No description provided."}&quot;
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground pt-2 border-t flex items-center justify-between">
                                <span>{format(new Date(dispute.createdAt), "MMM d, yyyy")}</span>
                                {dispute.status === "OPEN" && (
                                    <Button 
                                        size="sm" 
                                        onClick={() => handleResolve(dispute.id)}
                                        disabled={resolvingId === dispute.id}
                                    >
                                        {resolvingId === dispute.id ? "Resolving..." : "Mark Resolved"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
