# Rapport de Migration : React (Vite) → Next.js 16 (App Router)

**Projet :** EduShare — Plateforme collaborative de ressources éducatives  
**Date :** 23 février 2026  
**Statut :** ✅ Migration complète et fonctionnelle

---

## 1. Contexte et objectif

Le projet EduShare était initialement bâti sur une stack **Vite + React + React Router v7**. Cette configuration est parfaite pour des SPA (Single Page Applications) légères, mais elle présente des limites pour un projet éducatif destiné à évoluer :

- Pas de rendu côté serveur (SSR) ni de génération statique (SSG)
- Mauvais référencement naturel (SEO) car tout le HTML est généré côté client
- Pas d'optimisation automatique des images, des polices ou du code
- Configuration manuelle nécessaire pour le routing, les métadonnées, etc.

**L'objectif** était de migrer vers **Next.js 16** avec l'**App Router**, le framework React le plus utilisé en production, afin de bénéficier de ces fonctionnalités sans réécrire les composants métier.

---

## 2. Architecture avant/après

### Avant — Stack Vite + React Router

```
Edushare2/
├── vite.config.ts          ← Bundler
├── package.json            ← type: "module" (ESM)
└── src/
    ├── app/
    │   ├── App.tsx          ← Entrée React (RouterProvider)
    │   ├── routes.ts        ← Définition manuelle des routes
    │   ├── pages/           ← Composants de pages
    │   └── components/      ← Layouts et UI
    └── styles/              ← CSS global
```

```tsx
// App.tsx — Avant
import { RouterProvider } from 'react-router';
import { router } from './routes';

function App() {
  return <RouterProvider router={router} />;
}
```

```ts
// routes.ts — Avant (déclaration manuelle)
export const router = createBrowserRouter([
  { path: "/",            Component: Login },
  { path: "/home",        Component: Home },
  { path: "/quiz/:id",    Component: Quiz },
  // ... 11 autres routes
]);
```

### Après — Stack Next.js 16 App Router

```
Edushare2/
├── next.config.ts          ← Configuration Next.js
├── postcss.config.mjs      ← PostCSS pour Tailwind v4
├── tsconfig.json           ← TypeScript configuré pour Next.js
├── package.json            ← Scripts next dev/build/start
└── src/
    └── app/
        ├── layout.tsx       ← Root Layout Next.js (remplace App.tsx)
        ├── page.tsx         ← Route "/"
        ├── home/page.tsx    ← Route "/home"
        ├── about/page.tsx   ← Route "/about"
        ├── contact/page.tsx
        ├── signup/page.tsx
        ├── formations/page.tsx
        ├── public-resources/page.tsx
        ├── super-admin/page.tsx
        ├── teacher/page.tsx
        ├── student/page.tsx
        ├── categories/page.tsx
        ├── resources/page.tsx
        ├── add-resource/page.tsx
        ├── quiz/[id]/page.tsx ← Route dynamique "/quiz/:id"
        ├── pages/           ← Composants métier (inchangés)
        └── components/      ← Layouts et UI (adaptés)
```

---

## 3. Changements techniques détaillés

### 3.1 Système de routing

C'est le changement le plus visible. React Router utilisait un fichier `routes.ts` centralisé. Next.js utilise le **routing basé sur le système de fichiers** : chaque dossier contenant un `page.tsx` devient automatiquement une route.

| Ancienne route (React Router) | Nouveau fichier (Next.js) |
|---|---|
| `/` → `Login` | `src/app/page.tsx` |
| `/home` → `Home` | `src/app/home/page.tsx` |
| `/about` → `About` | `src/app/about/page.tsx` |
| `/contact` → `Contact` | `src/app/contact/page.tsx` |
| `/signup` → `SignUp` | `src/app/signup/page.tsx` |
| `/public-resources` | `src/app/public-resources/page.tsx` |
| `/formations` | `src/app/formations/page.tsx` |
| `/super-admin` | `src/app/super-admin/page.tsx` |
| `/teacher` | `src/app/teacher/page.tsx` |
| `/student` | `src/app/student/page.tsx` |
| `/categories` | `src/app/categories/page.tsx` |
| `/resources` | `src/app/resources/page.tsx` |
| `/add-resource` | `src/app/add-resource/page.tsx` |
| `/quiz/:id` → `Quiz` | `src/app/quiz/[id]/page.tsx` |

> **Note :** Les paramètres dynamiques comme `:id` deviennent `[id]` dans Next.js.

Chaque fichier `page.tsx` est un simple wrapper :

```tsx
// src/app/teacher/page.tsx
import TeacherDashboard from '../pages/TeacherDashboard';

export default function Page() {
  return <TeacherDashboard />;
}
```

### 3.2 Root Layout (remplace `main.tsx` + `App.tsx`)

Le fichier `src/app/layout.tsx` est le nouveau point d'entrée. Il remplace à la fois `main.tsx` (qui montait React dans le DOM) et `App.tsx` (qui fournissait le RouterProvider).

```tsx
// src/app/layout.tsx — Nouveau
import type { Metadata } from 'next';
import '../styles/index.css';      // CSS global importé ici

export const metadata: Metadata = {
  title: 'EduShare - Collaborative Educational Resource Platform',
  description: '...',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 3.3 Navigation — Hooks remplacés

Tous les hooks de `react-router` ont été remplacés par leurs équivalents `next/navigation` :

| Hook React Router | Hook Next.js | Usage |
|---|---|---|
| `useNavigate()` | `useRouter()` | Navigation programmatique |
| `navigate('/path')` | `router.push('/path')` | Redirection |
| `useLocation()` | `usePathname()` | URL courante |
| `useParams()` | `useParams()` | Paramètres de route dynamique |

**Exemple concret — Layout.tsx :**

```tsx
// AVANT
import { useNavigate } from 'react-router';

const navigate = useNavigate();
navigate('/teacher');

// APRÈS
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/teacher');
```

**Exemple concret — PublicLayout.tsx :**

```tsx
// AVANT
import { useNavigate, useLocation } from 'react-router';
const location = useLocation();
const isActive = (path: string) => location.pathname === path;

// APRÈS
import { useRouter, usePathname } from 'next/navigation';
const pathname = usePathname();
const isActive = (path: string) => pathname === path;
```

**Exemple concret — Quiz.tsx (paramètres dynamiques) :**

```tsx
// AVANT
import { useParams } from 'react-router';
const { id } = useParams();

// APRÈS
import { useParams } from 'next/navigation';
const params = useParams();
const id = params?.id;  // type: string | string[]
```

### 3.4 Directive `'use client'`

Next.js 16 avec l'App Router distingue deux types de composants :
- **Server Components** : rendus côté serveur (par défaut), pas d'état ni d'effets
- **Client Components** : rendus côté client, peuvent utiliser `useState`, `useEffect`, `useRouter`, etc.

Tous les composants EduShare utilisent des hooks React (`useState`, `useRouter`, etc.), ils nécessitent donc la directive `'use client'` en tête de fichier.

```tsx
// Tous les composants et pages — directive ajoutée
'use client';

import { useState } from 'react';
// ...
```

**Fichiers concernés :** Layout.tsx, PublicLayout.tsx, et les 14 pages.

### 3.5 Correction de `window.location.pathname`

Deux pages (`Resources.tsx`, `Categories.tsx`) utilisaient `window.location.pathname` pour détecter le rôle de l'utilisateur. Cette approche ne fonctionne pas en SSR (le serveur n'a pas accès à `window`). Remplacée par `usePathname()` :

```tsx
// AVANT — crash côté serveur
const path = window.location.pathname;
const role = path.includes('teacher') ? 'teacher' : 'student';

// APRÈS — compatible SSR
const pathname = usePathname();
const role = pathname.includes('teacher') ? 'teacher' : 'student';
```

### 3.6 Configuration Tailwind CSS v4

Tailwind CSS v4 avec Vite utilisait le plugin `@tailwindcss/vite`. Next.js utilise PostCSS, donc on remplace par `@tailwindcss/postcss` :

```js
// postcss.config.mjs — Avant
{ plugins: { tailwindcss: {} } }

// postcss.config.mjs — Après
{ plugins: { "@tailwindcss/postcss": {} } }
```

Le fichier `tailwind.css` a aussi été adapté (suppression de la syntaxe `source(none)` spécifique à Vite) :

```css
/* Avant — syntaxe Vite */
@import 'tailwindcss' source(none);
@source '../**/*.{js,ts,jsx,tsx}';

/* Après — syntaxe standard */
@import 'tailwindcss';
@source '../**/*.{js,ts,jsx,tsx}';
```

---

## 4. Fichiers de configuration créés/modifiés

| Fichier | Action | Rôle |
|---|---|---|
| `next.config.ts` | Créé | Configuration Next.js (minimal) |
| `tsconfig.json` | Créé | TypeScript avec `moduleResolution: bundler` |
| `postcss.config.mjs` | Modifié | Plugin Tailwind v4 pour Next.js |
| `package.json` | Modifié | Scripts Next.js, `"type": "module"` supprimé |
| `src/styles/tailwind.css` | Modifié | Syntaxe compatible PostCSS |
| `src/app/layout.tsx` | Créé | Root Layout (entrée de l'app) |

> **Important :** La suppression de `"type": "module"` dans `package.json` était nécessaire car Next.js gère son propre système de modules (CJS/ESM hybride) et ce champ provoquait un `WorkerError` au démarrage.

---

## 5. Ce qui n'a PAS changé

Un des avantages de cette migration est que **le code métier est préservé à 100%** :

- ✅ Tous les composants UI (`src/app/components/ui/`) — inchangés
- ✅ Toute la logique des pages (formulaires, état, filtres, etc.) — inchangée
- ✅ La structure CSS et les variables de thème — inchangées
- ✅ Toutes les dépendances (Radix UI, Recharts, Lucide, etc.) — compatibles
- ✅ Les fichiers `App.tsx` et `routes.ts` — conservés (sans être utilisés)

---

## 6. Avantages obtenus avec Next.js

| Fonctionnalité | Vite (avant) | Next.js (après) |
|---|---|---|
| **SEO** | ❌ HTML vide côté serveur | ✅ Metadata HTML générée (title, description) |
| **Performance** | ⚡ Rapide en dev | ⚡ Turbopack + optimisations prod |
| **SSR / SSG** | ❌ Non disponible | ✅ Prêt à l'emploi |
| **Optimisation images** | ❌ Manuel | ✅ `next/image` disponible |
| **API Routes** | ❌ Besoin d'un serveur séparé | ✅ `app/api/` intégré |
| **Routing** | 📄 Fichier `routes.ts` manuel | 🗂️ Basé sur le système de fichiers |
| **Déploiement** | Vercel/Netlify (static) | Vercel/Netlify/Docker (full-stack) |

---

## 7. Commandes disponibles

```bash
# Lancer en développement (hot reload)
npm run dev

# Compiler pour la production
npm run build

# Démarrer en production (après build)
npm start

# Lint du code
npm run lint
```

L'application tourne sur : **http://localhost:3000**

---

## 8. Routes disponibles

| URL | Page |
|---|---|
| `http://localhost:3000/` | Login |
| `http://localhost:3000/home` | Accueil public |
| `http://localhost:3000/signup` | Inscription |
| `http://localhost:3000/about` | À propos |
| `http://localhost:3000/contact` | Contact |
| `http://localhost:3000/formations` | Formations |
| `http://localhost:3000/public-resources` | Ressources publiques |
| `http://localhost:3000/super-admin` | Tableau de bord Admin |
| `http://localhost:3000/teacher` | Tableau de bord Enseignant |
| `http://localhost:3000/student` | Tableau de bord Étudiant |
| `http://localhost:3000/categories` | Catégories |
| `http://localhost:3000/resources` | Ressources |
| `http://localhost:3000/add-resource` | Ajouter une ressource |
| `http://localhost:3000/quiz/[id]` | Quiz (ex: `/quiz/1`) |

---

*Rapport généré automatiquement le 23 février 2026.*
