import { useEffect, useState } from "react";
import { api } from "@/db/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ContactSubmissionWithReplies } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Inbox as InboxIcon, Mail, MessageSquare, Clock } from "lucide-react";

export default function Inbox() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<ContactSubmissionWithReplies[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.email) {
      loadSubmissions();
    }
  }, [profile]);

  const loadSubmissions = async () => {
    if (!profile?.email) return;

    try {
      setLoading(true);
      const data = await api.getUserContactSubmissions(profile.email);
      setSubmissions(data);
    } catch (error) {
      console.error("Error loading submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load your messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "reviewed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your inbox</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <InboxIcon className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-display font-bold">Your Inbox</h1>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading your messages...</p>
            </CardContent>
          </Card>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Messages Yet</h3>
              <p className="text-muted-foreground">
                You haven't submitted any contact messages. Visit the About page to get in touch!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{submission.subject}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className={getStatusColor(submission.status)}>
                          {submission.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Your Message</p>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
                      </div>
                    </div>

                    {submission.replies && submission.replies.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            <p className="text-sm font-medium">
                              Admin Replies ({submission.replies.length})
                            </p>
                          </div>
                          <div className="space-y-3">
                            {submission.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-primary">
                                    {reply.admin?.username || reply.admin?.email || "Admin"}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(reply.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{reply.reply_message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {(!submission.replies || submission.replies.length === 0) && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          No replies yet. We'll respond to your message soon!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
