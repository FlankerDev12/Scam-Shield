import { PropsWithChildren } from "react";
import { Link, useLocation } from "wouter";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function TopNav() {
  const [loc] = useLocation();

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = loc === href;
    return (
      <Link
        href={href}
        className={cn(
          "rounded-full px-3 py-2 text-sm transition-colors",
          active
            ? "bg-secondary text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-[999]">
      <div className="mesh-bg">
        <div className="border-b bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link href="/" className="group flex items-center gap-2">
              <div className="relative grid place-items-center rounded-2xl bg-card p-2 shadow-[var(--shadow-sm)] ring-1 ring-border/60">
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(120px 60px at 30% 20%, hsl(var(--primary)/0.20), transparent 60%), radial-gradient(120px 60px at 80% 80%, hsl(var(--accent)/0.18), transparent 60%)",
                  }}
                />
                <ShieldCheck className="relative h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">ScamShield AI Pro</div>
                <div className="text-xs text-muted-foreground">Hybrid risk analysis</div>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-1">
              <NavLink href="/" label="Analyze" />
              <NavLink href="/about" label="How it works" />
              <NavLink href="/privacy" label="Privacy" />
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const root = document.documentElement;
                  root.classList.toggle("dark");
                }}
              >
                Toggle theme
              </Button>
              <Button
                onClick={() => {
                  window.open("https://support.google.com/websearch/answer/10631844?hl=en", "_blank");
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Safety tips
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <div className="glass grain rounded-2xl px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="text-sm text-muted-foreground">
            No data is stored. Analysis runs securely.
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(156_60%_42%)]" />
              Client-first UI
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
              Hybrid AI scoring
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="mesh-bg">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
