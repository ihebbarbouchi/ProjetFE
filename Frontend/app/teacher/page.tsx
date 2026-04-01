'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BookOpen, FileText, HelpCircle, Users, PlusCircle, Edit, Trash2, Eye, GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [myResources, setMyResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Chargement des ressources de l'enseignant ────────────────────────
  useEffect(() => {
    const fetchMyResources = async () => {
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
        console.error("Erreur chargement ressources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchMyResources();
  }, [token]);

  // ── Statistiques ────────────────────────────────────────────────────
  const stats = [
    { title: 'Mes ressources', value: myResources.length.toString(), icon: BookOpen, color: 'emerald' },
    { title: 'Total apprenants', value: '0', icon: Users, color: 'emerald' },
    { title: 'Cours PDF', value: myResources.length.toString(), icon: FileText, color: 'emerald' },
    { title: 'Quiz', value: '0', icon: HelpCircle, color: 'emerald' },
  ];

  const quizResults: any[] = [];
  const studentAccess: any[] = [];

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

  return (
    <Layout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Tableau de bord — {user?.prenom || 'Enseignant'}</h2>
            <p className="text-gray-600 mt-1">Gérez vos ressources et suivez la progression de vos apprenants</p>
          </div>
          <Button
            onClick={() => router.push('/add-resource')}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajouter une ressource
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-emerald-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Resources */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Mes ressources</CardTitle>
                <CardDescription>Gérez vos cours, documents et quiz</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-none" onClick={() => router.push('/teacher/resources')}>
                  Voir tout
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/add-resource')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : myResources.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune ressource pour l&apos;instant</p>
                <p className="text-sm text-gray-400 mb-4">Créez votre premier cours, document ou quiz</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/add-resource')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ajouter ma première ressource
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Visibilité</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myResources.map((resource) => (
                    <TableRow key={resource.id} className="group">
                      <TableCell className="font-bold text-gray-900">{resource.titre}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] font-bold uppercase">{resource.type}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-bold text-[10px]">
                          {resource.category?.code || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={resource.visibilite === 'public' ? 'bg-emerald-100 text-emerald-700 border-none text-[10px]' : 'bg-gray-100 text-gray-600 border-none text-[10px]'}>
                          {resource.visibilite}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-[11px]">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Voir"><Eye className="w-4 h-4 text-gray-400" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Modifier"><Edit className="w-4 h-4 text-gray-400" /></Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" 
                            onClick={() => handleDelete(resource.id)}
                            title="Supprimer"
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

        {/* My Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes apprenants</CardTitle>
                <CardDescription>Apprenants inscrits à vos ressources</CardDescription>
              </div>
              <Button variant="outline" disabled>
                <GraduationCap className="w-4 h-4 mr-2" />
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun apprenant pour l&apos;instant</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
