'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    CheckCircle,
} from 'lucide-react';

interface ChangePasswordProps {
    role: 'student' | 'teacher';
}

export function ChangePassword({ role }: ChangePasswordProps) {
    const { token } = useAuth();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getStrength = (pwd: string) => {
        if (pwd.length === 0) return 0;
        if (pwd.length < 6) return 1;
        if (pwd.length < 8) return 2;
        const hasNum = /\d/.test(pwd);
        const hasSym = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        const hasUp = /[A-Z]/.test(pwd);
        const score = [hasNum, hasSym, hasUp].filter(Boolean).length;
        return 2 + score; // 2-5
    };

    const strength = getStrength(form.new_password);
    const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength];
    const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-green-500'][strength];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.new_password.length < 8) {
            toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
            return;
        }
        if (form.new_password !== form.confirm_password) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/change-password`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        mot_de_passe_actuel: form.current_password,
                        nouveau_mot_de_passe: form.new_password,
                        nouveau_mot_de_passe_confirmation: form.confirm_password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                toast.success('Mot de passe modifié avec succès !');
                setTimeout(() => router.push(`/${role}/profile`), 2500);
            } else {
                toast.error(data.message || 'Erreur lors de la modification');
            }
        } catch (err) {
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    // Theme helpers
    const themeBg = role === 'teacher' ? 'bg-emerald-600' : 'bg-blue-600';
    const themeHover = role === 'teacher' ? 'hover:bg-emerald-700' : 'hover:bg-blue-700';
    const themeShadow = role === 'teacher' ? 'shadow-emerald-200' : 'shadow-blue-200';
    const themeIconBox = role === 'teacher' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600';
    const themeBorder = role === 'teacher' ? 'border-emerald-200' : 'border-blue-200';
    const themeText = role === 'teacher' ? 'text-emerald-600' : 'text-blue-600';

    const profilePath = `/${role}/profile`;

    return (
        <Layout role={role}>
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

                {/* Header */}
                <div className={`relative bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8`}>
                    <div className={`absolute -top-12 -right-12 w-48 h-48 ${themeBg} opacity-[0.06] rounded-full pointer-events-none`} />
                    <div className={`absolute -bottom-12 -left-12 w-36 h-36 ${themeBg} opacity-[0.04] rounded-full pointer-events-none`} />

                    <div className="relative z-10 flex items-start gap-4">
                        {/* Back arrow */}
                        <button
                            type="button"
                            onClick={() => router.push(profilePath)}
                            className="mt-1 p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-all flex-shrink-0"
                            aria-label="Retour"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sécurité du compte</p>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Modifier le mot de passe</h1>
                            <p className="text-gray-400 mt-1 text-sm">
                                Choisissez un mot de passe fort d&apos;au moins <strong>8 caractères</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success state */}
                {success ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-12 flex flex-col items-center gap-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">Mot de passe modifié !</h2>
                            <p className="text-gray-400 mt-2 text-sm">Vous allez être redirigé vers votre profil…</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-gray-50 bg-gray-50/40 p-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${themeIconBox}`}>
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">Nouveau mot de passe</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">
                                            Renseignez votre mot de passe actuel puis choisissez-en un nouveau
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-8 space-y-7">

                                {/* Ancien mot de passe */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        Mot de passe actuel
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <Input
                                            type={showCurrent ? 'text' : 'password'}
                                            name="current_password"
                                            value={form.current_password}
                                            onChange={handleChange}
                                            required
                                            placeholder="••••••••"
                                            className="h-13 pl-12 pr-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all h-12 font-mono tracking-wider"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(p => !p)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Séparateur */}
                                <hr className="border-gray-100" />

                                {/* Nouveau mot de passe */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        Nouveau mot de passe
                                    </Label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <Input
                                            type={showNew ? 'text' : 'password'}
                                            name="new_password"
                                            value={form.new_password}
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                            placeholder="Minimum 8 caractères"
                                            className="h-12 pl-12 pr-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all font-mono tracking-wider"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(p => !p)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                        >
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Strength bar */}
                                    {form.new_password.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-100'}`}
                                                    />
                                                ))}
                                            </div>
                                            <p className={`text-[11px] font-bold ${strength >= 4 ? 'text-green-500' : strength === 3 ? 'text-yellow-500' : 'text-red-400'}`}>
                                                {strengthLabel}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Confirmation */}
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        Confirmer le nouveau mot de passe
                                    </Label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <Input
                                            type={showConfirm ? 'text' : 'password'}
                                            name="confirm_password"
                                            value={form.confirm_password}
                                            onChange={handleChange}
                                            required
                                            minLength={8}
                                            placeholder="Répétez le mot de passe"
                                            className={`h-12 pl-12 pr-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all font-mono tracking-wider ${form.confirm_password && form.confirm_password !== form.new_password
                                                ? 'border-red-300 bg-red-50/30'
                                                : form.confirm_password && form.confirm_password === form.new_password
                                                    ? 'border-green-300 bg-green-50/30'
                                                    : ''
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(p => !p)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {form.confirm_password && form.confirm_password !== form.new_password && (
                                        <p className="text-[11px] text-red-500 font-bold ml-1">Les mots de passe ne correspondent pas</p>
                                    )}
                                    {form.confirm_password && form.confirm_password === form.new_password && (
                                        <p className="text-[11px] text-green-500 font-bold ml-1 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Les mots de passe correspondent
                                        </p>
                                    )}
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full ${themeBg} ${themeHover} text-white h-14 rounded-2xl font-bold shadow-lg ${themeShadow} transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-2`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" />
                                            Enregistrer le nouveau mot de passe
                                        </>
                                    )}
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => router.push(profilePath)}
                                    className="w-full text-center text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors mt-2"
                                >
                                    ← Annuler et retourner au profil
                                </button>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </div>
        </Layout>
    );
}
