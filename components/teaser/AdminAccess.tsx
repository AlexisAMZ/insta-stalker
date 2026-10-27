"use client";

import { useState } from "react";
import AccessForm from "./AccessForm";

/** Accès admin discret en bas de la page d'attente : un bouton qui déplie le formulaire de mot de passe. */
export default function AdminAccess({ open: initial, next }: { open: boolean; next: string }) {
  const [open, setOpen] = useState(initial);
  return (
    <div className="admin">
      <button
        type="button"
        className="admin-toggle"
        aria-expanded={open}
        aria-controls="admin-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Fermer l'accès admin" : "Se connecter en tant qu'admin"}
      </button>
      {open && (
        <div id="admin-panel" className="admin-panel">
          <AccessForm next={next} />
        </div>
      )}
    </div>
  );
}
