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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
    clientProfile: {
        city: string | null;
        state: string | null;
    } | null;
}

export default function AdminClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const { data } = await api.get('/admin/clients');
                setClients(data.clients || []);
            } catch (error) {
                console.error("Failed to load clients", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    if (loading) return <div className="p-8">Loading clients...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                <p className="text-muted-foreground mt-2">Manage all registered clients on the platform.</p>
            </div>

            {/* Desktop Table View */}
            <div className="border rounded-lg bg-card hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    No clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{client.name}</div>
                                                <div className="text-xs text-muted-foreground">{client.email}</div>
                                                {client.phone && <div className="text-xs text-muted-foreground">{client.phone}</div>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {client.clientProfile?.city ? `${client.clientProfile.city}, ${client.clientProfile.state}` : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(client.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={client.isActive ? "default" : "destructive"}>
                                            {client.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {clients.length === 0 ? (
                    <div className="border rounded-lg bg-card text-center py-8 text-muted-foreground shadow-sm">
                        No clients found.
                    </div>
                ) : (
                    clients.map((client) => (
                        <div key={client.id} className="border rounded-lg bg-card p-4 space-y-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-lg">{client.name}</div>
                                        <div className="text-sm text-muted-foreground">{client.email}</div>
                                        {client.phone && <div className="text-sm text-muted-foreground">{client.phone}</div>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t mt-4">
                                <div>
                                    <div className="text-muted-foreground mb-1">Location</div>
                                    <div className="font-medium">
                                        {client.clientProfile?.city ? `${client.clientProfile.city}, ${client.clientProfile.state}` : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground mb-1">Joined</div>
                                    <div className="font-medium">{format(new Date(client.createdAt), "MMM d, yyyy")}</div>
                                </div>
                            </div>

                            <div className="pt-2 border-t mt-2 flex justify-end">
                                <Badge variant={client.isActive ? "default" : "destructive"}>
                                    {client.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
