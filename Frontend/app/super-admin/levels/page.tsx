'use client';

import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Trash2, Plus, Loader2, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Level { id: number; niveau: string; }
interface Suggestion {
    id: number; type: string; valeur: string; statut: string;
    proposed_by?: string; created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function AdminLevels() {
    const role = 'super-admin';
    const { token } = useAuth();
    const [levels, setLevels] = useState<Level[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [newLevelName, setNewLevelName] = useState('');
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
            const [lvlRes, sugRes] = await Promise.all([
                fetch(`${API_URL}/admin/niveaux`, { headers }),
                fetch(`${API_URL}/admin/suggestions?type=niveau`, { headers }),
            ]);
            if (lvlRes.ok) setLevels(await lvlRes.json());
            if (sugRes.ok) setSuggestions(await sugRes.json());
        } catch { toast.error('Erreur de connexion'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAddLevel = async () => {
        if (!newLevelName.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/admin/niveaux`, {
                method: 'POST', headers,
                body: JSON.stringify({ niveau: newLevelName.trim() }),
            });
            if (res.ok) { toast.success('Niveau ajouté !'); setNewLevelName(''); fetchAll(); }
            else { const e = await res.json(); toast.error(e.message ?? 'Erreur'); }
        } catch { toast.error('Erreur de connexion'); }
        finally { setIsSubmitting(false); }
    };

    const handleDeleteLevel = async (id: number) => {
        if (!confirm('Supprimer ce niveau ?')) return;
        try {
            const res = await fetch(`${API_URL}/admin/niveaux/${id}`, { method: 'DELETE', headers });
            if (res.ok) { toast.success('Niveau supprimé.'); fetchAll(); }
            else toast.error('Erreur lors de la suppression');
        } catch { toast.error('Erreur de connexion'); }
    };

    const acceptSuggestion = async (id: number) => {
        const res = await fetch(`${API_URL}/admin/suggestions/${id}/accept`, { method: 'POST', headers });
        if (res.ok) { toast.success('Suggestion acceptée — niveau créé !'); fetchAll(); }
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
        if (res.ok) { toast.success('Suggestion mise à jour.'); setEditId(null); fetchAll(); }
        else toast.error('Erreur');
    };

    const pendingSuggestions = suggestions.filter(s => s.statut === 'pending');

    return (
        <Layout role={role}>
            <div className="max-w-5xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Niveaux</h1>
                    <p className="text-gray-500 mt-2">Gérer les niveaux d'apprentissage et les suggestions des enseignants</p>
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
                )}

                {/* Add Level Card */}
                <Card className="border border-gray-100 shadow-sm bg-white rounded-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            Ajouter un nouveau niveau
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nom du niveau</label>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Ex: Doctorat, Terminale, etc."
                                    value={newLevelName}
                                    onChange={(e) => setNewLevelName(e.target.value)}
                                    className="bg-[#f8f9fc] border border-gray-100 focus-visible:ring-1 focus-visible:ring-violet-500 h-11 rounded-lg"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddLevel()}
                                />
                                <Button
                                    onClick={handleAddLevel}
                                    disabled={!newLevelName.trim() || isSubmitting}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-10 h-11 rounded-lg shadow-md transition-all font-bold active:scale-95 flex items-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Ajouter</>}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Levels List Card */}
                <Card className="border border-gray-100 shadow-sm bg-white overflow-hidden rounded-xl">
                    <CardHeader className="border-b border-gray-50 bg-white py-4">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            Liste des niveaux ({levels.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50 text-[12px] font-medium text-gray-500">
                                            <th className="px-6 py-5">Nom</th>
                                            <th className="px-6 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {levels.map((lvl) => (
                                            <tr key={lvl.id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-gray-900">{lvl.niveau}</span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteLevel(lvl.id)}
                                                        className="text-red-500 border-red-100 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-medium px-4 h-10 rounded-lg gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Supprimer
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {levels.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="px-6 py-12 text-center text-gray-400">
                                                    Aucun niveau trouvé.
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
