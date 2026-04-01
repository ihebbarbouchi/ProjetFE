'use client';

import { useState, useEffect } from 'react';
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
    FolderOpen, Filter, Loader2
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

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/list-categories?status=all`, { headers });
            if (res.ok) setCategories(await res.json());
            else toast.error('Erreur lors du chargement des catégories');
        } catch {
            toast.error('Erreur de connexion');
        } finally {
            setIsLoading(false);
        }
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
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
                    <p className="text-gray-500 mt-1">Approuvez ou refusez les suggestions des enseignants</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Approuvées', value: counts.approved, color: 'emerald' },
                        { label: 'En attente', value: counts.pending, color: 'amber' },
                        { label: 'Total', value: counts.total, color: 'violet' },
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
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${statusFilter === f.key ? 'bg-violet-600 text-white shadow' : 'bg-white text-gray-500 border hover:bg-gray-50'}`}
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
                                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
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
                                                        <span className="ml-1 text-xs text-violet-500 font-medium">(custom)</span>
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
            </div>
        </Layout>
    );
}
