'use client';

import { useState, useEffect, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCancelButton,
    ModalConfirmButton,
} from '../../components/ui/modal';
import { Plus, FolderOpen, Clock, CheckCircle, Loader2, Send, XCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Discipline { id: number; discipline: string; }
interface Niveau { id: number; niveau: string; }
interface TypeRessource { id: number; type_ressource: string; }
interface Category {
    id: number;
    code: string;
    description: string;
    statut: string;
    discipline_name: string;
    niveau_name: string;
    resource_types: TypeRessource[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function TeacherCategories() {
    const { token } = useAuth();
    const role: 'teacher' = 'teacher';
    const [categories, setCategories] = useState<Category[]>([]);
    const [disciplines, setDisciplines] = useState<Discipline[]>([]);
    const [niveaux, setNiveaux] = useState<Niveau[]>([]);
    const [typesRessources, setTypesRessources] = useState<TypeRessource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuggestOpen, setIsSuggestOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    // Form state
    const [disciplineId, setDisciplineId] = useState('');
    const [customDiscipline, setCustomDiscipline] = useState('');
    const [niveauId, setNiveauId] = useState('');
    const [customNiveau, setCustomNiveau] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
    const [customTypes, setCustomTypes] = useState<string[]>(['']);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
    };

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [catRes, discRes, nivRes, typeRes] = await Promise.all([
                fetch(`${API_URL}/list-categories?status=all`, { headers: { ...headers, 'Content-Type': 'application/json' } }),
                fetch(`${API_URL}/admin/disciplines`, { headers: { ...headers, 'Content-Type': 'application/json' } }),
                fetch(`${API_URL}/admin/niveaux`, { headers: { ...headers, 'Content-Type': 'application/json' } }),
                fetch(`${API_URL}/admin/types-ressources`, { headers: { ...headers, 'Content-Type': 'application/json' } }),
            ]);
            if (catRes.ok) setCategories(await catRes.json());
            if (discRes.ok) setDisciplines(await discRes.json());
            if (nivRes.ok) setNiveaux(await nivRes.json());
            if (typeRes.ok) setTypesRessources(await typeRes.json());
        } catch (e) {
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const resetForm = () => {
        setDisciplineId(''); setCustomDiscipline('');
        setNiveauId(''); setCustomNiveau('');
        setCode(''); setDescription('');
        setSelectedTypes([]); setCustomTypes(['']);
        setSelectedImage(null);
    };

    const toggleType = (id: number) => {
        setSelectedTypes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleSuggest = async () => {
        if (!code.trim()) { toast.error('Le code est requis.'); return; }
        if (!disciplineId && !customDiscipline.trim()) {
            toast.error('Veuillez choisir ou saisir une discipline.'); return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('code', code.toUpperCase());
            formData.append('description', description);
            
            selectedTypes.forEach(id => formData.append('types[]', String(id)));
            customTypes.filter(t => t.trim() !== '').forEach(t => formData.append('custom_types[]', t));
            
            if (disciplineId && disciplineId !== 'other') formData.append('discipline_id', disciplineId);
            else formData.append('custom_discipline', customDiscipline.trim());

            if (niveauId && niveauId !== 'other') formData.append('niveau_id', niveauId);
            else if (customNiveau.trim()) formData.append('custom_niveau', customNiveau.trim());

            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const res = await fetch(`${API_URL}/suggest-category`, {
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }, 
                body: formData,
            });
            if (res.ok) {
                toast.success('Suggestion envoyée ! En attente d\'approbation.');
                setIsSuggestOpen(false);
                resetForm();
                fetchAll();
            } else {
                const err = await res.json();
                toast.error(err.message ?? 'Erreur lors de l\'envoi.');
            }
        } catch {
            toast.error('Erreur de connexion.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = categories.filter(c =>
        statusFilter === 'all' ? true : c.statut === statusFilter
    );

    const statusBadge = (statut: string) => {
        if (statut === 'approved') return <Badge className="bg-emerald-100 text-emerald-700 border-none text-xs">Approuvée</Badge>;
        if (statut === 'pending')  return <Badge className="bg-amber-100 text-amber-700 border-none text-xs">En attente</Badge>;
        return <Badge className="bg-red-100 text-red-700 border-none text-xs">Refusée</Badge>;
    };

    return (
        <Layout role={role}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Mes Catégories</h2>
                        <p className="text-gray-500 mt-1">Proposez de nouvelles catégories pour vos ressources</p>
                    </div>
                    <Button
                        onClick={() => setIsSuggestOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 h-11 px-6 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Suggérer une catégorie
                    </Button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total',       value: categories.length,                                             icon: FolderOpen,    color: 'emerald', bg: 'emerald'  },
                        { label: 'Approuvées',  value: categories.filter(c => c.statut === 'approved').length,        icon: CheckCircle,   color: 'emerald', bg: 'emerald' },
                        { label: 'En attente',  value: categories.filter(c => c.statut === 'pending').length,         icon: Clock,         color: 'amber',   bg: 'amber'   },
                    ].map(s => (
                        <Card key={s.label} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                            <CardContent className="p-6 relative">
                                <div className={`absolute top-0 right-0 w-20 h-20 bg-${s.bg}-50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-${s.bg}-100 transition-colors`} />
                                <div className={`w-10 h-10 rounded-xl bg-${s.bg}-100 flex items-center justify-center mb-3`}>
                                    <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                                </div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{s.label}</p>
                                <p className={`text-4xl font-black text-${s.color}-600 tracking-tight`}>{s.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {[
                        { key: 'all',      label: 'Toutes',     activeClass: 'bg-emerald-600 text-white shadow' },
                        { key: 'approved', label: 'Approuvées', activeClass: 'bg-emerald-600 text-white shadow' },
                        { key: 'pending',  label: 'En attente', activeClass: 'bg-amber-500 text-white shadow'   },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setStatusFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                statusFilter === f.key
                                    ? f.activeClass
                                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Categories list */}
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-white py-4 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <FolderOpen className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold text-gray-900">Catégories proposées</CardTitle>
                                <CardDescription className="text-xs text-gray-400 mt-0.5">Liste de vos suggestions de catégories</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-14">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-14">
                                <FolderOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 text-sm">Aucune catégorie trouvée.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {filtered.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                cat.statut === 'approved' ? 'bg-emerald-100' :
                                                cat.statut === 'pending'  ? 'bg-amber-100'   : 'bg-red-100'
                                            }`}>
                                                {cat.statut === 'approved' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                                                 cat.statut === 'pending'  ? <Clock        className="w-5 h-5 text-amber-500"   /> :
                                                                             <XCircle       className="w-5 h-5 text-red-500"     />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{cat.code}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{cat.discipline_name} • {cat.niveau_name ?? '—'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            {statusBadge(cat.statut)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Suggest Modal */}
                <Modal open={isSuggestOpen} onOpenChange={setIsSuggestOpen}>
                    <ModalHeader onClose={() => { setIsSuggestOpen(false); resetForm(); }}>
                        Suggerer une nouvelle categorie
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            {/* Discipline */}
                            <div className="space-y-2">
                                <Label htmlFor="sg-discipline">Discipline *</Label>
                                <Select value={disciplineId} onValueChange={setDisciplineId}>
                                    <SelectTrigger id="sg-discipline">
                                        <SelectValue placeholder="Choisir une discipline" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {disciplines.map(d => (
                                            <SelectItem key={d.id} value={String(d.id)}>{d.discipline}</SelectItem>
                                        ))}
                                        <SelectItem value="other">✏️ Autre (suggerer une nouvelle discipline)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {disciplineId === 'other' && (
                                    <Input
                                        id="sg-custom-discipline"
                                        placeholder="Nom de la discipline proposee"
                                        value={customDiscipline}
                                        onChange={e => setCustomDiscipline(e.target.value)}
                                        className="mt-2"
                                    />
                                )}
                            </div>

                            {/* Code */}
                            <div className="space-y-2">
                                <Label htmlFor="sg-code">Code identification *</Label>
                                <Input
                                    id="sg-code"
                                    placeholder="Ex: MATH-L1, PROG-ADV"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                />
                            </div>

                            {/* Niveau */}
                            <div className="space-y-2">
                                <Label htmlFor="sg-niveau">Niveau</Label>
                                <Select value={niveauId} onValueChange={setNiveauId}>
                                    <SelectTrigger id="sg-niveau">
                                        <SelectValue placeholder="Choisir un niveau (optionnel)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {niveaux.map(n => (
                                            <SelectItem key={n.id} value={String(n.id)}>{n.niveau}</SelectItem>
                                        ))}
                                        <SelectItem value="other">✏️ Autre (suggerer un nouveau niveau)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {niveauId === 'other' && (
                                    <Input
                                        id="sg-custom-niveau"
                                        placeholder="Nom du niveau proposé"
                                        value={customNiveau}
                                        onChange={e => setCustomNiveau(e.target.value)}
                                        className="mt-2"
                                    />
                                )}
                            </div>

                            {/* Types de ressources */}
                            <div className="space-y-2 text-sm">
                                <Label>Types de ressources</Label>
                                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                                    {typesRessources.map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => toggleType(t.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedTypes.includes(t.id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                        >
                                            {t.type_ressource}
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-2 mt-2">
                                    <p className="text-xs text-gray-500 font-medium font-semibold uppercase">Types personnalisés (optionnel)</p>
                                    {customTypes.map((ct, i) => (
                                        <Input
                                            key={i}
                                            placeholder={`Type personnalisé ${i + 1}`}
                                            value={ct}
                                            onChange={e => {
                                                const arr = [...customTypes];
                                                arr[i] = e.target.value;
                                                setCustomTypes(arr);
                                            }}
                                        />
                                    ))}
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        onClick={() => setCustomTypes([...customTypes, ''])}
                                        className="p-0 h-auto text-emerald-600"
                                    >
                                        + Ajouter un type personnalisé
                                    </Button>
                                </div>
                            </div>

                            {/* Photo de catégorie */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-gray-400 uppercase ml-1">Photo d'illustration</Label>
                                <div 
                                    onClick={() => imageInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-100 bg-gray-50/50 hover:border-emerald-200'}`}
                                >
                                    <input 
                                        type="file" 
                                        ref={imageInputRef} 
                                        onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                    {selectedImage ? (
                                        <div className="flex items-center gap-3 w-full">
                                            <img 
                                                src={URL.createObjectURL(selectedImage)} 
                                                alt="Preview" 
                                                className="w-12 h-12 rounded-lg object-cover" 
                                            />
                                            <span className="text-xs text-emerald-600 font-bold truncate flex-1">{selectedImage.name}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                                                className="p-1 hover:bg-white rounded-full text-emerald-400"
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-2">
                                            <PlusCircle className="w-6 h-6 text-emerald-400 mb-1" />
                                            <p className="text-[10px] text-gray-400 font-bold">Ajouter une image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="sg-desc">Description (optionnel)</Label>
                                <Textarea
                                    id="sg-desc"
                                    placeholder="Décrivez brièvement cette catégorie…"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <ModalCancelButton onClick={() => { setIsSuggestOpen(false); resetForm(); }} />
                        <ModalConfirmButton
                            onClick={handleSuggest}
                            disabled={isSubmitting || !code.trim() || (!disciplineId && !customDiscipline.trim())}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <Send className="w-4 h-4 mr-2 inline" />}
                            Envoyer la suggestion
                        </ModalConfirmButton>
                    </ModalFooter>
                </Modal>
            </div>
        </Layout>
    );
}
