'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import {
    Bell, CheckCircle, XCircle, FileText, Tag, Mail,
    CheckCheck, Trash2, Filter, Loader2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

type NotificationType =
    | 'compte_valide'
    | 'compte_refuse'
    | 'quiz_publie'
    | 'categorie_acceptee'
    | 'categorie_refusee'
    | 'message_contact';

interface Notification {
    id: number;
    type: NotificationType;
    titre: string;
    message: string;
    lu: boolean;
    created_at: string;
}

type FilterType = 'toutes' | 'non_lues' | 'quiz' | 'compte' | 'categories' | 'messages';

// ── Config des types ───────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotificationType, {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    badge: string;
    badgeBg: string;
}> = {
    compte_valide: {
        icon: CheckCircle,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        badge: 'Compte',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    compte_refuse: {
        icon: XCircle,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        badge: 'Compte',
        badgeBg: 'bg-red-50 text-red-700 border-red-200',
    },
    quiz_publie: {
        icon: FileText,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        badge: 'Quiz',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    categorie_acceptee: {
        icon: Tag,
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        badge: 'Catégorie',
        badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    categorie_refusee: {
        icon: Tag,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        badge: 'Catégorie',
        badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    message_contact: {
        icon: Mail,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        badge: 'Message',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
};

// ── Filtres disponibles par rôle ───────────────────────────────────────────────

/**
 * Chaque acteur ne voit que les onglets pertinents pour lui :
 *
 *  super-admin : Toutes · Non lues · Messages (contacts reçus)
 *  teacher     : Toutes · Non lues · Compte  · Catégories
 *  student     : Toutes · Non lues · Compte  · Quiz
 */
const FILTERS_BY_ROLE: Record<'super-admin' | 'teacher' | 'student', FilterType[]> = {
    'super-admin': ['toutes', 'non_lues', 'messages'],
    teacher:       ['toutes', 'non_lues', 'compte', 'categories'],
    student:       ['toutes', 'non_lues', 'compte', 'quiz'],
};

const FILTER_LABELS: Record<FilterType, string> = {
    toutes:     'Toutes',
    non_lues:   'Non lues',
    quiz:       'Quiz',
    compte:     'Compte',
    categories: 'Catégories',
    messages:   'Messages',
};

const TYPE_TO_FILTER: Record<NotificationType, FilterType> = {
    compte_valide:    'compte',
    compte_refuse:    'compte',
    quiz_publie:      'quiz',
    categorie_acceptee: 'categories',
    categorie_refusee:  'categories',
    message_contact:  'messages',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
    const date   = new Date(dateStr);
    const now    = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH  = Math.floor(diffMin / 60);
    const diffD  = Math.floor(diffH / 24);

    if (diffMin < 1)  return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH < 24)   return `Il y a ${diffH}h`;
    if (diffD === 1)  return 'Hier';
    if (diffD < 7)    return `Il y a ${diffD} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// ── Données de démo selon le rôle ──────────────────────────────────────────────

function demoData(role: 'super-admin' | 'teacher' | 'student'): Notification[] {
    const now = Date.now();
    if (role === 'super-admin') {
        return [
            {
                id: 1, type: 'message_contact',
                titre: 'Nouveau message de contact',
                message: 'Ahmed Bouaziz vous a envoyé un message concernant l\'accès aux ressources pédagogiques.',
                lu: false, created_at: new Date(now - 5 * 60000).toISOString(),
            },
            {
                id: 2, type: 'message_contact',
                titre: 'Demande de renseignements',
                message: 'Une étudiante demande des informations sur les formations disponibles sur la plateforme.',
                lu: true, created_at: new Date(now - 3 * 60 * 60000).toISOString(),
            },
        ];
    }
    if (role === 'teacher') {
        return [
            {
                id: 1, type: 'compte_valide',
                titre: 'Compte approuvé ✅',
                message: 'Votre compte enseignant a été validé par l\'administrateur. Vous pouvez maintenant accéder à toutes les fonctionnalités.',
                lu: false, created_at: new Date(now - 5 * 60000).toISOString(),
            },
            {
                id: 2, type: 'categorie_acceptee',
                titre: 'Catégorie approuvée ✅',
                message: 'Votre suggestion de catégorie "Mathématiques L2" a été approuvée par l\'administrateur. Elle est maintenant disponible.',
                lu: false, created_at: new Date(now - 60 * 60000).toISOString(),
            },
            {
                id: 3, type: 'categorie_refusee',
                titre: 'Catégorie refusée',
                message: 'Votre suggestion de catégorie "PHYS-L3-ADV" a été refusée. Vous pouvez soumettre une nouvelle suggestion avec des corrections.',
                lu: true, created_at: new Date(now - 24 * 60 * 60000).toISOString(),
            },
        ];
    }
    // student
    return [
        {
            id: 1, type: 'compte_valide',
            titre: 'Compte approuvé ✅',
            message: 'Votre compte étudiant a été validé. Vous pouvez maintenant accéder à toutes les ressources et quiz disponibles.',
            lu: false, created_at: new Date(now - 5 * 60000).toISOString(),
        },
        {
            id: 2, type: 'quiz_publie',
            titre: 'Nouveau quiz disponible 🎓',
            message: 'Le quiz "Introduction aux Bases de Données" est maintenant disponible. Testez vos connaissances !',
            lu: false, created_at: new Date(now - 60 * 60000).toISOString(),
        },
        {
            id: 3, type: 'quiz_publie',
            titre: 'Nouveau quiz disponible 🎓',
            message: 'Le quiz "Algorithmes & Structures de Données" vient d\'être publié par votre enseignant.',
            lu: true, created_at: new Date(now - 2 * 24 * 60 * 60000).toISOString(),
        },
    ];
}

// ── Composant principal ────────────────────────────────────────────────────────

export default function NotificationsPage() {
    const { user, token } = useAuth();
    const router = useRouter();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading]             = useState(true);
    const [filter, setFilter]               = useState<FilterType>('toutes');
    const [markingAll, setMarkingAll]       = useState(false);

    const API_URL = 'http://localhost:8000/api';

    // ── Rôle de l'utilisateur ──────────────────────────────────────────────────
    const role = (user?.role === 'super-admin'
        ? 'super-admin'
        : user?.role === 'teacher'
            ? 'teacher'
            : 'student') as 'super-admin' | 'teacher' | 'student';

    const accentColor =
        role === 'super-admin' ? 'violet' :
        role === 'teacher'     ? 'emerald' : 'blue';

    // ── Filtres disponibles pour ce rôle ──────────────────────────────────────
    const availableFilters = FILTERS_BY_ROLE[role];

    // ── Chargement des notifications ───────────────────────────────────────────
    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications`, {
                headers: {
                    Authorization: `Bearer ${token || localStorage.getItem('auth_token')}`,
                    Accept: 'application/json',
                },
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setNotifications(data);
        } catch {
            // Données de démo si l'API n'est pas encore connectée
            setNotifications(demoData(role));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, role]);

    // ── Marquer une notification comme lue ────────────────────────────────────
    const markAsRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token || localStorage.getItem('auth_token')}`,
                    Accept: 'application/json',
                },
            });
        } catch { /* ignore */ }
    };

    // ── Marquer toutes comme lues ─────────────────────────────────────────────
    const markAllAsRead = async () => {
        setMarkingAll(true);
        setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
        try {
            await fetch(`${API_URL}/notifications/read-all`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token || localStorage.getItem('auth_token')}`,
                    Accept: 'application/json',
                },
            });
        } catch { /* ignore */ }
        finally { setMarkingAll(false); }
    };

    // ── Supprimer une notification ────────────────────────────────────────────
    const deleteNotification = async (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await fetch(`${API_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token || localStorage.getItem('auth_token')}`,
                    Accept: 'application/json',
                },
            });
        } catch { /* ignore */ }
    };

    // ── Filtrage ──────────────────────────────────────────────────────────────
    const filtered = notifications.filter(n => {
        if (filter === 'toutes')   return true;
        if (filter === 'non_lues') return !n.lu;
        return TYPE_TO_FILTER[n.type] === filter;
    });

    const nonLuesCount = notifications.filter(n => !n.lu).length;

    const filterCount = (f: FilterType) => {
        if (f === 'toutes')   return notifications.length;
        if (f === 'non_lues') return nonLuesCount;
        return notifications.filter(n => TYPE_TO_FILTER[n.type] === f).length;
    };

    // ── Couleur active par rôle ───────────────────────────────────────────────
    const activePillClass =
        role === 'super-admin' ? 'bg-violet-600 text-white border-violet-600 shadow-sm' :
        role === 'teacher'     ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' :
                                 'bg-blue-600 text-white border-blue-600 shadow-sm';

    // ── Rendu ─────────────────────────────────────────────────────────────────
    return (
        <Layout role={role}>
            <div className="space-y-6">

                {/* ── Header ─────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                        <p className="text-gray-600 mt-1">
                            {nonLuesCount > 0
                                ? `${nonLuesCount} notification${nonLuesCount > 1 ? 's' : ''} non lue${nonLuesCount > 1 ? 's' : ''}`
                                : 'Toutes vos notifications sont à jour ✓'}
                        </p>
                    </div>
                    {nonLuesCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            className="gap-2"
                        >
                            {markingAll
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <CheckCheck className="w-4 h-4" />}
                            Tout marquer comme lu
                        </Button>
                    )}
                </div>

                {/* ── Description rôle ───────────────────────────────────────────── */}
                <div className={`rounded-xl border p-4 text-sm flex items-start gap-3 ${
                    role === 'super-admin' ? 'bg-violet-50 border-violet-200 text-violet-800' :
                    role === 'teacher'     ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                                            'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                    <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                        {role === 'super-admin' && 'En tant qu\'administrateur, vous recevez les messages de contact des visiteurs.'}
                        {role === 'teacher'     && 'En tant qu\'enseignant, vous recevez les décisions sur votre compte et vos suggestions de catégories.'}
                        {role === 'student'     && 'En tant qu\'apprenant, vous recevez les décisions sur votre compte et les alertes de nouveaux quiz disponibles.'}
                    </span>
                </div>

                {/* ── Filtres (adaptés au rôle) ───────────────────────────────────── */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    {availableFilters.map(f => {
                        const count    = filterCount(f);
                        const isActive = filter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                                    isActive
                                        ? activePillClass
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {FILTER_LABELS[f]}
                                {count > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* ── Liste des notifications ────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-gray-500" />
                            {FILTER_LABELS[filter]}
                        </CardTitle>
                        <CardDescription>
                            {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-16">
                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Chargement des notifications…</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            // ── État vide ──────────────────────────────────────────────
                            <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium text-lg">Aucune notification</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {filter === 'non_lues'
                                        ? 'Toutes vos notifications ont été lues.'
                                        : 'Vous serez notifié ici de toute activité importante.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map((notif) => {
                                    const config = TYPE_CONFIG[notif.type];
                                    const Icon   = config.icon;

                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.lu && markAsRead(notif.id)}
                                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all group cursor-pointer ${
                                                !notif.lu
                                                    ? 'border-l-4 border-l-blue-500 border-gray-100 bg-blue-50/30 hover:bg-blue-50/50'
                                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                                            }`}
                                        >
                                            {/* Icône */}
                                            <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                <Icon className={`w-5 h-5 ${config.iconColor}`} />
                                            </div>

                                            {/* Contenu */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <p className={`font-semibold text-gray-900 ${!notif.lu ? 'font-bold' : ''}`}>
                                                        {notif.titre}
                                                    </p>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs px-2 py-0 ${config.badgeBg}`}
                                                    >
                                                        {config.badge}
                                                    </Badge>
                                                    {!notif.lu && (
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1.5">
                                                    {formatRelativeTime(notif.created_at)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                {!notif.lu && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 p-0"
                                                        title="Marquer comme lu"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </Layout>
    );
}
