"use client";

import { useState } from "react";

type State = { phase: "idle" | "loading" | "done" | "error"; message: string };

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>({ phase: "idle", message: "" });

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    setState({ phase: "loading", message: "" });
    try {
      const source = new URLSearchParams(window.location.search).get("utm_source") ?? "";
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent, source, website }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Inscription impossible.");
      setState({ phase: "done", message: "C'est noté. On t'écrit le jour du lancement." });
    } catch (err) {
      setState({ phase: "error", message: err instanceof Error ? err.message : "Inscription impossible." });
    }
  }

  if (state.phase === "done") {
    return (
      <p className="soon-done" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form className="soon-form" onSubmit={submit} noValidate>
      <label className="field">
        Ton e-mail
        <input
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          placeholder="toi@exemple.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={state.phase === "error" ? true : undefined}
          aria-describedby={state.phase === "error" ? "soon-err" : undefined}
        />
      </label>
      {/* champ piège pour les robots : caché aux humains et aux lecteurs d'écran */}
      <div className="hp" aria-hidden="true">
        <label>
          Ne pas remplir
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>J&rsquo;accepte de recevoir un e-mail au lancement de unfollowd.</span>
      </label>
      {state.phase === "error" && (
        <p id="soon-err" className="gate-err" role="alert">
          {state.message}
        </p>
      )}
      <button className="btn primary" type="submit" disabled={state.phase === "loading"}>
        {state.phase === "loading" ? "Envoi…" : "Me prévenir"}
      </button>
    </form>
  );
}
