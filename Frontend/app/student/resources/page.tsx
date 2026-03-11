'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { BookOpen, FileText, HelpCircle, Play, Download, User, Clock } from 'lucide-react';

export default function StudentResources() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    // All available resources for students (mock data)
    const resources: {
        id: number;
        title: string;
        description: string;
        type: string;
        category: string;
        teacher: string;
        students: number;
        duration: string;
        status: string;
        image: string;
    }[] = [];


    const filteredResources = resources.filter((resource) => {
        const matchesSearch =
            resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || resource.type === filterType;
        const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
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

    return (
        <Layout role="student" onSearch={handleSearch}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Resources</h2>
                        <p className="text-gray-600 mt-1">Browse and access learning materials</p>
                    </div>
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
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setFilterType('all');
                                        setFilterCategory('all');
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
                    Showing {filteredResources.length} of {resources.length} resources
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => {
                        const TypeIcon = getTypeIcon(resource.type);
                        return (
                            <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                                <div className="h-48 bg-gray-200 overflow-hidden relative">
                                    <img
                                        src={resource.image}
                                        alt={resource.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <Badge className="bg-white text-gray-900">
                                            <TypeIcon className="w-3 h-3 mr-1" />
                                            {resource.type}
                                        </Badge>
                                    </div>
                                    <div className="absolute top-3 right-3">
                                        <Badge variant="secondary">{resource.category}</Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">{resource.title}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <User className="w-4 h-4 mr-2" />
                                            {resource.teacher}
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {resource.duration}
                                            </div>
                                            <div>{resource.students} students</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {resource.type === 'Quiz' ? (
                                            <Button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                onClick={() => router.push(`/quiz/${resource.id}`)}
                                            >
                                                <Play className="w-4 h-4 mr-2" />
                                                Take Quiz
                                            </Button>
                                        ) : resource.type === 'Document' ? (
                                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        ) : (
                                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Course
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No resources found matching your criteria.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
