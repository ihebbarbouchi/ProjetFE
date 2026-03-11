'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { BookOpen, Award, TrendingUp, Clock, Play, AlertCircle, XCircle } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const stats = [
    { title: 'Cours inscrits', value: '0', icon: BookOpen, color: 'blue' },
    { title: 'Complétés', value: '0', icon: Award, color: 'green' },
    { title: 'En cours', value: '0', icon: TrendingUp, color: 'orange' },
    { title: 'Heures apprises', value: '0', icon: Clock, color: 'purple' },
  ];

  const enrolledCourses: { id: number; title: string; teacher: string; category: string; progress: number; image: string }[] = [];

  const recentQuizResults: { id: number; quiz: string; course: string; score: number; date: string }[] = [];

  const recommendedCourses: { id: number; title: string; teacher: string; category: string; students: number; image: string }[] = [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <Layout role="student" onSearch={handleSearch}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Bienvenue, {user?.prenom || 'Apprenant'}!</h2>
          <p className="text-gray-600 mt-1">Continuez votre parcours d&apos;apprentissage</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enrolled Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Mes cours</h3>
            <Button variant="outline" onClick={() => router.push('/resources')}>
              Voir tout
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-200 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <Badge className="mb-2">{course.category}</Badge>
                  <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">by {course.teacher}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-blue-600">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    <Play className="w-4 h-4 mr-2" />
                    Continuer l&apos;apprentissage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quiz Results */}
        <Card>
          <CardHeader>
            <CardTitle>Résultats récents des quiz</CardTitle>
            <CardDescription>Vos performances aux derniers quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuizResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{result.quiz}</h4>
                    <p className="text-sm text-gray-600">{result.course}</p>
                    <p className="text-xs text-gray-500 mt-1">{result.date}</p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${result.score >= 70 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                      {result.score}%
                    </div>
                    <Badge variant={result.score >= 70 ? 'default' : 'destructive'}>
                      {result.score >= 70 ? 'Réussi' : 'Échoué'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Recommandé pour vous</h3>
            <Button variant="outline" onClick={() => router.push('/student/categories')}>
              Parcourir les catégories
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-200 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <Badge className="mb-2">{course.category}</Badge>
                  <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">by {course.teacher}</p>
                  <p className="text-xs text-gray-500 mb-3">{course.students} students enrolled</p>
                  <Button variant="outline" className="w-full">
                    S&apos;inscrire maintenant
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
