'use client';

import { useState, useEffect } from 'react';
import { PublicLayout } from '../components/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, BookOpen, Loader2, FileText, ArrowLeft, Download, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const STORAGE_URL = 'http://localhost:8000/storage';

interface ResourceType { id: number; type_ressource: string; }

interface Category {
  id: number;
  code: string;
  description: string | null;
  discipline_name: string | null;
  niveau_name: string | null;
  resource_types: ResourceType[];
  image_path?: string;
}

interface Resource {
  id: number;
  titre: string;
  description: string | null;
  type: string;
  chemin_fichier: string;
  user?: { nom: string; prenom: string };
  created_at: string;
  image_path?: string;
}

export default function PublicResources() {
  const [categories, setCategories]   = useState<Category[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // État pour la catégorie sélectionnée et ses ressources
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // ── Chargement des catégories approuvées ──────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/public/categories?status=approved`)
      .then(r => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Chargement des ressources d'une catégorie ────────────────────────
  const fetchResources = (catId: number) => {
    setIsLoadingResources(true);
    fetch(`${API_URL}/public/resources/category/${catId}`)
      .then(r => r.json())
      .then((data: Resource[]) => setResources(data))
      .catch(() => setResources([]))
      .finally(() => setIsLoadingResources(false));
  };

  const handleCategoryClick = (cat: Category) => {
    setSelectedCategory(cat);
    fetchResources(cat.id);
  };

  // ── Listes uniques pour les filtres ──────────────────────────────────
  const disciplines = Array.from(
    new Set(categories.map(c => c.discipline_name).filter(Boolean) as string[])
  );
  const levels = Array.from(
    new Set(categories.map(c => c.niveau_name).filter(Boolean) as string[])
  );

  // ── Filtrage des catégories ──────────────────────────────────────────
  const filteredCategories = categories.filter(cat => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      cat.code.toLowerCase().includes(q) ||
      (cat.description ?? '').toLowerCase().includes(q) ||
      (cat.discipline_name ?? '').toLowerCase().includes(q);
    const matchDiscipline = disciplineFilter === 'all' || cat.discipline_name === disciplineFilter;
    const matchLevel      = levelFilter      === 'all' || cat.niveau_name    === levelFilter;
    return matchSearch && matchDiscipline && matchLevel;
  });

  return (
    <PublicLayout>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {selectedCategory ? `Ressources : ${selectedCategory.code}` : "Catégories"}
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              {selectedCategory 
                ? selectedCategory.description || "Consultez les ressources pédagogiques de cette catégorie."
                : "Explorez notre collection de catégories de ressources pédagogiques classées par discipline et niveau."}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {selectedCategory ? (
            /* ══ VUE : RESSOURCES D'UNE CATÉGORIE ════════════════════════ */
            <div className="space-y-6">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCategory(null)}
                className="mb-4 gap-2 hover:bg-white"
              >
                <ArrowLeft className="w-4 h-4" /> Retour aux catégories
              </Button>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCategory.code}</h2>
                    <p className="text-sm text-gray-500">{selectedCategory.discipline_name} • {selectedCategory.niveau_name}</p>
                  </div>
                </div>
              </div>

              {isLoadingResources ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
              ) : resources.length === 0 ? (
                <Card className="border-dashed border-2 shadow-none py-20">
                  <CardContent className="flex flex-col items-center justify-center text-center">
                    <FileText className="w-16 h-16 text-gray-200 mb-4" />
                    <h3 className="text-lg font-bold text-gray-400">Aucune ressource disponible</h3>
                    <p className="text-gray-400 max-w-sm mt-1">
                      Il n'y a pas encore de fichiers PDF partagés dans cette catégorie.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((res) => (
                    <Card key={res.id} className="group hover:shadow-xl transition-all border-none shadow-sm overflow-hidden bg-white">
                      {res.image_path ? (
                        <div className="h-40 w-full overflow-hidden">
                          <img 
                            src={`${STORAGE_URL}/${res.image_path}`} 
                            alt={res.titre} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="h-2 bg-blue-600" />
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">PDF</Badge>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(res.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {res.titre}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed min-h-[60px]">
                          {res.description || "Aucune description fournie."}
                        </p>
                        
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                              {res.user?.prenom?.charAt(0) || "U"}
                            </div>
                            <span className="text-xs text-gray-600 font-medium italic">
                              {res.user ? `${res.user.prenom} ${res.user.nom}` : "Anonyme"}
                            </span>
                          </div>
                        </div>

                        <a 
                          href={`${STORAGE_URL}/${res.chemin_fichier}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Consulter le PDF
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          ) : (
            /* ══ VUE : LISTE DES CATÉGORIES ══════════════════════════════ */
            <>
              {/* ── Filtres ─────────────────────────────────────────────── */}
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
                          placeholder="Nom, discipline…"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-10 h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Filtre discipline */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Discipline</label>
                      <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Toutes les disciplines" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">Toutes les disciplines</SelectItem>
                          {disciplines.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtre niveau */}
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Niveau</label>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger className="h-12 rounded-xl">
                          <SelectValue placeholder="Tous les niveaux" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">Tous les niveaux</SelectItem>
                          {levels.map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* ── Compteur ────────────────────────────────────────────── */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  {isLoading ? 'Chargement…' : `Affichage de ${filteredCategories.length} catégorie${filteredCategories.length !== 1 ? 's' : ''}`}
                </p>
                {(searchQuery || disciplineFilter !== 'all' || levelFilter !== 'all') && (
                  <Button
                    variant="link"
                    className="text-blue-600 text-sm p-0"
                    onClick={() => { setSearchQuery(''); setDisciplineFilter('all'); setLevelFilter('all'); }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>

              {/* ── Loading / Empty ─────────────────────────────────────── */}
              {isLoading ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">Aucune catégorie trouvée.</p>
                </div>
              ) : (
                /* ── Grille des catégories ────────────────────────────── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map(cat => (
                    <Card 
                      key={cat.id} 
                      className="hover:shadow-lg transition-all border-gray-200 cursor-pointer group active:scale-[0.98] overflow-hidden"
                      onClick={() => handleCategoryClick(cat)}
                    >
                      {cat.image_path && (
                        <div className="h-32 w-full overflow-hidden">
                          <img 
                            src={`${STORAGE_URL}/${cat.image_path}`} 
                            alt={cat.code} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                              <BookOpen className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none px-2 py-0.5 text-[11px] font-bold uppercase transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                              {cat.code}
                            </Badge>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                          {cat.description || <span className="text-gray-400 font-normal italic text-base">Aucune description</span>}
                        </h3>

                        {cat.resource_types?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {cat.resource_types.map(t => (
                              <span key={t.id} className="text-[10px] font-semibold bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full border border-gray-100">
                                {t.type_ressource}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-bold">
                            {cat.discipline_name ?? '—'}
                          </Badge>
                          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                            {cat.niveau_name ?? '—'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </section>
    </PublicLayout>
  );
}
