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
import { Card } from "@/components/ui/card"
import { toast } from "react-hot-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RTIApplication {
    id: string;
    authorityName: string;
    subject: string;
    description: string;
    status: "SUBMITTED" | "IN_PROGRESS" | "RESOLVED";
    createdAt: string;
    applicant: {
        id: string;
        name: string;
        email: string;
    };
}

export default function AdminRTIPage() {
    const [applications, setApplications] = useState<RTIApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const { data } = await api.get('/admin/rti');
            setApplications(data.applications || []);
        } catch (error) {
            console.error("Failed to load RTIs", error);
            toast.error("Failed to load RTI applications");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.put(`/admin/rti/${id}/status`, { status: newStatus });
            toast.success("RTI status updated");
            setApplications(prev => 
                prev.map(app => app.id === id ? { ...app, status: newStatus as RTIApplication["status"] } : app)
            );
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Failed to update RTI status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return 'default';
            case 'IN_PROGRESS': return 'secondary';
            case 'RESOLVED': return 'outline';
            default: return 'default';
        }
    };

    if (loading) return <div className="p-8">Loading RTI applications...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">RTI Management</h1>
                <p className="text-muted-foreground hidden md:block">Track and manage Right to Information applications submitted by clients.</p>
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block shadow-sm border-border/50">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Authority</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Date Filed</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    No RTI applications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell>
                                        <div className="font-medium">{app.applicant.name}</div>
                                        <div className="text-xs text-muted-foreground">{app.applicant.email}</div>
                                    </TableCell>
                                    <TableCell className="font-medium">{app.authorityName}</TableCell>
                                    <TableCell className="max-w-xs truncate" title={app.subject}>
                                        {app.subject}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(app.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(app.status)}>
                                            {app.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Select
                                                defaultValue={app.status}
                                                onValueChange={(val) => handleStatusUpdate(app.id, val)}
                                            >
                                                <SelectTrigger className="w-[140px] h-8 text-xs">
                                                    <SelectValue placeholder="Update Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {applications.length === 0 ? (
                    <div className="border rounded-lg bg-card text-center py-6 text-muted-foreground shadow-sm">
                        No RTI applications found.
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app.id} className="border rounded-lg bg-card p-4 space-y-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-lg">{app.applicant.name}</div>
                                    <div className="text-sm text-muted-foreground">{app.applicant.email}</div>
                                </div>
                                <Badge variant={getStatusColor(app.status)}>
                                    {app.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-2 text-sm pt-2 border-t">
                                <div>
                                    <div className="text-muted-foreground mb-1">To: <span className="font-medium text-foreground">{app.authorityName}</span></div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Subject:</div>
                                    <div className="text-foreground font-medium text-xs leading-relaxed max-h-16 overflow-hidden">
                                        {app.subject}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{format(new Date(app.createdAt), "MMM d, yyyy")}</span>
                                <Select
                                    defaultValue={app.status}
                                    onValueChange={(val) => handleStatusUpdate(app.id, val)}
                                >
                                    <SelectTrigger className="w-[130px] h-8 text-xs">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
