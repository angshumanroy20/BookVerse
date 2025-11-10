import { Link } from "react-router-dom";
import { BookOpen, Github, Linkedin, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold">BookVerse</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Discover, manage, and share your literary journey with a community of book lovers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <div className="space-y-2 text-sm">
              <Link to="/browse" className="block text-muted-foreground hover:text-primary transition-colors">
                Browse Books
              </Link>
              <Link to="/upload" className="block text-muted-foreground hover:text-primary transition-colors">
                Upload Books
              </Link>
              <Link to="/my-library" className="block text-muted-foreground hover:text-primary transition-colors">
                My Library
              </Link>
              <Link to="/dashboard" className="block text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Community</h3>
            <div className="space-y-2 text-sm">
              <Link to="/browse" className="block text-muted-foreground hover:text-primary transition-colors">
                Reviews & Ratings
              </Link>
              <Link to="/my-library" className="block text-muted-foreground hover:text-primary transition-colors">
                Reading Lists
              </Link>
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Connect</h3>
            <div className="flex gap-3 mb-4">
              <a
                href="https://github.com/angshumanroy20"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/angshuman-roy-422aa425b/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/_._angshuman._/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/uniqueEarth1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
                aria-label="X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Follow us for updates and book recommendations
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{currentYear} BookVerse</p>
        </div>
      </div>
    </footer>
  );
}
