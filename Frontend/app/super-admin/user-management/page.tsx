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
    Modal, ModalHeader, ModalBody, ModalFooter,
    ModalCancelButton, ModalConfirmButton,
} from '../../components/ui/modal';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '../../components/ui/select';
import {
    Users, UserCheck, GraduationCap, Search, Trash2, ShieldCheck,
    Loader2, AlertCircle, Clock, CheckCircle, XCircle, Edit,
    FileText, Smartphone, Building, Briefcase, UserPlus, FolderOpen,
    Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const STORAGE_URL = 'http://localhost:8000/storage';

// ── Types ──────────────────────────────────────────────────────────────────
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

// ── Helpers ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: User['role'] }) {
    if (role === 'super-admin') return (
        <Badge className="bg-violet-100 text-violet-800 border-violet-200 gap-1">
            <ShieldCheck className="w-3 h-3" />Administrateur
        </Badge>
    );
    if (role === 'teacher') return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1">
            <UserCheck className="w-3 h-3" />Enseignant
        </Badge>
    );
    return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
            <GraduationCap className="w-3 h-3" />Apprenant
        </Badge>
    );
}

function StatutBadge({ statut, role }: { statut: User['statut']; role: User['role'] }) {
    const map = {
        active: { cls: 'bg-emerald-100 text-emerald-700 border-none', label: role === 'teacher' ? 'Approuvé' : 'Actif' },
        pending: { cls: 'bg-amber-100 text-amber-700 border-none', label: 'En attente' },
        rejected: { cls: 'bg-red-100 text-red-600 border-none', label: 'Rejeté' },
        inactive: { cls: 'bg-gray-100 text-gray-500 border-none', label: 'Inactif' },
    };
    const { cls, label } = map[statut] ?? map.inactive;
    return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

// ── Composant principal ────────────────────────────────────────────────────
export default function UserManagement() {
    const { token } = useAuth();

    // ── State ────────────────────────────────────────────────────────────
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'student' | 'teacher'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending' | 'rejected'>('all');

    // Modal dossier
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Modal ajouter / modifier
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [newNom, setNewNom] = useState('');
    const [newPrenom, setNewPrenom] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<User['role']>('student');
    const [isAdding, setIsAdding] = useState(false);

    // ── API ──────────────────────────────────────────────────────────────
    const authHeaders = {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
    };

    const fetchUsers = async () => {
        setIsLoading(true); setError('');
        try {
            const res = await fetch(`${API_URL}/admin/users`, { headers: authHeaders });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const list = (data.data ?? data).map((u: Record<string, unknown>) => ({
                id: u.id as number,
                nom: u.nom as string,
                prenom: u.prenom as string,
                nom_famille: u.nom_famille as string,
                email: u.email as string,
                role: u.role as User['role'],
                statut: u.statut as User['statut'],
                joinedAt: (u.created_at as string)?.split('T')[0] ?? '',
                cv_path: u.chemin_cv as string,
                motivation_path: u.chemin_motivation as string,
                cin_path: u.chemin_cin as string,
                telephone: u.telephone as string,
                poste_actuel: u.poste_actuel as string,
                institution: u.institution as string,
            }));
            setUsers(list);
        } catch {
            setError('Impossible de charger les utilisateurs.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ── Filtre ────────────────────────────────────────────────────────────
    const filtered = users.filter(u => {
        const matchSearch = u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = filterRole === 'all' || u.role === filterRole;
        const matchStatus = filterStatus === 'all' || u.statut === filterStatus;
        return matchSearch && matchRole && matchStatus && u.role !== 'super-admin';
    });

    // ── Actions ───────────────────────────────────────────────────────────
    const apiAction = async (url: string, method = 'POST') => {
        const res = await fetch(url, { method, headers: authHeaders });
        if (!res.ok) throw new Error();
    };

    const handleApprove = async (id: number) => {
        setActionLoading(id);
        try {
            await apiAction(`${API_URL}/admin/approve-user/${id}`);
            setUsers(p => p.map(u => u.id === id ? { ...u, statut: 'active' } : u));
            toast.success('Utilisateur approuvé ✅');
        } catch { toast.error('Erreur lors de l\'approbation'); }
        finally { setActionLoading(null); }
    };

    const handleReject = async (id: number) => {
        setActionLoading(id);
        try {
            await apiAction(`${API_URL}/admin/reject-user/${id}`);
            setUsers(p => p.filter(u => u.id !== id));
            toast.success('Utilisateur rejeté et supprimé');
        } catch { toast.error('Erreur lors du rejet'); }
        finally { setActionLoading(null); }
    };


    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer définitivement cet utilisateur ?')) return;
        setActionLoading(id);
        try {
            await apiAction(`${API_URL}/admin/reject-user/${id}`);
            setUsers(p => p.filter(u => u.id !== id));
            toast.success('Utilisateur supprimé');
        } catch { toast.error('Erreur lors de la suppression'); }
        finally { setActionLoading(null); }
    };

    // ── CRUD modal ────────────────────────────────────────────────────────
    const resetForm = () => { setNewNom(''); setNewPrenom(''); setNewEmail(''); setNewPassword(''); setNewRole('student'); };

    const openAdd = () => { setEditUser(null); resetForm(); setIsAddOpen(true); };
    const openEdit = (u: User) => {
        setEditUser(u);
        setNewNom(u.nom_famille || u.nom);
        setNewPrenom(u.prenom || '');
        setNewEmail(u.email);
        setNewRole(u.role);
        setNewPassword('');
        setIsAddOpen(true);
    };

    const handleSave = async () => {
        if (!newNom.trim() || !newPrenom.trim() || !newEmail.trim()) return;
        setIsAdding(true);
        const url = editUser
            ? `${API_URL}/admin/update-user/${editUser.id}`
            : `${API_URL}/admin/create-user`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { ...authHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: newNom.trim(), prenom: newPrenom.trim(),
                    email: newEmail.trim(), password: newPassword.trim() || undefined,
                    role: newRole,
                }),
            });
            if (!res.ok) { const d = await res.json(); toast.error(d.message ?? 'Erreur'); return; }
            toast.success(editUser ? 'Utilisateur mis à jour' : 'Utilisateur créé');
            setIsAddOpen(false); resetForm(); fetchUsers();
        } catch { toast.error('Erreur de connexion'); }
        finally { setIsAdding(false); }
    };

    // ── Stats ─────────────────────────────────────────────────────────────
    const nonAdmins = users.filter(u => u.role !== 'super-admin');
    const totalUsers = nonAdmins.length;
    const studentCount = users.filter(u => u.role === 'student').length;
    const teacherCount = users.filter(u => u.role === 'teacher').length;
    const pendingCount = users.filter(u => u.statut === 'pending').length;

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <Layout role="super-admin" onSearch={setSearchQuery}>
            <div className="space-y-6">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h2>
                        <p className="text-gray-500 mt-1">Gérez les apprenants et les enseignants de la plateforme</p>
                    </div>
                    <Button
                        onClick={openAdd}
                        className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 h-11 px-6 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        Ajouter un utilisateur
                    </Button>
                </div>

                {/* ── Stats ────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total', value: totalUsers, icon: Users, color: 'violet' },
                        { label: 'Apprenants', value: studentCount, icon: GraduationCap, color: 'blue' },
                        { label: 'Enseignants', value: teacherCount, icon: UserCheck, color: 'emerald' },
                        { label: 'En attente', value: pendingCount, icon: Clock, color: 'amber' },
                    ].map((s, i) => (
                        <Card key={i} className="rounded-2xl border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all group">
                            <CardContent className="p-5 relative">
                                <div className={`absolute top-0 right-0 w-16 h-16 bg-${s.color}-50 rounded-bl-full -mr-8 -mt-8`} />
                                <div className={`w-9 h-9 rounded-xl bg-${s.color}-100 flex items-center justify-center mb-3`}>
                                    <s.icon className={`w-4 h-4 text-${s.color}-600`} />
                                </div>
                                <p className="text-xs font-medium text-gray-400 mb-0.5">{s.label}</p>
                                {isLoading
                                    ? <Loader2 className="w-6 h-6 animate-spin text-gray-200" />
                                    : <p className={`text-3xl font-black text-${s.color}-600 tracking-tight`}>{s.value}</p>
                                }
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Filtres ──────────────────────────────────────────────── */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Rechercher par nom ou email…"
                            className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-violet-500 shadow-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Select value={filterRole} onValueChange={v => setFilterRole(v as typeof filterRole)}>
                            <SelectTrigger className="w-44 h-11 rounded-xl border-gray-200 shadow-sm font-medium">
                                <SelectValue placeholder="Tous les rôles" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={8} className="bg-white rounded-xl shadow-2xl z-[100]">
                                <SelectItem value="all">Tous les rôles</SelectItem>
                                <SelectItem value="student">Apprenants</SelectItem>
                                <SelectItem value="teacher">Enseignants</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as typeof filterStatus)}>
                            <SelectTrigger className="w-52 h-11 rounded-xl border-gray-200 shadow-sm font-medium">
                                <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent position="popper" sideOffset={8} className="bg-white rounded-xl shadow-2xl z-[100]">
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="active">Actifs / Approuvés</SelectItem>
                                <SelectItem value="inactive">Inactifs</SelectItem>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="rejected">Rejetés</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* ── Tableau utilisateurs ─────────────────────────────────── */}
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
                        <Button
                            size="sm" variant="outline"
                            onClick={fetchUsers} disabled={isLoading}
                            className="h-8 text-xs border-gray-200 rounded-lg"
                        >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                            Actualiser
                        </Button>
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
                                        {filtered.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                                                {/* Avatar + nom */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-bold text-violet-700">
                                                                {user.nom?.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 leading-tight">{user.nom}</p>
                                                            <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <RoleBadge role={user.role} />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <StatutBadge statut={user.statut} role={user.role} />
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-gray-400">{user.joinedAt}</span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">

                                                        {/* Dossier — visible pour teacher + student */}
                                                        <Button
                                                            size="sm" variant="outline"
                                                            className="text-violet-600 border-violet-100 hover:bg-violet-50 h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                            onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                                                        >
                                                            <FolderOpen className="w-3.5 h-3.5" /> Dossier
                                                        </Button>

                                                        {/* En attente → Accepter + Refuser */}
                                                        {user.statut === 'pending' ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                    onClick={() => handleApprove(user.id)}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    {actionLoading === user.id
                                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                        : <CheckCircle className="w-3.5 h-3.5" />}
                                                                    Accepter
                                                                </Button>
                                                                <Button
                                                                    size="sm" variant="outline"
                                                                    className="text-red-500 border-red-100 hover:bg-red-50 h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                    onClick={() => handleReject(user.id)}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    {actionLoading === user.id
                                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                        : <XCircle className="w-3.5 h-3.5" />}
                                                                    Refuser
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            /* Actif / Rejeté → Modifier + Reset */
                                                            <>
                                                                <Button
                                                                    size="sm" variant="outline"
                                                                    className="text-violet-600 border-violet-100 hover:bg-violet-50 h-8 px-3 rounded-lg gap-1.5 text-xs"
                                                                    onClick={() => openEdit(user)}
                                                                    disabled={actionLoading === user.id}
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" /> Modifier
                                                                </Button>

                                                            </>
                                                        )}

                                                        {/* Suppression */}
                                                        <Button
                                                            size="sm" variant="outline"
                                                            className="h-8 px-3 border-red-100 text-red-500 hover:bg-red-50 rounded-lg gap-1.5 text-xs"
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={actionLoading === user.id}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
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

            </div>

            {/* ══ MODAL : Ajouter / Modifier ══════════════════════════════ */}
            <Modal open={isAddOpen} onOpenChange={setIsAddOpen} size="md">
                <ModalHeader onClose={() => setIsAddOpen(false)}>
                    <span className="flex items-center gap-2">
                        {editUser
                            ? <><Edit className="w-5 h-5 text-violet-500" /> Modifier l&apos;utilisateur</>
                            : <><UserPlus className="w-5 h-5 text-violet-500" /> Ajouter un utilisateur</>}
                    </span>
                </ModalHeader>

                <ModalBody className="overflow-y-auto max-h-[70vh]">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="um-nom" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nom</Label>
                                <Input id="um-nom" placeholder="Dupont" value={newNom} onChange={e => setNewNom(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="um-prenom" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Prénom</Label>
                                <Input id="um-prenom" placeholder="Jean" value={newPrenom} onChange={e => setNewPrenom(e.target.value)} className="rounded-xl" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="um-email" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Adresse e-mail</Label>
                            <Input id="um-email" type="email" placeholder="jean.dupont@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="rounded-xl" />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="um-password" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                {editUser ? 'Nouveau mot de passe (laisser vide pour conserver)' : 'Mot de passe'}
                            </Label>
                            <Input id="um-password" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-xl" />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Rôle</Label>
                            <Select value={newRole} onValueChange={v => setNewRole(v as User['role'])}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={8} className="z-[200] rounded-xl">
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
                        onClick={handleSave}
                        disabled={!newNom.trim() || !newPrenom.trim() || !newEmail.trim() || (!editUser && !newPassword.trim()) || isAdding}
                        className="bg-violet-600 hover:bg-violet-700 shadow-violet-200"
                    >
                        {isAdding
                            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{editUser ? 'Mise à jour…' : 'Création…'}</>
                            : (editUser ? 'Mettre à jour' : 'Ajouter')}
                    </ModalConfirmButton>
                </ModalFooter>
            </Modal>

            {/* ══ MODAL : Dossier utilisateur ═════════════════════════════ */}
            <Modal open={isDetailsOpen} onOpenChange={setIsDetailsOpen} size="lg">
                <ModalHeader onClose={() => setIsDetailsOpen(false)}>
                    <span className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-violet-500" />
                        Dossier — {selectedUser?.nom}
                    </span>
                </ModalHeader>

                <ModalBody className="overflow-y-auto max-h-[75vh] space-y-6">
                    {selectedUser && (
                        <>
                            {/* ── Avatar + identité ─────────────────────────────── */}
                            <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100">
                                <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-200">
                                    <span className="text-2xl font-black text-white">
                                        {selectedUser.nom?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.nom}</h3>
                                    <p className="text-sm text-gray-500 truncate">{selectedUser.email}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <RoleBadge role={selectedUser.role} />
                                        <StatutBadge statut={selectedUser.statut} role={selectedUser.role} />
                                        <span className="text-xs text-gray-400">Inscrit le {selectedUser.joinedAt}</span>
                                    </div>
                                </div>

                                {/* Actions rapides depuis la modal */}
                                {selectedUser.statut === 'pending' && (
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 text-xs rounded-xl"
                                            onClick={() => { handleApprove(selectedUser.id); setIsDetailsOpen(false); }}
                                            disabled={actionLoading === selectedUser.id}
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Approuver
                                        </Button>
                                        <Button
                                            size="sm" variant="outline"
                                            className="text-red-500 border-red-200 hover:bg-red-50 gap-1.5 text-xs rounded-xl"
                                            onClick={() => { handleReject(selectedUser.id); setIsDetailsOpen(false); }}
                                            disabled={actionLoading === selectedUser.id}
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Refuser
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* ── Informations du profil ────────────────────────── */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Informations du profil</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { label: 'Téléphone', value: selectedUser.telephone, icon: Smartphone },
                                        { label: 'Institution', value: selectedUser.institution, icon: Building },
                                        { label: 'Poste actuel', value: selectedUser.poste_actuel, icon: Briefcase },
                                    ].map((info, i) => (
                                        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <info.icon className="w-4 h-4 text-violet-400" />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{info.label}</span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {info.value || <span className="text-gray-400 font-normal italic">Non renseigné</span>}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Pièces justificatives ─────────────────────────── */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Pièces justificatives</h4>

                                {!selectedUser.cv_path && !selectedUser.motivation_path && !selectedUser.cin_path ? (
                                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                                        <FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400 italic">Aucun document fourni pour ce compte.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {[
                                            { path: selectedUser.cv_path, label: 'Curriculum Vitae', icon: FileText, color: 'violet' },
                                            { path: selectedUser.motivation_path, label: 'Lettre de motivation', icon: FileText, color: 'blue' },
                                            { path: selectedUser.cin_path, label: "Pièce d'identité", icon: ShieldCheck, color: 'emerald' },
                                        ].filter(d => !!d.path).map((doc, i) => (
                                            <a
                                                key={i}
                                                href={`${STORAGE_URL}/${doc.path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:bg-${doc.color}-50 hover:border-${doc.color}-200 transition-all group`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl bg-${doc.color}-100 flex items-center justify-center flex-shrink-0`}>
                                                    <doc.icon className={`w-5 h-5 text-${doc.color}-500`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
                                                    <p className="text-xs text-gray-400">Cliquez pour ouvrir</p>
                                                </div>
                                                <Download className={`w-4 h-4 text-${doc.color}-400 opacity-0 group-hover:opacity-100 transition-opacity`} />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </ModalBody>

                <ModalFooter>
                    <ModalCancelButton onClick={() => setIsDetailsOpen(false)}>
                        Fermer
                    </ModalCancelButton>
                    {selectedUser && selectedUser.statut === 'active' && (
                        <Button
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4"
                            onClick={() => { openEdit(selectedUser); setIsDetailsOpen(false); }}
                        >
                            <Edit className="w-4 h-4 mr-2" /> Modifier le profil
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </Layout>
    );
}