import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Lock, ShieldCheck, DatabaseZap } from "lucide-react";

export default function Privacy() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="animate-float-in">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy, by design
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            ScamShield AI Pro is built to minimize sensitive exposure. The UI is explicit: paste content only when you
            need analysis, and avoid sharing secrets.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="glass grain animate-float-in" style={{ animationDelay: "40ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                  <DatabaseZap className="h-4 w-4" />
                </div>
                <div className="text-base font-semibold">No storage promise</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                The interface is designed so analysis can be run without saving your message history.
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-2xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur">
                Tip: redact names, account numbers, addresses, and OTPs before analyzing.
              </div>
            </CardContent>
          </Card>

          <Card className="glass grain animate-float-in" style={{ animationDelay: "90ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="text-base font-semibold">Security posture</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Strong defaults: HTTPS in production, minimal attack surface, clear UI to avoid risky actions.
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-2xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur">
                Always verify using official apps/websites—not links in messages.
              </div>
            </CardContent>
          </Card>

          <Card className="glass grain animate-float-in" style={{ animationDelay: "140ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="grid place-items-center rounded-2xl bg-secondary p-2">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-base font-semibold">User control</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                You can clear your message at any time. No background recording, no hidden collection flows.
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-2xl border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur">
                Paste only what you need for analysis and avoid private identifiers.
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass grain animate-float-in" style={{ animationDelay: "180ms" }}>
          <CardHeader>
            <div className="text-base font-semibold tracking-tight">Plain-language summary</div>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground/90 dark:prose-invert">
            <p>
              We built this UI to be transparent: you paste a message, you request analysis, you see the output. Avoid
              sharing secrets (OTP/PIN/password). If something feels urgent or threatening, slow down and verify with an
              official channel.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
