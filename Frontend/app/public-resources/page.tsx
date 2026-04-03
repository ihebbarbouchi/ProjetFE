'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '../components/PublicLayout';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, BookOpen, FileText, HelpCircle, Loader2 } from 'lucide-react';

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
}

export default function PublicResources() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [titleFilter, setTitleFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Fetch real resources from database
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const url = `${API_URL}/public/resources`;
        console.log('[PublicResources] Fetching from:', url);
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json' },
        });
        console.log('[PublicResources] Response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('[PublicResources] Data received:', data.length, 'resources');
          setResources(data);
        } else {
          const errText = await res.text();
          console.error('[PublicResources] Non-ok response:', errText);
          setFetchError(`Erreur serveur (${res.status})`);
        }
      } catch (error) {
        console.error('[PublicResources] Fetch error:', error);
        setFetchError('Impossible de charger les ressources. Vérifiez que le serveur est bien démarré.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  // Filter resources based on user input
  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTitle = titleFilter === 'all' || res.titre === titleFilter;
    
    let matchesLevel = levelFilter === 'all';
    if (!matchesLevel && res.category?.level?.nom) {
        matchesLevel = res.category.level.nom === levelFilter;
    }
    
    return matchesSearch && matchesTitle && matchesLevel;
  });

  const resourceTitles = Array.from(new Set(resources.map(r => r.titre).filter(Boolean))) as string[];
  const levels = Array.from(new Set(resources.map(r => r.category?.level?.nom).filter(Boolean))) as string[];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Cours':
        return BookOpen;
      case 'Document':
        return FileText;
      case 'Quiz':
        return HelpCircle;
      default:
        return BookOpen;
    }
  };

  const getLevelColor = (level: string | null | undefined) => {
    if (!level) return 'bg-gray-100 text-gray-700';
    const l = level.toLowerCase();
    if (l.includes('débutant')) return 'bg-green-100 text-green-700';
    if (l.includes('inter')) return 'bg-blue-100 text-blue-700';
    if (l.includes('avan')) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <PublicLayout>
      {/* Section Héro - Design Contact conservé pour la cohérence */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ressources
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Explorez notre collection de ressources éducatives incluant des cours, des documents et des quiz pour approfondir vos connaissances.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section de filtrage (Ancienne version : Selects dans une Card) */}
          <Card className="mb-8 shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recherche */}
                <div className="md:col-span-1">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Rechercher</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Mots-clés..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtre par ressource (titre de la ressource) */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Ressources</label>
                  <Select value={titleFilter} onValueChange={setTitleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les ressources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les ressources</SelectItem>
                      {resourceTitles.map((title: string) => (
                        <SelectItem key={title} value={title}>{title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtre par niveau */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Niveau</label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les niveaux" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les niveaux</SelectItem>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Résultats */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">
              Affichage de {filteredResources.length} ressource(s)
            </p>
          </div>

          {/* Grille des ressources (Design Classique) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
               <div className="col-span-full flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
               </div>
            ) : filteredResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none px-2 py-0.5 text-[11px] font-bold">
                          {resource.type || 'Document'}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                      {resource.titre}
                    </h3>

                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                      {resource.description || "Pas de description disponible."}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <Badge className={`${getLevelColor(resource.category?.level?.nom)} border-none text-[10px] font-bold`}>
                        {resource.category?.level?.nom || 'Intermédiaire'}
                      </Badge>
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{resource.category?.code || 'Académique'}</span>
                    </div>

                    <Button 
                      className="w-full mt-6 h-10 border border-gray-200 bg-white text-sm font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors"
                      variant="outline"
                      onClick={() => router.push(`/resources/${resource.id}`)}
                    >
                      Voir les détails
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Error State */}
          {fetchError && (
            <div className="col-span-full text-center py-16 bg-red-50 rounded-xl border border-red-100">
              <p className="text-red-600 font-medium">{fetchError}</p>
              <p className="text-sm text-red-400 mt-1">URL: {API_URL}/public/resources</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !fetchError && filteredResources.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">Aucune ressource trouvée correspondant à vos critères.</p>
              <Button
                variant="link"
                className="mt-2 text-blue-600"
                onClick={() => {
                  setSearchQuery('');
                  setTitleFilter('all');
                  setLevelFilter('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
