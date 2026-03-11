'use client';

import { useState } from 'react';
import { PublicLayout } from '../components/PublicLayout';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BookOpen, Clock, Search } from 'lucide-react';

export default function Formations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Un seul exemple de formation (version classique)
  const formations = [
    {
      id: 1,
      title: 'Introduction au Développement Web Moderne',
      description: 'Apprenez les bases du HTML5, CSS3 et JavaScript ES6+ pour créer des sites web réactifs et interactifs de A à Z.',
      modules: 12,
      level: 'Débutant',
      duration: '3 mois',
      category: 'Programmation',
    }
  ];

  const filteredFormations = formations.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || f.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

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
      {/* Section Héro - Design identique à la page Contact */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Formations
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Parcourez nos programmes de formation complets conçus pour vous aider à maîtriser de nouvelles compétences et à faire avancer votre carrière.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section de filtrage (Principe identique aux ressources : Selects) */}
          <Card className="mb-8 shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
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

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Catégorie</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="Programmation">Programmation</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="IA">Intelligence Artificielle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Niveau</label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les niveaux" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les niveaux</SelectItem>
                      <SelectItem value="Débutant">Débutant</SelectItem>
                      <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="Avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grille des formations (Design Classique) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFormations.map((formation) => (
              <Card key={formation.id} className="hover:shadow-lg transition-all border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {formation.category}
                    </Badge>
                    <Badge className={`${getLevelColor(formation.level)} border-none px-3 py-1 text-[10px] font-bold uppercase`}>
                      {formation.level}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-gray-900 text-xl mb-3">
                    {formation.title}
                  </h3>

                  <p className="text-sm text-gray-500 mb-6 leading-relaxed line-clamp-3">
                    {formation.description}
                  </p>

                  <div className="flex items-center gap-6 py-4 border-t border-gray-100 mb-6">
                    <div className="flex items-center text-xs font-bold text-gray-400">
                      <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{formation.modules} MODULES</span>
                    </div>
                    <div className="flex items-center text-xs font-bold text-gray-400">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{formation.duration.toUpperCase()}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-lg transition-all">
                    Voir la formation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFormations.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-lg font-bold">Aucune formation trouvée</p>
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
