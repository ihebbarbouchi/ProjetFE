'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalCancelButton } from '../components/ui/modal';
import {
  Users, BookOpen, FolderOpen, UserCheck,
  GraduationCap, ShieldCheck, Loader2, AlertCircle, Clock, Eye,
  FileText, Smartphone, Building, Briefcase,
  FileType, Layers, ArrowRight, TrendingUp,
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

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const res = await fetch(`${API_URL}/admin/users`, { headers });
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

  useEffect(() => { fetchUsers(); }, []);

  // ── Badges ──────────────────────────────────────────────────
  const getRoleBadge = (role: string) => {
    if (role === 'super-admin') return (
      <Badge className="bg-violet-100 text-violet-700 border-none text-xs">
        <ShieldCheck className="w-3 h-3 mr-1" />Administrateur
      </Badge>
    );
    if (role === 'teacher') return (
      <Badge className="bg-emerald-100 text-emerald-700 border-none text-xs">
        <UserCheck className="w-3 h-3 mr-1" />Enseignant
      </Badge>
    );
    return (
      <Badge className="bg-blue-100 text-blue-700 border-none text-xs">
        <GraduationCap className="w-3 h-3 mr-1" />Apprenant
      </Badge>
    );
  };

  const getStatutBadge = (statut: string) => {
    if (statut === 'active') return <Badge className="bg-emerald-100 text-emerald-700 border-none text-xs">Actif</Badge>;
    if (statut === 'pending') return <Badge className="bg-amber-100 text-amber-700 border-none text-xs">En attente</Badge>;
    return <Badge className="bg-gray-100 text-gray-500 border-none text-xs">Inactif</Badge>;
  };

  // ── Stats ──────────────────────────────────────────────────
  const totalStudents  = users.filter(u => u.role === 'student').length;
  const totalTeachers  = users.filter(u => u.role === 'teacher').length;
  const activeTeachers = users.filter(u => u.role === 'teacher' && u.statut === 'active').length;
  const pendingCount   = users.filter(u => u.statut === 'pending').length;

  const stats = [
    { title: 'Total Apprenants',       value: totalStudents,  icon: GraduationCap, color: 'blue',   bg: 'blue' },
    { title: 'Enseignants Actifs',     value: activeTeachers, icon: UserCheck,     color: 'emerald', bg: 'emerald' },
    { title: 'Total Enseignants',      value: totalTeachers,  icon: Users,         color: 'violet',  bg: 'violet' },
    { title: 'En attente validation',  value: pendingCount,   icon: Clock,         color: 'amber',   bg: 'amber' },
  ];

  const referentiels = [
    { label: 'Disciplines',       desc: 'Matières académiques',          icon: BookOpen,  color: 'blue',    path: '/super-admin/disciplines' },
    { label: 'Niveaux',           desc: "Niveaux d'études",              icon: Layers,    color: 'emerald', path: '/super-admin/levels' },
    { label: 'Types de ressources', desc: 'Formats (Cours, TP, etc.)',  icon: FileType,  color: 'violet',  path: '/super-admin/resource-types' },
    { label: 'Catégories',        desc: 'Suggestions des enseignants',   icon: FolderOpen, color: 'indigo', path: '/super-admin/categories' },
  ];

  const recentUsers = users.filter(u => u.role !== 'super-admin').slice(0, 6);

  return (
    <Layout role="super-admin">
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Tableau de bord
            </h2>
            <p className="text-gray-500 mt-1">
              Bonjour, {user?.prenom ?? 'Administrateur'} — bienvenue sur EduShare
            </p>
          </div>
          <Button
            onClick={() => router.push('/super-admin/user-management')}
            className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 h-11 px-6 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Users className="w-4 h-4" />
            Gérer les utilisateurs
          </Button>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
              <CardContent className="p-6 relative">
                <div className={`absolute top-0 right-0 w-20 h-20 bg-${stat.bg}-50 rounded-bl-full -mr-10 -mt-10 group-hover:bg-${stat.bg}-100 transition-colors`} />
                <div className={`w-10 h-10 rounded-xl bg-${stat.bg}-100 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                {usersLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                ) : (
                  <p className={`text-4xl font-black text-${stat.color}-600 tracking-tight`}>{stat.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Référentiels ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {referentiels.map((ref, i) => (
            <button
              key={i}
              onClick={() => router.push(ref.path)}
              className={`group text-left p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-${ref.color}-200 transition-all`}
            >
              <div className={`w-10 h-10 rounded-xl bg-${ref.color}-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <ref.icon className={`w-5 h-5 text-${ref.color}-600`} />
              </div>
              <p className="font-bold text-gray-900 text-sm">{ref.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">{ref.desc}</p>
              <div className={`flex items-center gap-1 text-xs font-semibold text-${ref.color}-600 group-hover:gap-2 transition-all`}>
                Accéder <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

        {/* ── Utilisateurs récents ───────────────────────────── */}
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-white py-4 px-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900">Utilisateurs récents</CardTitle>
                <CardDescription className="text-xs text-gray-400 mt-0.5">Derniers inscrits sur la plateforme</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={usersLoading}
                className="h-8 text-xs border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                {usersLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                Actualiser
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/super-admin/user-management')}
                className="h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4"
              >
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {usersError && (
              <div className="flex items-center gap-3 bg-red-50 text-red-600 text-sm rounded-lg p-3 mx-6 mt-4 mb-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{usersError}</span>
              </div>
            )}
            {usersLoading ? (
              <div className="flex justify-center items-center py-14">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center py-14">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Aucun utilisateur trouvé.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Utilisateur</th>
                      <th className="px-6 py-4">Rôle</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4">Inscrit le</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-violet-600">
                                {u.nom?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight">{u.nom}</p>
                              <p className="text-xs text-gray-400 leading-tight">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                        <td className="px-6 py-4">{getStatutBadge(u.statut)}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-400">{u.joinedAt}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {u.role === 'teacher' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setSelectedUser(u); setIsDetailsOpen(true); }}
                                className="h-8 px-3 text-xs text-violet-600 border-violet-100 hover:bg-violet-50 rounded-lg gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" /> Dossier
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push('/super-admin/user-management')}
                              className="h-8 px-3 text-xs text-gray-600 border-gray-200 hover:bg-gray-50 rounded-lg"
                            >
                              Gérer
                            </Button>
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

        {/* ── Activité rapide ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Catégories en attente',
              desc: 'Suggestions à traiter',
              value: '—',
              icon: FolderOpen,
              color: 'violet',
              action: 'Voir les catégories',
              path: '/super-admin/categories',
            },
            {
              title: 'Enseignants en attente',
              desc: 'Demandes à approuver',
              value: pendingCount,
              icon: Clock,
              color: 'amber',
              action: 'Gérer les demandes',
              path: '/super-admin/user-management',
            },
            {
              title: 'Apprenants inscrits',
              desc: 'Total sur la plateforme',
              value: totalStudents,
              icon: GraduationCap,
              color: 'blue',
              action: 'Voir les apprenants',
              path: '/super-admin/user-management',
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all cursor-pointer group`}
              onClick={() => router.push(item.path)}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{item.title}</p>
                <p className={`text-3xl font-black text-${item.color}-600 mt-1`}>{usersLoading ? '…' : item.value}</p>
                <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold text-${item.color}-600 group-hover:gap-2 transition-all`}>
                {item.action} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ── Modal dossier enseignant ───────────────────────── */}
      <Modal open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <ModalHeader onClose={() => setIsDetailsOpen(false)}>
          Dossier de {selectedUser?.nom}
        </ModalHeader>
        <ModalBody>
          {selectedUser && (
            <div className="space-y-6">
              {/* Profil */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <span className="text-2xl font-black text-violet-600">
                    {selectedUser.nom?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.nom}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getRoleBadge(selectedUser.role)}
                    {getStatutBadge(selectedUser.statut)}
                  </div>
                </div>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {[
                  { label: 'Téléphone', value: selectedUser.telephone, icon: Smartphone },
                  { label: 'Institution', value: selectedUser.institution, icon: Building },
                  { label: 'Poste actuel', value: selectedUser.poste_actuel, icon: Briefcase },
                ].map((info, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{info.label}</span>
                    <p className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                      <info.icon className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      {info.value || <span className="text-gray-400 font-normal">Non renseigné</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Pièces Justificatives</h4>
                <div className="space-y-2">
                  {selectedUser.cv_path && (
                    <a href={`http://localhost:8000/storage/${selectedUser.cv_path}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-violet-50 hover:border-violet-100 transition-colors">
                      <FileText className="w-5 h-5 text-violet-400" />
                      <span className="text-sm font-semibold text-gray-700">Curriculum Vitae</span>
                    </a>
                  )}
                  {selectedUser.motivation_path && (
                    <a href={`http://localhost:8000/storage/${selectedUser.motivation_path}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-violet-50 hover:border-violet-100 transition-colors">
                      <FileText className="w-5 h-5 text-violet-400" />
                      <span className="text-sm font-semibold text-gray-700">Lettre de Motivation</span>
                    </a>
                  )}
                  {selectedUser.cin_path && (
                    <a href={`http://localhost:8000/storage/${selectedUser.cin_path}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-violet-50 hover:border-violet-100 transition-colors">
                      <ShieldCheck className="w-5 h-5 text-violet-400" />
                      <span className="text-sm font-semibold text-gray-700">Pièce d'Identité</span>
                    </a>
                  )}
                  {!selectedUser.cv_path && !selectedUser.motivation_path && !selectedUser.cin_path && (
                    <p className="text-sm text-gray-400 italic py-2">Aucun document fourni.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalCancelButton onClick={() => setIsDetailsOpen(false)}>Fermer</ModalCancelButton>
        </ModalFooter>
      </Modal>
    </Layout>
  );
}
