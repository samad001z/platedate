"use client";

import { submitEnquiry } from "@/app/party/actions";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import { enquirySchema } from "@/lib/schemas";
import { whatsappLink } from "@/lib/site";
import { useState, useTransition } from "react";

export function PartyClient({ todayISO }: { todayISO: string }) {
  const [isPending, startTransition] = useTransition();
  const [kind, setKind] = useState<"party" | "bulk">("party");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [headcount, setHeadcount] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <main className="px-gutter py-section mx-auto max-w-xl">
        <Card className="p-6 sm:p-8">
          <h1 className="text-title">Got it, thank you</h1>
          <p className="text-body text-plum-ink/70 mt-2">
            Rhea reads every enquiry herself and replies the same day, usually
            within a few hours. If it is urgent, WhatsApp reaches her fastest.
          </p>
          <a
            href={whatsappLink(
              "Hello Rhea, I just sent a party enquiry through the website.",
            )}
            target="_blank"
            rel="noreferrer"
            className="bg-berry text-body text-porcelain hover:bg-berry-deep mt-4 inline-flex h-12 items-center justify-center rounded-md px-5 font-semibold transition duration-150"
          >
            Message on WhatsApp
          </a>
        </Card>
      </main>
    );
  }

  function submit() {
    setServerError(null);
    const digits = budget.replace(/[^\d]/g, "");
    const input = {
      kind,
      name,
      phone,
      eventDate,
      headcount: headcount ? Number(headcount) : undefined,
      budgetPaise: digits ? Number(digits) * 100 : undefined,
      message,
    };
    const parsed = enquirySchema.safeParse(input);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    startTransition(async () => {
      const result = await submitEnquiry(parsed.data);
      if (result.ok) setSent(true);
      else setServerError(result.message);
    });
  }

  const err = (key: string) =>
    fieldErrors[key] ? (
      <p className="text-small text-berry mt-1 font-medium">
        {fieldErrors[key]}
      </p>
    ) : null;

  return (
    <main className="px-gutter mx-auto max-w-xl py-10">
      <h1 className="text-hero">Feeding a crowd</h1>
      <p className="text-body text-plum-ink/70 mt-2 max-w-prose">
        Tell Rhea the date, the headcount and the occasion. She builds the
        platter around it and replies with a menu and a quote.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
        className="mt-6 flex flex-col gap-5"
      >
        <div>
          <p className="text-small mb-1.5 font-semibold">What is this for</p>
          <div className="flex gap-2">
            {(
              [
                ["party", "A party or occasion"],
                ["bulk", "A bulk order"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
                className={cn(
                  "rounded-pill text-body h-12 border px-5 font-medium transition-colors",
                  kind === value
                    ? "border-berry bg-blush font-semibold"
                    : "border-plum-ink/20 bg-porcelain hover:bg-blush/50",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="pq-name"
            className="text-small mb-1.5 block font-semibold"
          >
            Your name
          </label>
          <Input
            id="pq-name"
            autoComplete="name"
            value={name}
            error={!!fieldErrors.name}
            onChange={(e) => setName(e.target.value)}
          />
          {err("name")}
        </div>

        <div>
          <label
            htmlFor="pq-phone"
            className="text-small mb-1.5 block font-semibold"
          >
            Mobile number
          </label>
          <Input
            id="pq-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98300 12345"
            value={phone}
            error={!!fieldErrors.phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {err("phone")}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="pq-date"
              className="text-small mb-1.5 block font-semibold"
            >
              Event date (if you know it)
            </label>
            <Input
              id="pq-date"
              type="date"
              min={todayISO}
              value={eventDate}
              error={!!fieldErrors.eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            {err("eventDate")}
          </div>
          <div>
            <label
              htmlFor="pq-headcount"
              className="text-small mb-1.5 block font-semibold"
            >
              Roughly how many people
            </label>
            <Input
              id="pq-headcount"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="40"
              value={headcount}
              error={!!fieldErrors.headcount}
              onChange={(e) => setHeadcount(e.target.value)}
            />
            {err("headcount")}
          </div>
        </div>

        <div>
          <label
            htmlFor="pq-budget"
            className="text-small mb-1.5 block font-semibold"
          >
            Budget (optional)
          </label>
          <Input
            id="pq-budget"
            inputMode="numeric"
            placeholder="₹ 8,000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="pq-message"
            className="text-small mb-1.5 block font-semibold"
          >
            Tell us about it
          </label>
          <Textarea
            id="pq-message"
            placeholder="The occasion, dietary rules (strictly Jain, no nuts), what you have in mind"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {serverError && (
          <p aria-live="polite" className="text-small text-berry font-medium">
            {serverError}
          </p>
        )}

        <Button
          size="lg"
          type="submit"
          loading={isPending}
          className="sm:self-start"
        >
          Send the enquiry
        </Button>
      </form>
    </main>
  );
}
