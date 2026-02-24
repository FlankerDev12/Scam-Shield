import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Link2, ShieldCheck, TriangleAlert } from "lucide-react";

export default function About() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="animate-float-in">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            How ScamShield AI Pro works
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            A premium, minimal workflow: paste a message → we extract signals → we score risk → you get clear guidance.
            The goal is to reduce false confidence and highlight what to verify.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="glass grain animate-float-in" style={{ animationDelay: "40ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-base font-semibold">Heuristic signals</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Fast pattern checks for urgency, threats, payment requests, impersonation, and coercive language.
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Urgency</Badge>
                <Badge variant="secondary">Threats</Badge>
                <Badge variant="secondary">Refund bait</Badge>
                <Badge variant="secondary">KYC scams</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass grain animate-float-in" style={{ animationDelay: "90ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                  <Link2 className="h-4 w-4" />
                </div>
                <div className="text-base font-semibold">Extraction</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                We identify key artifacts to verify: links, amounts, phone numbers, UPI IDs, and brands.
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">URLs</Badge>
                <Badge variant="secondary">Amounts</Badge>
                <Badge variant="secondary">UPI</Badge>
                <Badge variant="secondary">Phones</Badge>
                <Badge variant="secondary">Brands</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass grain animate-float-in" style={{ animationDelay: "140ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="text-base font-semibold">Contextual AI</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                AI reasoning looks at intent and narrative to explain “why” the message is risky—without being vague.
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-2xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur">
                Output includes: risk score, category, scam type, confidence, and a readable rationale.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass grain animate-float-in" style={{ animationDelay: "190ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                <TriangleAlert className="h-4 w-4" />
              </div>
              <div className="text-base font-semibold">What you should do next</div>
            </div>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground/90 dark:prose-invert">
            <ul>
              <li>Never share OTP/PIN/passwords—no legitimate service asks for them.</li>
              <li>Verify the sender using an official channel, not the number/link in the message.</li>
              <li>Don’t click shortened or suspicious domains; type official domains manually.</li>
              <li>For UPI: beware of collect requests disguised as refunds.</li>
              <li>If in doubt, pause. Urgency is a classic manipulation technique.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
