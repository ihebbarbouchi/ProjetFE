'use client';

import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';
import { Users, GraduationCap, TrendingUp, Award, Search, Eye } from 'lucide-react';

interface Student {
    id: number;
    name: string;
    email: string;
    enrolledCourses: number;
    completedCourses: number;
    avgProgress: number;
    avgScore: number;
    lastActive: string;
    status: 'active' | 'inactive';
}

export default function TeacherStudents() {
    const [searchQuery, setSearchQuery] = useState('');

    const students: Student[] = [];

    const handleSearch = (query: string) => setSearchQuery(query);

    const filtered = students.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'active').length;
    const avgProgress =
        students.length > 0
            ? Math.round(students.reduce((sum, s) => sum + s.avgProgress, 0) / students.length)
            : 0;
    const avgScore =
        students.length > 0
            ? Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length)
            : 0;

    return (
        <Layout role="teacher" onSearch={handleSearch}>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">My Students</h2>
                    <p className="text-gray-600 mt-1">Track enrollment and progress of your students</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-xl font-bold text-gray-900">{totalStudents}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-xl font-bold text-gray-900">{activeStudents}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg. Progress</p>
                                <p className="text-xl font-bold text-gray-900">{avgProgress}%</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center">
                                <Award className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg. Score</p>
                                <p className="text-xl font-bold text-gray-900">{avgScore}%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search students..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Student List</CardTitle>
                        <CardDescription>{filtered.length} student{filtered.length !== 1 ? 's' : ''} enrolled in your courses</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Enrolled Courses</TableHead>
                                    <TableHead>Avg. Progress</TableHead>
                                    <TableHead>Avg. Score</TableHead>
                                    <TableHead>Last Active</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-gray-900">{student.name}</p>
                                                <p className="text-xs text-gray-500">{student.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold">{student.enrolledCourses}</span>
                                            <span className="text-gray-500 text-sm"> ({student.completedCourses} completed)</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-32 space-y-1">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>{student.avgProgress}%</span>
                                                </div>
                                                <Progress value={student.avgProgress} className="h-1.5" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-semibold ${student.avgScore >= 70 ? 'text-emerald-600' : 'text-emerald-800 opacity-80'}`}>
                                                {student.avgScore}%
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">{student.lastActive}</TableCell>
                                        <TableCell>
                                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                {student.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline">
                                                <Eye className="w-4 h-4 mr-1" /> View Progress
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {filtered.length === 0 && (
                            <div className="text-center py-16">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No students enrolled yet</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Students will appear here once they enroll in your courses
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
