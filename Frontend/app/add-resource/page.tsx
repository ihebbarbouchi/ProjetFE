'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { 
    ChevronLeft, 
    BookOpen, 
    Paperclip, 
    Info, 
    Globe, 
    Lock, 
    UploadCloud, 
    CheckCircle2,
    FileText,
    Loader2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

interface Category {
    id: number;
    code: string;
    discipline_name: string;
    niveau_name: string;
}

export default function AddResource() {
    const router = useRouter();
    const { token } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Charger les catégories depuis la base de données
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // On récupère les catégories approuvées
                const res = await fetch(`${API_URL}/list-categories?status=approved`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Erreur chargement catégories:", error);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        if (token) fetchCategories();
    }, [token]);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                toast.error("Seulement les fichiers PDF sont autorisés");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedFile || !title || !categoryId) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setIsSubmitting(true);
        // Simulation/Logique d'envoi
        const formData = new FormData();
        formData.append('titre', title);
        formData.append('description', description);
        formData.append('categorie_id', categoryId);
        formData.append('visibilite', visibility);
        formData.append('fichier', selectedFile);

        try {
            // Ici l'appel API vers votre store de ressources
            toast.success("Ressource publiée avec succès !");
            router.push('/teacher');
        } catch (error) {
            toast.error("Erreur lors de la publication");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout role="teacher">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:bg-gray-50 transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Ajouter une ressource PDF
                        </h1>
                        <p className="text-gray-500 text-sm font-medium">
                            Partagez vos contenus pédagogiques avec vos apprenants
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Catégorie Dynamique */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-800">Sélectionnez la catégorie</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Choisissez la catégorie existante à laquelle vous voulez ajouter ce PDF. 
                                </p>
                            </div>
                        </div>

                        <Select value={categoryId} onValueChange={setCategoryId}>
                            <SelectTrigger className="h-14 bg-gray-50/50 border-gray-100 rounded-2xl px-6 focus:ring-emerald-500/20">
                                <SelectValue placeholder={isLoadingCategories ? "Chargement..." : "Choisir une catégorie du catalogue..."} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 shadow-xl max-h-[300px]">
                                {categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{cat.code}</span>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {cat.discipline_name} {cat.niveau_name ? `• ${cat.niveau_name}` : ''}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-400">
                                        {isLoadingCategories ? "Chargement des catégories..." : "Aucune catégorie disponible"}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Section 2: Téléchargement Actif */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Paperclip className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-800">Téléversez votre fichier PDF</h3>
                                <p className="text-sm text-gray-500">
                                    Format PDF uniquement, max 10 Mo.
                                </p>
                            </div>
                        </div>

                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="application/pdf" 
                            className="hidden" 
                        />

                        <div 
                            onClick={handleFileClick}
                            className={`border-2 border-dashed rounded-[28px] p-10 flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer ${
                                selectedFile 
                                ? 'border-emerald-500 bg-emerald-50/20' 
                                : 'border-gray-100 bg-gray-50/30 hover:bg-emerald-50/10 hover:border-emerald-200'
                            }`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${selectedFile ? 'bg-emerald-500' : 'bg-emerald-50'}`}>
                                {selectedFile ? (
                                    <FileText className="w-8 h-8 text-white" />
                                ) : (
                                    <UploadCloud className="w-8 h-8 text-emerald-500" />
                                )}
                            </div>
                            
                            <div className="text-center">
                                <p className="text-gray-900 font-bold">
                                    {selectedFile ? selectedFile.name : "Glissez-déposez votre fichier"}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {selectedFile 
                                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo` 
                                        : <>ou <span className="text-emerald-500 font-bold underline">cliquez pour parcourir</span> vos fichiers</>
                                    }
                                </p>
                            </div>
                            
                            <div className="flex gap-2 pt-2">
                                <span className="px-3 py-1 bg-white border border-gray-100 text-[10px] font-black text-gray-400 rounded-lg uppercase tracking-wider">.PDF Uniquement</span>
                                {selectedFile && <span className="px-3 py-1 bg-emerald-100 text-[10px] font-black text-emerald-600 rounded-lg uppercase tracking-wider">Fichier prêt</span>}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Informations */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Info className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-800">Informations sur la ressource</h3>
                                <p className="text-sm text-gray-500">Structurez et décrivez votre contenu</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Titre du PDF</Label>
                                <Input 
                                    className="h-14 bg-gray-50/50 border-gray-100 rounded-2xl px-6 focus:ring-emerald-500/20"
                                    placeholder='Ex : "Introduction à l’algèbre linéaire"'
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Description détaillée</Label>
                                <Textarea 
                                    className="min-h-[100px] bg-gray-50/50 border-gray-100 rounded-2xl p-6 focus:ring-emerald-500/20 resize-none"
                                    placeholder="Décrivez le contenu..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Visibilité */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-50 space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <Globe className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-800">Visibilité</h3>
                                <p className="text-sm text-gray-500">Choisissez qui pourra voir cette ressource</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div 
                                onClick={() => setVisibility('public')}
                                className={`relative p-6 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                                    visibility === 'public' ? 'border-emerald-400 bg-emerald-50/10' : 'border-gray-50 bg-white hover:border-gray-200'
                                }`}
                            >
                                <Globe className={`w-6 h-6 ${visibility === 'public' ? 'text-emerald-500' : 'text-gray-300'}`} />
                                <div className="text-center">
                                    <p className={`font-black text-sm uppercase tracking-wider ${visibility === 'public' ? 'text-emerald-600' : 'text-gray-400'}`}>Public</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">Visible par tous</p>
                                </div>
                            </div>

                            <div 
                                onClick={() => setVisibility('private')}
                                className={`relative p-6 rounded-[24px] border-2 transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                                    visibility === 'private' ? 'border-emerald-400 bg-emerald-50/10' : 'border-gray-50 bg-white hover:border-gray-200'
                                }`}
                            >
                                <Lock className={`w-6 h-6 ${visibility === 'private' ? 'text-emerald-500' : 'text-gray-300'}`} />
                                <div className="text-center">
                                    <p className={`font-black text-sm uppercase tracking-wider ${visibility === 'private' ? 'text-emerald-600' : 'text-gray-400'}`}>Privé</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">Uniquement moi</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button 
                            type="submit"
                            disabled={isSubmitting || !selectedFile}
                            className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[20px] font-extrabold text-lg flex items-center justify-center gap-3 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                            Publier mon PDF
                        </Button>
                        <Button 
                            type="button"
                            variant="ghost" 
                            onClick={() => router.back()}
                            className="h-14 px-12 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-[24px] font-bold"
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
