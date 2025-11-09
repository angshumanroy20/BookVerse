import { Link, useLocation } from "react-router-dom";
import { BookOpen, User, LogOut, Library, Upload, Moon, Sun, LayoutDashboard, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import routes from "../../routes";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const navigation = routes.filter((route) => route.visible !== false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header className="bg-card/80 border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl shadow-elegant">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-12">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text hidden sm:block">
                Biblios
              </span>
            </Link>

            <div className="hidden xl:flex items-center gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                    location.pathname === item.path
                      ? "gradient-primary text-primary-foreground shadow-glow"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                      location.pathname === "/dashboard"
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-library"
                    className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                      location.pathname === "/my-library"
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    My Library
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-11 h-11 hover:bg-muted/50 transition-all duration-300"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            {user ? (
              <>
                <Button asChild className="hidden sm:flex gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow rounded-xl px-6">
                  <Link to="/upload">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upload Book
                  </Link>
                </Button>
                <Button asChild variant="default" size="icon" className="sm:hidden gradient-primary rounded-xl">
                  <Link to="/upload">
                    <Upload className="w-4 h-4" />
                  </Link>
                </Button>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="hidden sm:flex rounded-xl border-2 hover:bg-muted/50 transition-all duration-300">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden sm:flex rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300">
                    <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
                      <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                        {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 z-[100] rounded-2xl shadow-elegant border-border/50">
                    <div className="px-4 py-3 bg-muted/30 rounded-t-2xl">
                      <p className="text-sm font-semibold">{profile?.username || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer py-3 px-4 hover:bg-muted/50 transition-colors">
                        <User className="w-4 h-4 mr-3" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer py-3 px-4 hover:bg-muted/50 transition-colors">
                        <LayoutDashboard className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-library" className="cursor-pointer py-3 px-4 hover:bg-muted/50 transition-colors">
                        <Library className="w-4 h-4 mr-3" />
                        My Library
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer py-3 px-4 hover:bg-muted/50 transition-colors">
                          <User className="w-4 h-4 mr-3" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild className="gradient-primary hover:opacity-90 transition-all duration-300 shadow-glow rounded-xl px-6">
                <Link to="/login">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden rounded-xl">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] rounded-l-3xl">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="gradient-text">Biblios Menu</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {user && (
                    <div className="flex items-center gap-3 pb-4 border-b border-border">
                      <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
                        <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                          {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profile?.username || "User"}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ${
                          location.pathname === item.path
                            ? "gradient-primary text-primary-foreground shadow-glow"
                            : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {user && (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-3 ${
                            location.pathname === "/profile"
                              ? "gradient-primary text-primary-foreground shadow-glow"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <User className="w-4 h-4" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-3 ${
                            location.pathname === "/dashboard"
                              ? "gradient-primary text-primary-foreground shadow-glow"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/my-library"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-3 ${
                            location.pathname === "/my-library"
                              ? "gradient-primary text-primary-foreground shadow-glow"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Library className="w-4 h-4" />
                          My Library
                        </Link>
                        {profile?.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 flex items-center gap-3 ${
                              location.pathname === "/admin"
                                ? "gradient-primary text-primary-foreground shadow-glow"
                                : "text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <User className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                        )}
                      </>
                    )}
                  </div>

                  {user && (
                    <div className="pt-4 border-t border-border">
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleSignOut();
                        }}
                        variant="outline"
                        className="w-full rounded-xl border-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
