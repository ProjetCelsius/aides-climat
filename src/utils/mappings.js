// Mapping code postal → région pour filtrer les aides régionales

const CP_TO_REGION = {
  // Île-de-France
  "75": "ile-de-france", "77": "ile-de-france", "78": "ile-de-france",
  "91": "ile-de-france", "92": "ile-de-france", "93": "ile-de-france",
  "94": "ile-de-france", "95": "ile-de-france",
  // Grand Est
  "08": "grand-est", "10": "grand-est", "51": "grand-est", "52": "grand-est",
  "54": "grand-est", "55": "grand-est", "57": "grand-est", "67": "grand-est",
  "68": "grand-est", "88": "grand-est",
  // Hauts-de-France
  "02": "hauts-de-france", "59": "hauts-de-france", "60": "hauts-de-france",
  "62": "hauts-de-france", "80": "hauts-de-france",
  // Normandie
  "14": "normandie", "27": "normandie", "50": "normandie",
  "61": "normandie", "76": "normandie",
  // Bretagne
  "22": "bretagne", "29": "bretagne", "35": "bretagne", "56": "bretagne",
  // Pays de la Loire
  "44": "pays-de-la-loire", "49": "pays-de-la-loire", "53": "pays-de-la-loire",
  "72": "pays-de-la-loire", "85": "pays-de-la-loire",
  // Centre-Val de Loire
  "18": "centre-val-de-loire", "28": "centre-val-de-loire", "36": "centre-val-de-loire",
  "37": "centre-val-de-loire", "41": "centre-val-de-loire", "45": "centre-val-de-loire",
  // Bourgogne-Franche-Comté
  "21": "bourgogne-franche-comte", "25": "bourgogne-franche-comte",
  "39": "bourgogne-franche-comte", "58": "bourgogne-franche-comte",
  "70": "bourgogne-franche-comte", "71": "bourgogne-franche-comte",
  "89": "bourgogne-franche-comte", "90": "bourgogne-franche-comte",
  // Nouvelle-Aquitaine
  "16": "nouvelle-aquitaine", "17": "nouvelle-aquitaine", "19": "nouvelle-aquitaine",
  "23": "nouvelle-aquitaine", "24": "nouvelle-aquitaine", "33": "nouvelle-aquitaine",
  "40": "nouvelle-aquitaine", "47": "nouvelle-aquitaine", "64": "nouvelle-aquitaine",
  "79": "nouvelle-aquitaine", "86": "nouvelle-aquitaine", "87": "nouvelle-aquitaine",
  // Occitanie
  "09": "occitanie", "11": "occitanie", "12": "occitanie", "30": "occitanie",
  "31": "occitanie", "32": "occitanie", "34": "occitanie", "46": "occitanie",
  "48": "occitanie", "65": "occitanie", "66": "occitanie", "81": "occitanie", "82": "occitanie",
  // Auvergne-Rhône-Alpes
  "01": "auvergne-rhone-alpes", "03": "auvergne-rhone-alpes", "07": "auvergne-rhone-alpes",
  "15": "auvergne-rhone-alpes", "26": "auvergne-rhone-alpes", "38": "auvergne-rhone-alpes",
  "42": "auvergne-rhone-alpes", "43": "auvergne-rhone-alpes", "63": "auvergne-rhone-alpes",
  "69": "auvergne-rhone-alpes", "73": "auvergne-rhone-alpes", "74": "auvergne-rhone-alpes",
  // Provence-Alpes-Côte d'Azur
  "04": "paca", "05": "paca", "06": "paca",
  "13": "paca", "83": "paca", "84": "paca",
  // Corse
  "20": "corse", "2A": "corse", "2B": "corse",
};

const REGION_LABELS = {
  "ile-de-france": "Île-de-France",
  "grand-est": "Grand Est",
  "hauts-de-france": "Hauts-de-France",
  "normandie": "Normandie",
  "bretagne": "Bretagne",
  "pays-de-la-loire": "Pays de la Loire",
  "centre-val-de-loire": "Centre-Val de Loire",
  "bourgogne-franche-comte": "Bourgogne-Franche-Comté",
  "nouvelle-aquitaine": "Nouvelle-Aquitaine",
  "occitanie": "Occitanie",
  "auvergne-rhone-alpes": "Auvergne-Rhône-Alpes",
  "paca": "Provence-Alpes-Côte d'Azur",
  "corse": "Corse",
};

export function getRegionFromCP(codePostal) {
  if (!codePostal) return null;
  const cp = String(codePostal).padStart(5, "0");
  // Corse spécial
  if (cp.startsWith("20")) {
    const num = parseInt(cp);
    if (num >= 20000 && num <= 20190) return "corse"; // 2A
    if (num >= 20200 && num <= 20299) return "corse"; // 2B
    return "corse";
  }
  const dept = cp.substring(0, 2);
  return CP_TO_REGION[dept] || null;
}

export function getRegionLabel(regionId) {
  return REGION_LABELS[regionId] || regionId;
}

// NAF section mapping
const NAF_INDUSTRIEL = ["A", "B", "C", "D", "E"];
const NAF_PUBLIC = ["O"];

export function getNafInfo(nafCode) {
  if (!nafCode) return { section: null, industriel: false, public: false };
  // Le code NAF peut être sous forme "62.01Z" ou "6201Z"
  // La section est dérivée de la première lettre du code division
  // Mais dans l'API, activite_principale est déjà le code NAF
  const section = nafCode.charAt(0).toUpperCase();
  // En fait le code NAF de l'API est numérique (ex: "62.01Z")
  // Il faut mapper les divisions aux sections
  const div = parseInt(nafCode);
  let sec = "";
  if (div >= 1 && div <= 3) sec = "A";
  else if (div >= 5 && div <= 9) sec = "B";
  else if (div >= 10 && div <= 33) sec = "C";
  else if (div >= 35 && div <= 35) sec = "D";
  else if (div >= 36 && div <= 39) sec = "E";
  else if (div >= 41 && div <= 43) sec = "F";
  else if (div >= 45 && div <= 47) sec = "G";
  else if (div >= 49 && div <= 53) sec = "H";
  else if (div >= 55 && div <= 56) sec = "I";
  else if (div >= 58 && div <= 63) sec = "J";
  else if (div >= 64 && div <= 66) sec = "K";
  else if (div === 68) sec = "L";
  else if (div >= 69 && div <= 75) sec = "M";
  else if (div >= 77 && div <= 82) sec = "N";
  else if (div === 84) sec = "O";
  else if (div === 85) sec = "P";
  else if (div >= 86 && div <= 88) sec = "Q";
  else if (div >= 90 && div <= 93) sec = "R";
  else if (div >= 94 && div <= 96) sec = "S";
  else if (div >= 97 && div <= 98) sec = "T";
  else if (div === 99) sec = "U";
  
  return {
    section: sec,
    industriel: NAF_INDUSTRIEL.includes(sec),
    public: NAF_PUBLIC.includes(sec),
  };
}

// Mapping tranche effectif INSEE
export function getEffectifFromTranche(tranche) {
  const MAP = {
    "00": 0, "01": 2, "02": 4, "03": 8,
    "11": 15, "12": 35, "21": 75, "22": 150,
    "31": 225, "32": 375, "41": 750, "42": 1500,
    "51": 3500, "52": 7500, "53": 15000,
  };
  return MAP[tranche] || 10; // défaut 10 si inconnu
}
