'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { BookOpen, FileText, HelpCircle, PlusCircle, Edit, Trash2, Eye, Users, Clock, Loader2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function TeacherResources() {
    const router = useRouter();
    const { token } = useAuth();
    const [myResources, setMyResources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await fetch(`${API_URL}/my-resources`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMyResources(data);
                }
            } catch (error) {
                console.error("Error loading resources:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) fetchResources();
    }, [token]);

    const handleDelete = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer cette ressource ?")) return;
        try {
            const res = await fetch(`${API_URL}/resources/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                toast.success("Ressource supprimée");
                setMyResources(prev => prev.filter(r => r.id !== id));
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const filteredResources = myResources.filter((resource) => {
        const matchesSearch =
            resource.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (resource.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || resource.category?.code === filterCategory;
        const matchesStatus = filterStatus === 'all' || resource.visibilite === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = Array.from(new Set(myResources.map(r => r.category?.code).filter(Boolean)));

    return (
        <Layout role="teacher">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Mes Ressources</h2>
                        <p className="text-gray-500 mt-1 font-medium italic">Gérez l&apos;ensemble de vos contenus PDF partagés</p>
                    </div>
                    <Button onClick={() => router.push('/add-resource')} className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6 rounded-xl font-bold shadow-lg shadow-emerald-100">
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Nouvelle ressource
                    </Button>
                </div>

                {/* Filters */}
                <Card className="rounded-[24px] border-none shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Recherche</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input 
                                        placeholder="Titre, description..." 
                                        className="pl-10 h-12 rounded-xl bg-gray-50/50 border-gray-100 focus:ring-emerald-500/20"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Catégorie</label>
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="h-12 rounded-xl bg-gray-50/50 border-gray-100">
                                        <SelectValue placeholder="Toutes" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-100">
                                        <SelectItem value="all">Toutes les catégories</SelectItem>
                                        {categories.map((cat: any) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Visibilité</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="h-12 rounded-xl bg-gray-50/50 border-gray-100">
                                        <SelectValue placeholder="Tout" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-gray-100">
                                        <SelectItem value="all">Tout</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="private">Privé</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="rounded-[24px] border-none shadow-sm overflow-hidden bg-white">
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                            </div>
                        ) : filteredResources.length === 0 ? (
                            <div className="text-center py-20">
                                <BookOpen className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold">Aucune ressource trouvée</p>
                                <Button 
                                    variant="link" 
                                    className="text-emerald-500 mt-2"
                                    onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all'); }}
                                >
                                    Réinitialiser les filtres
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-gray-50 bg-gray-50/30">
                                        <TableHead className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ressource</TableHead>
                                        <TableHead className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Catégorie</TableHead>
                                        <TableHead className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibilité</TableHead>
                                        <TableHead className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</TableHead>
                                        <TableHead className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredResources.map((resource) => (
                                        <TableRow key={resource.id} className="group border-b border-gray-50/50 hover:bg-emerald-50/5 transition-colors">
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{resource.titre}</p>
                                                        <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{resource.description || "Pas de description"}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-bold text-[10px] px-2.5 py-1">
                                                    {resource.category?.code || '—'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge className={resource.visibilite === 'public' ? 'bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold' : 'bg-gray-100 text-gray-600 border-none text-[10px] font-bold'}>
                                                    {resource.visibilite}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-gray-400 text-[11px] font-medium">
                                                {new Date(resource.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="sm" variant="ghost" className="h-9 w-9 p-0 bg-white shadow-sm border border-gray-100 rounded-lg hover:bg-emerald-50">
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-9 w-9 p-0 bg-white shadow-sm border border-gray-100 rounded-lg hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(resource.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
