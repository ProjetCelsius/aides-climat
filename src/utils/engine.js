// Moteur d'éligibilité - croise le profil entreprise avec la base de données
import { DISPOSITIFS, AIDES_REGIONALES, CATEGORIES } from "../data/dispositifs";

export function computeEligibilite(profile) {
  const results = {
    eligible: [],
    nonEligible: [],
    totalSubventions: 0,
    nbCelsius: 0,
    categories: {},
  };

  // 1. Évaluer chaque dispositif national
  DISPOSITIFS.forEach((d) => {
    const check = d.checkEligibilite(profile);
    const financement = d.getFinancement(profile);

    if (check.eligible && financement) {
      const item = {
        ...d,
        financement,
        check,
        isRegional: false,
      };
      results.eligible.push(item);

      // Calculer le total des subventions
      if (financement.total && financement.reste !== null && financement.reste !== undefined) {
        results.totalSubventions += financement.total - financement.reste;
      }

      if (d.celsius) results.nbCelsius++;
    } else {
      // Seulement ajouter aux non-éligibles si c'est un dispositif principal (pas les génériques)
      if (check.reasons.length > 0) {
        results.nonEligible.push({ ...d, check, financement });
      }
    }
  });

  // 2. Ajouter les aides régionales correspondant à la région
  if (profile.region) {
    AIDES_REGIONALES.filter((a) => a.region === profile.region).forEach((a) => {
      const check = a.checkEligibilite(profile);
      const financement = a.getFinancement(profile);

      if (check.eligible && financement) {
        results.eligible.push({
          ...a,
          categorie: "regional",
          celsius: false,
          check,
          financement,
          isRegional: true,
        });
      }
    });
  }

  // 3. Regrouper par catégorie
  Object.keys(CATEGORIES).forEach((catId) => {
    const items = results.eligible.filter((d) => d.categorie === catId);
    if (items.length > 0) {
      results.categories[catId] = {
        ...CATEGORIES[catId],
        items,
      };
    }
  });

  // 4. Trier : bon_plan en premier dans chaque catégorie, puis celsius
  Object.values(results.categories).forEach((cat) => {
    cat.items.sort((a, b) => {
      if (a.celsius && !b.celsius) return -1;
      if (!a.celsius && b.celsius) return 1;
      if (a.bon_plan && !b.bon_plan) return -1;
      if (!a.bon_plan && b.bon_plan) return 1;
      return 0;
    });
  });

  return results;
}
