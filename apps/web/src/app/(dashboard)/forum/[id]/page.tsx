"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { format } from "date-fns";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, CheckCircle, ChevronLeft, Send } from "lucide-react";
import { toast } from "react-hot-toast";

interface Author {
  name: string;
  role: string;
  avatar: string | null;
}

interface Answer {
  id: string;
  content: string;
  upvotes: number;
  isAccepted: boolean;
  createdAt: string;
  author: Author;
}

interface QuestionDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  createdAt: string;
  authorId: string;
  author: Author;
  answers: Answer[];
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Answer Form
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestion = useCallback(async () => {
    try {
      const { data } = await api.get(`/forum/${id}`);
      setQuestion(data.question);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load question details.");
      router.push("/forum");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleUpvoteQuestion = async () => {
    if (!user) return toast.error("Please log in to vote.");
    try {
      await api.post(`/forum/${id}/upvote`);
      setQuestion(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to upvote question.");
    }
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    if (!user) return toast.error("Please log in to vote.");
    try {
      await api.post(`/forum/answers/${answerId}/upvote`);
      fetchQuestion(); // Refresh to sort appropriately
    } catch (e) {
      console.error(e);
      toast.error("Failed to upvote answer.");
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await api.post(`/forum/answers/${answerId}/accept`);
      toast.success("Answer accepted!");
      fetchQuestion();
    } catch (e) {
      console.error(e);
      toast.error("Failed to accept answer.");
    }
  };

  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) return toast.error("Answer cannot be empty.");
    if (!user) return toast.error("Please login to answer.");

    setSubmitting(true);
    try {
      await api.post(`/forum/${id}/answer`, { content: newAnswer });
      toast.success("Answer posted!");
      setNewAnswer("");
      fetchQuestion();
    } catch (e) {
      console.error(e);
      toast.error("Failed to post answer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading discussion...</div>;
  if (!question) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Button variant="ghost" onClick={() => router.push("/forum")} className="-ml-4 mb-2">
        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Forum
      </Button>

      {/* Main Question Card */}
      <Card className="border-t-4 border-t-primary shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{question.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  Asked by <span className="font-medium text-foreground">{question.author.name}</span> on {format(new Date(question.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <CardTitle className="text-2xl leading-tight">{question.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed text-lg mb-6">
            {question.content}
          </p>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleUpvoteQuestion} className="bg-muted/50 hover:bg-muted">
              <ArrowUp className="w-4 h-4 mr-2" />
              Upvote ({question.upvotes})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div className="pt-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
        </h3>

        <div className="space-y-4">
          {question.answers.map(answer => (
            <Card key={answer.id} className={answer.isAccepted ? "border-green-500/50 bg-green-50/10" : ""}>
              <CardContent className="p-6 flex gap-4">
                {/* Voting Column */}
                <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleUpvoteAnswer(answer.id)}>
                    <ArrowUp className="w-5 h-5 text-muted-foreground" />
                  </Button>
                  <span className="font-semibold text-lg">{answer.upvotes}</span>
                  {answer.isAccepted && (
                    <div className="mt-2 flex flex-col items-center text-green-600">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Answer Content */}
                <div className="flex-1 min-w-0">
                  <p className="whitespace-pre-wrap leading-relaxed mb-4">
                    {answer.content}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      Answered by <span className="font-medium text-foreground">{answer.author.name}</span> 
                      {answer.author.role === "LAWYER" && (
                        <Badge variant="outline" className="ml-2 border-primary text-primary h-5 px-1 py-0 text-xs">Verified Lawyer</Badge>
                      )}
                      <span className="mx-2">•</span>
                      {format(new Date(answer.createdAt), "MMM d, yyyy")}
                    </div>
                    {/* Only question author can accept an answer */}
                    {user?.id === question.authorId && !answer.isAccepted && (
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleAcceptAnswer(answer.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept as Solution
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Post Answer Section */}
        {user ? (
          <Card className="mt-8 bg-muted/20 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Share your legal knowledge or experience to help..."
                className="min-h-[150px] bg-background"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handlePostAnswer} disabled={submitting}>
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Posting..." : "Post Answer"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="mt-8 bg-muted/50 p-6 text-center">
            <p className="text-muted-foreground mb-4">You need to log in to post an answer.</p>
            <Button asChild variant="outline">
              <a href="/login">Log In</a>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
