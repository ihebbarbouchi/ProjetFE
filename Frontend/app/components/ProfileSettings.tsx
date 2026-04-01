'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Globe,
    Home,
    Briefcase,
    Building,
    ShieldCheck,
    Save,
    Loader2,
    Lock,
    Camera,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

interface ProfileSettingsProps {
    role: 'student' | 'teacher';
}

export function ProfileSettings({ role }: ProfileSettingsProps) {
    const { user, token } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [formData, setFormData] = useState({
        prenom: '',
        nom_famille: '',
        email: '',
        telephone: '',
        ville: '',
        pays: '',
        adresse: '',
        poste_actuel: '',
        institution: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                prenom: user.prenom || user.nom.split(' ')[0] || '',
                nom_famille: user.nom_famille || user.nom.split(' ').slice(1).join(' ') || '',
                email: user.email || '',
                telephone: user.telephone || '',
                ville: user.ville || '',
                pays: user.pays || '',
                adresse: user.adresse || '',
                poste_actuel: user.poste_actuel || '',
                institution: user.institution || '',
            });
            const storedAvatar = localStorage.getItem(`avatar_${user.id}`);
            if (storedAvatar) setAvatarPreview(storedAvatar);
        }
    }, [user]);

    const showToast = (type: 'success' | 'error', msg: string) => {
        setToastMsg({ type, msg });
        setTimeout(() => setToastMsg(null), 3500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showToast('error', 'La photo ne doit pas dépasser 2 Mo');
            return;
        }
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (avatarFile && user) {
            localStorage.setItem(`avatar_${user.id}`, avatarPreview!);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/update-profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                showToast('success', 'Profil mis à jour avec succès !');
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('auth_user', JSON.stringify(updatedUser));
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast('error', data.message || 'Erreur lors de la mise à jour');
            }
        } catch {
            showToast('error', 'Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    // Theme tokens — aligns with teacher (emerald) and student (blue) dashboard palettes
    const accentBg   = role === 'teacher' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200';
    const accentIcon  = role === 'teacher' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600';
    const accentBorder = role === 'teacher' ? 'border-emerald-200 text-emerald-700' : 'border-blue-200 text-blue-700';
    const accentAvatarBg = role === 'teacher' ? 'bg-emerald-600' : 'bg-blue-600';
    const accentLink   = role === 'teacher' ? 'text-emerald-600 hover:text-emerald-800' : 'text-blue-600 hover:text-blue-800';

    const userInitials = user?.nom
        ? user.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : role === 'teacher' ? 'E' : 'A';

    const changePasswordPath = `/${role}/change-password`;

    return (
        <Layout role={role}>
            <div className="space-y-6">

                {/* Toast notification */}
                {toastMsg && (
                    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium animate-in slide-in-from-top-2 ${
                        toastMsg.type === 'success' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : (role === 'teacher' ? 'bg-emerald-200 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-200 text-red-800')
                    }`}>
                        {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : (role === 'teacher' ? <AlertCircle className="w-4 h-4 text-emerald-900" /> : <AlertCircle className="w-4 h-4 text-red-600" />)}
                        {toastMsg.msg}
                    </div>
                )}

                {/* ── Page Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Mon Profil</h2>
                        <p className="text-gray-600 mt-1">Gérez vos informations personnelles et professionnelles</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${accentBorder} ${accentIcon}`}>
                        <ShieldCheck className="w-4 h-4" />
                        Compte {role === 'teacher' ? 'Enseignant' : 'Apprenant'}
                    </div>
                </div>

                {/* ── Main Form ── */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left: main fields */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Identité */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accentIcon}`}>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle>Informations personnelles</CardTitle>
                                            <CardDescription>Nom, email et coordonnées</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">

                                    {/* Avatar row */}
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div
                                            className={`relative group/av w-14 h-14 rounded-xl ${accentAvatarBg} flex items-center justify-center text-white text-lg font-bold overflow-hidden cursor-pointer flex-shrink-0`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {avatarPreview
                                                ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                : <span>{userInitials}</span>
                                            }
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/av:opacity-100 transition-all flex items-center justify-center">
                                                <Camera className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{user?.nom || 'Votre nom'}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`mt-1.5 text-xs font-medium ${accentLink} transition-colors flex items-center gap-1`}
                                            >
                                                <Camera className="w-3 h-3" /> Changer la photo (max 2 Mo)
                                            </button>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                    </div>

                                    {/* Prénom / Nom */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500 font-medium">Prénom *</Label>
                                            <Input
                                                name="prenom"
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                required
                                                placeholder="Votre prénom"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500 font-medium">Nom de famille *</Label>
                                            <Input
                                                name="nom_famille"
                                                value={formData.nom_famille}
                                                onChange={handleChange}
                                                required
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-gray-500 font-medium">Adresse e-mail *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="pl-10"
                                                placeholder="votre@email.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Téléphone / Ville */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500 font-medium">Téléphone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input name="telephone" value={formData.telephone} onChange={handleChange} className="pl-10" placeholder="+213 ..." />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500 font-medium">Ville</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input name="ville" value={formData.ville} onChange={handleChange} className="pl-10" placeholder="Ex: Alger, Paris…" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pays / Adresse */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500 font-medium">Pays</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input name="pays" value={formData.pays} onChange={handleChange} className="pl-10" placeholder="Ex: Algérie, France…" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500 font-medium">Adresse</Label>
                                            <div className="relative">
                                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input name="adresse" value={formData.adresse} onChange={handleChange} className="pl-10" placeholder="Ex: 12 Rue de la République…" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Infos professionnelles */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accentIcon}`}>
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle>Informations professionnelles</CardTitle>
                                            <CardDescription>Poste et établissement</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500 font-medium">Poste actuel</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input name="poste_actuel" value={formData.poste_actuel} onChange={handleChange} className="pl-10" placeholder="Ex: Professeur de Mathématiques" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-gray-500 font-medium">Établissement</Label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <Input name="institution" value={formData.institution} onChange={handleChange} className="pl-10" placeholder="Ex: École Polytechnique" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Right sidebar ── */}
                        <div className="space-y-4">

                            {/* Bouton Enregistrer */}
                            <Card>
                                <CardContent className="p-5">
                                    <Button
                                        type="submit"
                                        id="btn-save-profile"
                                        disabled={isLoading}
                                        className={`w-full transition-all hover:scale-[1.02] ${accentBg}`}
                                    >
                                        {isLoading
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <><Save className="w-4 h-4" /> Enregistrer les modifications</>
                                        }
                                    </Button>
                                    <p className="text-center text-xs text-gray-400 mt-3">
                                        Vos données sont sécurisées et ne seront jamais partagées sans votre consentement.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Sécurité */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm">Sécurité du compte</CardTitle>
                                            <CardDescription className="text-xs">Mot de passe et accès</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                                        Utilisez un mot de passe fort d&apos;au moins 8 caractères pour protéger votre compte.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.push(changePasswordPath)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${accentBorder} ${accentIcon} font-semibold text-sm transition-all hover:shadow-sm hover:scale-[1.01] group`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Changer le mot de passe
                                        </span>
                                        <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </CardContent>
                            </Card>

                            {/* Infos compte */}
                            <Card>
                                <CardContent className="p-5 space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Informations du compte</p>
                                    {[
                                        { label: 'Rôle', val: role === 'teacher' ? 'Enseignant' : 'Apprenant' },
                                        { label: 'Statut', val: 'Actif' },
                                        { label: 'Membre depuis', val: (user as unknown as Record<string, string>)?.created_at ? new Date((user as unknown as Record<string, string>).created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-xs text-gray-400">{item.label}</span>
                                            <span className="text-xs font-semibold text-gray-700">{item.val}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
