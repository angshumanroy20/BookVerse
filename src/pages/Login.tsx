import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/db/supabase";
import { api } from "@/db/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Shield, User, Loader2, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: string })?.from;

  const routeByRole = async (userId: string, userEmail?: string | null) => {
    try {
      const profile = await api.getProfile(userId);
      const isAdmin =
        profile?.role === "admin" ||
        userEmail?.toLowerCase() === "angshumanroy200@gmail.com";

      if (isAdmin) {
        toast({
          title: "Welcome Administrator",
          description: `Logged in as ${profile?.username || userEmail}. Redirecting to Admin Suite.`,
        });
        navigate("/admin", { replace: true });
      } else {
        toast({
          title: "Welcome Back",
          description: `Logged in as ${profile?.username || userEmail}. Redirecting to your Library.`,
        });
        navigate(from || "/dashboard", { replace: true });
      }
    } catch (err) {
      console.warn("Could not fetch profile role, checking email:", err);
      if (userEmail?.toLowerCase() === "angshumanroy200@gmail.com") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from || "/dashboard", { replace: true });
      }
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;
      if (data.user) {
        await routeByRole(data.user.id, data.user.email);
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast({
        title: "Sign in Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !username.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in username, email, and password.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password should be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account Created!",
          description: "Welcome to BookVerse! Redirecting to your reader account.",
        });
        await routeByRole(data.user.id, data.user.email);
      }
    } catch (error: any) {
      console.error("Sign-up error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Clean standard Supabase OAuth - NO third party SSO domain
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "OAuth Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Google Sign In Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("password123");
    toast({
      title: "Preset Selected",
      description: `Loaded account: ${presetEmail}`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary/15 via-purple-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <Card className="w-full max-w-lg rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              Welcome to BookVerse
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Sign in to access your personal reading list, bookmarks, and administrative dashboard.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
            <TabsList className="grid grid-cols-2 p-1 bg-muted/80 rounded-xl mb-6">
              <TabsTrigger value="signin" className="rounded-lg text-xs sm:text-sm font-semibold">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg text-xs sm:text-sm font-semibold">
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Sign In */}
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl bg-card border-border/70 focus-visible:ring-primary shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password" className="text-xs font-semibold text-foreground">
                      Password
                    </Label>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl bg-card border-border/70 focus-visible:ring-primary shadow-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 shadow-lg shadow-primary/25 text-primary-foreground gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* TAB 2: Create Account */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-username" className="text-xs font-semibold text-foreground">
                    Username / Display Name
                  </Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Your Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-11 rounded-xl bg-card border-border/70 focus-visible:ring-primary shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl bg-card border-border/70 focus-visible:ring-primary shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-semibold text-foreground">
                    Create Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 rounded-xl bg-card border-border/70 focus-visible:ring-primary shadow-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 shadow-lg shadow-primary/25 text-primary-foreground gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Quick Preset Selector for Easy Role Access */}
          <div className="pt-2 border-t border-border/60">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">
              Quick Account Selector
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("angshumanroy200@gmail.com")}
                className="h-11 text-xs rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-foreground justify-start gap-2.5 shadow-xs transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <span className="font-bold text-foreground block leading-tight">Admin Account</span>
                  <span className="text-[10px] text-muted-foreground block truncate">angshumanroy200@...</span>
                </div>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect("csm25047@tezu.ac.in")}
                className="h-11 text-xs rounded-xl border border-primary/50 bg-primary/10 hover:bg-primary/20 text-foreground justify-start gap-2.5 shadow-xs transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <span className="font-bold text-foreground block leading-tight">Reader Account</span>
                  <span className="text-[10px] text-muted-foreground block truncate">csm25047@tezu...</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Optional Direct Google OAuth (No third party SSO) */}
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-11 rounded-xl border border-border/80 bg-card hover:bg-muted text-foreground text-xs font-semibold gap-2.5 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="font-semibold text-foreground">Continue with Google Account</span>
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center pt-2">
            By accessing your account, you agree to BookVerse's Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
