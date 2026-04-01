'use client';

import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Trash2, Loader2, FolderOpen, Plus, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface ResourceType { id: number; type_ressource: string; }
interface Suggestion {
    id: number; type: string; valeur: string; statut: string;
    proposed_by?: string; created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function AdminResourceTypes() {
    const role = 'super-admin';
    const { token } = useAuth();
    const [types, setTypes] = useState<ResourceType[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [newTypeName, setNewTypeName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const fetchAll = async () => {
        setIsLoading(true);
        try {
            const [typRes, sugRes] = await Promise.all([
                fetch(`${API_URL}/admin/types-ressources`, { headers }),
                fetch(`${API_URL}/admin/suggestions?type=type_ressource`, { headers }),
            ]);
            if (typRes.ok) setTypes(await typRes.json());
            if (sugRes.ok) setSuggestions(await sugRes.json());
        } catch { toast.error('Erreur de connexion'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAddType = async () => {
        if (!newTypeName.trim()) { toast.error('Veuillez remplir le nom'); return; }
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/admin/types-ressources`, {
                method: 'POST', headers,
                body: JSON.stringify({ type_ressource: newTypeName.trim() }),
            });
            if (res.ok) { toast.success('Type ajouté !'); setNewTypeName(''); fetchAll(); }
            else toast.error('Erreur lors de l\'ajout');
        } catch { toast.error('Erreur de connexion'); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteType = async (id: number) => {
        if (!confirm('Supprimer ce type de ressource ?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/types-ressources/${id}`, { method: 'DELETE', headers });
            if (res.ok) { toast.success('Type supprimé.'); fetchAll(); }
            else toast.error('Erreur lors de la suppression');
        } catch { toast.error('Erreur de connexion'); }
    };

    const acceptSuggestion = async (id: number) => {
        const res = await fetch(`${API_URL}/admin/suggestions/${id}/accept`, { method: 'POST', headers });
        if (res.ok) { toast.success('Suggestion acceptée — type créé !'); fetchAll(); }
        else toast.error('Erreur');
    };

    const refuseSuggestion = async (id: number) => {
        const res = await fetch(`${API_URL}/admin/suggestions/${id}/refuse`, { method: 'POST', headers });
        if (res.ok) { toast.success('Suggestion refusée.'); fetchAll(); }
        else toast.error('Erreur');
    };

    const updateSuggestion = async (id: number) => {
        const res = await fetch(`${API_URL}/admin/suggestions/${id}`, {
            method: 'PATCH', headers, body: JSON.stringify({ valeur: editValue }),
        });
        if (res.ok) { toast.success('Mise à jour effectuée.'); setEditId(null); fetchAll(); }
        else toast.error('Erreur');
    };

    const pendingSuggestions = suggestions.filter(s => s.statut === 'pending');

    return (
        <Layout role={role}>
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Types de ressources</h1>
                        <p className="text-gray-500 mt-1 font-medium">Gérer les formats et suggestions des enseignants</p>
                    </div>
                </div>

                {/* Suggestions */}
                {pendingSuggestions.length > 0 && (
                    <Card className="border border-amber-100 shadow-sm bg-amber-50/30 rounded-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
                                Propositions des enseignants ({pendingSuggestions.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {pendingSuggestions.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100">
                                        {editId === s.id ? (
                                            <div className="flex gap-2 flex-1 mr-3">
                                                <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-9 text-sm" />
                                                <Button size="sm" onClick={() => updateSuggestion(s.id)} className="bg-violet-600 h-9">Sauver</Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="h-9">Annuler</Button>
                                            </div>
                                        ) : (
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{s.valeur}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">par {s.proposed_by ?? 'Inconnu'}</p>
                                            </div>
                                        )}
                                        <div className="flex gap-2 shrink-0">
                                            {editId !== s.id && (
                                                <Button size="sm" variant="outline" onClick={() => { setEditId(s.id); setEditValue(s.valeur); }}
                                                    className="h-8 px-3 text-xs text-gray-600 border-gray-200">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                            <Button size="sm" onClick={() => acceptSuggestion(s.id)}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 text-xs gap-1">
                                                <CheckCircle className="w-3.5 h-3.5" /> Accepter
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => refuseSuggestion(s.id)}
                                                className="text-red-500 border-red-100 hover:bg-red-50 h-8 px-3 text-xs gap-1">
                                                <XCircle className="w-3.5 h-3.5" /> Refuser
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}                {/* Add Type Card */}
                <Card className="border border-gray-100 shadow-md bg-white rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                        <CardTitle className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                            Nouveau type de ressource
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Désignation du type</label>
                                    <Input
                                        placeholder="Ex: Image, Document PDF, Vidéo MP4..."
                                        value={newTypeName}
                                        onChange={(e) => setNewTypeName(e.target.value)}
                                        className="bg-white border-gray-200 focus:ring-violet-500 focus:border-violet-500 h-12 rounded-xl transition-all"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                                    />
                                </div>
                                <div className="md:self-end">
                                    <Button
                                        onClick={handleAddType}
                                        disabled={!newTypeName.trim() || isSubmitting}
                                        className="bg-violet-600 hover:bg-violet-700 text-white px-10 h-12 rounded-xl shadow-lg shadow-violet-100 transition-all font-bold flex items-center gap-2 active:scale-95"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ajouter au catalogue'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* List Card */}
                <Card className="border border-gray-100 shadow-md bg-white overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-5">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                                Types enregistrés ({types.length})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="px-8 py-5">Désignation</th>
                                            <th className="px-8 py-5 text-right font-bold">Actions de gestion</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {types.map((type) => (
                                            <tr key={type.id} className="hover:bg-violet-50/30 transition-all group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <span className="font-bold text-gray-800 text-base">{type.type_ressource}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteType(type.id)}
                                                        className="text-red-500 border-red-100 hover:text-white hover:bg-red-600 hover:border-red-600 font-bold px-6 h-10 rounded-xl transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Supprimer
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {types.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-40">
                                                        <FolderOpen className="w-12 h-12 text-gray-300" />
                                                        <p className="font-bold text-gray-400">Aucun type de ressource configuré</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
