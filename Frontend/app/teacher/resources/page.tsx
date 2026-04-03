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
    const { user, token } = useAuth();
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

    const stats = [
        { title: 'Mes ressources', value: myResources.length.toString(), icon: BookOpen },
        { title: 'Total apprenants', value: '0', icon: Users },
        { title: 'Cours', value: myResources.length.toString(), icon: FileText },
        { title: 'Quiz', value: '0', icon: HelpCircle },
    ];

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
            <div className="space-y-8">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Mes ressources
                        </h1>
                        <p className="text-gray-500 mt-2 text-base font-medium">
                            Gerez vos ressources et suivez la progression de vos apprenants
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/add-resource')}
                        className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all hover:scale-105"
                    >
                        <PlusCircle className="w-5 h-5 mr-3" />
                        Ajouter une ressource
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                        <stat.icon className="w-8 h-8 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Card */}
                <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-900">Mes ressources</CardTitle>
                                <CardDescription className="text-gray-500 font-medium">Gerez vos cours, documents et quiz</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-xl border-gray-100 font-bold hover:bg-gray-50"
                                    onClick={() => router.push('/teacher/resources')}
                                >
                                    Voir tout
                                </Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold h-10 px-5"
                                    onClick={() => router.push('/add-resource')}
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Ajouter
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        {/* Filters */}
                        <div className="mb-8 p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Recherche</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Rechercher par titre ou description..."
                                            className="pl-12 h-12 rounded-xl bg-white border-none shadow-sm focus:ring-emerald-500/20"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Catégorie</label>
                                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                                        <SelectTrigger className="h-12 rounded-xl bg-white border-none shadow-sm">
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
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Visibilité</label>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="h-12 rounded-xl bg-white border-none shadow-sm">
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
                        </div>

                        {/* Table */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-24">
                                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                            </div>
                        ) : filteredResources.length === 0 ? (
                            <div className="text-center py-24 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <BookOpen className="w-10 h-10 text-gray-200" />
                                </div>
                                <p className="text-gray-400 font-bold text-lg">Aucune ressource trouvée</p>
                                <Button
                                    variant="link"
                                    className="text-emerald-500 mt-2 font-bold"
                                    onClick={() => { setSearchQuery(''); setFilterCategory('all'); setFilterStatus('all'); }}
                                >
                                    Réinitialiser les filtres
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-gray-100">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                                            <TableHead className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Ressource</TableHead>
                                            <TableHead className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Catégorie</TableHead>
                                            <TableHead className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Visibilité</TableHead>
                                            <TableHead className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Date</TableHead>
                                            <TableHead className="px-8 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredResources.map((resource) => (
                                            <TableRow key={resource.id} className="group border-b border-gray-50 hover:bg-emerald-50/5 transition-colors">
                                                <TableCell className="px-8 py-5">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110">
                                                            <FileText className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors text-base">{resource.titre}</p>
                                                            <p className="text-sm text-gray-500 font-medium truncate max-w-[250px]">{resource.description || "Pas de description"}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-8 py-5">
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm shadow-blue-50">
                                                        {resource.category?.code || '—'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-8 py-5">
                                                    <Badge className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none shadow-sm ${resource.visibilite === 'public'
                                                        ? 'bg-emerald-100 text-emerald-700 shadow-emerald-50'
                                                        : 'bg-gray-100 text-gray-600 shadow-gray-50'
                                                        }`}>
                                                        {resource.visibilite.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-8 py-5 text-gray-400 text-xs font-bold">
                                                    {new Date(resource.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell className="px-8 py-5 text-right">
                                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        <Button size="icon" variant="ghost" className="h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-xl hover:bg-emerald-50 hover:text-emerald-600">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-xl hover:text-red-600 hover:bg-red-50"
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
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
