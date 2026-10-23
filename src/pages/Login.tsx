import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/db/supabase";
import { api } from "@/db/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Loader2,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  ExternalLink,
  Mail,
} from "lucide-react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // Forgot Password & Recovery states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Google OAuth guidance modal
  const [googleHelpOpen, setGoogleHelpOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: string })?.from;

  // Check if user reached here via a password reset/recovery link
  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      setIsRecoveryMode(true);
    }
  }, []);

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
        description:
          error.message === "Invalid login credentials"
            ? "Invalid login credentials. If your account was created without a password, click 'Forgot password?' below to set one."
            : error.message || "Invalid email or password. Please try again.",
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
          description: "Welcome to BookVerse! Redirecting to your account.",
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your registered email address.",
        variant: "destructive",
      });
      return;
    }

    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/login#type=recovery`,
      });

      if (error) throw error;

      toast({
        title: "Reset Link Sent",
        description: `We've sent a password reset link to ${forgotEmail}. Please check your inbox.`,
      });
      setForgotPasswordOpen(false);
      setForgotEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      toast({
        title: "Could not send reset link",
        description: err.message || "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "New password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setRecoveryLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated!",
        description: "Your password has been successfully saved. Logging in...",
      });
      setIsRecoveryMode(false);
      if (data.user) {
        await routeByRole(data.user.id, data.user.email);
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Password update error:", err);
      toast({
        title: "Update Failed",
        description: err.message || "Could not update password.",
        variant: "destructive",
      });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes("not enabled") || errorMsg.includes("unsupported")) {
          // Google provider is not toggled on in Supabase dashboard
          setGoogleHelpOpen(true);
        } else {
          toast({
            title: "Google Sign In Failed",
            description: error.message,
            variant: "destructive",
          });
        }
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

  // RECOVERY MODE VIEW (Setting new password from email link)
  if (isRecoveryMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-md rounded-3xl border border-border/80 bg-card shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
              <KeyRound className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-display font-bold">Set New Password</CardTitle>
            <CardDescription className="text-sm">
              Enter your new account password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} method="post" action="#" autoComplete="on" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 rounded-xl bg-card border-border/80"
                />
              </div>

              <Button
                type="submit"
                disabled={recoveryLoading}
                className="w-full h-11 rounded-xl font-semibold bg-primary text-primary-foreground gap-2"
              >
                {recoveryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save New Password & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary/15 via-purple-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <Card className="w-full max-w-md rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
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

            {/* TAB 1: Sign In (Standard Semantic Form for Password Managers & Autofill) */}
            <TabsContent value="signin" className="space-y-4">
              <form
                onSubmit={handleEmailSignIn}
                method="post"
                action="#"
                autoComplete="on"
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl bg-card border-border/80 text-foreground focus-visible:ring-primary shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotPasswordOpen(true);
                      }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl bg-card border-border/80 text-foreground focus-visible:ring-primary shadow-xs"
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

            {/* TAB 2: Create Account (Sign Up Form) */}
            <TabsContent value="signup" className="space-y-4">
              <form
                onSubmit={handleEmailSignUp}
                method="post"
                action="#"
                autoComplete="on"
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="signup-username" className="text-xs font-semibold text-foreground">
                    Username / Display Name
                  </Label>
                  <Input
                    id="signup-username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Your Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-11 rounded-xl bg-card border-border/80 text-foreground focus-visible:ring-primary shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
                    Email Address
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 rounded-xl bg-card border-border/80 text-foreground focus-visible:ring-primary shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs font-semibold text-foreground">
                    Create Password
                  </Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 rounded-xl bg-card border-border/80 text-foreground focus-visible:ring-primary shadow-xs"
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

          {/* Social Sign-In (Direct Google OAuth) */}
          <div className="pt-2 border-t border-border/70">
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

          <p className="text-[11px] text-muted-foreground text-center pt-1">
            By accessing your account, you agree to BookVerse's Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>

      {/* DIALOG 1: Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-card border-border/80">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2">
              <Mail className="w-5 h-5" />
            </div>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              Enter the email address registered with your BookVerse account. We will send you a secure link to set a new password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Account Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="name@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-card border-border/80"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotPasswordOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={forgotLoading}
                className="rounded-xl font-semibold bg-primary text-primary-foreground gap-2"
              >
                {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Google OAuth Configuration Info Dialog */}
      <Dialog open={googleHelpOpen} onOpenChange={setGoogleHelpOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-card border-border/80">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
              <AlertCircle className="w-5 h-5" />
            </div>
            <DialogTitle>Google OAuth Provider Setup</DialogTitle>
            <DialogDescription>
              Google Sign-In is not yet enabled in your Supabase backend (<code className="text-xs bg-muted px-1 py-0.5 rounded">pxsfarjyhffuhuhzztgc</code>).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed bg-muted/50 p-3.5 rounded-xl border border-border/60">
            <p className="font-semibold text-foreground">To activate Google Login in 1 minute:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your Supabase Project Dashboard</li>
              <li>Go to <strong>Authentication</strong> → <strong>Providers</strong></li>
              <li>Toggle <strong>Google</strong> to <span className="text-emerald-500 font-bold">Enabled</span></li>
              <li>Paste your Google Client ID and Secret</li>
              <li>Click <strong>Save</strong></li>
            </ol>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              asChild
              className="rounded-xl gap-1.5"
            >
              <a
                href="https://supabase.com/dashboard/project/pxsfarjyhffuhuhzztgc/auth/providers"
                target="_blank"
                rel="noreferrer"
              >
                <span>Open Supabase Providers</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
            <Button
              type="button"
              onClick={() => setGoogleHelpOpen(false)}
              className="rounded-xl font-semibold bg-primary text-primary-foreground"
            >
              Got it, use Email Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
