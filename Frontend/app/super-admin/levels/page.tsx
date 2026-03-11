'use client';

import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Level {
    id: number;
    niveau: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function AdminLevels() {
    const role = 'super-admin';
    const { token } = useAuth();
    const [levels, setLevels] = useState<Level[]>([]);
    const [newLevelName, setNewLevelName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLevels = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/admin/niveaux`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            if (response.ok) {
                const data = await response.json();
                setLevels(data);
            } else {
                toast.error('Erreur lors du chargement des niveaux');
            }
        } catch (error) {
            console.error('Error fetching levels:', error);
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLevels();
    }, []);

    const handleAddLevel = async () => {
        if (!newLevelName.trim()) return;

        try {
            setIsSubmitting(true);
            const response = await fetch(`${API_URL}/admin/niveaux`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    niveau: newLevelName.trim()
                })
            });

            if (response.ok) {
                toast.success('Niveau ajouté avec succès');
                setNewLevelName('');
                fetchLevels(); // Refresh list
            } else {
                toast.error('Erreur lors de l\'ajout du niveau');
            }
        } catch (error) {
            console.error('Error adding level:', error);
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLevel = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce niveau ?')) return;

        try {
            const response = await fetch(`${API_URL}/admin/niveaux/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                toast.success('Niveau supprimé avec succès');
                fetchLevels(); // Refresh list
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting level:', error);
            toast.error('Erreur de connexion au serveur');
        }
    };

    return (
        <Layout role={role}>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Niveaux</h1>
                    <p className="text-gray-500 mt-2">
                        Gérer les niveaux d'apprentissage disponibles sur la plateforme
                    </p>
                </div>

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
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddLevel()}
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
