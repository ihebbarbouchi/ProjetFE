'use client';

import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCancelButton,
    ModalConfirmButton,
} from '../../components/ui/modal';
import {
    Code,
    Calculator,
    FlaskConical,
    Languages,
    Palette,
    Music,
    BookOpen,
    Briefcase,
    Pencil,
    Trash2,
    Plus,
    FolderOpen,
    Users,
    Search,
} from 'lucide-react';



interface Category {
    id: number;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    resources: number;
    students: number;
    color: string;
}

export default function AdminCategories() {
    const role = 'super-admin';
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newType, setNewType] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const [categories, setCategories] = useState<Category[]>([
        {
            id: 1,
            name: 'Programming',
            description: 'Learn coding and software development',
            icon: Code,
            resources: 45,
            students: 234,
            color: 'blue',
        },

    ]);

    const filtered = categories.filter(
        (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalResources = categories.reduce((s, c) => s + c.resources, 0);
    const totalStudents = categories.reduce((s, c) => s + c.students, 0);

    const handleAdd = () => {
        if (!newName.trim() || !newCode.trim()) return;
        const newCat: Category = {
            id: Date.now(),
            name: newName.trim(),
            description: newDescription.trim() || 'No description provided',
            icon: FolderOpen,
            resources: 0,
            students: 0,
            color: 'gray',
        };
        // Note: Ici on simule l'ajout local. Si vous avez une API, incluez code et type dans l'appel.
        setCategories((prev) => [...prev, newCat]);
        setNewName('');
        setNewCode('');
        setNewType('');
        setNewDescription('');
        setIsAddOpen(false);
    };

    const handleEdit = () => {
        if (!editCategory || !newName.trim()) return;
        setCategories((prev) =>
            prev.map((c) =>
                c.id === editCategory.id
                    ? { ...c, name: newName.trim(), description: newDescription.trim() || c.description }
                    : c
            )
        );
        setEditCategory(null);
        setNewName('');
        setNewDescription('');
    };

    const handleDelete = (id: number) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    const openEdit = (cat: Category) => {
        setEditCategory(cat);
        setNewName(cat.name);
        setNewDescription(cat.description);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <Layout role={role} onSearch={handleSearch}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Category Management</h2>
                        <p className="text-gray-600 mt-1">
                            {role === 'super-admin'
                                ? 'Create, edit, and manage all resource categories'
                                : 'Manage categories for your teaching resources'}
                        </p>
                    </div>
                    <Button
                        className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all hover:scale-[1.02] active:scale-95 px-6 h-12 rounded-2xl flex items-center gap-2 font-bold"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle Catégorie
                    </Button>
                </div>

                {/* Modal Ajouter */}
                <Modal open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <ModalHeader onClose={() => setIsAddOpen(false)}>
                        Ajouter une catégorie
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-cat-name">Nom de la catégorie</Label>
                                <Input
                                    id="add-cat-name"
                                    placeholder="Ex : Programmation, Mathématiques"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-cat-code">Code identification</Label>
                                <Input
                                    id="add-cat-code"
                                    placeholder="Ex : PROG, MATH"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-cat-type">Type de ressources</Label>
                                <Input
                                    id="add-cat-type"
                                    placeholder="Ex : Cours, Exercices, TP"
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-cat-desc">Description détaillée</Label>
                                <Textarea
                                    id="add-cat-desc"
                                    placeholder="Brève description de la catégorie"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <ModalCancelButton onClick={() => setIsAddOpen(false)} />
                        <ModalConfirmButton
                            onClick={handleAdd}
                            disabled={!newName.trim() || !newCode.trim()}
                        >
                            <Plus className="w-4 h-4 mr-1 inline-block" />
                            Créer la catégorie
                        </ModalConfirmButton>
                    </ModalFooter>
                </Modal>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-6 text-center relative">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-violet-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-violet-100 transition-colors" />
                            <p className="text-4xl font-black text-violet-600 tracking-tight group-hover:scale-110 transition-transform">{categories.length}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Catégories</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-6 text-center relative">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-emerald-100 transition-colors" />
                            <p className="text-4xl font-black text-emerald-600 tracking-tight group-hover:scale-110 transition-transform">{totalResources}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Ressources</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-6 text-center relative">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-indigo-100 transition-colors" />
                            <p className="text-4xl font-black text-indigo-600 tracking-tight group-hover:scale-110 transition-transform">{totalStudents}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Étudiants</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-6 text-center relative">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-amber-100 transition-colors" />
                            <p className="text-4xl font-black text-amber-600 tracking-tight group-hover:scale-110 transition-transform">{filtered.length}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Résultats</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search categories..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Categories Table / Cards */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Categories</CardTitle>
                        <CardDescription>
                            {role === 'super-admin'
                                ? 'Manage all platform categories'
                                : 'Categories available for your resources'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filtered.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    {/* Icon + Info */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div
                                            className={`w-10 h-10 rounded-full bg-${category.color}-100 flex items-center justify-center flex-shrink-0`}
                                        >
                                            <category.icon className={`w-5 h-5 text-${category.color}-600`} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                            <p className="text-sm text-gray-500 truncate">{category.description}</p>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex items-center gap-4 mx-4 flex-shrink-0">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <BookOpen className="w-4 h-4 text-blue-500" />
                                            <span>{category.resources} resources</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Users className="w-4 h-4 text-green-500" />
                                            <span>{category.students} students</span>
                                        </div>
                                        <Badge variant="secondary">{category.resources}</Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                                                onClick={() => openEdit(category)}
                                            >
                                                <Pencil className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Modal
                                                open={editCategory?.id === category.id}
                                                onOpenChange={(open) => {
                                                    if (!open) {
                                                        setEditCategory(null);
                                                        setNewName('');
                                                        setNewDescription('');
                                                    }
                                                }}
                                            >
                                                <ModalHeader onClose={() => { setEditCategory(null); setNewName(''); setNewDescription(''); }}>
                                                    Modifier la catégorie
                                                </ModalHeader>
                                                <ModalBody>
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-cat-name">Nom de la catégorie</Label>
                                                            <Input
                                                                id="edit-cat-name"
                                                                value={newName}
                                                                onChange={(e) => setNewName(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="edit-cat-desc">Description détaillée</Label>
                                                            <Textarea
                                                                id="edit-cat-desc"
                                                                value={newDescription}
                                                                onChange={(e) => setNewDescription(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </ModalBody>
                                                <ModalFooter>
                                                    <ModalCancelButton onClick={() => { setEditCategory(null); setNewName(''); setNewDescription(''); }} />
                                                    <ModalConfirmButton
                                                        onClick={handleEdit}
                                                        disabled={!newName.trim()}
                                                    >
                                                        Enregistrer
                                                    </ModalConfirmButton>
                                                </ModalFooter>
                                            </Modal>
                                        </>

                                        {role === 'super-admin' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {filtered.length === 0 && (
                                <div className="text-center py-12">
                                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No categories found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout >
    );
}
