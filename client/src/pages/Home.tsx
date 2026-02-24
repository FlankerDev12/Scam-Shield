import { useMemo, useState } from "react";
import { FileX, RotateCcw } from "lucide-react";
import { useAnalyze } from "@/hooks/use-analyze";
import { AppShell } from "@/components/AppShell";
import { AnalyzeComposer } from "@/components/AnalyzeComposer";
import { RiskDial } from "@/components/RiskDial";
import { AnalysisCards } from "@/components/AnalysisCards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { AnalyzeResponse } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const analyze = useAnalyze();

  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const canReset = useMemo(() => !!message.trim() || !!result, [message, result]);

  const onAnalyze = () => {
    analyze.mutate(
      { message },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({
            title: "Analysis complete",
            description: `Risk: ${data.riskCategory} • Score ${Math.round(data.riskScore)}/100`,
          });
        },
        onError: (err) => {
          toast({
            title: "Analysis failed",
            description: err instanceof Error ? err.message : "Unexpected error",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <AnalyzeComposer
          value={message}
          onChange={setMessage}
          onAnalyze={onAnalyze}
          isPending={analyze.isPending}
        />

        {result ? (
          <div className="space-y-6">
            <Card className="glass grain animate-float-in p-4 sm:p-6" style={{ animationDelay: "40ms" }}>
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
                <div className="min-w-[260px]">
                  <div className="text-sm font-semibold text-muted-foreground">Result</div>
                  <div className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                    {result.riskCategory}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Confidence: <span className="font-semibold text-foreground">{result.confidence}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(
                            `ScamShield AI Pro\nRisk: ${result.riskCategory} (${Math.round(
                              result.riskScore,
                            )}/100)\nConfidence: ${result.confidence}\nType: ${result.scamType}\n\nReasoning:\n${result.reasoning}`,
                          )
                          .then(() => {
                            toast({ title: "Copied", description: "Summary copied to clipboard." });
                          })
                          .catch(() => {
                            toast({
                              title: "Copy failed",
                              description: "Clipboard permission denied.",
                              variant: "destructive",
                            });
                          });
                      }}
                    >
                      Copy summary
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setMessage("");
                        setResult(null);
                        analyze.reset();
                        toast({ title: "Reset", description: "Ready for a new analysis." });
                      }}
                      disabled={!canReset}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      New scan
                    </Button>
                  </div>
                </div>

                <RiskDial score={result.riskScore} category={result.riskCategory} className="w-full md:w-auto" />
              </div>
            </Card>

            <AnalysisCards data={result} />
          </div>
        ) : (
          <Card className="glass grain animate-float-in p-6" style={{ animationDelay: "60ms" }}>
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="grid place-items-center rounded-2xl bg-secondary p-3">
                <FileX className="h-6 w-6" />
              </div>
              <div className="text-lg font-semibold tracking-tight">No analysis yet</div>
              <div className="max-w-lg text-sm text-muted-foreground">
                Paste a suspicious message and run analysis. You’ll get a risk score, category, and extracted signals.
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Button
                  onClick={() => {
                    const s =
                      "Dear customer, your KYC is pending. Click https://kyc-update.example to avoid account suspension. Share OTP for verification.";
                    setMessage(s);
                    toast({ title: "Example added", description: "Now click Analyze." });
                  }}
                >
                  Try an example
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Back to top
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
