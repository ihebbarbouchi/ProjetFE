'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, BookOpen, Clock, Play, Download, User } from 'lucide-react';

export default function ResourceDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const pathname = usePathname() || '';
  const role: 'super-admin' | 'teacher' | 'student' = 
    pathname.includes('super-admin') ? 'super-admin' : 
    pathname.includes('teacher') ? 'teacher' : 'student';

  return (
    <Layout role={role}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Retour aux ressources
        </Button>
        <Card className="overflow-hidden">
          <div className="h-64 bg-gray-200 relative">
            <img 
              src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop" 
              alt="Resource Cover" 
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Badge className="bg-blue-100 text-blue-700 mb-4">Course</Badge>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Détails de la ressource {id}</h1>
                <p className="text-gray-600 text-lg">
                  Learn Python from scratch with hands-on examples and projects.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-100 mb-6">
              <div className="space-y-1">
                 <p className="text-sm text-gray-500">Enseignant</p>
                 <p className="font-medium flex items-center gap-2"><User className="w-4 h-4 text-blue-600"/> Sarah Johnson</p>
              </div>
              <div className="space-y-1">
                 <p className="text-sm text-gray-500">Catégorie</p>
                 <p className="font-medium flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600"/> Programming</p>
              </div>
              <div className="space-y-1">
                 <p className="text-sm text-gray-500">Durée</p>
                 <p className="font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-blue-600"/> 8 hours</p>
              </div>
              <div className="space-y-1">
                 <p className="text-sm text-gray-500">Inscrits</p>
                 <p className="font-medium">234 étudiants</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 flex-1 h-12 text-lg">
                <Play className="w-5 h-5 mr-2" /> Start Course
              </Button>
              <Button variant="outline" className="flex-1 h-12 text-lg">
                <Download className="w-5 h-5 mr-2" /> Download Materials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
