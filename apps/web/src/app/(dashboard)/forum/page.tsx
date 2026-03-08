"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, ArrowUp, PlusCircle, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/store/auth";

interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  createdAt: string;
  author: { name: string; role: string };
  _count: { answers: number };
}

export default function ForumPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  
  // New Question Form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get("/forum");
      setQuestions(data.questions);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load forum questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreateQuestion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Please fill in both title and content.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/forum", {
        title: newTitle,
        content: newContent,
        category: newCategory
      });
      toast.success("Question posted successfully!");
      setIsDialogOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("General");
      fetchQuestions(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Failed to post question.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Legal Q&A Forum</h1>
          <p className="text-muted-foreground mt-1">Ask questions, share knowledge, and get answers from the community.</p>
        </div>
        
        {user && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Ask a Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Ask a Legal Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="Civil Law">Civil Law</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Family Law">Family Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Property Law">Property Law</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Question Title</Label>
                  <Input 
                    placeholder="E.g., What are the grounds for mutual consent divorce?" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Details</Label>
                  <Textarea 
                    placeholder="Provide more context about your specific situation..." 
                    rows={5}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Cancel</Button>
                <Button onClick={handleCreateQuestion} disabled={submitting}>
                  {submitting ? "Posting..." : "Post Question"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Search for topics, categories, or keywords..." 
          className="pl-10 h-12 text-lg bg-background border-muted-foreground/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-12">Loading discussions...</div>
      ) : filteredQuestions.length === 0 ? (
        <Card className="p-12 text-center bg-muted/30 border-dashed">
          <p className="text-muted-foreground font-medium text-lg">No questions found matching your search.</p>
          <p className="text-sm mt-2 text-muted-foreground">Be the first to start a discussion on this topic!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <Link key={q.id} href={`/forum/${q.id}`} className="block">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-5 flex gap-4">
                  {/* Upvote Counter */}
                  <div className="flex flex-col items-center justify-start min-w-[3rem] bg-muted/50 rounded-lg p-2 h-fit">
                    <ArrowUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-bold text-lg mt-1">{q.upvotes}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="secondary" className="hover:bg-secondary">
                        {q.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                         Posted by <span className="font-medium text-foreground ml-1">{q.author.name}</span>
                         {q.author.role === "LAWYER" && (
                            <Badge variant="outline" className="ml-2 border-primary/30 text-primary h-5 text-[10px]">Verified Lawyer</Badge>
                         )}
                      </span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {format(new Date(q.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {q.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
                      {q.content}
                    </p>
                    
                    <div className="flex items-center text-sm font-medium text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {q._count.answers} {q._count.answers === 1 ? 'Answer' : 'Answers'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
