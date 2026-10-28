-- Double opt-in : une adresse n'est comptée et exportée qu'une fois confirmée.
-- À exécuter UNE fois sur Neon avant le déploiement.
-- Les inscrits existants restent « non confirmés » : décide s'il faut les confirmer d'office
-- (UPDATE waitlist SET confirmed_at = created_at WHERE source = '<source de confiance>') ou leur écrire.
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
