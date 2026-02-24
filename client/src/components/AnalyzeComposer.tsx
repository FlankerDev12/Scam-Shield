import { useEffect, useMemo, useRef, useState } from "react";
import { Shield, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  {
    label: "Bank OTP & urgency",
    text: "Your account will be blocked in 30 minutes. Verify your KYC immediately: http://secure-kyc-verification.example.com. Share OTP to confirm.",
  },
  {
    label: "UPI collect request",
    text: "Hi, I accidentally sent you ₹4,999. Please accept the UPI collect request from 'refund-team@upi' so I can reverse it quickly.",
  },
  {
    label: "Delivery fee bait",
    text: "Your parcel is stuck. Pay ₹25 fee at https://track-myparcel.example to reschedule delivery.",
  },
];

export function AnalyzeComposer({
  value,
  onChange,
  onAnalyze,
  isPending,
}: {
  value: string;
  onChange: (v: string) => void;
  onAnalyze: () => void;
  isPending: boolean;
}) {
  const { toast } = useToast();
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [exampleIdx, setExampleIdx] = useState(0);

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  const count = value.trim().length;
  const hint = useMemo(() => {
    if (count === 0) return "Paste a message, email, or SMS. Keep it short or include full context.";
    if (count < 40) return "Add more context (sender, links, request, urgency).";
    return "Looks good. Run analysis when ready.";
  }, [count]);

  return (
    <Card className="glass grain animate-float-in">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[240px]">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                <Shield className="h-4 w-4" />
              </div>
              <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                ScamShield AI Pro
              </h1>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Intelligent Scam Detection. Powered by Hybrid AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const next = (exampleIdx + 1) % EXAMPLES.length;
                setExampleIdx(next);
                onChange(EXAMPLES[next].text);
                toast({
                  title: "Example loaded",
                  description: EXAMPLES[next].label,
                });
                requestAnimationFrame(() => taRef.current?.focus());
              }}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Load example
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                onChange("");
                toast({ title: "Cleared", description: "Paste a new message to analyze." });
                requestAnimationFrame(() => taRef.current?.focus());
              }}
            >
              Clear
            </Button>

            <Button
              onClick={() => {
                if (!value.trim()) {
                  toast({
                    title: "Message required",
                    description: "Paste or type a message to analyze.",
                    variant: "destructive",
                  });
                  return;
                }
                onAnalyze();
              }}
              disabled={isPending}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isPending ? "Analyzing…" : "Analyze"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="relative">
          <div
            className="pointer-events-none absolute inset-0 rounded-[calc(var(--radius)+4px)]"
            style={{
              background:
                "linear-gradient(120deg, hsl(var(--primary)/0.12), transparent 28%, hsl(var(--accent)/0.12) 62%, transparent)",
            }}
          />
          <div className="relative rounded-2xl border bg-background/60 p-3 backdrop-blur-xl">
            <Textarea
              ref={taRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste the message you received…"
              className={cn(
                "min-h-[160px] resize-none border-0 bg-transparent text-base leading-relaxed focus-visible:ring-0",
              )}
            />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="text-sm text-muted-foreground">{hint}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1">
                  {count} chars
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1">
                  No storage
                </span>
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1">
                  Local-first UI
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
