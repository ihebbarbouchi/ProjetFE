'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  HelpCircle, Clock, Award, Loader2, Search, PlayCircle, AlertCircle,
  CheckCircle2, XCircle, Lock
} from 'lucide-react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../components/ui/modal';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

interface QuizItem {
  id: number;
  titre: string;
  slug: string;
  description: string | null;
  temps_limite: number | null;
  score_passage: number;
  questions_count: number;
  nb_tentatives_max: number;
  ma_tentative?: {
    score: number;
    score_total: number;
    pourcentage: number;
    est_reussi: boolean;
    completee_le: string;
  } | null;
  nb_mes_tentatives?: number;
  peut_tenter?: boolean;
}

export default function StudentQuizListPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Pour le test du code
  const [selectedQuiz, setSelectedQuiz] = useState<QuizItem | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState('');

  const handleQuizClick = (quiz: QuizItem) => {
    // Si déjà tenté ou réussi, on laisse passer (ils l'ont déjà débloqué ou n'ont plus de tentatives)
    if (quiz.ma_tentative) {
      router.push(`/quiz/${quiz.slug}`);
    } else {
      setSelectedQuiz(quiz);
      setEnteredCode('');
      setCodeError('');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode.trim() || !selectedQuiz) return;

    setCodeLoading(true);
    setCodeError('');

    try {
      const res = await fetch(`${API_URL}/quiz/public/code/${enteredCode.trim().toUpperCase()}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Code invalide.');
      }

      if (data.slug !== selectedQuiz.slug) {
        throw new Error('Ce code ne correspond pas à ce quiz.');
      }

      // Succès: on redirige
      router.push(`/quiz/${selectedQuiz.slug}`);
    } catch (err: unknown) {
      setCodeError(err instanceof Error ? err.message : 'Erreur de vérification.');
    } finally {
      setCodeLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Les quiz publiés sont accessibles via /quiz/public/{slug} individuellement,
        // mais pour les lister on utilise l'endpoint standard (l'enseignant publie, l'apprenant voit ceux publiés)
        // On suppose un endpoint GET /quiz/publies accessible à tous les utilisateurs authentifiés
        const res = await fetch(`${API_URL}/quiz/publies`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = quizzes.filter(q =>
    q.titre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout role="student">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Quiz disponibles</h2>
            <p className="text-gray-600 mt-1">Testez vos connaissances sur les cours de vos enseignants</p>
          </div>
        </div>

        {/* Recherche */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un quiz…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
            <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {quizzes.length === 0 ? 'Aucun quiz disponible pour le moment' : 'Aucun quiz trouvé'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {quizzes.length === 0
                ? 'Vos enseignants publieront bientôt des quiz sur leurs cours'
                : 'Essayez avec un autre terme de recherche'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((quiz) => (
              <Card
                key={quiz.id}
                className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                onClick={() => handleQuizClick(quiz)}
              >
                <CardContent className="p-5">
                  {/* En-tête avec Icône et Badge Résultat */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${quiz.ma_tentative ? (quiz.ma_tentative.est_reussi ? 'bg-emerald-100' : 'bg-red-100') : 'bg-blue-100 group-hover:bg-blue-600'}`}>
                      {quiz.ma_tentative?.est_reussi ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : quiz.ma_tentative ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <HelpCircle className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                      )}
                    </div>
                    
                    {quiz.ma_tentative && (
                      <Badge className={quiz.ma_tentative.est_reussi ? 'bg-emerald-100 text-emerald-700 border-none' : 'bg-red-100 text-red-700 border-none'}>
                        {quiz.ma_tentative.est_reussi ? 'Réussi ✓' : 'Échoué ✗'} ({quiz.ma_tentative.pourcentage}%)
                      </Badge>
                    )}
                  </div>

                  {/* Titre */}
                  <h3 className="font-bold text-gray-900 mb-1 leading-snug line-clamp-2">{quiz.titre}</h3>
                  {quiz.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{quiz.description}</p>
                  )}

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                      <HelpCircle className="w-3 h-3 mr-1" />
                      {quiz.questions_count} questions
                    </Badge>
                    {quiz.temps_limite && (
                      <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {quiz.temps_limite} min
                      </Badge>
                    )}
                  </div>

                  {/* Bouton */}
                  {quiz.peut_tenter !== false && (!quiz.ma_tentative?.est_reussi) ? (
                    <Button
                      id={`btn-commencer-quiz-${quiz.id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleQuizClick(quiz); }}
                    >
                      {quiz.ma_tentative ? <PlayCircle className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                      {quiz.ma_tentative ? 'Réessayer' : 'Commencer le quiz'}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-gray-100 text-gray-500 hover:bg-gray-100 cursor-default"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {quiz.ma_tentative?.est_reussi ? 'Quiz complété' : 'Tentatives épuisées'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Note info si pas d'endpoint publies */}
        {!loading && quizzes.length === 0 && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 max-w-lg">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Si vous connaissez le lien d&apos;un quiz partagé par votre enseignant, vous pouvez y accéder directement via l&apos;URL.
            </p>
          </div>
        )}

        {/* Modal de vérification du code */}
        <Modal open={!!selectedQuiz} onOpenChange={(open) => !open && setSelectedQuiz(null)} size="sm">
          <ModalHeader onClose={() => setSelectedQuiz(null)}>
            Code secret requis
          </ModalHeader>
          <form onSubmit={handleVerifyCode}>
            <ModalBody>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <p className="text-sm text-gray-500">
                  Ce quiz est protégé. Entrez le code d'accès fourni par votre enseignant pour déverrouiller <br/>
                  <span className="font-semibold text-gray-900 mt-1 block">« {selectedQuiz?.titre} »</span>
                </p>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="EX: A7V9XK"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                  className="uppercase text-center text-2xl tracking-[0.25em] font-mono h-14 bg-gray-50 border-gray-300 focus-visible:ring-blue-600 rounded-xl"
                  maxLength={10}
                  autoFocus
                />
                {codeError && (
                  <div className="flex items-center justify-center gap-1.5 text-red-600 bg-red-50 py-2 px-3 rounded-lg text-sm font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{codeError}</p>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-11 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl" 
                onClick={() => setSelectedQuiz(null)}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={codeLoading || !enteredCode.trim()} 
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200 transition-all font-medium"
              >
                {codeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                Déverrouiller
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
