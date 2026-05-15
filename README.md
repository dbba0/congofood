# CongoFood — Monorepo

Application de livraison food & épicerie à Kinshasa (RDC).

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Mobile (client & livreur) | React Native + Expo SDK 51 + Expo Router v3 |
| Dashboard admin | Next.js 14 |
| Backend | Node.js + Express + TypeScript |
| Base de données | MongoDB Atlas + Mongoose |
| State management | Zustand |
| Cache / requêtes | TanStack Query (React Query v5) |
| Stockage local | react-native-mmkv |
| Temps réel | Socket.io |
| Paiement | CinetPay (Mobile Money RDC) |
| Cartographie | MapLibre GL + OpenStreetMap |
| Monorepo | npm workspaces |

---

## Structure du projet

```
congofood/
├── apps/
│   ├── client/       # App React Native — clients finaux
│   ├── livreur/      # App React Native — livreurs
│   └── admin/        # Dashboard Next.js — restaurants & admin
├── packages/
│   ├── types/        # Types TypeScript partagés entre toutes les apps
│   ├── ui/           # Composants React Native partagés (phase 2)
│   └── api-client/   # Hooks React Query partagés (phase 2)
└── backend/          # API REST + WebSocket
```

---

## Installation

```bash
# À la racine du projet
npm install
```

npm workspaces installe les dépendances de toutes les apps et packages en une seule commande.

---

## Lancer les apps

### Backend

```bash
# Copier et remplir les variables d'environnement
cp backend/.env.example backend/.env

cd backend
npm run dev
# → Serveur Express + Socket.io sur http://localhost:3000
```

### App client (React Native)

```bash
cd apps/client
npx expo start
# Scan le QR code avec Expo Go (iOS/Android)
# ou appuyer sur 'a' pour Android emulator / 'i' pour iOS simulator
```

### App livreur (React Native)

```bash
cd apps/livreur
npx expo start
```

### Dashboard admin (Next.js)

```bash
cd apps/admin
npm run dev
# → http://localhost:3001
```

---

## Variables d'environnement

Copier `backend/.env.example` vers `backend/.env` et remplir :

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | URI de connexion MongoDB Atlas |
| `JWT_SECRET` | Secret pour signer les access tokens (≥ 32 chars) |
| `JWT_REFRESH_SECRET` | Secret pour signer les refresh tokens (≥ 32 chars) |
| `CINETPAY_API_KEY` | Clé API CinetPay (paiements Mobile Money) |
| `CINETPAY_SITE_ID` | Site ID CinetPay |
| `AFRICAS_TALKING_API_KEY` | Clé API Africa's Talking (SMS OTP) |
| `FCM_SERVER_KEY` | Clé serveur Firebase (notifications push) |
| `CLOUDINARY_URL` | URL Cloudinary (upload images produits/logos) |
| `REDIS_URL` | URL Redis (optionnel en dev) |

---

## Types partagés

Tous les types TypeScript sont centralisés dans `packages/types`.  
Ils sont importés comme :

```typescript
import type { Order, User, Restaurant } from '@congofood/types';
```

Les packages partagés sont référencés via les `paths` dans chaque `tsconfig.json` — pas besoin de build avant de démarrer en développement.

---

## Modèles de données

Voir [`packages/types/src/`](packages/types/src/) pour les interfaces TypeScript.  
Les Mongoose schemas correspondants sont dans [`backend/src/models/`](backend/src/models/).

### Flux d'une commande

```
pending → confirmed → preparing → ready → picking_up → on_the_way → delivered
                                                                   ↘ cancelled
```

### Méthodes de paiement supportées

- **Airtel Money** (via CinetPay)
- **Orange Money** (via CinetPay)
- **M-Pesa** (via CinetPay)
- **Cash** (paiement à la livraison)
