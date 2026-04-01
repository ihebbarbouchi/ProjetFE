'use client';

import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

import { toast } from 'sonner';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCancelButton,
    ModalConfirmButton,
} from '../../components/ui/modal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Users, UserCheck, GraduationCap, Search, Trash2, ShieldCheck, Loader2, AlertCircle, Clock, CheckCircle, XCircle, Eye, Edit, FileText, Smartphone, Building, Briefcase, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

interface User {
    id: number;
    nom: string;
    prenom?: string;
    nom_famille?: string;
    email: string;
    role: 'student' | 'teacher' | 'super-admin';
    statut: 'active' | 'inactive' | 'pending' | 'rejected';
    joinedAt: string;
    cv_path?: string;
    motivation_path?: string;
    cin_path?: string;
    telephone?: string;
    poste_actuel?: string;
    institution?: string;
}

export default function UserManagement() {
    const { token } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending' | 'rejected'>('all');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [newNom, setNewNom] = useState('');
    const [newPrenom, setNewPrenom] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<User['role']>('student');
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/admin/users`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                const list = (data.data ?? data).map((u: Record<string, unknown>) => ({
                    id: u.id as number,
                    nom: u.nom as string,
                    prenom: u.prenom as string,
                    nom_famille: u.nom_famille as string,
                    email: u.email as string,
                    role: (u.role as string) as User['role'],
                    statut: (u.statut as string) as User['statut'],
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
                setError('Impossible de charger les utilisateurs.');
            }
        } catch {
            setError('Impossible de contacter le serveur.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query: string) => setSearchQuery(query);

    const filtered = users.filter((u) => {
        const matchesSearch =
            u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = filterRole === 'all' || u.role === filterRole;
        const matchesStatus = filterStatus === 'all' || u.statut === filterStatus;

        // Ne pas afficher les super-admins dans cette liste
        const isNotAdmin = u.role !== 'super-admin';

        return matchesSearch && matchesRole && matchesStatus && isNotAdmin;
    });

    const handleAdd = async () => {
        if (!newNom.trim() || !newPrenom.trim() || !newEmail.trim() || !newPassword.trim()) return;
        setIsAdding(true);
        try {
            const res = await fetch(`${API_URL}/admin/create-user`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nom: newNom.trim(),
                    prenom: newPrenom.trim(),
                    email: newEmail.trim(),
                    password: newPassword.trim(),
                    role: newRole,
                }),
            });
            if (res.ok) {
                toast.success('Utilisateur créé avec succès');
                setNewNom('');
                setNewPrenom('');
                setNewEmail('');
                setNewPassword('');
                setNewRole('student');
                setIsAddOpen(false);
                fetchUsers();
            } else {
                const data = await res.json();
                toast.error(data.message ?? 'Erreur lors de la création');
            }
        } catch {
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsAdding(false);
        }
    };

    const handleEdit = async () => {
        if (!editUser || !newNom.trim() || !newPrenom.trim() || !newEmail.trim()) return;
        setIsAdding(true);
        try {
            const res = await fetch(`${API_URL}/admin/update-user/${editUser.id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nom: newNom.trim(),
                    prenom: newPrenom.trim(),
                    email: newEmail.trim(),
                    password: newPassword.trim() || undefined,
                    role: newRole,
                }),
            });
            if (res.ok) {
                toast.success('Utilisateur mis à jour avec succès');
                setEditUser(null);
                setNewNom('');
                setNewPrenom('');
                setNewEmail('');
                setNewPassword('');
                setNewRole('student');
                setIsAddOpen(false);
                fetchUsers();
            } else {
                const data = await res.json();
                toast.error(data.message ?? 'Erreur lors de la mise à jour');
            }
        } catch {
            toast.error('Erreur de connexion au serveur');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur définitivement ?')) return;

        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/admin/reject-user/${id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== id));
                toast.success('Utilisateur supprimé avec succès');
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch {
            toast.error('Erreur de connexion');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = async (id: number) => {
        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/admin/approve-user/${id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, statut: 'active' } : u))
                );
                toast.success('Utilisateur approuvé avec succès');
            } else {
                toast.error('Erreur lors de l\'approbation');
            }
        } catch {
            toast.error('Erreur de connexion');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/admin/reject-user/${id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, statut: 'rejected' } : u))
                );
                toast.success('Utilisateur rejeté et supprimé');
            } else {
                toast.error('Erreur lors du rejet');
            }
        } catch {
            toast.error('Erreur de connexion');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReset = async (id: number) => {
        if (!confirm("Voulez-vous remettre ce compte en attente pour modifier son statut ?")) return;
        setActionLoading(id);
        try {
            const res = await fetch(`${API_URL}/admin/reset-user/${id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (res.ok) {
                setUsers((prev) =>
                    prev.map((u) => (u.id === id ? { ...u, statut: 'pending' } : u))
                );
            }
        } catch {
            // ignorer
        } finally {
            setActionLoading(null);
        }
    };

    const openEdit = (user: User) => {
        setEditUser(user);
        setNewNom(user.nom_famille || user.nom);
        setNewPrenom(user.prenom || '');
        setNewEmail(user.email);
        setNewRole(user.role);
        setNewPassword(''); // Ne pas pré-remplir le mot de passe pour des raisons de sécurité
        setIsAddOpen(true); // Ouvrir le modal
    };

    const getRoleBadge = (role: User['role']) => {
        switch (role) {
            case 'super-admin':
                return <Badge className="bg-violet-100 text-violet-800 border border-violet-200"><ShieldCheck className="w-3 h-3 mr-1" />Administrateur</Badge>;
            case 'teacher':
                return <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200"><UserCheck className="w-3 h-3 mr-1" />Enseignant</Badge>;
            case 'student':
                return <Badge className="bg-blue-100 text-blue-800 border border-blue-200"><GraduationCap className="w-3 h-3 mr-1" />Apprenant</Badge>;
        }
    };

    const totalUsers = users.filter(u => u.role !== 'super-admin').length;
    const studentCount = users.filter((u) => u.role === 'student').length;
    const teacherCount = users.filter((u) => u.role === 'teacher').length;
    const pendingUsers = users.filter((u) => u.statut === 'pending').length;

    return (
        <Layout role="super-admin" onSearch={handleSearch}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h2>
                        <p className="text-gray-500 mt-1">Gérez les apprenants et les enseignants de la plateforme</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditUser(null);
                            setNewNom('');
                            setNewPrenom('');
                            setNewEmail('');
                            setNewPassword('');
                            setNewRole('student');
                            setIsAddOpen(true);
                        }}
                        className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 h-11 px-6 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Ajouter un utilisateur
                    </Button>
                </div>

                {/* Modal Ajouter/Modifier Utilisateur */}
                <Modal open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <ModalHeader onClose={() => setIsAddOpen(false)}>
                        {editUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="add-user-nom">Nom</Label>
                                    <Input
                                        id="add-user-nom"
                                        placeholder="Dupont"
                                        value={newNom}
                                        onChange={(e) => setNewNom(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="add-user-prenom">Prénom</Label>
                                    <Input
                                        id="add-user-prenom"
                                        placeholder="Jean"
                                        value={newPrenom}
                                        onChange={(e) => setNewPrenom(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-user-email">Adresse e-mail</Label>
                                <Input
                                    id="add-user-email"
                                    type="email"
                                    placeholder="jean.dupont@example.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-user-password">
                                    {editUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                                </Label>
                                <Input
                                    id="add-user-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div className={`space-y-2 transition-all duration-300 ${isSelectOpen ? 'mb-28' : 'mb-0'}`}>
                                <Label>Rôle utilisateur</Label>
                                <Select value={newRole} onValueChange={(v) => setNewRole(v as User['role'])} open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper" sideOffset={8} className="z-[100]">
                                        <SelectItem value="student">Apprenant</SelectItem>
                                        <SelectItem value="teacher">Enseignant</SelectItem>
                                        <SelectItem value="super-admin">Administrateur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <ModalCancelButton onClick={() => setIsAddOpen(false)} />
                        <ModalConfirmButton
                            onClick={editUser ? handleEdit : handleAdd}
                            disabled={!newNom.trim() || !newPrenom.trim() || !newEmail.trim() || (!editUser && !newPassword.trim()) || isAdding}
                        >
                            {isAdding ? (editUser ? 'Mise à jour...' : 'Création...') : (editUser ? 'Mettre à jour' : 'Ajouter')}
                        </ModalConfirmButton>
                    </ModalFooter>
                </Modal>

                {/* Erreur */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Utilisateurs', value: totalUsers,   icon: Users,        color: 'violet' },
                        { label: 'Apprenants',         value: studentCount,  icon: GraduationCap, color: 'blue' },
                        { label: 'Enseignants',        value: teacherCount,  icon: UserCheck,    color: 'emerald' },
                        { label: 'En attente',         value: pendingUsers,  icon: Clock,        color: 'amber' },
                    ].map((s, i) => (
                        <Card key={i} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                            <CardContent className="p-5 relative">
                                <div className={`absolute top-0 right-0 w-16 h-16 bg-${s.color}-50 rounded-bl-full -mr-8 -mt-8`} />
                                <div className={`w-9 h-9 rounded-xl bg-${s.color}-100 flex items-center justify-center mb-3`}>
                                    <s.icon className={`w-4 h-4 text-${s.color}-600`} />
                                </div>
                                <p className="text-xs font-medium text-gray-400 mb-0.5">{s.label}</p>
                                <p className={`text-3xl font-black text-${s.color}-600 tracking-tight`}>{s.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filtres */}
                <div className="flex flex-col sm:flex-row gap-3 relative z-30">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            className="pl-10 h-11 bg-white border-gray-200 rounded-xl focus:ring-violet-500 focus:border-violet-500 transition-all font-medium shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Select value={filterRole} onValueChange={(v) => setFilterRole(v as typeof filterRole)}>
                            <SelectTrigger className="w-44 h-11 bg-white border-gray-200 rounded-xl focus:ring-violet-500 shadow-sm font-medium">
                                <SelectValue placeholder="Tous les rôles" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={8} className="bg-white border border-gray-200 shadow-2xl rounded-xl z-[100] min-w-[180px]">
                                <SelectItem value="all" className="cursor-pointer focus:bg-violet-50 py-2.5">Tous les rôles</SelectItem>
                                <SelectItem value="student" className="cursor-pointer focus:bg-violet-50 py-2.5">Apprenants</SelectItem>
                                <SelectItem value="teacher" className="cursor-pointer focus:bg-violet-50 py-2.5">Enseignants</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                            <SelectTrigger className="w-52 h-11 bg-white border-gray-200 rounded-xl focus:ring-violet-500 shadow-sm font-medium">
                                <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={8} className="bg-white border border-gray-200 shadow-2xl rounded-xl z-[100] min-w-[200px]">
                                <SelectItem value="all" className="cursor-pointer focus:bg-violet-50 py-2.5">Tous les statuts</SelectItem>
                                <SelectItem value="active" className="cursor-pointer focus:bg-violet-50 py-2.5">Actifs / Approuvés</SelectItem>
                                <SelectItem value="inactive" className="cursor-pointer focus:bg-violet-50 py-2.5">Inactifs</SelectItem>
                                <SelectItem value="pending" className="cursor-pointer focus:bg-violet-50 py-2.5">En attente</SelectItem>
                                <SelectItem value="rejected" className="cursor-pointer focus:bg-violet-50 py-2.5">Rejetés</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tableau */}
                <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-white py-4 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-semibold text-gray-900">Liste des utilisateurs</CardTitle>
                                <CardDescription className="text-xs text-gray-400 mt-0.5">
                                    {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-16">
                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">Aucun utilisateur trouvé</p>
                                <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres</p>
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
                                        {filtered.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold text-violet-600">
                                                                {user.nom?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 leading-tight">{user.nom}</p>
                                                            <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                                <td className="px-6 py-4">
                                                    <Badge className={
                                                        user.statut === 'active'   ? 'bg-emerald-100 text-emerald-700 border-none text-xs' :
                                                        user.statut === 'pending'  ? 'bg-amber-100 text-amber-700 border-none text-xs' :
                                                        user.statut === 'rejected' ? 'bg-red-100 text-red-600 border-none text-xs' :
                                                                                     'bg-gray-100 text-gray-500 border-none text-xs'
                                                    }>
                                                        {user.statut === 'active'   ? (user.role === 'teacher' ? 'Approuvé' : 'Actif') :
                                                         user.statut === 'pending'  ? 'En attente' :
                                                         user.statut === 'rejected' ? 'Rejeté' : 'Inactif'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-gray-400">{user.joinedAt}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {(user.role === 'teacher' || user.role === 'student') && (
                                                            <Button size="sm" variant="outline"
                                                                className="text-violet-600 border-violet-100 hover:bg-violet-50 h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> Dossier
                                                            </Button>
                                                        )}
                                                        {user.statut === 'pending' ? (
                                                            <>
                                                                <Button size="sm"
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                    onClick={() => handleApprove(user.id)}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                                    Accepter
                                                                </Button>
                                                                <Button size="sm" variant="outline"
                                                                    className="text-red-500 border-red-100 hover:bg-red-50 h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                    onClick={() => handleReject(user.id)}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                                                    Refuser
                                                                </Button>
                                                            </>
                                                        ) : (user.statut === 'active' || user.statut === 'rejected') ? (
                                                            <>
                                                                <Button size="sm" variant="outline"
                                                                    className="text-violet-600 border-violet-100 hover:bg-violet-50 h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                    onClick={() => openEdit(user)}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" /> Modifier
                                                                </Button>
                                                                <Button size="sm" variant="outline"
                                                                    className="h-8 px-3 border-red-100 text-red-500 hover:bg-red-50 rounded-lg gap-1.5 text-xs"
                                                                    onClick={() => handleDelete(user.id)}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                                    Supprimer
                                                                </Button>
                                                            </>
                                                        ) : null}
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
                                    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl font-black text-violet-600">
                                            {selectedUser.nom?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedUser.nom}</h3>
                                        <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {getRoleBadge(selectedUser.role)}
                                            <Badge className={selectedUser.statut === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                {selectedUser.statut === 'active' ? 'Approuvé' : 'En attente'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations détaillées */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    {[
                                        { label: 'Téléphone',    value: selectedUser.telephone,    icon: Smartphone },
                                        { label: 'Institution',   value: selectedUser.institution,   icon: Building   },
                                        { label: 'Poste actuel', value: selectedUser.poste_actuel,  icon: Briefcase  },
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

                                {/* Pièces Justificatives */}
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
                                        {(!selectedUser.cv_path && !selectedUser.motivation_path && !selectedUser.cin_path) && (
                                            <p className="text-sm text-gray-400 italic py-2">Aucun document fourni.</p>
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
