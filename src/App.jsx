import { useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════
const CP_REGION = {"75":"idf","77":"idf","78":"idf","91":"idf","92":"idf","93":"idf","94":"idf","95":"idf","08":"ge","10":"ge","51":"ge","52":"ge","54":"ge","55":"ge","57":"ge","67":"ge","68":"ge","88":"ge","02":"hdf","59":"hdf","60":"hdf","62":"hdf","80":"hdf","14":"nor","27":"nor","50":"nor","61":"nor","76":"nor","22":"bre","29":"bre","35":"bre","56":"bre","44":"pdl","49":"pdl","53":"pdl","72":"pdl","85":"pdl","18":"cvl","28":"cvl","36":"cvl","37":"cvl","41":"cvl","45":"cvl","21":"bfc","25":"bfc","39":"bfc","58":"bfc","70":"bfc","71":"bfc","89":"bfc","90":"bfc","16":"na","17":"na","19":"na","23":"na","24":"na","33":"na","40":"na","47":"na","64":"na","79":"na","86":"na","87":"na","09":"occ","11":"occ","12":"occ","30":"occ","31":"occ","32":"occ","34":"occ","46":"occ","48":"occ","65":"occ","66":"occ","81":"occ","82":"occ","01":"ara","03":"ara","07":"ara","15":"ara","26":"ara","38":"ara","42":"ara","43":"ara","63":"ara","69":"ara","73":"ara","74":"ara","04":"paca","05":"paca","06":"paca","13":"paca","83":"paca","84":"paca","20":"cor"};
const REGION_LABELS = {idf:"Île-de-France",ge:"Grand Est",hdf:"Hauts-de-France",nor:"Normandie",bre:"Bretagne",pdl:"Pays de la Loire",cvl:"Centre-Val de Loire",bfc:"Bourgogne-Franche-Comté",na:"Nouvelle-Aquitaine",occ:"Occitanie",ara:"Auvergne-Rhône-Alpes",paca:"PACA",cor:"Corse"};
const getRegion = cp => cp ? CP_REGION[String(cp).padStart(5,"0").substring(0,2)] : null;
const TRANCHE = {"00":0,"01":2,"02":4,"03":8,"11":15,"12":35,"21":75,"22":150,"31":225,"32":375,"41":750,"42":1500,"51":3500,"52":7500,"53":15000};
const getNafIndustriel = naf => { const d=parseInt(naf); return d>=1&&d<=39; };

// ═══════════════════════════════════════════════════════════════
// 47 DISPOSITIFS
// ═══════════════════════════════════════════════════════════════
const D = [
  // A - DIAGNOSTICS
  {id:"dca",cat:"diag",nom:"Diag Décarbon'Action",op:"Bpifrance / ADEME",desc:"Bilan GES scopes 1-2-3 + plan d'actions décarbonation. 12 jours, 6-8 mois.",
    fin:p=>{if(p.eff>=500)return null;if(p.eff<250)return{t:40,r:6000,tot:10000,l:"Sub. CEE 40%"};return{t:0,r:10000,tot:10000,l:"Plus de sub. 250-499 sal."};},
    elig:p=>{const r=[];if(p.eff>=500)r.push("≥500 sal.");if(p.bc)r.push("BC déjà réalisé");if(p.pub)r.push("Secteur public");return r;},
    url:"https://diag.bpifrance.fr/diag-decarbon-action",cel:true,cel_m:"Expert agréé Diag Décarbon'Action",bp:false},
  {id:"eco",cat:"diag",nom:"Diag Écoconception",op:"Bpifrance / ADEME",desc:"ACV d'un produit/service + plan écoconception. 18 jours, 6-8 mois.",
    fin:p=>{if(p.eff>=250)return null;if(p.eff<50)return{t:70,r:5400,tot:18000,l:"Sub. ADEME 70%"};return{t:60,r:7200,tot:18000,l:"Sub. ADEME 60%"};},
    elig:p=>{const r=[];if(p.eff>=250)r.push("≥250 sal.");if(!p.prod&&!p.serv)r.push("Pas de produit/service identifié");return r;},
    url:"https://diag.bpifrance.fr/diag-eco-conception",cel:true,cel_m:"Expert agréé ACV & écoconception",bp:false},
  {id:"ada",cat:"diag",nom:"Diag Adaptation",op:"Bpifrance / ADEME",desc:"Diagnostic vulnérabilité climatique + plan d'adaptation. 7 jours, 3-6 mois.",
    fin:p=>p.eff>=500?null:{t:50,r:3000,tot:6000,l:"Sub. ADEME 50%"},
    elig:p=>p.eff>=500?["≥500 sal."]:[],url:"https://diag.bpifrance.fr/diag-adaptation",cel:false,bp:true},
  {id:"efl",cat:"diag",nom:"Diag Eco-Flux",op:"Bpifrance / ADEME",desc:"Optimisation flux eau/énergie/matières/déchets. Économie moy. 45k€/an/site.",
    fin:p=>{if(!p.site)return null;if(p.eff<20||p.eff>250)return null;return p.eff<50?{t:50,r:2000,tot:4000,l:"Sub. ADEME 50%"}:{t:50,r:3000,tot:6000,l:"Sub. ADEME 50%"};},
    elig:p=>{const r=[];if(!p.site)r.push("Pas de site de production");if(p.eff<20)r.push("Site <20 sal.");if(p.eff>250)r.push("Site >250 sal.");return r;},
    url:"https://www.bpifrance.fr/catalogue-offres/diag-eco-flux",cel:false,bp:false},
  {id:"pim",cat:"diag",nom:"Diag Perf'Immo",op:"Bpifrance / ADEME",desc:"Audit énergétique bâtiment tertiaire + plan de rénovation chiffré.",
    fin:p=>p.eff>=500?null:{t:50,r:null,tot:null,l:"Sub. ADEME 50% (max 8 500€/site)"},
    elig:p=>p.eff>=500?["≥500 sal."]:[],url:"https://www.bpifrance.fr/catalogue-offres/diag-perfimmo",cel:false,bp:false},
  {id:"bio",cat:"diag",nom:"Diag Biodiversité",op:"Bpifrance / OFB",desc:"Analyse matérialité biodiversité + plan d'action. 10 jours, 3-6 mois.",
    fin:p=>p.eff<250?{t:50,r:5000,tot:10000,l:"Sub. OFB 50%"}:p.eff<5000?{t:30,r:7000,tot:10000,l:"Sub. OFB 30%"}:null,
    elig:p=>p.eff>=5000?["Réservé PME/ETI"]:[],url:"https://diag.bpifrance.fr/diag-biodiversite",cel:false,bp:true},
  {id:"bee",cat:"diag",nom:"Booster Éco-Énergie Tertiaire",op:"ADEME (CEE)",desc:"Étude d'ingénierie rénovation énergétique bâtiment tertiaire. Nouveau 2026.",
    fin:p=>p.eff>=250?null:{t:null,r:null,tot:null,l:"Financement CEE PACTE"},
    elig:p=>p.eff>=250?["Réservé TPE/PME"]:[],url:"https://agirpourlatransition.ademe.fr",cel:false,bp:true},

  // B - STRATÉGIE
  {id:"act",cat:"strat",nom:"ACT Pas à Pas",op:"ADEME",desc:"Stratégie décarbonation alignée Accord de Paris + plan de transition. 12-18 mois.",
    fin:p=>{if(!p.bc||p.bc_old)return null;if(p.eff<250)return{t:70,r:7500,tot:25000,l:"Sub. ADEME 70% (max 18k€)"};if(p.eff<5000)return{t:60,r:10000,tot:25000,l:"Sub. ADEME 60%"};return{t:50,r:12500,tot:25000,l:"Sub. ADEME 50%"};},
    elig:p=>{const r=[];if(!p.bc)r.push("Prérequis : BC < 2 ans");if(p.bc_old)r.push("BC > 2 ans, à actualiser");if(p.indus)r.push("Industriels → PACTE Industrie");return r;},
    url:"https://mission-transition-ecologique.beta.gouv.fr/aides-entreprise/act-pas-a-pas",cel:true,cel_m:"Accompagnement stratégie climat post-BC",bp:false},
  {id:"ace",cat:"strat",nom:"ACT Évaluation",op:"ADEME",desc:"Évaluation alignement de votre stratégie climat / Accord de Paris.",
    fin:p=>p.eff<250?{t:80,r:1200,tot:6000,l:"Sub. ADEME 80%"}:{t:60,r:2400,tot:6000,l:"Sub. ADEME 60%"},
    elig:p=>p.bc?[]:["Prérequis : stratégie climat formalisée"],url:"https://actinitiative.org/fr/act-in-france-soutien-financier/",cel:true,cel_m:"Évaluation ACT accompagnée",bp:false},
  {id:"pac",cat:"strat",nom:"PACTE Industrie",op:"ADEME / ATEE",desc:"Parcours complet décarbonation industrie : mix énergétique, stratégie, trajectoire investissements.",
    fin:p=>!p.indus?null:p.eff<250?{t:80,r:null,tot:null,l:"Sub. ADEME jusqu'à 80% (plafond 5-50k€)"}:{t:60,r:null,tot:null,l:"Sub. ADEME jusqu'à 60%"},
    elig:p=>p.indus?[]:["Réservé entreprises industrielles"],url:"https://agirpourlatransition.ademe.fr/entreprises/aides-financieres/catalogue/2026/pacte-industrie",cel:true,cel_m:"Intervient sur certaines prestations PACTE",bp:false},
  {id:"acd",cat:"strat",nom:"Accélérateur Décarbonation",op:"Bpifrance / Mines Paris",desc:"Programme premium 24 mois. 20 entreprises/promotion. Très sélectif.",
    fin:p=>(p.eff>=50&&p.eff<=250&&p.bc)?{t:64,r:25000,tot:64000,l:"Sub. ~64% → reste ~25k€ HT"}:null,
    elig:p=>{const r=[];if(p.eff<50||p.eff>250)r.push("PME 50-250 sal.");if(!p.bc)r.push("BC < 2 ans requis");return r;},
    url:"https://www.bpifrance.fr/catalogue-offres/accelerateur-decarbonation",cel:false,bp:true},
  {id:"cci",cat:"strat",nom:"Accompagnement CCI gratuit",op:"CCI France",desc:"Climatomètre, Flash Diag Énergie, visite énergie, parcours accompagnement. 100% gratuit.",
    fin:()=>({t:100,r:0,tot:0,l:"100% gratuit"}),elig:()=>[],url:"https://www.cci.fr/ressources/developpement-durable/transition-ecologique",cel:false,bp:true},
  {id:"cma",cat:"strat",nom:"Performa Environnement (CMA)",op:"CMA",desc:"Diagnostic environnemental + plan d'actions, 100% pris en charge pour artisans et TPE.",
    fin:p=>p.eff>20?null:{t:100,r:0,tot:0,l:"100% gratuit (Région + CMA)"},
    elig:p=>p.eff>20?["Réservé artisans/TPE (<20 sal.)"]:[],url:"https://www.artisanat.fr/nous-connaitre/vous-accompagner/performa-environnement",cel:false,bp:true},

  // C - FINANCEMENT
  {id:"pvb",cat:"fin",nom:"Prêt Vert Bpifrance",op:"Bpifrance",desc:"Prêt sans garantie pour investissements transition écologique. 2-10 ans.",
    fin:()=>({t:null,r:null,tot:null,l:"50k€ à 5M€ - Sans garantie"}),elig:()=>[],url:"https://www.bpifrance.fr/catalogue-offres/pret-vert",cel:false,bp:false},
  {id:"pva",cat:"fin",nom:"Prêt Vert ADEME",op:"ADEME / Bpifrance",desc:"Prêt taux bonifié si diagnostic ou aide ADEME préalable.",
    fin:()=>({t:null,r:null,tot:null,l:"10k€ à 1M€ - Taux bonifié"}),elig:()=>[],url:null,cel:false,bp:false},
  {id:"pee",cat:"fin",nom:"Prêt Économies d'Énergie",op:"Bpifrance",desc:"Prêt pour équipements éligibles CEE. 3-7 ans.",
    fin:()=>({t:null,r:null,tot:null,l:"10k€ à 500k€"}),elig:()=>[],url:null,cel:false,bp:false},
  {id:"pcl",cat:"fin",nom:"Prêt Action Climat",op:"Bpifrance",desc:"Prêt 100% en ligne, sans garantie, spécial TPE. Rapide et simple.",
    fin:p=>p.eff>=50?null:{t:null,r:null,tot:null,l:"10k€ à 75k€ - 100% en ligne"},
    elig:p=>p.eff>=50?["Réservé TPE <50 sal."]:[],url:null,cel:false,bp:true},
  {id:"fch",cat:"fin",nom:"Fonds Chaleur ADEME",op:"ADEME",desc:"Subvention chaleur renouvelable : biomasse, solaire thermique, géothermie, récup chaleur fatale.",
    fin:()=>({t:null,r:null,tot:null,l:"Budget 800M€/an - Jusqu'à 45%+"}),elig:()=>[],url:"https://agirpourlatransition.ademe.fr",cel:false,bp:false},

  // D - FORMATION & RH
  {id:"vte",cat:"form",nom:"VTE Vert",op:"Bpifrance",desc:"8 000€ pour recruter un jeune Bac+3 sur mission environnementale (min 12 mois).",
    fin:()=>({t:null,r:null,tot:null,l:"Subvention directe : 8 000€"}),elig:()=>[],url:"https://www.bpifrance.fr/vte-vert",cel:false,bp:true},
  {id:"fop",cat:"form",nom:"Formations climat via OPCO",op:"Votre OPCO",desc:"BC, ACV, RSE, Fresque du Climat pro, ISO 14001 - financées par votre OPCO.",
    fin:p=>p.eff<50?{t:100,r:0,tot:null,l:"Prise en charge jusqu'à 100%"}:p.eff<300?{t:80,r:null,tot:null,l:"Prise en charge ~80%"}:{t:50,r:null,tot:null,l:"Prise en charge ~50%"},
    elig:()=>[],url:null,cel:true,cel_m:"Formations certifiées Qualiopi (BC, ACV, RSE)",bp:false},
  {id:"fne",cat:"form",nom:"FNE-Formation / FSE+",op:"État / OPCO",desc:"Financement renforcé formations transition écologique - priorité nationale n°1.",
    fin:p=>p.eff<50?{t:70,r:null,tot:null,l:"Prise en charge 70%"}:p.eff<250?{t:60,r:null,tot:null,l:"Prise en charge 60%"}:{t:50,r:null,tot:null,l:"Prise en charge 50%"},
    elig:()=>[],url:null,cel:true,cel_m:"Formations Celsius éligibles FNE/FSE+",bp:true},
  {id:"pcr",cat:"form",nom:"PCRH volet RSE",op:"OPCO + État",desc:"Accompagnement RH/RSE personnalisé, financé jusqu'à 100%. Très peu connu.",
    fin:p=>p.eff>=250?null:{t:100,r:0,tot:null,l:"Jusqu'à 100% financé"},
    elig:p=>p.eff>=250?["Réservé TPE/PME <250 sal."]:[],url:null,cel:false,bp:true},
  {id:"fac",cat:"form",nom:"Formation Chef de projet ACT",op:"ADEME",desc:"Formation obligatoire pour piloter ACT Pas à Pas. Finançable OPCO.",
    fin:p=>p.eff<250?{t:80,r:200,tot:1000,l:"Sub. ADEME 80%"}:{t:40,r:600,tot:1000,l:"Sub. ADEME 40%"},
    elig:p=>p.bc?[]:["Prérequis : BC existant"],url:null,cel:true,cel_m:"Orientation vers la bonne formation",bp:false},

  // F - FISCAL
  {id:"sav",cat:"fisc",nom:"Suramortissement véhicules propres",op:"État",desc:"Déduction fiscale supplémentaire véhicules lourds propres : jusqu'à 115% pour l'électrique.",
    fin:()=>({t:null,r:null,tot:null,l:"20-115% de déduction fiscale supplémentaire"}),elig:()=>[],url:null,cel:false,bp:true},
  {id:"tvs",cat:"fisc",nom:"Exonération TVS véhicules électriques",op:"État",desc:"Véhicules 100% électriques totalement exonérés de TVS.",
    fin:()=>({t:null,r:null,tot:null,l:"Économie ~2k-5k€/véhicule/an"}),elig:()=>[],url:null,cel:false,bp:false},
  {id:"cee",cat:"fisc",nom:"Certificats d'Économies d'Énergie",op:"Fournisseurs énergie",desc:"Primes pour travaux d'efficacité énergétique : isolation, chauffage, éclairage, process...",
    fin:()=>({t:null,r:null,tot:null,l:"15€/MWh cumac + bonif. PME +20%"}),elig:()=>[],url:null,cel:false,bp:true},
  {id:"tvr",cat:"fisc",nom:"TVA 5,5% bornes de recharge",op:"État",desc:"TVA réduite pour installation de bornes de recharge par professionnel certifié IRVE.",
    fin:()=>({t:null,r:null,tot:null,l:"5,5% au lieu de 20%"}),elig:()=>[],url:null,cel:false,bp:false},
  {id:"fmd",cat:"fisc",nom:"Forfait Mobilités Durables",op:"État",desc:"700€/an/salarié exonérés pour déplacements en mobilité douce (vélo, covoiturage...).",
    fin:()=>({t:null,r:null,tot:null,l:"700€/an/salarié exonérés"}),elig:()=>[],url:null,cel:false,bp:true},

  // G - COMPLÉMENTAIRE
  {id:"fec",cat:"comp",nom:"Fonds Économie Circulaire ADEME",op:"ADEME",desc:"Subvention réemploi, recyclage, valorisation des déchets.",
    fin:()=>({t:null,r:null,tot:null,l:"Études 80% / Investissements 55%"}),elig:()=>[],url:null,cel:false,bp:false},
  {id:"rae",cat:"comp",nom:"Aide réemploi emballages",op:"ADEME",desc:"Subvention pour développer le réemploi de vos emballages (objectif AGEC 10% en 2027).",
    fin:()=>({t:null,r:null,tot:null,l:"Variable selon projet"}),elig:()=>[],url:null,cel:false,bp:false},
  {id:"een",cat:"comp",nom:"Entreprises Engagées Nature",op:"OFB",desc:"Programme gratuit de reconnaissance de votre démarche biodiversité.",
    fin:()=>({t:100,r:0,tot:0,l:"Gratuit"}),elig:()=>[],url:"https://engagespourlanature.ofb.fr/entreprises",cel:false,bp:true},
  {id:"eau",cat:"comp",nom:"Aides Agences de l'Eau",op:"6 Agences de l'Eau",desc:"Subventions pour réduction conso eau, traitement effluents, préservation milieux aquatiques.",
    fin:()=>({t:null,r:null,tot:null,l:"Sub. 30-70% selon agence"}),elig:()=>[],url:null,cel:false,bp:true},
  {id:"f30",cat:"comp",nom:"France 2030 - Décarbo industrie",op:"ADEME / Bpifrance",desc:"AAP investissements massifs de décarbonation industrielle.",
    fin:p=>p.indus?{t:null,r:null,tot:null,l:"Jusqu'à 30M€/projet"}:null,
    elig:p=>p.indus?[]:["Réservé industrie"],url:null,cel:false,bp:false},
  {id:"adi",cat:"comp",nom:"ADEME Investissement",op:"ADEME",desc:"Fonds propres pour projets TEE innovants au stade commercialisation.",
    fin:()=>({t:null,r:null,tot:null,l:"Fonds propres - Projets matures"}),elig:()=>[],url:null,cel:false,bp:false},
];

// AIDES RÉGIONALES
const REG = [
  {id:"idf1",reg:"idf",nom:"PM'UP Souveraineté TEE",op:"Région Île-de-France",desc:"Subvention massive PME franciliennes.",
    fin:p=>(p.eff>=10&&p.eff<250)?{t:50,r:null,tot:null,l:"Jusqu'à 375 000€ (50%)"}:null,elig:p=>(p.eff>=10&&p.eff<250)?[]:["PME 10-250 sal."],bp:true},
  {id:"idf2",reg:"idf",nom:"TP'UP Souveraineté TEE",op:"Région Île-de-France",desc:"Subvention TPE franciliennes.",
    fin:p=>p.eff<10?{t:50,r:null,tot:null,l:"Jusqu'à 82 500€ (50%)"}:null,elig:p=>p.eff<10?[]:["TPE <10 sal."],bp:true},
  {id:"ge1",reg:"ge",nom:"Climaxion",op:"Région Grand Est / ADEME",desc:"Programme complet TEE : faisabilité, investissements EnR, circulaire.",
    fin:()=>({t:null,r:null,tot:null,l:"100-400k€ + cumul ADEME"}),elig:()=>[],bp:true},
  {id:"occ1",reg:"occ",nom:"Pass Transformation Écologique",op:"Région Occitanie",desc:"Aide directe TPE hors métropoles.",
    fin:p=>p.eff<=20?{t:50,r:null,tot:null,l:"Jusqu'à 10 000€ (50%)"}:null,elig:p=>p.eff<=20?[]:["TPE ≤20 sal."],bp:true},
  {id:"nor1",reg:"nor",nom:"Impulsion Environnement",op:"Région Normandie",desc:"Subvention + prêt taux zéro investissements environnementaux.",
    fin:()=>({t:null,r:null,tot:null,l:"Jusqu'à 1M€ (prêt 0% + sub.)"}),elig:()=>[],bp:true},
  {id:"ara1",reg:"ara",nom:"INNOV'R",op:"Région AURA",desc:"Projets éco-innovants.",
    fin:()=>({t:null,r:null,tot:null,l:"Variable selon projet"}),elig:()=>[],bp:false},
  {id:"na1",reg:"na",nom:"Aide Conseil TEE",op:"Région Nouvelle-Aquitaine",desc:"Prestations de conseil transition écologique.",
    fin:()=>({t:null,r:null,tot:null,l:"50-70%, jusqu'à 30-40k€"}),elig:()=>[],bp:false},
  {id:"bre1",reg:"bre",nom:"Prêt Transitions Bretagne",op:"Région Bretagne / Bpifrance",desc:"Prêt régional couplé bancaire pour la transition.",
    fin:()=>({t:null,r:null,tot:null,l:"Prêt ~300k€ couplé bancaire"}),elig:()=>[],bp:true},
  {id:"bre2",reg:"bre",nom:"Breizh Fab - Pass Transitions",op:"Région Bretagne",desc:"Transformation industrie bretonne.",
    fin:p=>(p.indus&&p.eff>=5)?{t:50,r:null,tot:null,l:"50% de 20-50k€"}:null,elig:p=>(p.indus&&p.eff>=5)?[]:["Industrie ≥5 sal."],bp:false},
  {id:"hdf1",reg:"hdf",nom:"Booster Transformation Rev3",op:"Région Hauts-de-France",desc:"Accompagnement et financement transformation durable PME.",
    fin:p=>p.eff<250?{t:50,r:null,tot:null,l:"Jusqu'à 10 000€ (50%)"}:null,elig:p=>p.eff<250?[]:["PME <250"],bp:true},
  {id:"pdl1",reg:"pdl",nom:"Emploi Transitions",op:"Région Pays de la Loire",desc:"Aide embauche postes transition écologique.",
    fin:p=>p.eff>=5?{t:30,r:null,tot:null,l:"Jusqu'à 15 000€ (30% sal.)"}:null,elig:p=>p.eff>=5?[]:["≥5 sal. CDI"],bp:true},
  {id:"cvl1",reg:"cvl",nom:"CAP Transition Écologique",op:"Région Centre-Val de Loire",desc:"Diagnostics + investissements TPE/PME et ESS.",
    fin:()=>({t:null,r:null,tot:null,l:"20k€ diag + 200k€ invest."}),elig:()=>[],bp:true},
];

const CATS = {
  diag:{label:"💊 Faites financer votre diagnostic",ord:1},
  strat:{label:"🎯 Construisez votre stratégie climat",ord:2},
  fin:{label:"💰 Financez vos investissements verts",ord:3},
  form:{label:"🎓 Formez vos équipes",ord:4},
  reg:{label:"📍 Les aides de votre région",ord:5},
  fisc:{label:"🧾 Avantages fiscaux & économies",ord:6},
  comp:{label:"🔗 Pour aller plus loin",ord:7},
};

// ═══════════════════════════════════════════════════════════════
// MOTEUR
// ═══════════════════════════════════════════════════════════════
function compute(p) {
  const eligible = [];
  const blocked = [];
  let totalSub = 0;
  let nbCel = 0;

  D.forEach(d => {
    const reasons = d.elig(p);
    const f = d.fin(p);
    if (reasons.length === 0 && f) {
      eligible.push({...d, f});
      if (f.tot && f.r != null) totalSub += f.tot - f.r;
      if (d.cel) nbCel++;
    } else if (reasons.length > 0) {
      blocked.push({...d, reasons});
    }
  });

  // Régionales
  if (p.reg) {
    REG.filter(r => r.reg === p.reg).forEach(r => {
      const reasons = r.elig(p);
      const f = r.fin(p);
      if (reasons.length === 0 && f) {
        eligible.push({...r, cat:"reg", f, cel:false});
      }
    });
  }

  // Grouper
  const groups = {};
  Object.keys(CATS).forEach(k => { groups[k] = []; });
  eligible.forEach(d => {
    if (groups[d.cat]) groups[d.cat].push(d);
  });

  return { eligible, blocked, totalSub, nbCel, groups };
}

// ═══════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep] = useState("home"); // home, questions, results
  const [siren, setSiren] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState({nom:"",siren:"",eff:10,reg:null,indus:false,pub:false,bc:false,bc_old:false,prod:false,serv:false,site:false});
  const [qIdx, setQIdx] = useState(0);
  const [results, setResults] = useState(null);
  const [expanded, setExpanded] = useState(null);

  // SIREN lookup
  const doLookup = useCallback(async () => {
    if (siren.length !== 9) { setErr("9 chiffres requis"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siren}&page=1&per_page=1`);
      const data = await res.json();
      if (!data.results?.length) { setErr("Entreprise non trouvée"); setLoading(false); return; }
      const e = data.results[0];
      const eff = TRANCHE[e.tranche_effectif_salarie] || 10;
      const cp = e.siege?.code_postal || "";
      const naf = e.activite_principale || "";
      const indus = getNafIndustriel(naf);
      setProfile(prev => ({...prev, nom:e.nom_complet||"", siren, eff, reg:getRegion(cp), indus, pub:parseInt(naf)===84, ville:e.siege?.libelle_commune||""}));
      setStep("questions");
    } catch { setErr("Erreur réseau"); }
    setLoading(false);
  }, [siren]);

  // Questions
  const QS = [
    {q:"Combien de salariés dans votre entreprise ?",opts:[["1-9",5],["10-49",30],["50-249",150],["250-499",375],["500+",750]],
      apply:(v)=>({eff:v})},
    {q:"Avez-vous déjà réalisé un bilan carbone ?",opts:[["Non, jamais","no"],["Oui, il y a < 2 ans","recent"],["Oui, il y a > 2 ans","old"]],
      apply:(v)=>({bc:v!=="no",bc_old:v==="old"})},
    {q:"Produisez-vous un produit physique ou un service ?",opts:[["Produit physique","prod"],["Un service","serv"],["Les deux","both"],["Ni l'un ni l'autre","none"]],
      apply:(v)=>({prod:v==="prod"||v==="both",serv:v==="serv"||v==="both"})},
    {q:"Avez-vous un site de production ou transformation ?",opts:[["Oui",true],["Non",false]],
      apply:(v)=>({site:v}), show:(p)=>p.indus||p.eff>=20},
  ];
  const visibleQs = QS.filter(q => !q.show || q.show(profile));

  const answerQ = (val) => {
    const q = visibleQs[qIdx];
    setProfile(prev => ({...prev, ...q.apply(val)}));
    if (qIdx < visibleQs.length - 1) {
      setTimeout(() => setQIdx(prev => prev + 1), 150);
    }
  };

  const showResults = () => {
    setResults(compute(profile));
    setStep("results");
  };

  const reset = () => {
    setStep("home"); setSiren(""); setProfile({nom:"",siren:"",eff:10,reg:null,indus:false,pub:false,bc:false,bc_old:false,prod:false,serv:false,site:false}); setQIdx(0); setResults(null); setExpanded(null); setErr("");
  };

  // ─── STYLES ───
  const S = {
    page: {minHeight:"100vh",background:"#fafafa",color:"#1a1a1a",fontFamily:"'Courier New', Courier, monospace",maxWidth:680,margin:"0 auto",padding:"32px 20px"},
    h1: {fontSize:28,fontWeight:700,margin:"0 0 8px",lineHeight:1.3},
    h2: {fontSize:20,fontWeight:700,margin:"24px 0 12px"},
    sub: {fontSize:14,color:"#666",margin:"0 0 32px",lineHeight:1.5},
    input: {padding:"12px 14px",fontSize:16,border:"2px solid #333",borderRadius:4,fontFamily:"'Courier New', monospace",background:"#fff",color:"#1a1a1a",width:"100%",boxSizing:"border-box"},
    btn: {padding:"12px 24px",fontSize:14,fontWeight:700,background:"#1a1a1a",color:"#fff",border:"none",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New', monospace"},
    btnSec: {padding:"10px 16px",fontSize:13,background:"transparent",color:"#666",border:"1px dashed #ccc",borderRadius:4,cursor:"pointer",fontFamily:"'Courier New', monospace"},
    card: {background:"#fff",border:"1px solid #ddd",borderRadius:6,marginBottom:8,overflow:"hidden"},
    tag: {display:"inline-block",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:3,background:"#e8f5e9",color:"#2e7d32",marginLeft:8,letterSpacing:"0.05em"},
    tagBp: {display:"inline-block",fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:3,background:"#fff3e0",color:"#e65100",marginLeft:8},
    green: {color:"#2e7d32",fontWeight:700},
    muted: {color:"#999",fontSize:12},
    hr: {border:"none",borderTop:"1px solid #eee",margin:"24px 0"},
  };

  // ─── HOME ───
  if (step === "home") return (
    <div style={S.page}>
      <div style={{textAlign:"center",padding:"40px 0 32px"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#999",letterSpacing:"0.1em",marginBottom:16}}>AIDES-CLIMAT.FR</div>
        <h1 style={S.h1}>Quelles aides climat<br/>votre entreprise<br/>laisse-t-elle sur la table ?</h1>
        <p style={S.sub}>Entrez votre SIREN. On vous dit tout.<br/>47 dispositifs vérifiés. 2 minutes. Gratuit.</p>
      </div>

      <div style={{marginBottom:16}}>
        <label style={{fontSize:12,fontWeight:700,color:"#999",letterSpacing:"0.08em",display:"block",marginBottom:6}}>NUMÉRO SIREN</label>
        <div style={{display:"flex",gap:8}}>
          <input style={S.input} type="text" value={siren} maxLength={9} placeholder="123 456 789"
            onChange={e=>{setSiren(e.target.value.replace(/\D/g,"").slice(0,9));setErr("");}}
            onKeyDown={e=>e.key==="Enter"&&doLookup()} />
          <button style={{...S.btn,opacity:siren.length===9?1:0.4}} onClick={doLookup} disabled={loading||siren.length!==9}>
            {loading?"...":"→"}
          </button>
        </div>
        {err && <div style={{color:"#d32f2f",fontSize:12,marginTop:6}}>{err}</div>}
        <div style={{fontSize:11,color:"#bbb",marginTop:8}}>Données INSEE via api.gouv.fr - Pré-remplissage automatique</div>
      </div>

      <button style={{...S.btnSec,width:"100%"}} onClick={()=>setStep("questions")}>
        Pas de SIREN ? Répondre manuellement →
      </button>

      <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:40,flexWrap:"wrap"}}>
        {["47 dispositifs","Données officielles","100% gratuit","2 min"].map(t=>(
          <span key={t} style={{fontSize:11,color:"#999"}}>✓ {t}</span>
        ))}
      </div>
    </div>
  );

  // ─── QUESTIONS ───
  if (step === "questions") return (
    <div style={S.page}>
      <div style={{display:"flex",alignItems:"center",marginBottom:24}}>
        <button style={{...S.btnSec,border:"none",padding:"4px 0"}} onClick={reset}>← Retour</button>
        <div style={{flex:1}} />
        <span style={S.muted}>{qIdx+1}/{visibleQs.length}</span>
      </div>

      {profile.nom && (
        <div style={{background:"#f5f5f5",border:"1px solid #e0e0e0",borderRadius:6,padding:"12px 16px",marginBottom:24}}>
          <div style={{fontWeight:700,fontSize:14}}>{profile.nom}</div>
          <div style={{fontSize:12,color:"#888"}}>{profile.ville}{profile.reg ? ` - ${REGION_LABELS[profile.reg]||""}` : ""} {profile.siren ? `- SIREN ${profile.siren}` : ""}</div>
        </div>
      )}

      {/* Progress */}
      <div style={{height:3,background:"#eee",borderRadius:2,marginBottom:32}}>
        <div style={{height:"100%",width:`${((qIdx+1)/visibleQs.length)*100}%`,background:"#1a1a1a",borderRadius:2,transition:"width 0.3s"}} />
      </div>

      {visibleQs.map((q, i) => {
        if (i > qIdx) return null;
        const active = i === qIdx;
        return (
          <div key={i} style={{marginBottom:28,opacity:active?1:0.35}}>
            <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>{q.q}</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {q.opts.map(([label, val]) => {
                const updates = q.apply(val);
                const selected = Object.entries(updates).every(([k,v]) => profile[k] === v);
                return (
                  <button key={label} onClick={()=>active&&answerQ(val)}
                    style={{padding:"12px 16px",fontSize:14,textAlign:"left",background:selected?"#1a1a1a":"#fff",
                      color:selected?"#fff":"#1a1a1a",border:`1px solid ${selected?"#1a1a1a":"#ddd"}`,
                      borderRadius:4,cursor:active?"pointer":"default",fontFamily:"'Courier New', monospace",transition:"all 0.1s"}}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {qIdx >= visibleQs.length - 1 && (
        <button style={{...S.btn,width:"100%",marginTop:16,padding:"16px",fontSize:16}} onClick={showResults}>
          Voir mes aides éligibles →
        </button>
      )}
    </div>
  );

  // ─── RESULTS ───
  if (step === "results" && results) return (
    <div style={S.page}>
      <div style={{textAlign:"center",marginBottom:32}}>
        {profile.nom && <div style={{fontSize:12,color:"#999",marginBottom:4}}>{profile.nom}</div>}
        <h1 style={{...S.h1,fontSize:32}}>
          <span style={S.green}>{results.eligible.length}</span> aide{results.eligible.length>1?"s":""} identifiée{results.eligible.length>1?"s":""}
        </h1>
        {results.totalSub > 0 && (
          <div style={{display:"inline-block",background:"#e8f5e9",border:"1px solid #a5d6a7",borderRadius:6,padding:"10px 20px",marginTop:12}}>
            <span style={{fontSize:13,color:"#666"}}>Subventions potentielles : </span>
            <span style={{fontSize:22,...S.green}}>{results.totalSub.toLocaleString("fr-FR")} €</span>
          </div>
        )}
      </div>

      {Object.entries(CATS).filter(([k]) => results.groups[k]?.length > 0).sort(([,a],[,b]) => a.ord - b.ord).map(([catId, cat]) => (
        <div key={catId} style={{marginBottom:28}}>
          <h2 style={{...S.h2,fontSize:15,color:"#666",borderBottom:"1px solid #eee",paddingBottom:8}}>{cat.label} ({results.groups[catId].length})</h2>
          {results.groups[catId].map(d => {
            const isExp = expanded === d.id;
            return (
              <div key={d.id} style={{...S.card,borderLeft:d.cel?"3px solid #2e7d32":"3px solid transparent"}}>
                <div onClick={()=>setExpanded(isExp?null:d.id)} style={{padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:4}}>
                      <span style={{fontWeight:700,fontSize:14}}>{d.nom}</span>
                      {d.cel && <span style={S.tag}>CELSIUS</span>}
                      {d.bp && <span style={S.tagBp}>BON PLAN</span>}
                    </div>
                    <div style={{fontSize:12,color:"#888",marginTop:4}}>{d.op}</div>
                  </div>
                  <div style={{textAlign:"right",minWidth:100,flexShrink:0}}>
                    {d.f.tot && d.f.r != null ? (
                      <>
                        <div style={{fontSize:11,color:"#bbb",textDecoration:"line-through"}}>{d.f.tot.toLocaleString("fr-FR")}€</div>
                        <div style={{fontSize:18,...S.green}}>{d.f.r===0?"Gratuit":`${d.f.r.toLocaleString("fr-FR")}€`}</div>
                      </>
                    ) : (
                      <div style={{fontSize:12,...S.green}}>{d.f.l}</div>
                    )}
                  </div>
                  <span style={{color:"#ccc",fontSize:16,transition:"transform 0.2s",transform:isExp?"rotate(180deg)":"none"}}>▾</span>
                </div>

                {isExp && (
                  <div style={{padding:"0 16px 16px",borderTop:"1px solid #f0f0f0",paddingTop:12}}>
                    <p style={{fontSize:13,color:"#555",margin:"0 0 12px",lineHeight:1.5}}>{d.desc}</p>
                    <div style={{fontSize:12,color:"#888",marginBottom:8}}>
                      <strong>Financement :</strong> {d.f.l}
                    </div>
                    {d.cel && (
                      <div style={{background:"#e8f5e9",borderRadius:4,padding:"8px 12px",fontSize:12,color:"#2e7d32",marginBottom:8}}>
                        🟢 {d.cel_m}
                      </div>
                    )}
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#1565c0",textDecoration:"none"}}>
                        Vérifier éligibilité sur le site officiel ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Blocked */}
      {results.blocked.length > 0 && (
        <div style={{marginTop:32}}>
          <h2 style={{...S.h2,fontSize:13,color:"#bbb"}}>NON ÉLIGIBLE ({results.blocked.length})</h2>
          {results.blocked.slice(0,8).map(d => (
            <div key={d.id} style={{padding:"8px 12px",marginBottom:4,fontSize:12,color:"#bbb",background:"#f9f9f9",borderRadius:4}}>
              <span style={{fontWeight:600}}>{d.nom}</span> - {d.reasons.join(", ")}
            </div>
          ))}
        </div>
      )}

      {/* CTA Celsius */}
      <div style={{background:"#f1f8e9",border:"2px solid #a5d6a7",borderRadius:8,padding:28,marginTop:40,textAlign:"center"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#999",letterSpacing:"0.08em",marginBottom:8}}>CELSIUS - CABINET D'EXPERTISE ENVIRONNEMENTALE</div>
        <h3 style={{fontSize:18,fontWeight:700,margin:"0 0 8px"}}>
          Sur {results.eligible.length} aides identifiées, Celsius peut vous accompagner sur {results.nbCel}
        </h3>
        <p style={{fontSize:13,color:"#666",marginBottom:20}}>
          20 min pour clarifier votre éligibilité et lancer votre démarche. Sans engagement.
        </p>
        <a href="https://projetcelsius.com" target="_blank" rel="noopener noreferrer"
          style={{...S.btn,textDecoration:"none",display:"inline-block",background:"#2e7d32",padding:"14px 32px",fontSize:15}}>
          Parler à un expert Celsius →
        </a>
      </div>

      <div style={{textAlign:"center",marginTop:24}}>
        <button style={S.btnSec} onClick={reset}>← Recommencer avec une autre entreprise</button>
      </div>

      <div style={{textAlign:"center",marginTop:40,fontSize:11,color:"#ccc",lineHeight:1.6}}>
        Données vérifiées mars 2026. Sources : BPI France, ADEME, OFB, Régions.<br/>
        Les montants et conditions sont indicatifs. Vérifiez toujours sur les sites officiels.<br/>
        Un outil créé par <a href="https://projetcelsius.com" style={{color:"#999"}}>Celsius</a> - cabinet d'expertise environnementale.
      </div>
    </div>
  );

  return null;
}
