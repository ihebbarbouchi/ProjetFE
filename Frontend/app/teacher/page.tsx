'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BookOpen, FileText, HelpCircle, Users, PlusCircle, Edit, Trash2, Eye, GraduationCap, AlertCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const stats = [
    { title: 'Mes ressources', value: '0', icon: BookOpen, color: 'emerald' },
    { title: 'Total apprenants', value: '0', icon: Users, color: 'emerald' },
    { title: 'Cours', value: '0', icon: FileText, color: 'emerald' },
    { title: 'Quiz', value: '0', icon: HelpCircle, color: 'emerald' },
  ];

  const myResources: { id: number; title: string; type: string; category: string; students: number; status: string }[] = [];
  const quizResults: { id: number; quiz: string; student: string; score: number; date: string; status: string }[] = [];
  const studentAccess: { id: number; name: string; email: string; courses: number; lastActive: string }[] = [];

  return (
    <Layout role="teacher">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Tableau de bord — {user?.prenom || 'Enseignant'}</h2>
            <p className="text-gray-600 mt-1">Gerez vos ressources et suivez la progression de vos apprenants</p>
          </div>
          <Button
            onClick={() => router.push('/add-resource')}
            className="bg-emerald-600 hover:bg-emerald-700"

          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajouter une ressource
          </Button>
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

        {/* My Resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes ressources</CardTitle>
                <CardDescription>Gerez vos cours, documents et quiz</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/teacher/resources')}>
                  Voir tout
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/add-resource')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {myResources.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucune ressource pour l&apos;instant</p>
                <p className="text-sm text-gray-400 mb-4">Créez votre premier cours, document ou quiz</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push('/add-resource')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Ajouter ma première ressource
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Étudiants</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.title}</TableCell>
                      <TableCell><Badge variant="outline">{resource.type}</Badge></TableCell>
                      <TableCell>{resource.category}</TableCell>
                      <TableCell>{resource.students}</TableCell>
                      <TableCell>
                        <Badge variant={resource.status === 'Published' ? 'default' : 'secondary'}>
                          {resource.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-emerald-700 hover:text-emerald-800">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* My Students */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes apprenants</CardTitle>
                <CardDescription>Apprenants inscrits à vos ressources</CardDescription>
              </div>
              <Button variant="outline" onClick={() => router.push('/teacher/students')}>
                <GraduationCap className="w-4 h-4 mr-2" />
                Voir tous les apprenants
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {studentAccess.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun apprenant pour l&apos;instant</p>
                <p className="text-sm text-gray-400">Les apprenants apparaîtront ici dès leur inscription à vos cours</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cours inscrits</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAccess.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.courses}</TableCell>
                      <TableCell>{student.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">Voir la progression</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quiz Results */}
        <Card>
          <CardHeader>
            <CardTitle>Résultats récents des quiz</CardTitle>
            <CardDescription>Suivez les performances de vos étudiants</CardDescription>
          </CardHeader>
          <CardContent>
            {quizResults.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun résultat de quiz pour l&apos;instant</p>
                <p className="text-sm text-gray-400">Les résultats apparaîtront ici une fois que vos étudiants auront complété les quiz</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizResults.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-medium">{result.quiz}</TableCell>
                      <TableCell>{result.student}</TableCell>
                      <TableCell>
                        <span className={result.score >= 70 ? 'text-emerald-600 font-semibold' : 'text-emerald-800 font-semibold opacity-70'}>
                          {result.score}%
                        </span>
                      </TableCell>
                      <TableCell>{result.date}</TableCell>
                      <TableCell>
                        <Badge className={result.status === 'Passed' ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-emerald-50 text-emerald-600 border-none'}>
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">Voir les détails</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
