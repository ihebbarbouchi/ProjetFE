'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { BookOpen, FileText, HelpCircle, PlusCircle, Edit, Trash2, Eye, Users, Clock } from 'lucide-react';

export default function TeacherResources() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Teacher's own resources
    const myResources: {
        id: number;
        title: string;
        description: string;
        type: string;
        category: string;
        students: number;
        duration: string;
        status: string;
        createdAt: string;
        lastUpdated: string;
    }[] = [];

    const filteredResources = myResources.filter((resource) => {
        const matchesSearch =
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || resource.type === filterType;
        const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
        return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Course':
                return BookOpen;
            case 'Document':
                return FileText;
            case 'Quiz':
                return HelpCircle;
            default:
                return BookOpen;
        }
    };

    const totalStudents = myResources.reduce((sum, r) => sum + r.students, 0);
    const publishedCount = myResources.filter((r) => r.status === 'Published').length;
    const draftCount = myResources.filter((r) => r.status === 'Draft').length;

    return (
        <Layout role="teacher" onSearch={handleSearch}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">My Resources</h2>
                        <p className="text-gray-600 mt-1">Manage your courses, documents, and quizzes</p>
                    </div>
                    <Button onClick={() => router.push('/add-resource')} className="bg-emerald-600 hover:bg-emerald-700">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Resource
                    </Button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Resources</p>
                                <p className="text-xl font-bold text-gray-900">{myResources.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Published</p>
                                <p className="text-xl font-bold text-gray-900">{publishedCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Edit className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Drafts</p>
                                <p className="text-xl font-bold text-gray-900">{draftCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-xl font-bold text-gray-900">{totalStudents}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Type</label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="Course">Courses</SelectItem>
                                        <SelectItem value="Document">Documents</SelectItem>
                                        <SelectItem value="Quiz">Quizzes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Category</label>
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="Programming">Programming</SelectItem>
                                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                                        <SelectItem value="Science">Science</SelectItem>
                                        <SelectItem value="Data Science">Data Science</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Status</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="Published">Published</SelectItem>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setFilterType('all');
                                        setFilterCategory('all');
                                        setFilterStatus('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results count */}
                <div className="text-sm text-gray-600">
                    Showing {filteredResources.length} of {myResources.length} resources
                </div>

                {/* Resources Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredResources.map((resource) => {
                                    const TypeIcon = getTypeIcon(resource.type);
                                    return (
                                        <TableRow key={resource.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center">
                                                        <TypeIcon className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{resource.title}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{resource.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{resource.type}</Badge>
                                            </TableCell>
                                            <TableCell>{resource.category}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3 text-gray-400" />
                                                    {resource.students}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={resource.status === 'Published' ? 'default' : 'secondary'}>
                                                    {resource.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {resource.lastUpdated}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button size="sm" variant="ghost" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No resources found matching your criteria.</p>
                        <Button onClick={() => router.push('/add-resource')} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Create Your First Resource
                        </Button>
                    </div>
                )}
            </div>
        </Layout>
    );
}
