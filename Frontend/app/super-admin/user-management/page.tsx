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
import { Users, UserCheck, GraduationCap, Search, Plus, Trash2, ShieldCheck, Loader2, AlertCircle, Clock, CheckCircle, XCircle, Eye, Edit, FileText, Smartphone, Building, User as UserIcon, Paperclip, Briefcase, UserPlus } from 'lucide-react';
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
                            className="bg-gray-700 hover:bg-gray-800 text-white cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Ajouter un utilisateur
                        </Button>
                    </div>
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
                                                    {/* Voir Documents pour les enseignants et apprenants */}
                                                    {(user.role === 'teacher' || user.role === 'student') && (
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
