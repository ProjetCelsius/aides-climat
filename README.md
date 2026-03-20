# aides-climat.fr

Moteur de recherche d'aides climat pour les entreprises françaises.

**Entrez votre SIREN, découvrez toutes les aides auxquelles vous avez droit.**

58 dispositifs (46 nationaux + 12 régionaux). React 18 + Vite. Zéro backend.

## Lancer en local
```bash
npm install
npm run dev
```

## Architecture
- `src/App.jsx` - App standalone (données + logique + UI en un seul fichier)
- API : recherche-entreprises.api.gouv.fr (gratuite, sans clé)
- Déployable sur Vercel / Netlify / Lovable

## Catégories d'aides
- 7 diagnostics subventionnés (BPI/ADEME/OFB)
- 6 stratégie & accompagnement (ACT, PACTE, CCI, CMA)
- 5 financements (prêts verts, Fonds Chaleur)
- 5 formations & RH (OPCO, FNE, VTE Vert, PCRH)
- 12 aides régionales (filtrées par code postal)
- 5 avantages fiscaux (CEE, TVS, suramortissement)
- 6 dispositifs complémentaires (éco circulaire, eau, France 2030)

## Données
Vérifiées mars 2026. Sources : BPI France, ADEME, OFB, Régions, economie.gouv.fr.

## Créé par Celsius
https://projetcelsius.com - Cabinet d'expertise environnementale
