"use client";

import { useActionState } from "react";
import { unlock, type AccessState } from "./actions";

export default function AccessForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AccessState, FormData>(unlock, {});
  return (
    <form action={action} className="gate-form">
      <input type="hidden" name="next" value={next} />
      <label className="field">
        Mot de passe
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "gate-err" : undefined}
        />
      </label>
      {state.error && <p id="gate-err" className="gate-err" role="alert">{state.error}</p>}
      <button className="btn primary" type="submit" disabled={pending}>
        {pending ? "Vérification…" : "Entrer"}
      </button>
    </form>
  );
}
