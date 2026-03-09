"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { Search, Ban, CheckCircle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  lawyerProfile?: { status: string; avgRating: number } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = async (q = search, r = role, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (q) params.set("search", q);
      if (r !== "ALL") params.set("role", r);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleBan = async (user: User) => {
    setActionId(user.id);
    try {
      await api.put(`/admin/users/${user.id}/ban`, { banned: user.isActive });
      toast.success(`User ${user.isActive ? "suspended" : "reinstated"}`);
      fetchUsers();
    } catch {
      toast.error("Action failed");
    } finally {
      setActionId(null);
    }
  };

  const roleBadge: Record<string, string> = {
    CLIENT: "bg-blue-100 text-blue-800",
    LAWYER: "bg-purple-100 text-purple-800",
    ADMIN:  "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
        <p className="text-muted-foreground hidden md:block">Manage all platform users — search, filter, and take action.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setPage(1); fetchUsers(search, role, 1); } }}
            className="pl-8"
          />
        </div>
        <Select value={role} onValueChange={v => { setRole(v); setPage(1); fetchUsers(search, v, 1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="CLIENT">Clients</SelectItem>
            <SelectItem value="LAWYER">Lawyers</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setPage(1); fetchUsers(search, role, 1); }}>Search</Button>
      </div>

      {/* Desktop Table */}
      <Card className="hidden md:block border-border/50 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Email Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No users found.</TableCell></TableRow>
            ) : users.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadge[u.role] || ""}`}>{u.role}</span>
                </TableCell>
                <TableCell className="text-sm">{format(new Date(u.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell>
                  {u.isEmailVerified
                    ? <CheckCircle className="h-4 w-4 text-green-500" />
                    : <span className="text-xs text-muted-foreground">Unverified</span>}
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "default" : "destructive"}>{u.isActive ? "Active" : "Suspended"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {u.role !== "ADMIN" && (
                    <Button
                      size="sm" variant={u.isActive ? "destructive" : "outline"}
                      disabled={actionId === u.id}
                      onClick={() => handleBan(u)}
                    >
                      {actionId === u.id ? "…" : u.isActive ? <><Ban className="h-3 w-3 mr-1" />Suspend</> : "Reinstate"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {loading ? <p className="text-center py-8 text-muted-foreground">Loading…</p>
        : users.length === 0 ? <p className="text-center py-8 text-muted-foreground">No users found.</p>
        : users.map(u => (
          <div key={u.id} className="border rounded-lg bg-card p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{u.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${roleBadge[u.role] || ""}`}>{u.role}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t text-sm">
              <span className="text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</span>
              <div className="flex items-center gap-2">
                <Badge variant={u.isActive ? "default" : "destructive"}>{u.isActive ? "Active" : "Suspended"}</Badge>
                {u.role !== "ADMIN" && (
                  <Button size="sm" variant={u.isActive ? "destructive" : "outline"} disabled={actionId === u.id} onClick={() => handleBan(u)}>
                    {actionId === u.id ? "…" : u.isActive ? "Suspend" : "Reinstate"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchUsers(search, role, page - 1); }}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchUsers(search, role, page + 1); }}>Next</Button>
        </div>
      )}
    </div>
  );
}
