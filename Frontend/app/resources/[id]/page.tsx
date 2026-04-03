'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicLayout } from '../../components/PublicLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  Calendar, 
  User, 
  BookOpen, 
  Loader2,
  AlertCircle
} from 'lucide-react';

const API_URL = 'http://localhost:8000/api';
const STORAGE_URL = 'http://localhost:8000/storage';

interface Resource {
  id: number;
  titre: string;
  description: string | null;
  type: string;
  chemin_fichier: string;
  created_at: string;
  category?: { 
    code: string; 
    discipline?: { nom: string };
    level?: { nom: string };
  };
  user?: {
    nom: string;
    prenom: string;
  };
}

export default function ResourceDetails() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResourceDetails = async () => {
      try {
        // Since there's no direct public/resources/{id} we might need to fetch all and find it
        // Or if the backend has show method, use it.
        // Let's assume a standard show method or we filter from index.
        const res = await fetch(`${API_URL}/public/resources`);
        if (res.ok) {
          const data: Resource[] = await res.json();
          const target = data.find(r => r.id.toString() === params.id);
          if (target) {
            setResource(target);
          } else {
            setError("Ressource non trouvée.");
          }
        } else {
          setError("Erreur lors de la récupération des détails.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Erreur de connexion au serveur.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchResourceDetails();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Chargement des détails...</p>
        </div>
      </PublicLayout>
    );
  }

  if (error || !resource) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-20">
          <Card className="border-red-100 bg-red-50/50">
            <CardContent className="p-8 text-center flex flex-col items-center">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">{error || "Ressource introuvable"}</h2>
              <p className="text-red-600/70 mb-8 max-w-md">La ressource que vous recherchez n'est plus disponible ou l'adresse est incorrecte.</p>
              <Button 
                onClick={() => router.push('/public-resources')}
                className="bg-red-600 hover:bg-red-700 text-white border-none px-8"
              >
                Retour aux ressources
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6 -ml-2 text-gray-500 hover:text-blue-600 flex items-center group font-semibold"
            onClick={() => router.push('/public-resources')}
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Retour à la bibliothèque
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 text-xs">
                  {resource.type}
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase">
                  {resource.category?.code || 'Académique'}
                </Badge>
                <Badge variant="outline" className="text-gray-500 border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold uppercase">
                   {resource.category?.level?.nom || 'Tous niveaux'}
                </Badge>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {resource.titre}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  Pr. {resource.user?.prenom} {resource.user?.nom}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(resource.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            
            <Button 
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-blue-200"
            >
              <a href={`${STORAGE_URL}/${resource.chemin_fichier}`} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le document
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="py-12 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm overflow-hidden rounded-2xl bg-white">
              <CardContent className="p-10 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-3 text-blue-600" />
                    Description du document
                  </h2>
                  <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-lg">
                    {resource.description || "Aucune description détaillée fournie pour ce document."}
                  </div>
                </div>
                
                <div className="pt-8 border-t border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-blue-600" />
                    Détails Techniques
                  </h2>
                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Format de fichier</p>
                      <p className="text-sm font-semibold text-gray-700">Document PDF</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Discipline</p>
                      <p className="text-sm font-semibold text-gray-700">{resource.category?.discipline?.nom || 'Général'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Visibilité</p>
                      <p className="text-sm font-semibold text-emerald-600">Libre / Public</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Langue</p>
                      <p className="text-sm font-semibold text-gray-700">Français / Anglais</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Quick Links */}
          <div className="space-y-6">
            <Card className="border-none bg-blue-600 shadow-xl shadow-blue-100 rounded-2xl overflow-hidden text-white">
              <CardContent className="p-8 space-y-6 relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full blur-2xl"></div>
                 <h2 className="text-xl font-bold">Actions rapides</h2>
                 <p className="text-sm text-blue-100 leading-relaxed">
                   Vous pouvez consulter ce document en ligne ou le télécharger sur votre appareil pour une lecture hors-ligne.
                 </p>
                 <div className="space-y-3 pt-4">
                    <Button 
                      asChild 
                      variant="secondary" 
                      className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold h-11 border-none shadow-sm rounded-xl"
                    >
                      <a href={`${STORAGE_URL}/${resource.chemin_fichier}`} target="_blank" rel="noopener noreferrer">
                         Lire le document
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-400 text-white hover:bg-blue-500 font-semibold h-11 rounded-xl"
                      onClick={() => window.print()}
                    >
                       Imprimer (Générer PDF)
                    </Button>
                 </div>
              </CardContent>
            </Card>

            <div className="bg-gray-100/50 p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">Besoin d'aide ?</p>
              <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                 "La connaissance est la seule chose qui s'accroît quand on la partage."
              </p>
            </div>
          </div>

        </div>
      </section>
    </PublicLayout>
  );
}
