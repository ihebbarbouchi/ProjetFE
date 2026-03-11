'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
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
    ArrowLeft,
    Camera,
    ChevronRight,
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
            // Load existing avatar if stored
            const storedAvatar = localStorage.getItem(`avatar_${user.id}`);
            if (storedAvatar) setAvatarPreview(storedAvatar);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('La photo ne doit pas dépasser 2 Mo');
            return;
        }
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setAvatarPreview(result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Save avatar locally (base64 in localStorage as a quick win — replace with server upload if needed)
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
                toast.success('Profil mis à jour avec succès !');
                const updatedUser = { ...user, ...data.user };
                localStorage.setItem('auth_user', JSON.stringify(updatedUser));
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    // Theme helpers
    const themeColor = role === 'teacher' ? 'emerald' : 'blue';
    const themeBg = role === 'teacher' ? 'bg-emerald-600' : 'bg-blue-600';
    const themeHover = role === 'teacher' ? 'hover:bg-emerald-700' : 'hover:bg-blue-700';
    const themeShadow = role === 'teacher' ? 'shadow-emerald-200' : 'shadow-blue-200';
    const themeIconBox = role === 'teacher' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600';
    const themeBorder = role === 'teacher' ? 'border-emerald-200' : 'border-blue-200';
    const themeRing = role === 'teacher' ? 'focus:ring-emerald-400' : 'focus:ring-blue-400';

    const userInitials = user?.nom
        ? user.nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : role === 'teacher' ? 'E' : 'A';

    const changePasswordPath = `/${role}/change-password`;

    return (
        <Layout role={role}>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">

                {/* ── Header ── */}
                <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
                    {/* Background deco */}
                    <div className={`absolute inset-0 ${themeBg} opacity-[0.03] pointer-events-none`} />
                    <div className={`absolute -top-16 -right-16 w-64 h-64 ${themeBg} opacity-[0.05] rounded-full pointer-events-none`} />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            {/* Avatar with upload */}
                            <div className="relative group/avatar flex-shrink-0">
                                <div
                                    className={`w-24 h-24 rounded-[1.5rem] ${themeBg} flex items-center justify-center text-white shadow-xl ${themeShadow} overflow-hidden cursor-pointer`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black">{userInitials}</span>
                                    )}
                                </div>
                                {/* Camera overlay */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 rounded-[1.5rem] bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center cursor-pointer"
                                >
                                    <Camera className="w-7 h-7 text-white drop-shadow" />
                                </div>
                                {/* Upload badge */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`absolute -bottom-2 -right-2 w-8 h-8 ${themeBg} rounded-full border-2 border-white flex items-center justify-center shadow-md cursor-pointer`}
                                >
                                    <Camera className="w-4 h-4 text-white" />
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Paramètres du profil</h1>
                                <p className="text-gray-400 mt-1 text-sm font-medium">Personnalisez vos informations personnelles</p>
                                <p className="text-xs text-gray-400 mt-2 italic">Cliquez sur votre avatar pour changer la photo · max 2 Mo</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className={`px-4 py-2 rounded-2xl ${themeIconBox} font-bold text-xs border ${themeBorder} flex items-center gap-2 shadow-sm`}>
                                <ShieldCheck className="w-4 h-4" />
                                Compte {role === 'teacher' ? 'Enseignant' : 'Apprenant'}
                            </div>
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Retour
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: main fields */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Informations personnelles */}
                        <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-gray-50 bg-gray-50/40 p-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${themeIconBox}`}>
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">Informations personnelles</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">Nom, email et coordonnées</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Prénom</Label>
                                        <Input
                                            name="prenom"
                                            value={formData.prenom}
                                            onChange={handleChange}
                                            required
                                            className={`h-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nom de famille</Label>
                                        <Input
                                            name="nom_famille"
                                            value={formData.nom_famille}
                                            onChange={handleChange}
                                            required
                                            className={`h-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Adresse Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className={`h-12 pl-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Téléphone</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <Input
                                                name="telephone"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                                className={`h-12 pl-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Ville</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <Input
                                                name="ville"
                                                placeholder="Ex : Alger, Paris…"
                                                value={formData.ville}
                                                onChange={handleChange}
                                                className={`h-12 pl-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pays + Adresse */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Pays</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <Input
                                                name="pays"
                                                placeholder="Ex : Algérie, France…"
                                                value={formData.pays}
                                                onChange={handleChange}
                                                className={`h-12 pl-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Adresse</Label>
                                        <div className="relative">
                                            <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <Input
                                                name="adresse"
                                                placeholder="Ex : 12 Rue de la République…"
                                                value={formData.adresse}
                                                onChange={handleChange}
                                                className={`h-12 pl-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informations professionnelles */}
                        <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-gray-50 bg-gray-50/40 p-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${themeIconBox}`}>
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold">Informations professionnelles</CardTitle>
                                        <CardDescription className="text-xs mt-0.5">Poste, établissement et parcours</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Poste actuel</Label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <Input
                                                name="poste_actuel"
                                                placeholder="Ex : Professeur de Mathématiques"
                                                value={formData.poste_actuel}
                                                onChange={handleChange}
                                                className={`h-12 pl-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Établissement</Label>
                                        <div className="relative">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                            <Input
                                                name="institution"
                                                placeholder="Ex : École Polytechnique"
                                                value={formData.institution}
                                                onChange={handleChange}
                                                className={`h-12 pl-12 border-gray-100 rounded-2xl bg-gray-50/50 focus:bg-white transition-all focus:${themeRing}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: sidebar */}
                    <div className="space-y-6">

                        {/* Security card → redirect to change-password */}
                        <Card className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="border-b border-gray-50 bg-gray-50/40 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gray-100 text-gray-500">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-base font-bold">Sécurité du compte</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                                    Pour sécuriser votre compte, nous vous recommandons d&apos;utiliser un mot de passe fort d&apos;au moins 8 caractères.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => router.push(changePasswordPath)}
                                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 ${themeBorder} ${themeIconBox} font-bold text-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] group`}
                                >
                                    <span className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Modifier votre mot de passe
                                    </span>
                                    <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </CardContent>
                        </Card>

                        {/* Save button */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4 sticky top-6">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full ${themeBg} ${themeHover} text-white h-14 rounded-2xl font-bold shadow-lg ${themeShadow} transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2`}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Enregistrer les modifications
                                    </>
                                )}
                            </Button>
                            <p className="text-center text-[11px] text-gray-400 font-medium leading-relaxed">
                                Vos données sont sécurisées et ne seront jamais partagées sans votre consentement.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
