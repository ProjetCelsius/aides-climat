// Hook pour la recherche SIREN via l'API recherche-entreprises.api.gouv.fr
import { useState } from "react";
import { getRegionFromCP, getNafInfo, getEffectifFromTranche } from "../utils/mappings";

export function useSirenLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(siren) {
    if (!siren || siren.length !== 9 || !/^\d{9}$/.test(siren)) {
      setError("Le SIREN doit contenir exactement 9 chiffres");
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${siren}&page=1&per_page=1`
      );

      if (!res.ok) throw new Error("API indisponible");

      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setError("Entreprise non trouvée. Vérifiez le SIREN.");
        setLoading(false);
        return null;
      }

      const ent = data.results[0];
      const nafCode = ent.activite_principale || "";
      const nafInfo = getNafInfo(nafCode);
      const effectif = getEffectifFromTranche(ent.tranche_effectif_salarie);
      const cp = ent.siege?.code_postal || "";
      const region = getRegionFromCP(cp);

      const profile = {
        nom: ent.nom_complet || ent.nom_raison_sociale || "",
        siren: siren,
        naf: nafCode,
        naf_section: nafInfo.section,
        secteur_public: nafInfo.public,
        est_industriel: nafInfo.industriel,
        effectif: effectif,
        effectif_site: effectif,
        ca_me: effectif < 50 ? 5 : effectif < 250 ? 25 : effectif < 500 ? 100 : 500,
        code_postal: cp,
        region: region,
        ville: ent.siege?.libelle_commune || "",
        anciennete: 5, // défaut, difficile à calculer exactement
      };

      setLoading(false);
      return profile;
    } catch (e) {
      setError("Erreur de connexion. Réessayez ou passez en mode manuel.");
      setLoading(false);
      return null;
    }
  }

  return { lookup, loading, error, setError };
}
