'use client';

import { useState, useEffect, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    Modal, ModalHeader, ModalBody, ModalFooter,
    ModalCancelButton, ModalConfirmButton,
} from '../../components/ui/modal';
import {
    CheckCircle, XCircle, Trash2, Plus, Search,
    FolderOpen, Filter, Loader2, Send, PlusCircle,
    Database, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Category {
    id: number;
    code: string;
    description?: string;
    statut: string;
    discipline_name?: string;
    niveau_name?: string;
    custom_discipline?: string;
    custom_niveau?: string;
    custom_types?: string[];
    resource_types: { id: number; type_ressource: string }[];
    proposed_by?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function AdminCategories() {
    const { token } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Creation modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disciplines, setDisciplines] = useState<any[]>([]);
    const [niveaux, setNiveaux] = useState<any[]>([]);
    const [typesRessources, setTypesRessources] = useState<any[]>([]);

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

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const [catRes, discRes, nivRes, typeRes] = await Promise.all([
                fetch(`${API_URL}/list-categories?status=all`, { headers }),
                fetch(`${API_URL}/admin/disciplines`, { headers }),
                fetch(`${API_URL}/admin/niveaux`, { headers }),
                fetch(`${API_URL}/admin/types-ressources`, { headers }),
            ]);
            if (catRes.ok) setCategories(await catRes.json());
            if (discRes.ok) setDisciplines(await discRes.json());
            if (nivRes.ok) setNiveaux(await nivRes.json());
            if (typeRes.ok) setTypesRessources(await typeRes.json());
        } catch {
            toast.error('Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setDisciplineId(''); setCustomDiscipline('');
        setNiveauId(''); setCustomNiveau('');
        setCode(''); setDescription('');
        setSelectedTypes([]); setCustomTypes(['']);
        setSelectedImage(null);
    };

    const handleCreate = async () => {
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

            const res = await fetch(`${API_URL}/admin/categories`, {
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }, 
                body: formData,
            });
            if (res.ok) {
                toast.success('Catégorie créée avec succès !');
                setIsModalOpen(false);
                resetForm();
                fetchCategories();
            } else {
                const err = await res.json();
                toast.error(err.message ?? 'Erreur lors de la création.');
            }
        } catch {
            toast.error('Erreur de connexion.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleType = (id: number) => {
        setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    useEffect(() => { fetchCategories(); }, []);

    const approve = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/admin/approve-category/${id}`, { method: 'POST', headers });
            if (res.ok) { toast.success('Catégorie approuvée !'); fetchCategories(); }
            else toast.error('Erreur lors de l\'approbation');
        } catch { toast.error('Erreur de connexion'); }
    };

    const reject = async (id: number) => {
        if (!confirm('Refuser et supprimer cette catégorie ?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/reject-category/${id}`, { method: 'POST', headers });
            if (res.ok) { toast.success('Catégorie refusée.'); fetchCategories(); }
            else toast.error('Erreur lors du refus');
        } catch { toast.error('Erreur de connexion'); }
    };

    const destroy = async (id: number) => {
        if (!confirm('Supprimer définitivement cette catégorie ?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/categories/${id}`, { method: 'DELETE', headers });
            if (res.ok) { toast.success('Catégorie supprimée.'); fetchCategories(); }
            else toast.error('Erreur lors de la suppression');
        } catch { toast.error('Erreur de connexion'); }
    };

    const statusBadge = (statut: string) => {
        if (statut === 'approved') return <Badge className="bg-emerald-100 text-emerald-700 border-none text-xs">Approuvée</Badge>;
        if (statut === 'pending')  return <Badge className="bg-amber-100 text-amber-700 border-none text-xs">En attente</Badge>;
        return <Badge className="bg-red-100 text-red-700 border-none text-xs">Refusée</Badge>;
    };

    const filtered = categories.filter(c => {
        const matchStatus = statusFilter === 'all' || c.statut === statusFilter;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || c.code.toLowerCase().includes(q) || (c.discipline_name ?? '').toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const counts = {
        approved: categories.filter(c => c.statut === 'approved').length,
        pending:  categories.filter(c => c.statut === 'pending').length,
        total:    categories.length,
        types:    categories.reduce((acc, c) => acc + (c.resource_types?.length ?? 0), 0),
    };

    return (
        <Layout role="super-admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
                        <p className="text-gray-500 mt-1">Gérez le catalogue des disciplines et niveaux</p>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center gap-2 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                    >
                        <Plus className="w-5 h-5" />
                        Ajouter une catégorie
                    </Button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Approuvées', value: counts.approved, color: 'emerald' },
                        { label: 'En attente', value: counts.pending, color: 'amber' },
                        { label: 'Total', value: counts.total, color: 'emerald' },
                        { label: 'Types liés', value: counts.types, color: 'indigo' },
                    ].map(s => (
                        <Card key={s.label} className="rounded-2xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            <CardContent className="p-6 text-center relative">
                                <div className={`absolute top-0 right-0 w-16 h-16 bg-${s.color}-50 rounded-bl-full -mr-8 -mt-8`} />
                                <p className={`text-4xl font-black text-${s.color}-600 tracking-tight`}>{s.value}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Rechercher par code ou discipline…"
                            className="pl-10"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'Toutes' },
                            { key: 'approved', label: 'Approuvées' },
                            { key: 'pending', label: 'En attente' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === f.key ? 'bg-emerald-600 text-white shadow' : 'bg-white text-gray-500 border hover:bg-gray-50'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-gray-50 bg-white py-4">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            Toutes les catégories ({filtered.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16">
                                <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400">Aucune catégorie trouvée.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-4">Code</th>
                                            <th className="px-6 py-4">Discipline</th>
                                            <th className="px-6 py-4">Niveau</th>
                                            <th className="px-6 py-4">Types</th>
                                            <th className="px-6 py-4">Proposé par</th>
                                            <th className="px-6 py-4">Statut</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.map(cat => (
                                            <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900">{cat.code}</span>
                                                    {cat.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[140px]">{cat.description}</p>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-700">{cat.discipline_name ?? '—'}</span>
                                                    {cat.custom_discipline && (
                                                        <span className="ml-1 text-xs text-emerald-500 font-medium">(custom)</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{cat.niveau_name ?? '—'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {cat.resource_types?.map(t => (
                                                            <span key={t.id} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">{t.type_ressource}</span>
                                                        ))}
                                                        {cat.custom_types?.map((t, i) => (
                                                            <span key={i} className="px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded-full">{t}*</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">{cat.proposed_by ?? '—'}</td>
                                                <td className="px-6 py-4">{statusBadge(cat.statut)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        {cat.statut === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => approve(cat.id)}
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                >
                                                                    <CheckCircle className="w-3.5 h-3.5" /> Accepter
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => reject(cat.id)}
                                                                    className="text-red-500 border-red-100 hover:bg-red-50 h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5" /> Refuser
                                                                </Button>
                                                            </>
                                                        )}
                                                        {cat.statut === 'approved' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => destroy(cat.id)}
                                                                className="text-red-500 border-red-100 hover:bg-red-50 h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Supprimer
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
                {/* Create Modal */}
                <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <ModalHeader onClose={() => { setIsModalOpen(false); resetForm(); }}>
                        Ajouter une nouvelle catégorie
                    </ModalHeader>
                    <ModalBody className="py-4">
                        <div className="space-y-4">
                            {/* Discipline */}
                            <div className="space-y-1.5">
                                <Label htmlFor="sg-discipline" className="text-xs font-bold text-gray-400 uppercase ml-1">Discipline *</Label>
                                <Select value={disciplineId} onValueChange={setDisciplineId}>
                                    <SelectTrigger id="sg-discipline" className="h-11 rounded-xl bg-gray-50/50">
                                        <SelectValue placeholder="Choisir une discipline" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {disciplines.map(d => (
                                            <SelectItem key={d.id} value={String(d.id)}>{d.discipline}</SelectItem>
                                        ))}
                                        <SelectItem value="other">✏️ Autre (nouvelle discipline)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {disciplineId === 'other' && (
                                    <Input
                                        id="sg-custom-discipline"
                                        placeholder="Nom de la discipline"
                                        value={customDiscipline}
                                        onChange={e => setCustomDiscipline(e.target.value)}
                                        className="h-11 rounded-xl mt-1.5"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Code */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="sg-code" className="text-xs font-bold text-gray-400 uppercase ml-1">Code / Label *</Label>
                                    <Input
                                        id="sg-code"
                                        placeholder="Ex: MATH-L1"
                                        value={code}
                                        onChange={e => setCode(e.target.value.toUpperCase())}
                                        className="h-11 rounded-xl bg-gray-50/50"
                                    />
                                </div>

                                {/* Niveau */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="sg-niveau" className="text-xs font-bold text-gray-400 uppercase ml-1">Niveau</Label>
                                    <Select value={niveauId} onValueChange={setNiveauId}>
                                        <SelectTrigger id="sg-niveau" className="h-11 rounded-xl bg-gray-50/50">
                                            <SelectValue placeholder="Niveau (opt.)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {niveaux.map(n => (
                                                <SelectItem key={n.id} value={String(n.id)}>{n.niveau}</SelectItem>
                                            ))}
                                            <SelectItem value="other">✏️ Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {niveauId === 'other' && (
                                <div className="space-y-1.5">
                                    <Input
                                        id="sg-custom-niveau"
                                        placeholder="Nom du niveau"
                                        value={customNiveau}
                                        onChange={e => setCustomNiveau(e.target.value)}
                                        className="h-11 rounded-xl bg-gray-50/50"
                                    />
                                </div>
                            )}

                            {/* Types de ressources */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase ml-1">Types de ressources associés</Label>
                                <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50/50 rounded-xl border border-gray-100">
                                    {typesRessources.map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => toggleType(t.id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${selectedTypes.includes(t.id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'}`}
                                        >
                                            {t.type_ressource}
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase ml-1">Plus de types :</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {customTypes.map((ct, i) => (
                                            <Input
                                                key={i}
                                                placeholder={`Nouveau type ${i + 1}`}
                                                value={ct}
                                                onChange={e => {
                                                    const arr = [...customTypes];
                                                    arr[i] = e.target.value;
                                                    setCustomTypes(arr);
                                                }}
                                                className="h-10 text-sm rounded-xl bg-gray-50/30"
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCustomTypes([...customTypes, ''])}
                                        className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"
                                    >
                                        <PlusCircle className="w-3 h-3" /> Ajouter un type
                                    </button>
                                </div>
                            </div>

                            {/* Photo de catégorie */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-gray-400 uppercase ml-1">Photo de la catégorie</Label>
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
                            <div className="space-y-1.5">
                                <Label htmlFor="sg-desc" className="text-xs font-bold text-gray-400 uppercase ml-1">Description (optionnel)</Label>
                                <Textarea
                                    id="sg-desc"
                                    placeholder="Informations complémentaires sur cette catégorie…"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="min-h-[80px] rounded-xl bg-gray-50/50 resize-none text-sm p-3"
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <ModalCancelButton onClick={() => { setIsModalOpen(false); resetForm(); }} />
                        <ModalConfirmButton
                            onClick={handleCreate}
                            disabled={isSubmitting || !code.trim() || (!disciplineId && !customDiscipline.trim())}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 border-none"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <PlusCircle className="w-4 h-4 mr-2 inline" />}
                            Créer la catégorie
                        </ModalConfirmButton>
                    </ModalFooter>
                </Modal>
            </div>
        </Layout>
    );
}
