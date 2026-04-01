'use client';

import { useState, useEffect } from 'react';
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
import { Plus, FolderOpen, Clock, CheckCircle, Loader2, Send } from 'lucide-react';
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

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [catRes, discRes, nivRes, typeRes] = await Promise.all([
                fetch(`${API_URL}/list-categories?status=all`, { headers }),
                fetch(`${API_URL}/admin/disciplines`, { headers }),
                fetch(`${API_URL}/admin/niveaux`, { headers }),
                fetch(`${API_URL}/admin/types-ressources`, { headers }),
            ]);
            if (catRes.ok)  setCategories(await catRes.json());
            if (discRes.ok) setDisciplines(await discRes.json());
            if (nivRes.ok)  setNiveaux(await nivRes.json());
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
            const payload: Record<string, unknown> = {
                code: code.toUpperCase(),
                description,
                types: selectedTypes,
                custom_types: customTypes.filter(t => t.trim() !== ''),
            };
            if (disciplineId && disciplineId !== 'other') {
                payload.discipline_id = Number(disciplineId);
            } else {
                payload.custom_discipline = customDiscipline.trim();
            }
            if (niveauId && niveauId !== 'other') {
                payload.niveau_id = Number(niveauId);
            } else if (customNiveau.trim()) {
                payload.custom_niveau = customNiveau.trim();
            }

            const res = await fetch(`${API_URL}/suggest-category`, {
                method: 'POST', headers, body: JSON.stringify(payload),
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
        if (statut === 'approved') return <Badge className="bg-emerald-100 text-emerald-700 border-none">Approuvée</Badge>;
        if (statut === 'pending')  return <Badge className="bg-emerald-50 text-emerald-600 border-none">En attente</Badge>;
        return <Badge className="bg-emerald-200 text-emerald-800 border-none px-2 py-0.5 rounded-lg flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>Refusée</Badge>;
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
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center gap-2 h-11 px-6 rounded-xl font-semibold"
                    >
                        <Plus className="w-4 h-4" />
                        Suggérer une catégorie
                    </Button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total',      value: categories.length, color: 'emerald' },
                        { label: 'Approuvées', value: categories.filter(c => c.statut === 'approved').length, color: 'emerald' },
                        { label: 'En attente', value: categories.filter(c => c.statut === 'pending').length, color: 'emerald' },
                    ].map(s => (
                        <Card key={s.label} className="border-none shadow-sm">
                            <CardContent className="p-5 text-center">
                                <p className={`text-4xl font-black text-emerald-600`}>{s.value}</p>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {['all', 'approved', 'pending'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === f ? 'bg-emerald-600 text-white shadow' : 'bg-white text-gray-500 border hover:bg-gray-50'}`}
                                >
                                    {f === 'all' ? 'Toutes' : f === 'approved' ? 'Approuvées' : 'En attente'}
                                </button>
                    ))}
                </div>

                {/* Categories list */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Catégories proposées</CardTitle>
                        <CardDescription>Liste de vos suggestions de catégories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12">
                                <FolderOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400">Aucune catégorie trouvée.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                {cat.statut === 'pending' ? <Clock className="w-5 h-5 text-emerald-500" /> : <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{cat.code}</p>
                                                <p className="text-sm text-gray-500">{cat.discipline_name} • {cat.niveau_name ?? '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
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
                        Suggérer une nouvelle catégorie
                    </ModalHeader>
                    <ModalBody className="py-4">
                        <div className="space-y-3">
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
                                        <SelectItem value="other">✏️ Autre (suggérer une nouvelle discipline)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {disciplineId === 'other' && (
                                    <Input
                                        id="sg-custom-discipline"
                                        placeholder="Nom de la discipline proposée"
                                        value={customDiscipline}
                                        onChange={e => setCustomDiscipline(e.target.value)}
                                        className="h-11 rounded-xl mt-1.5"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Code */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="sg-code" className="text-xs font-bold text-gray-400 uppercase ml-1">Code *</Label>
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
                                        placeholder="Nom du niveau proposé"
                                        value={customNiveau}
                                        onChange={e => setCustomNiveau(e.target.value)}
                                        className="h-11 rounded-xl bg-gray-50/50"
                                    />
                                </div>
                            )}

                            {/* Types de ressources */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase ml-1">Types de ressources</Label>
                                <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50/50 rounded-xl border border-gray-100">
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
                                    <p className="text-[10px] text-gray-400 font-bold uppercase ml-1">Types personnalisés :</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {customTypes.map((ct, i) => (
                                            <Input
                                                key={i}
                                                placeholder={`Type ${i + 1}`}
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
                                        className="text-xs text-emerald-600 hover:underline"
                                    >
                                        + Ajouter un type personnalisé
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="sg-desc" className="text-xs font-bold text-gray-400 uppercase ml-1">Description (optionnel)</Label>
                                <Textarea
                                    id="sg-desc"
                                    placeholder="Décrivez brièvement cette catégorie…"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="min-h-[80px] rounded-xl bg-gray-50/50 resize-none text-sm p-3"
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <ModalCancelButton onClick={() => { setIsSuggestOpen(false); resetForm(); }} />
                        <ModalConfirmButton
                            onClick={handleSuggest}
                            disabled={isSubmitting || !code.trim() || (!disciplineId && !customDiscipline.trim())}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 border-none"
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
