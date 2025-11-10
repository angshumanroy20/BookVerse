import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/db/api";
import { BookOpen, Mail, MessageSquare, Send, Github, Linkedin, Instagram, Twitter } from "lucide-react";
import PageMeta from "@/components/common/PageMeta";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function About() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await api.createContactSubmission(data);
      toast({
        title: "Message Sent! ✉️",
        description: "Thank you for reaching out. We'll get back to you soon!",
      });
      form.reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="About BookVerse"
        description="Learn more about BookVerse and get in touch with us for feedback and future enhancements."
      />
      
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-5xl font-display font-bold gradient-text">BookVerse</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A comprehensive book management and discovery platform that allows users to upload, browse, 
              and manage their book collections while providing personalized reading recommendations.
            </p>
          </div>

          {/* About Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-8">
              <Card className="border-2 border-border/50 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  <p>
                    BookVerse is designed to revolutionize how readers discover, manage, and share their 
                    literary journeys. We believe that every book has the power to transform lives, and 
                    our platform makes it easier than ever to find your next great read.
                  </p>
                  <p>
                    Whether you're an avid reader looking to organize your collection, a casual reader 
                    seeking recommendations, or someone who wants to share their favorite books with 
                    the world, BookVerse is here for you.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-border/50 shadow-elegant">
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">📚</span>
                      <span><strong>Book Management:</strong> Upload and organize your book collection with ease</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">🔍</span>
                      <span><strong>Smart Discovery:</strong> Browse books by title, author, genre, and rating</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">🤖</span>
                      <span><strong>AI Recommendations:</strong> Get personalized book suggestions powered by AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">📖</span>
                      <span><strong>Reading Lists:</strong> Track your reading progress and organize books by status</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">⭐</span>
                      <span><strong>Reviews & Ratings:</strong> Share your thoughts and discover community favorites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">🔖</span>
                      <span><strong>Bookmarks:</strong> Save your place and add notes for easy reference</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-2 border-primary/20 shadow-glow sticky top-6 z-10 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Get in Touch
                  </CardTitle>
                  <CardDescription>
                    Have feedback or suggestions for future enhancements? We'd love to hear from you!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        rules={{ required: "Name is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        rules={{
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        rules={{ required: "Subject is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="What's this about?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        rules={{
                          required: "Message is required",
                          minLength: {
                            value: 10,
                            message: "Message must be at least 10 characters",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us your thoughts, feedback, or suggestions..."
                                className="min-h-[120px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Admin Social Links */}
              <Card className="border-2 border-border/50 shadow-elegant mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Connect With Admin
                  </CardTitle>
                  <CardDescription>
                    Follow and connect on social media
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href="https://github.com/angshumanroy20"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href="https://www.linkedin.com/in/angshuman-roy-422aa425b/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href="https://www.instagram.com/_._angshuman._/?hl=en"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href="https://x.com/uniqueEarth1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="w-4 h-4 mr-2" />
                        X (Twitter)
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Technology Stack */}
          <Card className="border-2 border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Built With Modern Technology</CardTitle>
              <CardDescription>
                BookVerse leverages cutting-edge technologies to deliver a seamless experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-semibold">React</p>
                  <p className="text-xs text-muted-foreground">Frontend Framework</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-semibold">TypeScript</p>
                  <p className="text-xs text-muted-foreground">Type Safety</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-semibold">Supabase</p>
                  <p className="text-xs text-muted-foreground">Backend & Database</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="font-semibold">Gemini AI</p>
                  <p className="text-xs text-muted-foreground">AI Recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
