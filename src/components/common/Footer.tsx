import { BookOpen } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Browse Books</p>
              <p>Upload Books</p>
              <p>My Library</p>
              <p>Recommendations</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Community</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Reviews & Ratings</p>
              <p>Reading Lists</p>
              <p>Book Discussions</p>
              <p>Author Spotlights</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{currentYear} BookVerse</p>
        </div>
      </div>
    </footer>
  );
}
