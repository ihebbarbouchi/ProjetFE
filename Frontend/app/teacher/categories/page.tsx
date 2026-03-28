'use client';

import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
    const role: 'super-admin' | 'teacher' | 'student' = 'teacher';
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);

    const filtered = categories.filter(
        (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalResources = categories.reduce((s, c) => s + c.resources, 0);
    const totalStudents = categories.reduce((s, c) => s + c.students, 0);

    const handleAdd = () => {
        if (!newName.trim()) return;
        const newCat: Category = {
            id: Date.now(),
            name: newName.trim(),
            description: newDescription.trim() || 'No description provided',
            icon: FolderOpen,
            resources: 0,
            students: 0,
            color: 'gray',
        };
        setCategories((prev) => [...prev, newCat]);
        setNewName('');
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
                            Manage categories for your teaching resources
                        </p>
                    </div>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </Button>
                </div>

                {/* Modal Ajouter */}
                <Modal open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <ModalHeader onClose={() => setIsAddOpen(false)}>
                        Add New Category
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="add-cat-name">Category Name</Label>
                                <Input
                                    id="add-cat-name"
                                    placeholder="e.g., Programming, Mathematics"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-cat-desc">Description</Label>
                                <Input
                                    id="add-cat-desc"
                                    placeholder="Brief description of this category"
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
                            disabled={!newName.trim()}
                        >
                            Create Category
                        </ModalConfirmButton>
                    </ModalFooter>
                </Modal>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-emerald-600">{categories.length}</p>
                            <p className="text-sm text-gray-600 mt-1">Total Categories</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">{totalResources}</p>
                            <p className="text-sm text-gray-600 mt-1">Total Resources</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-purple-600">{totalStudents}</p>
                            <p className="text-sm text-gray-600 mt-1">Total Students</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 text-center">
                            <p className="text-3xl font-bold text-orange-600">{filtered.length}</p>
                            <p className="text-sm text-gray-600 mt-1">Showing</p>
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
                            Categories available for your resources
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
                                                Edit Category
                                            </ModalHeader>
                                            <ModalBody>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-cat-name">Category Name</Label>
                                                        <Input
                                                            id="edit-cat-name"
                                                            value={newName}
                                                            onChange={(e) => setNewName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="edit-cat-desc">Description</Label>
                                                        <Input
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
                                                    Save Changes
                                                </ModalConfirmButton>
                                            </ModalFooter>
                                        </Modal>
                                    </>


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
        </Layout>
    );
}
