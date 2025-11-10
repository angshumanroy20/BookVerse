import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const literaryThoughts = [
  {
    text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin"
  },
  {
    text: "Books are a uniquely portable magic.",
    author: "Stephen King"
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway"
  },
  {
    text: "Reading is essential for those who seek to rise above the ordinary.",
    author: "Jim Rohn"
  },
  {
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss"
  },
  {
    text: "A book is a dream that you hold in your hand.",
    author: "Neil Gaiman"
  },
  {
    text: "Reading is to the mind what exercise is to the body.",
    author: "Joseph Addison"
  },
  {
    text: "Books are mirrors: you only see in them what you already have inside you.",
    author: "Carlos Ruiz Zafón"
  },
  {
    text: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero"
  },
  {
    text: "I have always imagined that Paradise will be a kind of library.",
    author: "Jorge Luis Borges"
  },
  {
    text: "One must always be careful of books and what is inside them, for words have the power to change us.",
    author: "Cassandra Clare"
  },
  {
    text: "The reading of all good books is like a conversation with the finest minds of past centuries.",
    author: "René Descartes"
  },
  {
    text: "Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors.",
    author: "Charles William Eliot"
  },
  {
    text: "A great book should leave you with many experiences, and slightly exhausted at the end.",
    author: "William Styron"
  },
  {
    text: "Reading brings us unknown friends.",
    author: "Honoré de Balzac"
  },
  {
    text: "Literature is the most agreeable way of ignoring life.",
    author: "Fernando Pessoa"
  },
  {
    text: "The person who deserves most pity is a lonesome one on a rainy day who doesn't know how to read.",
    author: "Benjamin Franklin"
  },
  {
    text: "Books are the plane, and the train, and the road. They are the destination, and the journey.",
    author: "Anna Quindlen"
  },
  {
    text: "A book is a garden, an orchard, a storehouse, a party, a company by the way, a counselor, a multitude of counselors.",
    author: "Charles Baudelaire"
  },
  {
    text: "Reading is a discount ticket to everywhere.",
    author: "Mary Schmich"
  }
];

export default function RandomThought() {
  const [currentThought, setCurrentThought] = useState(literaryThoughts[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomThought = () => {
    const availableThoughts = literaryThoughts.filter(
      (thought) => thought.text !== currentThought.text
    );
    const randomIndex = Math.floor(Math.random() * availableThoughts.length);
    return availableThoughts[randomIndex];
  };

  const changeThought = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentThought(getRandomThought());
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      changeThought();
    }, 15000); // Change every 15 seconds

    return () => clearInterval(interval);
  }, [currentThought]);

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20 shadow-elegant">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
      
      <div className="relative p-6 xl:p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Literary Thought
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={changeThought}
            className="hover:bg-primary/10 transition-all duration-300"
            title="Get new thought"
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div
          className={`transition-all duration-300 ${
            isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <blockquote className="text-base xl:text-lg font-serif italic text-foreground/90 mb-4 leading-relaxed">
            "{currentThought.text}"
          </blockquote>
          <p className="text-sm text-muted-foreground font-medium">
            — {currentThought.author}
          </p>
        </div>
      </div>
    </Card>
  );
}
