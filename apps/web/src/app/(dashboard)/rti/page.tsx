"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, PlusCircle, CheckCircle, Clock, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface RTIApplication {
  id: string;
  authorityName: string;
  subject: string;
  description: string;
  status: string;
  filedAt: string;
  createdAt: string;
}

export default function RTIFilingPage() {
  const [applications, setApplications] = useState<RTIApplication[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Draft State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [authorityName, setAuthorityName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get("/rti");
      setApplications(data.applications);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load RTI applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleGenerateTemplate = async () => {
    if (!subject) return toast.error("Please provide a subject to generate a template.");
    
    setGeneratingTemplate(true);
    try {
      const { data } = await api.get(`/rti/template/generate?topic=${encodeURIComponent(subject)}`);
      setDescription(data.template);
      toast.success("LexAI drafted an RTI template for you.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate RTI template.");
    } finally {
      setGeneratingTemplate(false);
    }
  };

  const handleSubmitRTI = async () => {
    if (!authorityName.trim() || !subject.trim() || !description.trim()) {
      return toast.error("Please fill in all fields before submitting.");
    }

    setSubmitting(true);
    try {
      await api.post("/rti", {
        authorityName,
        subject,
        description
      });
      toast.success("RTI Application successfully submitted!");
      setIsDialogOpen(false);
      setAuthorityName("");
      setSubject("");
      setDescription("");
      fetchApplications();
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit RTI Application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            RTI Filing Tool
          </h1>
          <p className="text-muted-foreground mt-1">Draft and manage your Right to Information applications.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg">
              <PlusCircle className="mr-2 h-5 w-5" /> File New RTI
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Draft RTI Application</DialogTitle>
              <CardDescription>Use LexAI to automatically draft your RTI request formatting.</CardDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Public Authority (Department Name)</Label>
                <Input 
                  placeholder="E.g., Ministry of Road Transport and Highways" 
                  value={authorityName}
                  onChange={(e) => setAuthorityName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subject of Information</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="E.g., Status of road repairs in Sector 4" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleGenerateTemplate} 
                    disabled={generatingTemplate || !subject}
                    className="whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    LexAI Draft
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Application Body</Label>
                <Textarea 
                  placeholder="Provide the exact details of the information you are seeking. You can let LexAI draft the boilerplate format above." 
                  className="min-h-[250px] font-mono text-sm leading-relaxed"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmitRTI} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Your RTI Applications</h2>
        
        {loading ? (
          <div className="p-12 text-center">Loading applications...</div>
        ) : applications.length === 0 ? (
          <Card className="p-12 text-center border-dashed bg-muted/20">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No RTIs filed yet.</h3>
            <p className="text-muted-foreground mt-2">Create your first Right to Information request by clicking the button above.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {applications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow flex flex-col h-full border-primary/10">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start gap-3 w-full">
                    <CardTitle className="text-lg leading-tight line-clamp-2">{app.subject}</CardTitle>
                    <Badge variant={app.status === "SUBMITTED" ? "default" : "secondary"} className="shrink-0">
                      {app.status === "SUBMITTED" ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {app.status}
                    </Badge>
                  </div>
                  <CardDescription className="font-medium text-foreground/80 mt-2">
                    To: {app.authorityName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {app.description}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Filed on {format(new Date(app.filedAt || app.createdAt), "PPP")}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
