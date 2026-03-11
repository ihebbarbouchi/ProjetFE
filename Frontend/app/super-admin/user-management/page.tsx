'use client';

import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Users, UserCheck, GraduationCap, Search, Plus, Trash2, ShieldCheck, Loader2, AlertCircle, Clock, CheckCircle, XCircle, Eye, Edit, FileText, Smartphone, Building, User as UserIcon, Paperclip, Briefcase } from 'lucide-react';
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
                        <p className="text-gray-600 mt-1">Gérez les apprenants et les enseignants de la plateforme</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Actualiser
                        </Button>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all hover:scale-[1.02] active:scale-95 px-6 h-11 rounded-2xl font-bold flex items-center gap-2"
                                    onClick={() => {
                                        setEditUser(null);
                                        setNewNom('');
                                        setNewPrenom('');
                                        setNewEmail('');
                                        setNewPassword('');
                                        setNewRole('student');
                                        setIsAddOpen(true);
                                    }}
                                >
                                    <Plus className="w-5 h-5" /> Ajouter un utilisateur
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md bg-white p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Users className="w-24 h-24 -mr-8 -mt-8" />
                                    </div>
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-white">
                                            {editUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                                        </DialogTitle>
                                        <DialogDescription className="text-violet-100 opacity-90 text-base mt-1">
                                            {editUser ? 'Mettre à jour les informations du compte' : 'Créer un nouveau compte pour la plateforme'}
                                        </DialogDescription>
                                    </DialogHeader>
                                </div>
                                <div className="p-8 space-y-5 bg-gray-50/50">
                                    {/* Nom + Prénom côte à côte */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="add-user-nom" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nom</Label>
                                            <Input
                                                id="add-user-nom"
                                                placeholder="Dupont"
                                                value={newNom}
                                                onChange={(e) => setNewNom(e.target.value)}
                                                className="h-12 bg-white shadow-sm border-gray-100 focus:ring-violet-500 focus:border-violet-500 rounded-2xl transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="add-user-prenom" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Prénom</Label>
                                            <Input
                                                id="add-user-prenom"
                                                placeholder="Jean"
                                                value={newPrenom}
                                                onChange={(e) => setNewPrenom(e.target.value)}
                                                className="h-12 bg-white shadow-sm border-gray-100 focus:ring-violet-500 focus:border-violet-500 rounded-2xl transition-all"
                                            />
                                        </div>
                                    </div>
                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="add-user-email" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Adresse e-mail</Label>
                                        <Input
                                            id="add-user-email"
                                            type="email"
                                            placeholder="jean.dupont@example.com"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            className="h-12 bg-white shadow-sm border-gray-100 focus:ring-violet-500 focus:border-violet-500 rounded-2xl transition-all"
                                        />
                                    </div>
                                    {/* Mot de passe */}
                                    <div className="space-y-2">
                                        <Label htmlFor="add-user-password" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                            {editUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                                        </Label>
                                        <Input
                                            id="add-user-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="h-12 bg-white shadow-sm border-gray-100 focus:ring-violet-500 focus:border-violet-500 rounded-2xl transition-all"
                                        />
                                    </div>
                                    {/* Rôle */}
                                    <div className={`space-y-2 transition-all duration-300 ${isSelectOpen ? 'mb-28' : 'mb-0'}`}>
                                        <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Rôle utilisateur</Label>
                                        <Select value={newRole} onValueChange={(v) => setNewRole(v as User['role'])} open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                                            <SelectTrigger className="h-12 bg-white border-gray-100 rounded-2xl focus:ring-violet-500 shadow-sm font-medium"><SelectValue /></SelectTrigger>
                                            <SelectContent position="popper" sideOffset={8} className="z-[100] bg-white border border-gray-100 shadow-2xl rounded-2xl min-w-[var(--radix-select-trigger-width)]">
                                                <SelectItem value="student" className="py-3 px-4 focus:bg-violet-50 cursor-pointer rounded-xl">Apprenant</SelectItem>
                                                <SelectItem value="teacher" className="py-3 px-4 focus:bg-violet-50 cursor-pointer rounded-xl">Enseignant</SelectItem>
                                                <SelectItem value="super-admin" className="py-3 px-4 focus:bg-violet-50 cursor-pointer rounded-xl text-violet-600 font-bold">Administrateur</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {/* Bouton confirmer */}
                                    <div className="pt-2">
                                        <Button
                                            onClick={editUser ? handleEdit : handleAdd}
                                            className="w-full bg-violet-600 hover:bg-violet-700 h-14 text-lg font-bold transition-all hover:scale-[1.01] active:scale-95 shadow-xl shadow-violet-200 flex items-center justify-center gap-2 rounded-2xl"
                                            disabled={!newNom.trim() || !newPrenom.trim() || !newEmail.trim() || (!editUser && !newPassword.trim()) || isAdding}
                                        >
                                            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                            {isAdding ? (editUser ? 'Mise à jour...' : 'Création en cours...') : (editUser ? 'Mettre à jour le compte' : 'Créer le compte')}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Erreur */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Total Utilisateurs</p>
                                <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Apprenants</p>
                                <p className="text-xl font-bold text-gray-900">{studentCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Enseignants</p>
                                <p className="text-xl font-bold text-gray-900">{teacherCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">En attente (Total)</p>
                                <p className="text-xl font-bold text-gray-900">{pendingUsers}</p>
                            </div>
                        </CardContent>
                    </Card>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des utilisateurs</CardTitle>
                        <CardDescription>{filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
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
                                    {filtered.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.nom}</TableCell>
                                            <TableCell className="text-gray-600">{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={user.statut === 'active' ? 'default' : 'secondary'}
                                                    className={
                                                        user.statut === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                            user.statut === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                                user.statut === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''
                                                    }
                                                >
                                                    {user.statut === 'active' ? (user.role === 'teacher' ? 'Approuvé' : 'Actif') :
                                                        user.statut === 'pending' ? 'En attente' :
                                                            user.statut === 'rejected' ? 'Rejeté' : 'Inactif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600">{user.joinedAt}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Voir Documents pour les enseignants */}
                                                    {user.role === 'teacher' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-violet-600 border-violet-200 hover:bg-violet-50 h-9 px-3 cursor-pointer shadow-sm group hover:border-violet-600 transition-all font-bold"
                                                            onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" /> Dossier
                                                        </Button>
                                                    )}

                                                    {/* Actions pour les utilisateurs en attente (Enseignants et Apprenants) */}
                                                    {user.statut === 'pending' ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white gap-1 h-9 px-3 cursor-pointer"
                                                                onClick={() => handleApprove(user.id)}
                                                                disabled={actionLoading === user.id}
                                                            >
                                                                {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                                Accepter
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-red-600 hover:bg-red-700 text-white gap-1 h-9 px-3 cursor-pointer"
                                                                onClick={() => handleReject(user.id)}
                                                                disabled={actionLoading === user.id}
                                                            >
                                                                {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                                Refuser
                                                            </Button>
                                                        </>
                                                    ) : (user.statut === 'active' || user.statut === 'rejected') ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-violet-600 border-violet-200 hover:bg-violet-50 h-9 px-3 font-medium cursor-pointer"
                                                            onClick={() => openEdit(user)}
                                                            disabled={actionLoading === user.id}
                                                        >
                                                            <Edit className="w-3 h-3 mr-1" /> Modifier
                                                        </Button>
                                                    ) : null}

                                                    {/* Bouton supprimer commun */}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-9 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1.5" />
                                                        Supprimer
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {!isLoading && filtered.length === 0 && (
                            <div className="text-center py-16">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
                                <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Modal de Détails Utilisateur / Documents */}
                <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                    <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                        {selectedUser && (
                            <>
                                {/* Header avec dégradé subtil aux couleurs du dashboard */}
                                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <UserIcon className="w-32 h-32 -mr-16 -mt-16" />
                                    </div>

                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl">
                                            <UserIcon className="w-10 h-10 text-white" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                                                Dossier de {selectedUser.nom}
                                            </DialogTitle>
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm px-3 py-1">
                                                    {selectedUser.role === 'teacher' ? 'Enseignant' : 'Apprenant'}
                                                </Badge>
                                                <Badge className={`${selectedUser.statut === 'active' ? 'bg-emerald-400' : 'bg-amber-400'} text-gray-900 border-none font-bold px-3 py-1`}>
                                                    {selectedUser.statut === 'active' ? 'Approuvé' : 'En attente'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-gray-50/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {/* Informations de Contact */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                            <h4 className="text-xs font-bold text-violet-600 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-violet-600"></span>
                                                Informations de contact
                                            </h4>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all">
                                                        <Smartphone className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Téléphone</p>
                                                        <p className="font-bold text-gray-900">{selectedUser.telephone || 'Non renseigné'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Email professionnel</p>
                                                        <p className="font-bold text-gray-900">{selectedUser.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profil Professionnel */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                            <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                                                Profil Professionnel
                                            </h4>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <Briefcase className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Poste actuel</p>
                                                        <p className="font-bold text-gray-900">{selectedUser.poste_actuel || 'Professeur'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <Building className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Institution</p>
                                                        <p className="font-bold text-gray-900">{selectedUser.institution || 'ISET'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pièces Justificatives */}
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pièces Justificatives</h4>
                                            <Badge variant="outline" className="text-[10px] font-bold border-gray-200 text-gray-400">
                                                {(selectedUser.cv_path ? 1 : 0) + (selectedUser.motivation_path ? 1 : 0) + (selectedUser.cin_path ? 1 : 0)} / 3 Documents
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {selectedUser.cv_path ? (
                                                <a
                                                    href={`http://localhost:8000/storage/${selectedUser.cv_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-violet-600 hover:shadow-md transition-all text-center relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-2 h-full bg-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                        <FileText className="w-6 h-6 text-violet-600" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">Curriculum Vitae</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Format PDF / DOC</p>
                                                </a>
                                            ) : (
                                                <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center opacity-60">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                        <FileText className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400 italic">CV non disponible</p>
                                                </div>
                                            )}

                                            {selectedUser.motivation_path ? (
                                                <a
                                                    href={`http://localhost:8000/storage/${selectedUser.motivation_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-indigo-600 hover:shadow-md transition-all text-center relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-2 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                        <FileText className="w-6 h-6 text-indigo-600" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">Lettre de Motiv.</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Format PDF / DOC</p>
                                                </a>
                                            ) : (
                                                <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center opacity-60">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                        <FileText className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400 italic">Lettre non dispo.</p>
                                                </div>
                                            )}

                                            {selectedUser.cin_path ? (
                                                <a
                                                    href={`http://localhost:8000/storage/${selectedUser.cin_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-emerald-600 hover:shadow-md transition-all text-center relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-2 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-900">Pièce d'Identité</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Passeport / CIN</p>
                                                </a>
                                            ) : (
                                                <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 text-center opacity-60">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                                        <ShieldCheck className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-400 italic">CIN non disponible</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-10 flex border-t border-gray-100 pt-6">
                                        <Button
                                            onClick={() => setIsDetailsOpen(false)}
                                            className="ml-auto bg-gray-900 hover:bg-black text-white px-10 rounded-2xl font-bold h-12 shadow-lg transition-transform active:scale-95"
                                        >
                                            Fermer le dossier
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
