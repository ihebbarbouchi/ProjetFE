'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalConfirmButton, ModalCancelButton } from '../components/ui/modal';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Users, BookOpen, FolderOpen, CheckCircle, XCircle, UserCheck,
  GraduationCap, ShieldCheck, Loader2, AlertCircle, Clock, Plus, Edit,
  Eye, FileText, Smartphone, Building, Briefcase, User as UserIcon,
  FileType, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

interface UserRow {
  id: number;
  nom: string;
  email: string;
  role: string;
  statut: string;
  joinedAt: string;
  cv_path?: string;
  motivation_path?: string;
  cin_path?: string;
  telephone?: string;
  poste_actuel?: string;
  institution?: string;
}

interface TeacherApplication {
  id: number;
  nom: string;
  email: string;
  date: string;
  statut: 'pending' | 'active' | 'rejected';
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { token } = useAuth();

  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Users
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const categories: { id: number; name: string; resources: number; students: number }[] = [];

  // ── Charger tous les utilisateurs ──
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = (data.data ?? data).map((u: Record<string, unknown>) => ({
          id: u.id as number,
          nom: u.nom as string,
          email: u.email as string,
          role: u.role as string,
          statut: u.statut as string,
          joinedAt: (u.created_at as string)?.split('T')[0] ?? '',
          cv_path: u.chemin_cv as string,
          motivation_path: u.chemin_motivation as string,
          cin_path: u.chemin_cin as string,
          telephone: u.telephone as string,
          poste_actuel: u.poste_actuel as string,
          institution: u.institution as string,
        }));
        setUsers(list);
      } else {
        setUsersError('Impossible de charger les utilisateurs.');
      }
    } catch {
      setUsersError('Impossible de contacter le serveur.');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCategory = () => {
    console.log('Adding category:', {
      name: categoryName,
      code: categoryCode,
      type: categoryType,
      description: categoryDescription
    });
    setCategoryName('');
    setCategoryCode('');
    setCategoryType('');
    setCategoryDescription('');
  };

  // ── Badges ──
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super-admin':
        return (
          <Badge className="bg-violet-100 text-violet-800 border border-violet-200">
            <ShieldCheck className="w-3 h-3 mr-1" />Administrateur
          </Badge>
        );
      case 'teacher':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserCheck className="w-3 h-3 mr-1" />Enseignant
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
            <GraduationCap className="w-3 h-3 mr-1" />Apprenant
          </Badge>
        );
    }
  };

  // ── Stats ──
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const pendingTeachersCount = users.filter((u) => u.role === 'teacher' && u.statut === 'pending').length;

  const stats = [
    { title: 'Total Apprenants', value: totalStudents, icon: GraduationCap, color: 'blue' },
    { title: 'Enseignants Actifs', value: users.filter((u) => u.role === 'teacher' && u.statut === 'active').length, icon: UserCheck, color: 'green' },
    { title: 'Total Enseignants', value: totalTeachers, icon: Users, color: 'purple' },
    { title: 'En attente validation', value: pendingTeachersCount, icon: Clock, color: 'orange' },
  ];

  return (
    <Layout role="super-admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-gray-600 mt-1">Gérez les utilisateurs, les catégories et surveillez la plateforme</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    {usersLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Section Gestion Unifiée des Utilisateurs ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <CardTitle>Utilisateurs récents</CardTitle>
                <CardDescription>Aperçu des derniers apprenants et enseignants inscrits</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchUsers} disabled={usersLoading}>
                {usersLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Actualiser
              </Button>
              <Button size="sm" asChild className="bg-violet-600 hover:bg-violet-700">
                <a href="/super-admin/user-management">Voir tout</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {usersError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mx-6 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{usersError}</span>
              </div>
            )}
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-7 h-7 animate-spin text-violet-600" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscrit le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter((u) => u.role !== 'super-admin')
                    .slice(0, 5) // Que les 5 derniers
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.nom}</TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.statut === 'active'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : user.statut === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }
                          >
                            {user.statut === 'active' ? 'Actif' : user.statut === 'pending' ? 'En attente' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">{user.joinedAt}</TableCell>
                        <TableCell className="text-right">
                          {user.role === 'teacher' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                            >
                              <Eye className="w-4 h-4 mr-1" /> Dossier
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
            {!usersLoading && users.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-gray-100 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Aucun utilisateur trouvé.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Section Configuration des Référentiels ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/super-admin/disciplines')}>
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Disciplines</CardTitle>
              <CardDescription>Gérez les matières académiques</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-bold justify-start">
                Accéder au référentiel →
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/super-admin/levels')}>
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
                <Layers className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Niveaux</CardTitle>
              <CardDescription>Gérez les niveaux d&apos;études</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto font-bold justify-start">
                Accéder au référentiel →
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/super-admin/resource-types')}>
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-2">
                <FileType className="w-5 h-5 text-violet-600" />
              </div>
              <CardTitle className="text-lg">Types de Ressources</CardTitle>
              <CardDescription>Gérez les formats (Cours, TP, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-violet-600 hover:text-violet-700 hover:bg-violet-50 p-0 h-auto font-bold justify-start">
                Accéder au référentiel →
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Unused but kept for reference */}
        <div style={{ display: 'none' }}>
          <BookOpen />
        </div>

        {/* Modal de Détails Utilisateur / Documents */}
        <Modal open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <ModalHeader onClose={() => setIsDetailsOpen(false)}>
                Dossier de {selectedUser?.nom}
            </ModalHeader>
            <ModalBody>
            {selectedUser && (
              <div className="space-y-6">
                  {/* Profil rapide */}
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedUser.nom}</h3>
                          <p className="text-sm text-gray-500">{selectedUser.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                  {selectedUser.role === 'teacher' ? 'Enseignant' : 'Apprenant'}
                              </Badge>
                              <Badge className={selectedUser.statut === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                  {selectedUser.statut === 'active' ? 'Approuvé' : 'En attente'}
                              </Badge>
                          </div>
                      </div>
                  </div>

                  {/* Informations detaillées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="space-y-1">
                          <span className="text-sm text-gray-500">Téléphone</span>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-gray-400" />
                              {selectedUser.telephone || 'Non renseigné'}
                          </p>
                      </div>
                      <div className="space-y-1">
                          <span className="text-sm text-gray-500">Institution</span>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              {selectedUser.institution || 'Non renseignée'}
                          </p>
                      </div>
                      <div className="space-y-1">
                          <span className="text-sm text-gray-500">Poste actuel</span>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              {selectedUser.poste_actuel || 'Non renseigné'}
                          </p>
                      </div>
                  </div>

                  {/* Pièces Justificatives */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900">Pièces Justificatives</h4>
                      <div className="space-y-2">
                          {selectedUser.cv_path && (
                              <a href={`http://localhost:8000/storage/${selectedUser.cv_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700">Curriculum Vitae</span>
                              </a>
                          )}
                          {selectedUser.motivation_path && (
                              <a href={`http://localhost:8000/storage/${selectedUser.motivation_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                  <FileText className="w-5 h-5 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700">Lettre de Motivation</span>
                              </a>
                          )}
                          {selectedUser.cin_path && (
                              <a href={`http://localhost:8000/storage/${selectedUser.cin_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-700">Pièce d'Identité</span>
                              </a>
                          )}
                          {(!selectedUser.cv_path && !selectedUser.motivation_path && !selectedUser.cin_path) && (
                              <p className="text-sm text-gray-500 italic">Aucun document fourni.</p>
                          )}
                      </div>
                  </div>
              </div>
            )}
            </ModalBody>
            <ModalFooter>
              <ModalCancelButton onClick={() => setIsDetailsOpen(false)}>
                Fermer
              </ModalCancelButton>
            </ModalFooter>
        </Modal>
      </div>
    </Layout>
  );
}

// Composant Modal (Extraits pour éviter duplicaion / simplification ici, mais on l'injecte direct)
// Ou on peut simplement copier la logique précédente
