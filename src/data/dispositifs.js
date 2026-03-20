// Base de données des 47 dispositifs d'aides climat pour entreprises
// Dernière mise à jour : 20 mars 2026
// Sources : BPI France, ADEME, OFB, Régions, economie.gouv.fr

export const DISPOSITIFS = [
  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE A - DIAGNOSTICS SUBVENTIONNÉS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag-decarbon-action",
    categorie: "diagnostics",
    nom: "Diag Décarbon'Action",
    operateur: "Bpifrance / ADEME",
    description: "Bilan GES complet (scopes 1, 2 et 3) + plan d'actions de décarbonation avec un expert agréé.",
    duree: "12 jours sur 6-8 mois",
    cout_total_ht: 10000,
    getFinancement: (p) => {
      if (p.effectif >= 500) return null;
      if (p.effectif < 250) return { taux: 40, reste: 6000, total: 10000, label: "Subvention CEE PACTE : 40%" };
      return { taux: 0, reste: 10000, total: 10000, label: "Plus de subvention pour les 250-499 sal. depuis mai 2025" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 500) r.push("Effectif ≥ 500 salariés");
      if (p.a_deja_bilan_ges) r.push("Vous avez déjà réalisé un bilan GES");
      if (p.soumis_beges) r.push("Soumis à l'obligation BEGES réglementaire");
      if (p.secteur_public) r.push("Secteur public non éligible");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://diag.bpifrance.fr/diag-decarbon-action",
    celsius: true,
    celsius_msg: "Celsius est expert agréé Diag Décarbon'Action",
    bon_plan: false,
  },
  {
    id: "diag-ecoconception",
    categorie: "diagnostics",
    nom: "Diag Écoconception",
    operateur: "Bpifrance / ADEME",
    description: "Analyse de cycle de vie (ACV) d'un produit/service/procédé + plan d'écoconception.",
    duree: "18 jours sur 6-8 mois",
    cout_total_ht: 18000,
    getFinancement: (p) => {
      if (p.effectif >= 250 || p.ca_me >= 50) return null;
      if (p.effectif < 50 && p.ca_me < 10) return { taux: 70, reste: 5400, total: 18000, label: "Subvention ADEME : 70%" };
      return { taux: 60, reste: 7200, total: 18000, label: "Subvention ADEME : 60%" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 250) r.push("Effectif ≥ 250 salariés");
      if (p.ca_me >= 50) r.push("CA ≥ 50M€");
      if (!p.a_produit && !p.a_service) r.push("Pas de produit ou service identifié pour l'écoconception");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://diag.bpifrance.fr/diag-eco-conception",
    celsius: true,
    celsius_msg: "Celsius est expert agréé ACV et écoconception",
    bon_plan: false,
  },
  {
    id: "diag-adaptation",
    categorie: "diagnostics",
    nom: "Diag Adaptation",
    operateur: "Bpifrance / ADEME",
    description: "Diagnostic de vulnérabilité climatique de votre site + plan d'adaptation aux risques physiques.",
    duree: "7 jours sur 3-6 mois",
    cout_total_ht: 6000,
    getFinancement: (p) => {
      if (p.effectif >= 500) return null;
      return { taux: 50, reste: 3000, total: 6000, label: "Subvention ADEME : 50%" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 500) r.push("Effectif ≥ 500 salariés");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://diag.bpifrance.fr/diag-adaptation",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "diag-eco-flux",
    categorie: "diagnostics",
    nom: "Diag Eco-Flux",
    operateur: "Bpifrance / ADEME",
    description: "Optimisation de vos flux eau, énergie, matières et déchets. Économie moyenne : 45 000€/an/site.",
    duree: "10 jours",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (!p.a_site_production) return null;
      const eff = p.effectif_site || p.effectif;
      if (eff < 20 || eff > 250) return null;
      if (eff < 50) return { taux: 50, reste: 2000, total: 4000, label: "Subvention ADEME : 50%" };
      return { taux: 50, reste: 3000, total: 6000, label: "Subvention ADEME : 50%" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (!p.a_site_production) r.push("Pas de site de production/transformation");
      const eff = p.effectif_site || p.effectif;
      if (eff < 20) r.push("Site < 20 salariés");
      if (eff > 250) r.push("Site > 250 salariés");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.bpifrance.fr/catalogue-offres/diag-eco-flux",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "diag-perfimmo",
    categorie: "diagnostics",
    nom: "Diag Perf'Immo",
    operateur: "Bpifrance / ADEME",
    description: "Audit énergétique de vos bâtiments tertiaires + plan de rénovation énergétique chiffré.",
    duree: "8 jours sur 3-6 mois",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (p.effectif >= 500) return null;
      if (!p.est_proprietaire && !p.est_locataire) return null;
      return { taux: 50, reste: null, total: null, label: "Subvention ADEME : 50% (max 8 500€/site)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 500) r.push("Effectif ≥ 500 salariés");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.bpifrance.fr/catalogue-offres/diag-perfimmo",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "diag-biodiversite",
    categorie: "diagnostics",
    nom: "Diag Biodiversité",
    operateur: "Bpifrance / OFB",
    description: "Analyse de matérialité biodiversité de votre chaîne de valeur + plan d'action.",
    duree: "10 jours sur 3-6 mois",
    cout_total_ht: 10000,
    getFinancement: (p) => {
      if (p.effectif < 250) return { taux: 50, reste: 5000, total: 10000, label: "Subvention OFB : 50%" };
      if (p.effectif < 5000) return { taux: 30, reste: 7000, total: 10000, label: "Subvention OFB : 30%" };
      return null;
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 5000) r.push("Réservé aux PME et ETI");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://diag.bpifrance.fr/diag-biodiversite",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "booster-eco-energie",
    categorie: "diagnostics",
    nom: "Booster Éco-Énergie Tertiaire",
    operateur: "ADEME (CEE PACTE)",
    description: "Étude d'ingénierie pour rénovation énergétique globale de vos bâtiments tertiaires. Nouveau 2026.",
    duree: "Variable",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (p.effectif >= 250) return null;
      return { taux: null, reste: null, total: null, label: "Financement CEE PACTE Entreprises" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 250) r.push("Réservé aux TPE/PME");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://agirpourlatransition.ademe.fr",
    celsius: false,
    bon_plan: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE B - STRATÉGIE & ACCOMPAGNEMENT
  // ═══════════════════════════════════════════════════════════════
  {
    id: "act-pas-a-pas",
    categorie: "strategie",
    nom: "ACT Pas à Pas",
    operateur: "ADEME",
    description: "Construisez votre stratégie de décarbonation alignée sur l'Accord de Paris, avec un plan de transition.",
    duree: "12-18 mois",
    cout_total_ht: 25000,
    getFinancement: (p) => {
      if (!p.a_deja_bilan_ges || p.bilan_ges_ancien) return null;
      if (p.effectif < 250) return { taux: 70, reste: 7500, total: 25000, label: "Subvention ADEME : 70% (max 18k€)" };
      if (p.effectif < 5000) return { taux: 60, reste: 10000, total: 25000, label: "Subvention ADEME : 60% (max 18k€)" };
      return { taux: 50, reste: 12500, total: 25000, label: "Subvention ADEME : 50% (max 18k€)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (!p.a_deja_bilan_ges) r.push("Prérequis : bilan GES de moins de 2 ans");
      if (p.bilan_ges_ancien) r.push("Votre bilan GES date de plus de 2 ans - à actualiser");
      if (p.est_industriel) r.push("Entreprises industrielles : orientation vers PACTE Industrie");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://mission-transition-ecologique.beta.gouv.fr/aides-entreprise/act-pas-a-pas",
    celsius: true,
    celsius_msg: "Celsius accompagne la stratégie climat post-bilan carbone",
    bon_plan: false,
  },
  {
    id: "act-evaluation",
    categorie: "strategie",
    nom: "ACT Évaluation",
    operateur: "ADEME",
    description: "Évaluez l'alignement de votre stratégie climat avec les objectifs de l'Accord de Paris.",
    duree: "6-12 mois",
    cout_total_ht: 6000,
    getFinancement: (p) => {
      if (p.effectif < 250) return { taux: 80, reste: 1200, total: 6000, label: "Subvention ADEME : 80%" };
      return { taux: 60, reste: 2400, total: 6000, label: "Subvention ADEME : 60%" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (!p.a_deja_bilan_ges) r.push("Prérequis : avoir un bilan GES et une stratégie climat");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://actinitiative.org/fr/act-in-france-soutien-financier/",
    celsius: true,
    celsius_msg: "Celsius peut vous accompagner dans l'évaluation ACT",
    bon_plan: false,
  },
  {
    id: "pacte-industrie",
    categorie: "strategie",
    nom: "PACTE Industrie",
    operateur: "ADEME / ATEE",
    description: "Parcours complet de décarbonation industrie : études mix énergétique, stratégie, trajectoire investissements.",
    duree: "Variable selon prestation",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (!p.est_industriel) return null;
      if (p.effectif < 250) return { taux: 80, reste: null, total: null, label: "Subvention ADEME : jusqu'à 80% (plafond 5-50k€ selon prestation)" };
      return { taux: 60, reste: null, total: null, label: "Subvention ADEME : jusqu'à 60% (plafond 5-50k€ selon prestation)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (!p.est_industriel) r.push("Réservé aux entreprises industrielles (codes NAF A-E)");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://agirpourlatransition.ademe.fr/entreprises/aides-financieres/catalogue/2026/pacte-industrie",
    celsius: true,
    celsius_msg: "Celsius intervient sur certaines prestations PACTE Industrie",
    bon_plan: false,
  },
  {
    id: "accelerateur-decarbonation",
    categorie: "strategie",
    nom: "Accélérateur Décarbonation",
    operateur: "Bpifrance / Mines Paris-PSL",
    description: "Programme premium de 24 mois avec les meilleurs experts. 20 entreprises par promotion.",
    duree: "24 mois",
    cout_total_ht: 64000,
    getFinancement: (p) => {
      if (p.effectif < 50 || p.effectif > 250) return null;
      if (p.ca_me < 10) return null;
      if (!p.a_deja_bilan_ges) return null;
      return { taux: 64, reste: 25000, total: 64000, label: "Subvention ~64% - Reste ~25 000€ HT" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif < 50) r.push("PME de 50 à 250 salariés requise");
      if (p.effectif > 250) r.push("PME de 50 à 250 salariés requise");
      if (p.ca_me < 10) r.push("CA > 10M€ requis");
      if (!p.a_deja_bilan_ges) r.push("BEGES < 2 ans requis");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.bpifrance.fr/catalogue-offres/accelerateur-decarbonation",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "cci-gratuit",
    categorie: "strategie",
    nom: "Accompagnement CCI gratuit",
    operateur: "CCI France",
    description: "Climatomètre (auto-diagnostic en ligne), Flash Diag Énergie, visite énergie, parcours accompagnement. Gratuit.",
    duree: "Variable (1h à plusieurs jours)",
    cout_total_ht: 0,
    getFinancement: () => ({ taux: 100, reste: 0, total: 0, label: "100% gratuit" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.cci.fr/ressources/developpement-durable/transition-ecologique",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "cma-performa",
    categorie: "strategie",
    nom: "Performa Environnement (CMA)",
    operateur: "Chambres de Métiers et de l'Artisanat",
    description: "Diagnostic environnemental + plan d'actions + suivi, 100% pris en charge pour artisans et TPE.",
    duree: "Plusieurs semaines",
    cout_total_ht: 0,
    getFinancement: (p) => {
      if (p.effectif > 20) return null;
      return { taux: 100, reste: 0, total: 0, label: "100% pris en charge (Région + CMA)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif > 20) r.push("Réservé aux artisans et TPE (< 20 sal.)");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.artisanat.fr/nous-connaitre/vous-accompagner/performa-environnement",
    celsius: false,
    bon_plan: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE C - FINANCEMENT
  // ═══════════════════════════════════════════════════════════════
  {
    id: "pret-vert-bpi",
    categorie: "financement",
    nom: "Prêt Vert Bpifrance",
    operateur: "Bpifrance",
    description: "Prêt sans garantie pour vos investissements de transition écologique.",
    duree: "2-10 ans",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (p.anciennete < 3) return null;
      return { taux: null, reste: null, total: null, label: "50 000€ à 5 000 000€ - Sans garantie, dans la limite des fonds propres" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.anciennete < 3) r.push("Entreprise de plus de 3 ans requise");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.bpifrance.fr/catalogue-offres/pret-vert",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "pret-vert-ademe",
    categorie: "financement",
    nom: "Prêt Vert ADEME",
    operateur: "ADEME / Bpifrance",
    description: "Prêt à taux bonifié si vous avez déjà bénéficié d'un diagnostic ou aide ADEME.",
    duree: "2-10 ans",
    cout_total_ht: null,
    getFinancement: (p) => {
      return { taux: null, reste: null, total: null, label: "10 000€ à 1 000 000€ - Taux bonifié, sans garantie" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.anciennete < 3) r.push("Entreprise de plus de 3 ans requise");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.bpifrance.fr/catalogue-offres/pret-vert-ademe",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "pret-economies-energie",
    categorie: "financement",
    nom: "Prêt Économies d'Énergie (PEE)",
    operateur: "Bpifrance",
    description: "Prêt pour financer vos équipements d'efficacité énergétique éligibles aux CEE.",
    duree: "3-7 ans",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (p.anciennete < 3) return null;
      return { taux: null, reste: null, total: null, label: "10 000€ à 500 000€" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.anciennete < 3) r.push("Entreprise de plus de 3 ans requise");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.bpifrance.fr/catalogue-offres/pret-economies-denergie",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "pret-action-climat",
    categorie: "financement",
    nom: "Prêt Action Climat",
    operateur: "Bpifrance",
    description: "Prêt 100% en ligne, sans garantie, spécial TPE. Rapide et simple.",
    duree: "2-5 ans",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (p.effectif >= 50) return null;
      return { taux: null, reste: null, total: null, label: "10 000€ à 75 000€ - 100% en ligne, sans garantie" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 50) r.push("Réservé aux TPE < 50 salariés");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.bpifrance.fr",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "fonds-chaleur",
    categorie: "financement",
    nom: "Fonds Chaleur ADEME",
    operateur: "ADEME",
    description: "Subvention pour investissements en chaleur renouvelable : biomasse, solaire thermique, géothermie, récupération de chaleur.",
    duree: "Variable",
    cout_total_ht: null,
    getFinancement: (p) => {
      return { taux: null, reste: null, total: null, label: "Budget national 800M€/an - Jusqu'à 45% du projet (plus pour PME)" };
    },
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://agirpourlatransition.ademe.fr/entreprises/aides-financieres/2026/fonds-chaleur",
    celsius: false,
    bon_plan: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE D - FORMATION & RH
  // ═══════════════════════════════════════════════════════════════
  {
    id: "vte-vert",
    categorie: "formation",
    nom: "VTE Vert",
    operateur: "Bpifrance",
    description: "8 000€ de subvention pour recruter un jeune Bac+3 sur une mission environnementale d'au moins 1 an.",
    duree: "Min 12 mois",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Subvention directe : 8 000€" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.bpifrance.fr/vte-vert",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "formation-opco",
    categorie: "formation",
    nom: "Formations climat via OPCO",
    operateur: "Votre OPCO",
    description: "Bilan carbone, ACV, RSE, Fresque du Climat pro, ISO 14001 - financées par votre OPCO.",
    duree: "1-5 jours",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (p.effectif < 50) return { taux: 100, reste: 0, total: null, label: "Prise en charge OPCO : jusqu'à 100%" };
      if (p.effectif < 300) return { taux: 80, reste: null, total: null, label: "Prise en charge OPCO : jusqu'à 80%" };
      return { taux: 50, reste: null, total: null, label: "Prise en charge OPCO partielle (~50%)" };
    },
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: null,
    celsius: true,
    celsius_msg: "Celsius propose des formations certifiées Qualiopi (BC, ACV, RSE)",
    bon_plan: false,
  },
  {
    id: "fne-formation",
    categorie: "formation",
    nom: "FNE-Formation / FSE+",
    operateur: "État / OPCO",
    description: "Financement renforcé pour formations à la transition écologique - priorité nationale n°1.",
    duree: "Variable",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (p.effectif < 50) return { taux: 70, reste: null, total: null, label: "FNE : prise en charge 70% (PE)" };
      if (p.effectif < 250) return { taux: 60, reste: null, total: null, label: "FNE : prise en charge 60% (ME)" };
      return { taux: 50, reste: null, total: null, label: "FNE : prise en charge 50% (GE)" };
    },
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://les-aides.fr/aide/V2Fv3w/dreets/fne-formation.html",
    celsius: true,
    celsius_msg: "Les formations Celsius sont éligibles FNE/FSE+",
    bon_plan: true,
  },
  {
    id: "pcrh-rse",
    categorie: "formation",
    nom: "PCRH volet RSE",
    operateur: "OPCO + État (DREETS)",
    description: "Accompagnement RH/RSE personnalisé, financé jusqu'à 100%. Très peu connu.",
    duree: "1-12 jours",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (p.effectif >= 250) return null;
      return { taux: 100, reste: 0, total: null, label: "Jusqu'à 100% financé (OPCO + État)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 250) r.push("Réservé aux TPE/PME < 250 salariés");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: null,
    celsius: false,
    bon_plan: true,
  },
  {
    id: "formation-act",
    categorie: "formation",
    nom: "Formation Chef de projet ACT",
    operateur: "ADEME",
    description: "Formation obligatoire pour piloter une démarche ACT Pas à Pas. Finançable OPCO.",
    duree: "2 jours",
    cout_total_ht: 1000,
    getFinancement: (p) => {
      if (p.effectif < 250) return { taux: 80, reste: 200, total: 1000, label: "Prise en charge ADEME : 80%" };
      return { taux: 40, reste: 600, total: 1000, label: "Prise en charge ADEME : 40%" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (!p.a_deja_bilan_ges) r.push("Prérequis : bilan GES existant (en vue d'un ACT Pas à Pas)");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://actinitiative.org/fr/act-in-france-soutien-financier/",
    celsius: true,
    celsius_msg: "Celsius peut vous orienter vers la bonne formation ACT",
    bon_plan: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE F - AVANTAGES FISCAUX & CEE
  // ═══════════════════════════════════════════════════════════════
  {
    id: "suramortissement-vehicules",
    categorie: "fiscal",
    nom: "Suramortissement véhicules propres",
    operateur: "État (DGFiP)",
    description: "Déduction fiscale supplémentaire sur l'achat de véhicules lourds propres : jusqu'à 115% pour l'électrique.",
    duree: "Sur la durée d'amortissement",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "20-60% (GNV) à 115% (électrique) de déduction fiscale supplémentaire" }),
    checkEligibilite: (p) => {
      const r = [];
      const codesTransport = ["H", "F"]; // Transport, BTP
      if (!codesTransport.includes(p.naf_section) && p.effectif < 20) r.push("Plus pertinent pour les entreprises avec flotte de véhicules lourds");
      return { eligible: true, reasons: [] }; // Toujours montrer, c'est informatif
    },
    lien: "https://bofip.impots.gouv.fr",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "exoneration-tvs",
    categorie: "fiscal",
    nom: "Exonération TVS véhicules électriques",
    operateur: "État (DGFiP)",
    description: "Les véhicules 100% électriques sont totalement exonérés de la Taxe sur les Véhicules de Société.",
    duree: "Permanent",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Économie : ~2 000 à 5 000€/véhicule/an" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.economie.gouv.fr",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "cee",
    categorie: "fiscal",
    nom: "Certificats d'Économies d'Énergie (CEE)",
    operateur: "Fournisseurs d'énergie",
    description: "Primes versées par les fournisseurs d'énergie pour vos travaux d'efficacité énergétique (isolation, chauffage, éclairage, process...).",
    duree: "Ponctuel (par opération)",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "15€/MWh cumac + bonification TPE/PME/ETI de +20%" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.ecologie.gouv.fr/cee",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "tva-bornes-recharge",
    categorie: "fiscal",
    nom: "TVA 5,5% bornes de recharge",
    operateur: "État",
    description: "TVA réduite à 5,5% au lieu de 20% pour l'installation de bornes de recharge par un professionnel certifié IRVE.",
    duree: "Permanent",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "TVA réduite : 5,5% au lieu de 20%" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: null,
    celsius: false,
    bon_plan: false,
  },
  {
    id: "forfait-mobilites-durables",
    categorie: "fiscal",
    nom: "Forfait Mobilités Durables",
    operateur: "État",
    description: "Jusqu'à 700€/an/salarié exonérés d'impôt et de charges pour les déplacements en mobilité douce.",
    duree: "Annuel",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "700€/an/salarié exonérés (employeur ET salarié)" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.economie.gouv.fr",
    celsius: false,
    bon_plan: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // CATÉGORIE G - DISPOSITIFS COMPLÉMENTAIRES
  // ═══════════════════════════════════════════════════════════════
  {
    id: "fonds-economie-circulaire",
    categorie: "complementaire",
    nom: "Fonds Économie Circulaire ADEME",
    operateur: "ADEME",
    description: "Subvention pour vos projets de réemploi, recyclage, valorisation des déchets.",
    duree: "Variable",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Études : 80% / Investissements : jusqu'à 55%" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://agirpourlatransition.ademe.fr/entreprises/aides-financieres",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "aide-reemploi-emballages",
    categorie: "complementaire",
    nom: "Aide réemploi emballages",
    operateur: "ADEME",
    description: "Subvention pour développer le réemploi de vos emballages industriels et commerciaux.",
    duree: "Jusqu'au 31/12/2026",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Variable selon projet - Objectif AGEC : 10% réemploi en 2027" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://agirpourlatransition.ademe.fr/entreprises/aides-financieres/catalogue/2026/aides-au-reemploi-des-emballages",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "een-ofb",
    categorie: "complementaire",
    nom: "Entreprises Engagées pour la Nature",
    operateur: "OFB",
    description: "Programme gratuit de reconnaissance de votre démarche biodiversité. Crédibilise votre stratégie RSE.",
    duree: "2-4 ans",
    cout_total_ht: 0,
    getFinancement: () => ({ taux: 100, reste: 0, total: 0, label: "Gratuit - Programme de reconnaissance" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://engagespourlanature.ofb.fr/entreprises",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "aides-agences-eau",
    categorie: "complementaire",
    nom: "Aides des Agences de l'Eau",
    operateur: "6 Agences de l'Eau",
    description: "Subventions pour réduire votre consommation d'eau, traiter vos effluents, préserver les milieux aquatiques.",
    duree: "Variable",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Subventions 30-70% selon agence et projet" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.lesagencesdeleau.fr",
    celsius: false,
    bon_plan: true,
  },
  {
    id: "france-2030-decarbo",
    categorie: "complementaire",
    nom: "France 2030 - Décarbonation industrie",
    operateur: "ADEME / Bpifrance",
    description: "Appels à projets pour investissements massifs de décarbonation industrielle.",
    duree: "Variable",
    cout_total_ht: null,
    getFinancement: (p) => {
      if (!p.est_industriel) return null;
      return { taux: null, reste: null, total: null, label: "Jusqu'à 30M€ par projet" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (!p.est_industriel) r.push("Réservé aux entreprises industrielles");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.economie.gouv.fr/france-2030",
    celsius: false,
    bon_plan: false,
  },
  {
    id: "ademe-investissement",
    categorie: "complementaire",
    nom: "ADEME Investissement",
    operateur: "ADEME",
    description: "Apport en fonds propres pour projets TEE innovants au stade de commercialisation.",
    duree: "Variable",
    cout_total_ht: null,
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Fonds propres - Projets matures uniquement" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://agirpourlatransition.ademe.fr",
    celsius: false,
    bon_plan: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// AIDES RÉGIONALES - ajoutées dynamiquement selon code postal
// ═══════════════════════════════════════════════════════════════
export const AIDES_REGIONALES = [
  {
    id: "idf-pmup",
    region: "ile-de-france",
    nom: "PM'UP Souveraineté TEE",
    operateur: "Région Île-de-France",
    description: "Subvention massive pour les PME franciliennes engagées dans la transition écologique.",
    getFinancement: (p) => {
      if (p.effectif < 10 || p.effectif >= 250) return null;
      return { taux: 50, reste: null, total: null, label: "Jusqu'à 375 000€ (50%, majoré en ZRE)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif < 10) r.push("PME de 10 à 250 salariés requise");
      if (p.effectif >= 250) r.push("PME de 10 à 250 salariés requise");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.iledefrance.fr/pm-up",
    bon_plan: true,
  },
  {
    id: "idf-tpup",
    region: "ile-de-france",
    nom: "TP'UP Souveraineté TEE",
    operateur: "Région Île-de-France",
    description: "Subvention pour les TPE franciliennes, version allégée de PM'UP.",
    getFinancement: (p) => {
      if (p.effectif >= 10) return null;
      return { taux: 50, reste: null, total: null, label: "Jusqu'à 82 500€ (50%)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 10) r.push("Réservé aux TPE < 10 salariés");
      if (p.ca_me >= 2) r.push("CA < 2M€ requis");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.iledefrance.fr/tp-up",
    bon_plan: true,
  },
  {
    id: "grand-est-climaxion",
    region: "grand-est",
    nom: "Climaxion",
    operateur: "Région Grand Est / ADEME",
    description: "Programme complet transition écologique : études de faisabilité, investissements EnR, économie circulaire.",
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "100 000 à 400 000€ + cumul ADEME possible" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.climaxion.fr",
    bon_plan: true,
  },
  {
    id: "occitanie-pass-te",
    region: "occitanie",
    nom: "Pass Transformation Écologique",
    operateur: "Région Occitanie",
    description: "Aide directe pour les TPE en dehors des métropoles.",
    getFinancement: (p) => {
      if (p.effectif > 20) return null;
      return { taux: 50, reste: null, total: null, label: "Jusqu'à 10 000€ (50%)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif > 20) r.push("Réservé TPE < 20 salariés");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.laregion.fr",
    bon_plan: true,
  },
  {
    id: "normandie-impulsion",
    region: "normandie",
    nom: "Impulsion Environnement",
    operateur: "Région Normandie",
    description: "Subvention + prêt à taux zéro pour investissements environnementaux.",
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Jusqu'à 1M€ (prêt 0% + subvention études 50%)" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.normandie.fr",
    bon_plan: true,
  },
  {
    id: "aura-innovr",
    region: "auvergne-rhone-alpes",
    nom: "INNOV'R",
    operateur: "Région Auvergne-Rhône-Alpes",
    description: "Financement de projets éco-innovants.",
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Variable selon projet" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.auvergnerhonealpes.fr",
    bon_plan: false,
  },
  {
    id: "na-aide-conseil",
    region: "nouvelle-aquitaine",
    nom: "Aide Conseil TEE",
    operateur: "Région Nouvelle-Aquitaine",
    description: "Financement de prestations de conseil en transition écologique.",
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "50-70%, jusqu'à 30-40k€" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://les-aides.nouvelle-aquitaine.fr",
    bon_plan: false,
  },
  {
    id: "bretagne-pret-transitions",
    region: "bretagne",
    nom: "Prêt Transitions Bretagne",
    operateur: "Région Bretagne / Bpifrance",
    description: "Nouveau prêt régional couplé à un prêt bancaire pour la transition.",
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "Prêt ~300k€ couplé bancaire" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.bretagne.bzh",
    bon_plan: true,
  },
  {
    id: "bretagne-breizh-fab",
    region: "bretagne",
    nom: "Breizh Fab - Pass Transitions",
    operateur: "Région Bretagne",
    description: "Aide aux entreprises industrielles pour leur transformation.",
    getFinancement: (p) => {
      if (!p.est_industriel || p.effectif < 5) return null;
      return { taux: 50, reste: null, total: null, label: "50% de 20 à 50k€" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (!p.est_industriel) r.push("Réservé industrie");
      if (p.effectif < 5) r.push("Min 5 salariés");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.bretagne.bzh",
    bon_plan: false,
  },
  {
    id: "hdf-booster-rev3",
    region: "hauts-de-france",
    nom: "Booster Transformation Rev3",
    operateur: "Région Hauts-de-France",
    description: "Accompagnement et financement pour la transformation durable des PME.",
    getFinancement: (p) => {
      if (p.effectif >= 250) return null;
      return { taux: 50, reste: null, total: null, label: "Jusqu'à 10 000€ (50%)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif >= 250) r.push("PME < 250 salariés");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.hautsdefrance.fr",
    bon_plan: true,
  },
  {
    id: "pdl-emploi-transitions",
    region: "pays-de-la-loire",
    nom: "Emploi Transitions",
    operateur: "Région Pays de la Loire",
    description: "Aide à l'embauche pour les postes liés à la transition écologique.",
    getFinancement: (p) => {
      if (p.effectif < 5) return null;
      return { taux: 30, reste: null, total: null, label: "Jusqu'à 15 000€ (30% salaires)" };
    },
    checkEligibilite: (p) => {
      const r = [];
      if (p.effectif < 5) r.push("Min 5 salariés en CDI");
      return { eligible: r.length === 0, reasons: r };
    },
    lien: "https://www.paysdelaloire.fr",
    bon_plan: true,
  },
  {
    id: "cvl-cap-transition",
    region: "centre-val-de-loire",
    nom: "CAP Transition Écologique",
    operateur: "Région Centre-Val de Loire",
    description: "Financement diagnostics + investissements pour TPE/PME et ESS.",
    getFinancement: () => ({ taux: null, reste: null, total: null, label: "20k€ diagnostic + jusqu'à 200k€ investissement" }),
    checkEligibilite: () => ({ eligible: true, reasons: [] }),
    lien: "https://www.centre-valdeloire.fr",
    bon_plan: true,
  },
];

// ═══════════════════════════════════════════════════════════════
// CATÉGORIES pour l'affichage
// ═══════════════════════════════════════════════════════════════
export const CATEGORIES = {
  diagnostics: { label: "Faites financer votre diagnostic", icon: "🔍", ordre: 1 },
  strategie: { label: "Construisez votre stratégie climat", icon: "🎯", ordre: 2 },
  financement: { label: "Financez vos investissements verts", icon: "💰", ordre: 3 },
  formation: { label: "Formez vos équipes", icon: "🎓", ordre: 4 },
  regional: { label: "Les aides de votre région", icon: "📍", ordre: 5 },
  fiscal: { label: "Avantages fiscaux & économies", icon: "🧾", ordre: 6 },
  complementaire: { label: "Pour aller plus loin", icon: "🔗", ordre: 7 },
};
