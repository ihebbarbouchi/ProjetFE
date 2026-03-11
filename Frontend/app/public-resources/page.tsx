'use client';

import { useState } from 'react';
import { PublicLayout } from '../components/PublicLayout';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, BookOpen, FileText, HelpCircle } from 'lucide-react';

export default function PublicResources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Un seul exemple de ressource (version classique)
  const resources = [
    {
      id: 1,
      title: 'Guide complet du responsive design avec Flexbox and Grid',
      type: 'Document',
      category: 'Design Académique',
      level: 'Intermédiaire',
      description: 'Découvrez comment construire des interfaces modernes et adaptatives en utilisant les dernières fonctionnalités de CSS Layout.',
    }
  ];

  // Filtrer les ressources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || resource.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant':
        return 'bg-green-100 text-green-700';
      case 'Intermédiaire':
        return 'bg-blue-100 text-blue-700';
      case 'Avancé':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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

                {/* Filtre par catégorie */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Catégorie</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="Programming">Programmation</SelectItem>
                      <SelectItem value="Mathematics">Mathématiques</SelectItem>
                      <SelectItem value="Design Académique">Design Académique</SelectItem>
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
                      <SelectItem value="Beginner">Débutant</SelectItem>
                      <SelectItem value="Intermediate">Intermédiaire</SelectItem>
                      <SelectItem value="Advanced">Avancé</SelectItem>
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
            {filteredResources.map((resource) => {
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
                          {resource.type}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                      {resource.title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-6 line-clamp-3 leading-relaxed">
                      {resource.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <Badge className={`${getLevelColor(resource.level)} border-none text-[10px] font-bold`}>
                        {resource.level}
                      </Badge>
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{resource.category}</span>
                    </div>

                    <Button variant="outline" className="w-full mt-6 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100">
                      Voir les détails
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">Aucune ressource trouvée correspondant à vos critères.</p>
              <Button
                variant="link"
                className="mt-2 text-blue-600"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
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
