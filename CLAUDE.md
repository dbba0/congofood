# CLAUDE.md — CongoFood Monorepo

> Fichier lu automatiquement par Claude Code au début de chaque session.
> Ne pas scanner node_modules/. Ne pas redéfinir les types de @congofood/types.
> Mettre à jour la section **6. ÉTAT ACTUEL** manuellement après chaque ticket.

---

## 1. PROJET

**Nom :** CongoFood  
**Description :** Application de livraison food & épicerie à Kinshasa (RDC) connectant clients, restaurants et livreurs via une plateforme mobile-first.  
**Marché cible :** Kinshasa, République Démocratique du Congo — appareils Android bas de gamme, réseau 3G instable.  
**Stack global :** React Native (Expo) · Node.js/Express · MongoDB Atlas · Socket.io · CinetPay · npm workspaces

---

## 2. STRUCTURE MONOREPO

```
congofood/
├── apps/
│   ├── client/               # App React Native — commande & suivi pour les clients
│   │   ├── app/
│   │   │   ├── (auth)/       # Login, OTP, register, sélection quartier
│   │   │   ├── (tabs)/       # Home, Search, Orders, Profile
│   │   │   ├── restaurant/   # Détail restaurant [id]
│   │   │   ├── cart.tsx      # Panier modal
│   │   │   └── checkout.tsx  # Paiement modal
│   │   ├── components/       # Composants propres à client (vide phase 1)
│   │   ├── constants/theme.ts
│   │   ├── hooks/            # Hooks propres à client (vide phase 1)
│   │   ├── lib/              # (à créer) helpers MMKV, etc.
│   │   └── store/            # authStore.ts · cartStore.ts
│   │
│   ├── livreur/              # App React Native — tableau de bord livreur & missions
│   │   ├── app/
│   │   │   ├── (auth)/       # Login téléphone + OTP 6 cases
│   │   │   ├── (tabs)/       # Dashboard, Map, Earnings
│   │   │   └── mission/      # Détail mission [id]
│   │   ├── components/       # (vide phase 1)
│   │   ├── constants/theme.ts
│   │   ├── hooks/            # (vide phase 1)
│   │   ├── lib/storage.ts    # MMKV : saveSession / loadSession / clearSession
│   │   └── store/            # authStore.ts · missionStore.ts
│   │
│   └── admin/                # Dashboard Next.js 14 — gestion restaurants & opérations
│
├── packages/
│   ├── types/                # Types TypeScript partagés — source de vérité unique
│   │   └── src/              # user · restaurant · product · order · delivery · payment · api
│   ├── api-client/           # Hooks React Query partagés (squelette phase 2)
│   └── ui/                   # Composants React Native partagés (squelette phase 2)
│
└── backend/                  # API REST Express + Socket.io temps réel
    └── src/
        ├── config/env.ts
        ├── middleware/auth.ts
        ├── models/           # User · Restaurant · Product · Order · Delivery · Payment
        └── routes/           # auth · users · restaurants · products · orders · deliveries · payments
```

**Règle :** chaque app est indépendante et autonome. Les packages partagés sont référencés via `paths` dans `tsconfig.json` — pas besoin de build avant dev.

---

## 3. STACK TECHNIQUE

| Couche | Technologie | Notes |
|--------|-------------|-------|
| **Mobile** | React Native 0.74 + Expo SDK 51 + Expo Router v3 | iOS & Android. Cible : Android bas de gamme |
| **État mobile** | Zustand ^4.5 | Stores par app, pas de store global partagé |
| **Requêtes** | TanStack React Query v5 | Hooks dans packages/api-client (phase 2) |
| **Stockage local** | react-native-mmkv ^2.12 | **Uniquement MMKV — jamais AsyncStorage** |
| **Backend** | Node.js 18 + Express 4 + TypeScript | Port 3000 par défaut |
| **DB** | MongoDB Atlas + Mongoose 8 | URI dans `MONGODB_URI` |
| **Cache** | Redis (optionnel dev, requis prod) | Sessions & rate-limiting |
| **Temps réel** | Socket.io 4.7 | Suivi livraison en direct |
| **Paiement** | CinetPay | Mobile Money : Airtel · Orange · M-Pesa + Cash |
| **SMS/OTP** | Africa's Talking | Envoi OTP par SMS |
| **Cartographie** | react-native-maps 1.14 (livreur) | Prévu : MapLibre GL + OSM |
| **Notifs push** | Firebase FCM | Champ `deviceToken` dans User |
| **Images** | Cloudinary | Logos restaurants, photos produits |
| **Dashboard admin** | Next.js 14 | Port 3001 |
| **Monorepo** | npm workspaces | Node ≥ 18, npm ≥ 9 |
| **Validation backend** | Zod + express-validator | Double validation par sécurité |
| **Auth** | JWT (access 15m + refresh 30j) + bcryptjs | |
| **Logs** | Winston + Morgan | |

---

## 4. DESIGN SYSTEM

**Direction artistique :** Variation B — "Vibrant & Communauté"  
**Mode :** Dark-first (pas de light mode en phase 1)  
**Polices :** Syne (titres, weights 600-800) · DM Sans (corps, weights 400-500)  
*(les polices sont référencées dans le cahier des charges — à intégrer via expo-font)*

### Couleurs exactes

```
Fond principal      #111118   (background)
Surface             #141418   (cards, inputs)
Surface élevée      #1E1E25   (modals, dropdowns)
Bordures            #2A2A35

Orange marque       #E85D04   (logo, accents client)
Orange clair        #FF6B00
Orange foncé        #C44E00

Lime CTA            #C8FF57   (boutons principaux livreur, add-to-cart)
Lime foncé          #A8E040

Texte principal     #FFFFFF
Texte secondaire    #9B9BA8
Texte atténué       #5A5A6B
Texte inverse       #0A0A0F   (sur fond lime)

Succès              #22C55E
Avertissement       #F59E0B
Erreur              #EF4444
Info                #3B82F6

Overlay             rgba(0, 0, 0, 0.75)
```

**Règle couleur :** `orange` → identité marque & UI client. `lime` → CTAs livreur & actions d'achat.

---

## 5. ÉQUIPE & PÉRIMÈTRES

| Membre | App / Rôle | Périmètre |
|--------|-----------|-----------|
| **Djibril Ba** | `apps/livreur/` + architecte | Auth livreur, dashboard missions, cartographie, architecture monorepo, reviews PR |
| **Ablaye Nian** | `apps/client/` | Auth client, home, search, panier, commandes, profil |
| **Modou Fall** | `backend/` — reviewer PR critiques | API REST, modèles MongoDB, auth JWT, Socket.io, intégrations tierces |
| **Christian** | Ops terrain Kinshasa | Tests utilisateurs, retours UX, coordination restaurants partenaires |

**Reviewer obligatoire :**
- PR `backend/` → Modou Fall
- PR `apps/*` ou architecture → Djibril Ba

---

## 6. ÉTAT ACTUEL

> Mettre à jour manuellement après chaque ticket terminé.

```
✅ CON-1  — Setup monorepo npm workspaces (Djibril)
✅ CON-2  — Auth livreur : login téléphone + OTP 6 cases + MMKV (Djibril)
🔄 CON-3  — Auth client : login téléphone + OTP + sélection quartier (Ablaye) — en cours
⏳ CON-11 — Auth backend : POST /api/auth/otp/send + /verify + JWT (Modou) — BLOQUANT pour CON-2 et CON-3
⏳ CON-4  — Dashboard livreur : liste missions, toggle online/offline (Djibril)
⏳ CON-5  — Home client : liste restaurants, recherche (Ablaye)
⏳ CON-6  — Intégration CinetPay paiement (Modou)
⏳ CON-7  — Suivi temps réel livraison via Socket.io (Djibril + Modou)
⏳ CON-8  — Admin dashboard restaurants (Djibril)
⏳ CON-9  — Notifications push FCM (Modou)
⏳ CON-10 — Cartographie MapLibre livreur (Djibril)
```

---

## 7. CONVENTIONS

### Git
- Branches : `feat/nom-court`, `fix/nom-court`, `chore/nom-court`
- **Jamais coder directement sur `main`**
- Commits en français : `feat: ajouter écran OTP`, `fix: corriger crash MMKV`, `chore: mettre à jour types`
- PR backend → reviewer Modou Fall obligatoire
- PR apps & architecture → reviewer Djibril Ba obligatoire

### Code
- Types **toujours** importés depuis `@congofood/types` — ne jamais redéfinir
- Appels API **uniquement** via hooks React Query (jamais `fetch`/`axios` bruts dans les composants)
- Stockage local : **MMKV uniquement** — jamais `AsyncStorage` ni `expo-secure-store` pour les tokens
- Zéro erreur TypeScript avant de merger (CI : `npx tsc --noEmit`)
- Commentaires en français
- Pas de `console.log` en production — utiliser Winston côté backend

### Architecture mobile
- Chaque app est autonome : pas de dépendances croisées entre `apps/client` et `apps/livreur`
- `packages/ui` et `packages/api-client` = phase 2 (mutualisé quand stable)
- Routing : Expo Router v3, groupes `(auth)` et `(tabs)` séparés
- Redirection auth : gérer dans `(auth)/_layout.tsx` via `useAuthStore().isAuthenticated`

---

## 8. VARIABLES D'ENVIRONNEMENT

Fichier : `backend/.env` (copier depuis `backend/.env.example`)

| Variable | Rôle |
|----------|------|
| `PORT` | Port serveur Express |
| `NODE_ENV` | Environnement (`development` / `production`) |
| `MONGODB_URI` | Connexion MongoDB Atlas |
| `JWT_SECRET` | Signature access tokens |
| `JWT_REFRESH_SECRET` | Signature refresh tokens |
| `JWT_EXPIRES_IN` | Durée access token (ex: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Durée refresh token (ex: `30d`) |
| `CINETPAY_API_KEY` | Clé API paiement Mobile Money |
| `CINETPAY_SITE_ID` | Identifiant site CinetPay |
| `CINETPAY_NOTIFY_URL` | Webhook CinetPay (webhook paiement) |
| `AFRICAS_TALKING_API_KEY` | Clé SMS OTP |
| `AFRICAS_TALKING_USERNAME` | Compte Africa's Talking |
| `FCM_SERVER_KEY` | Notifications push Firebase |
| `CLOUDINARY_URL` | Upload images (logos, photos) |
| `REDIS_URL` | Cache & sessions |
| `CLIENT_URL` | Origine autorisée CORS app client |
| `ADMIN_URL` | Origine autorisée CORS dashboard admin |

---

## 9. COMMANDES UTILES

```bash
# Installation (à la racine — installe tout le monorepo)
npm install

# ── Lancer les apps ─────────────────────────────────────────

# Backend Express + Socket.io (port 3000)
cd backend && npm run dev

# App client React Native
cd apps/client && npx expo start
# → scan QR avec Expo Go, ou 'a' Android / 'i' iOS

# App livreur React Native
cd apps/livreur && npx expo start

# Dashboard admin Next.js (port 3001)
cd apps/admin && npm run dev

# ── TypeScript ────────────────────────────────────────────────

# Vérifier types (depuis la racine, tous les workspaces)
npm run typecheck

# Vérifier un workspace précis
cd packages/types && npx tsc --noEmit
cd backend && npx tsc --noEmit
cd apps/livreur && npx tsc --noEmit
cd apps/client && npx tsc --noEmit

# ── Build ────────────────────────────────────────────────────

# Compiler les types partagés (requis avant build prod apps)
npm run build:types

# Compiler tous les packages
npm run build:packages

# ── Git ──────────────────────────────────────────────────────

# Workflow standard
git checkout -b feat/ma-feature
# ... coder ...
git add apps/livreur/app/(auth)/login.tsx
git commit -m "feat: implémenter login téléphone livreur"
git push origin feat/ma-feature
# → ouvrir PR, assigner reviewer

# ── Santé du monorepo ────────────────────────────────────────

# Vérifier que le backend répond
curl http://localhost:3000/health

# Vérifier que Metro (Expo) répond
curl http://localhost:8081/status
```

---

## 10. RÈGLES CLAUDE CODE

1. **Lire ce fichier en premier** avant toute action sur le projet.
2. **Ne jamais scanner `node_modules/`** — utiliser les paths du monorepo.
3. **Types depuis `@congofood/types` uniquement** — ne jamais redéfinir `User`, `Order`, `AuthTokens`, etc.
4. **Zéro erreur TypeScript** avant de déclarer une tâche terminée (`npx tsc --noEmit`).
5. **Commentaires en français** dans tout le code.
6. **MMKV uniquement** pour le stockage local — jamais `AsyncStorage`.
7. **Appels API via React Query** — jamais d'appels bruts dans les composants.
8. **Taille APK cible : < 25 MB** — éviter les dépendances lourdes inutiles.
9. **Optimiser pour Android bas de gamme + 3G instable** — pas d'images non compressées, staleTime raisonnable, retry limité, lazy loading.
10. **Couleur `lime` (#C8FF57)** pour les CTAs livreur. **`orange` (#E85D04)** pour l'identité marque client.
11. **Avant tout commit**, vérifier `tsc --noEmit` sur l'app/package modifié.
12. **Ne pas toucher à `main`** sans PR et review.
13. **Routes API** toutes préfixées `/api/` — ex: `POST /api/auth/otp/send`.
14. **Mock acceptable en dev** pour les intégrations tierces (OTP, paiement) mais laisser un commentaire `// TODO : appeler POST /api/...`.
