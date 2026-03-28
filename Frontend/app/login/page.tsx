'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PublicLayout } from '../components/PublicLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle, Loader2, Eye, EyeOff, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Modal, ModalBody, ModalFooter, ModalConfirmButton } from '../components/ui/modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, clearSession, isAuthenticated, user, isLoading: authLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [forcedLogout, setForcedLogout] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [countdown, setCountdown] = useState(30);

    // Si ?logout=true dans l'URL (lien depuis email de notification), vider la session sans redirection
    useEffect(() => {
        if (searchParams.get('logout') === 'true') {
            clearSession(); // Vide auth sans router.push('/')
            setForcedLogout(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Redirect if already authenticated (sauf si déconnexion forcée depuis email ou compte en attente)
    useEffect(() => {
        if (!authLoading && isAuthenticated && user && !forcedLogout) {
            // If user is pending and not a super-admin, show the pending modal
            if (user.statut === 'pending' && user.role !== 'super-admin') {
                setShowPendingModal(true);
            } else {
                // Redirect based on role (only if active or super-admin)
                // This condition ensures super-admins are always redirected, and other roles only if not pending.
                if (user.role === 'super-admin' || user.statut !== 'pending') {
                    const role = user.role;
                    if (role === 'super-admin') {
                        router.replace('/super-admin');
                    } else if (role === 'teacher') {
                        router.replace('/teacher');
                    } else {
                        router.replace('/student');
                    }
                }
            }
        }
    }, [authLoading, isAuthenticated, user, router, forcedLogout]);

    // Timer pour la fenêtre d'attente
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showPendingModal) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        clearInterval(timer);
                        // On ferme la modal d'abord, ce qui déclenchera la déconnexion via clearSession
                        setTimeout(() => {
                            clearSession();
                            setShowPendingModal(false);
                        }, 0);
                        return 30;
                    }
                    return next;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [showPendingModal, clearSession]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || 'Échec de la connexion');
            setIsSubmitting(false);
        } else {
            // Un petit délai pour laisser l'AuthContext se mettre à jour
            setTimeout(() => {
                setIsSubmitting(false);
            }, 500);
        }
    };

    // Loading spinner (auth check)
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    // Redirect in progress (only if not pending)
    if (isAuthenticated && user && (user.statut !== 'pending' || user.role === 'super-admin')) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Redirection vers votre tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <PublicLayout>
            {/* Modal de compte en attente */}
            <Modal open={showPendingModal} onOpenChange={(open) => { if (!open) { clearSession(); setShowPendingModal(false); } }}>
                <ModalBody>
                    <div className="text-center py-4">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
                            <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Inscription en attente
                        </h3>

                        <p className="text-lg font-medium text-blue-600 mb-6">
                            Votre compte est en cours de validation.
                        </p>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex gap-4 text-left mb-6">
                            <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                Un administrateur doit vérifier vos informations avant de vous accorder l&apos;accès à la plateforme EduShare.
                            </p>
                        </div>

                        <div className="inline-flex items-center justify-center px-4 py-1.5 bg-blue-50 rounded-full text-xs font-bold text-blue-700">
                            Déconnexion automatique : {countdown}s
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <ModalConfirmButton
                        className="w-full"
                        onClick={() => { clearSession(); setShowPendingModal(false); }}
                    >
                        Fermer la fenêtre
                    </ModalConfirmButton>
                </ModalFooter>
            </Modal>

            {/* Full-page gradient – mirrors signup layout */}
            <section className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center">
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* ── Left panel: text only ──────────────────────────────── */}
                        <div className="hidden lg:flex flex-col justify-between h-full py-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
                                    EduShare
                                </div>
                                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                    Bon retour parmi nous
                                </h1>
                                <p className="text-lg text-gray-600 leading-relaxed max-w-md">
                                    Connectez-vous pour retrouver vos ressources pédagogiques, vos cours et
                                    votre communauté d&apos;apprenants.
                                </p>

                                {/* Feature bullets */}
                                <ul className="space-y-3 pt-2">
                                    {[
                                        'Accédez à vos ressources en un clic',
                                        'Suivez votre progression en temps réel',
                                        'Échangez avec vos enseignants et pairs',
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-3 text-gray-700">
                                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                                                ✓
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>


                        </div>

                        {/* ── Right panel: white card form ──────────────────────── */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                            <div className="mb-7">
                                <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
                                <p className="text-sm text-gray-500 mt-1">Votre espace EduShare</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Error banner */}
                                {error && (
                                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Adresse e-mail */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                                        Adresse e-mail
                                    </Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="jean.dupont@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors"
                                    />
                                </div>

                                {/* Mot de passe */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                                            Mot de passe
                                        </Label>
                                        <button
                                            type="button"
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                            className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-colors pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            tabIndex={-1}
                                        >
                                            {showPassword
                                                ? <EyeOff className="w-4 h-4" />
                                                : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Utilisez 8 caractères minimum avec un mélange de lettres, chiffres et symboles.
                                    </p>
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base font-semibold transition-all"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Connexion en cours...
                                        </>
                                    ) : (
                                        'Se connecter'
                                    )}
                                </Button>

                                {/* Lien inscription */}
                                <div className="pt-4 border-t border-gray-100 mt-6">
                                    <p className="text-center text-sm text-gray-500 mb-4">
                                        Pas encore de compte ?
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-11 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-all"
                                        onClick={() => router.push('/signup')}
                                    >
                                        S&apos;inscrire
                                    </Button>
                                </div>
                            </form>
                        </div>
                        {/* end card */}

                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
