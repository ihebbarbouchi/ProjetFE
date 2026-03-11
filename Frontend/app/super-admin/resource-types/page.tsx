'use client';

import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Trash2, Loader2, FolderOpen, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface ResourceType {
    id: number;
    type_ressource: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function AdminResourceTypes() {
    const role = 'super-admin';
    const { token } = useAuth();
    const [types, setTypes] = useState<ResourceType[]>([]);
    const [newTypeName, setNewTypeName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchResourceTypes = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/admin/types-ressources`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTypes(data);
            } else {
                toast.error('Erreur lors du chargement des types de ressources');
            }
        } catch (error) {
            console.error('Error fetching resource types:', error);
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchResourceTypes();
    }, []);

    const handleAddType = async () => {
        if (!newTypeName.trim()) {
            toast.error('Veuillez remplir le nom');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(`${API_URL}/admin/types-ressources`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    type_ressource: newTypeName.trim()
                })
            });

            if (response.ok) {
                toast.success('Type de ressource ajouté avec succès');
                setNewTypeName('');
                fetchResourceTypes();
            } else {
                toast.error('Erreur lors de l\'ajout du type');
            }
        } catch (error) {
            console.error('Error adding resource type:', error);
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteType = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de ressource ?')) return;

        try {
            const response = await fetch(`${API_URL}/admin/types-ressources/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                toast.success('Type de ressource supprimé avec succès');
                fetchResourceTypes();
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting resource type:', error);
            toast.error('Erreur de connexion au serveur');
        }
    };

    return (
        <Layout role={role}>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Types de ressources</h1>
                        <p className="text-gray-500 mt-1 font-medium">
                            Gérer les formats et types de fichiers acceptés
                        </p>
                    </div>
                </div>

                {/* Add Type Card */}
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
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
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
