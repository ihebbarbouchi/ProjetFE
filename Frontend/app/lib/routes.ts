// ============================================================
//  ROUTES — Fichier centralisé de toutes les routes de l'app
//  Importé par Layout.tsx et tout composant qui a besoin des routes
// ============================================================

export const ROUTES = {
    // ── Public ─────────────────────────────────────────────
    home: '/',
    login: '/login',
    signup: '/signup',
    about: '/about',
    contact: '/contact',
    publicResources: '/public-resources',

    // ── Super Admin ─────────────────────────────────────────
    superAdmin: {
        dashboard: '/super-admin',
        userManagement: '/super-admin/user-management',
        teacherValidation: '/super-admin/teacher-validation',
        categories: '/super-admin/categories',
        resourceTypes: '/super-admin/resource-types',
        disciplines: '/super-admin/disciplines',
        levels: '/super-admin/levels',
    },

    // ── Teacher ─────────────────────────────────────────────
    teacher: {
        dashboard: '/teacher',
        resources: '/teacher/resources',
        categories: '/teacher/categories',
        students: '/teacher/students',
    },

    // ── Student ─────────────────────────────────────────────
    student: {
        dashboard: '/student',
        categories: '/student/categories',
        resources: '/student/resources',
    },

    // ── Shared ──────────────────────────────────────────────
    addResource: '/add-resource',
} as const;

export type Route = typeof ROUTES;
