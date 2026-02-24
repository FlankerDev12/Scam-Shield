import { useMemo, useState } from "react";
import {
  Aperture,
  BadgeCheck,
  Brain,
  Link as LinkIcon,
  ListChecks,
  ShieldAlert,
  Split,
} from "lucide-react";
import { AnalyzeResponse } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExtractedPills } from "@/components/ExtractedPills";
import { cn } from "@/lib/utils";

function toneMeta(score: number, category: string) {
  const c = (category || "").toLowerCase();
  const tone = c.includes("high") || score >= 70 ? "high" : c.includes("sus") || score >= 35 ? "mid" : "low";
  if (tone === "high")
    return {
      icon: ShieldAlert,
      title: "High risk indicators",
      desc: "Multiple red flags detected. Treat as likely scam.",
    };
  if (tone === "mid")
    return {
      icon: Aperture,
      title: "Suspicious patterns",
      desc: "Some signals match common scam playbooks. Verify carefully.",
    };
  return {
    icon: BadgeCheck,
    title: "Low risk signals",
    desc: "Few scam indicators found. Still stay cautious with links & payments.",
  };
}

export function AnalysisCards({ data }: { data: AnalyzeResponse }) {
  const [tab, setTab] = useState<"signals" | "extract">("signals");

  const meta = useMemo(() => toneMeta(data.riskScore, data.riskCategory), [data.riskScore, data.riskCategory]);
  const MetaIcon = meta.icon;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Card className="glass grain animate-float-in lg:col-span-7" style={{ animationDelay: "80ms" }}>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-[240px]">
              <div className="flex items-center gap-2">
                <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                  <MetaIcon className="h-4 w-4" />
                </div>
                <div className="text-lg font-semibold tracking-tight">{meta.title}</div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{meta.desc}</div>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-muted-foreground">Confidence</div>
              <div className="mt-1 inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
                {data.confidence}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList>
                <TabsTrigger value="signals">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Signals
                </TabsTrigger>
                <TabsTrigger value="extract">
                  <Split className="mr-2 h-4 w-4" />
                  Extracted
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signals" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="text-sm font-semibold">Scam type</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">{data.scamType || "Unknown"}</div>
                  </div>

                  <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <div className="text-sm font-semibold">Primary cue</div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{data.reasoning}</div>
                  </div>
                </div>

                <Accordion type="single" collapsible defaultValue="reasoning">
                  <AccordionItem value="reasoning">
                    <AccordionTrigger className="text-sm">
                      AI reasoning (expand)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-2xl border bg-background/60 p-4 text-sm leading-relaxed text-foreground/90 backdrop-blur">
                        <div className="text-xs font-semibold text-muted-foreground">Detailed rationale</div>
                        <div className="mt-2 whitespace-pre-wrap">{data.reasoning}</div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value="extract" className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ExtractedPills label="URLs" items={data.extracted.urls} emptyText="No links detected" />
                  <ExtractedPills label="Brands" items={data.extracted.brands} emptyText="No brand mentions detected" />
                  <ExtractedPills label="Amounts" items={data.extracted.amounts} emptyText="No amounts detected" />
                  <ExtractedPills label="UPI IDs" items={data.extracted.upiIds} emptyText="No UPI IDs detected" />
                  <ExtractedPills label="Phone numbers" items={data.extracted.phones} emptyText="No phone numbers detected" className="sm:col-span-2" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:col-span-5">
        <Card className={cn("glass grain animate-float-in")} style={{ animationDelay: "140ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                <ListChecks className="h-4 w-4" />
              </div>
              <div className="text-base font-semibold tracking-tight">Heuristic Analysis</div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Fast pattern matching for urgency, money requests, impersonation cues, and risky link behavior.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-2xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur">
              We combine structured extraction with rule-based signals to avoid over-relying on any single model.
            </div>
          </CardContent>
        </Card>

        <Card className="glass grain animate-float-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                <LinkIcon className="h-4 w-4" />
              </div>
              <div className="text-base font-semibold tracking-tight">Brand & Link Intelligence</div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Highlights domains, brands, payment identifiers, and contact handles that are commonly used in scams.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-2xl border bg-background/60 p-4 backdrop-blur">
              <div className="grid grid-cols-1 gap-3">
                <ExtractedPills label="Top URLs" items={data.extracted.urls.slice(0, 4)} emptyText="No links detected" />
                <ExtractedPills label="Brand mentions" items={data.extracted.brands.slice(0, 6)} emptyText="No brands detected" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass grain animate-float-in" style={{ animationDelay: "260ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                <Brain className="h-4 w-4" />
              </div>
              <div className="text-base font-semibold tracking-tight">AI Contextual Analysis</div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Interprets intent: social engineering, coercion, spoofing, and “too good to be true” narratives.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-2xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur">
              <div className="text-xs font-semibold text-muted-foreground">Summary</div>
              <div className="mt-2 text-foreground/90 line-clamp-4">{data.reasoning}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
