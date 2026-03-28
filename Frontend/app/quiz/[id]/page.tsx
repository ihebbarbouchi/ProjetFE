'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  CheckCircle2, XCircle, Clock, Award, ArrowLeft, ArrowRight,
  Loader2, AlertCircle, HelpCircle, Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

interface Choix {
  id: number;
  texte: string;
  ordre: number;
}

interface Question {
  id: number;
  enonce: string;
  difficulte: 'facile' | 'moyen' | 'difficile';
  points: number;
  ordre: number;
  choix: Choix[];
}

interface QuizPublic {
  id: number;
  titre: string;
  slug: string;
  description: string | null;
  temps_limite: number | null;
  score_passage: number;
  nb_tentatives_max: number;
  questions: Question[];
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

interface ResultDetail {
  question_id: number;
  est_correct: boolean;
  bons_choix?: number[];
  explication?: string;
}

interface ResultData {
  message: string;
  score: number;
  score_total: number;
  pourcentage: number;
  est_reussi: boolean;
  detail: ResultDetail[];
}

type PageState = 'loading' | 'intro' | 'quiz' | 'submitting' | 'result' | 'error';

export default function QuizStudentPage() {
  const { id: slug } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [quiz, setQuiz] = useState<QuizPublic | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedChoix, setSelectedChoix] = useState<Record<number, number[]>>({});
  const [result, setResult] = useState<ResultData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);

  // ── Chargement ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/quiz/public/${slug}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.message || 'Quiz introuvable');
        }
        const data: QuizPublic = await res.json();
        setQuiz(data);
        setPageState('intro');
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : 'Erreur');
        setPageState('error');
      }
    };
    load();
  }, [slug]);

  // ── Timer countdown ───────────────────────────────────────────
  useEffect(() => {
    if (pageState !== 'quiz' || !quiz?.temps_limite) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pageState]);

  const startQuiz = () => {
    setStartedAt(Date.now());
    if (quiz?.temps_limite) setTimeLeft(quiz.temps_limite * 60);
    setPageState('quiz');
  };

  // ── Sélection réponse ─────────────────────────────────────────
  const toggleChoix = (questionId: number, choixId: number) => {
    setSelectedChoix(prev => {
      const current = prev[questionId] ?? [];
      const already = current.includes(choixId);
      return {
        ...prev,
        [questionId]: already ? current.filter(c => c !== choixId) : [...current, choixId],
      };
    });
  };

  // ── Soumission ────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!quiz) return;
    setPageState('submitting');

    const reponses = quiz.questions.map(q => ({
      question_id: q.id,
      choix_ids: selectedChoix[q.id] ?? [],
    }));

    const temps = Math.round((Date.now() - startedAt) / 1000);

    try {
      const res = await fetch(`${API_URL}/quiz/public/${quiz.slug}/soumettre`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reponses, temps_passe: temps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
      setPageState('result');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erreur');
      setPageState('error');
    }
  }, [quiz, selectedChoix, startedAt, token]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const nbAnswered = quiz?.questions.filter(q => (selectedChoix[q.id] ?? []).length > 0).length ?? 0;
  const progress = quiz ? ((currentQ + 1) / quiz.questions.length) * 100 : 0;
  const diffColor = { facile: 'text-emerald-600 bg-emerald-50', moyen: 'text-amber-600 bg-amber-50', difficile: 'text-red-600 bg-red-50' };

  // ── LOADING ────────────────────────────────────────────────────
  if (pageState === 'loading') return (
    <Layout role="student">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    </Layout>
  );

  // ── ERROR ──────────────────────────────────────────────────────
  if (pageState === 'error') return (
    <Layout role="student">
      <div className="max-w-lg mx-auto mt-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Impossible d&apos;accéder au quiz</h3>
        <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
        <Button onClick={() => router.push('/student')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
        </Button>
      </div>
    </Layout>
  );

  // ── RESULT ─────────────────────────────────────────────────────
  if (pageState === 'result' && result) return (
    <Layout role="student">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            {/* Icône résultat */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.est_reussi ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {result.est_reussi
                ? <Award className="w-10 h-10 text-emerald-600" />
                : <XCircle className="w-10 h-10 text-red-500" />
              }
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.est_reussi ? '🎉 Félicitations !' : 'Quiz terminé'}</h2>
            <p className="text-gray-500 mb-6">{result.message}</p>

            {/* Score */}
            <div className={`text-6xl font-black mb-2 ${result.est_reussi ? 'text-emerald-600' : 'text-red-500'}`}>
              {result.pourcentage}%
            </div>
            <p className="text-gray-500 text-sm mb-4">{result.score} / {result.score_total} points</p>
            <Badge className={result.est_reussi ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}>
              {result.est_reussi ? 'Réussi ✓' : 'Échoué ✗'} — seuil: {quiz?.score_passage}%
            </Badge>

            <div className="flex gap-3 justify-center mt-8">
              <Button onClick={() => router.push('/student')} className="bg-blue-600 hover:bg-blue-700">
                Retour au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Correction détaillée */}
        {result.detail.length > 0 && quiz && (
          <Card>
            <CardHeader>
              <CardTitle>Correction détaillée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.detail.map((d, i) => {
                const q = quiz.questions.find(q => q.id === d.question_id);
                if (!q) return null;
                return (
                  <div key={d.question_id} className={`p-4 rounded-xl border ${d.est_correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                    <div className="flex items-start gap-3">
                      {d.est_correct
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        : <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      }
                      <div>
                        <p className="font-medium text-gray-900 mb-2">{i + 1}. {q.enonce}</p>
                        {d.bons_choix && (
                          <p className="text-xs text-gray-500">
                            Bonne(s) réponse(s): {q.choix.filter(c => d.bons_choix!.includes(c.id)).map(c => c.texte).join(', ')}
                          </p>
                        )}
                        {d.explication && <p className="text-xs text-blue-600 mt-1 italic">{d.explication}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );

  // ── INTRO ──────────────────────────────────────────────────────
  if (pageState === 'intro' && quiz) return (
    <Layout role="student">
      <div className="max-w-lg mx-auto mt-10">
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7 text-blue-600" />
            </div>
            <CardTitle className="text-xl">{quiz.titre}</CardTitle>
            {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Infos */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Questions', value: String(quiz.questions.length), icon: HelpCircle },
                { label: 'Score requis', value: `${quiz.score_passage}%`, icon: Award },
                { label: 'Temps limite', value: quiz.temps_limite ? `${quiz.temps_limite} min` : 'Illimité', icon: Clock },
                { label: 'Tentatives max', value: quiz.nb_tentatives_max === 0 ? 'Illimité' : String(quiz.nb_tentatives_max), icon: CheckCircle2 },
              ].map((info, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <info.icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{info.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {quiz.peut_tenter !== false && (!quiz.ma_tentative?.est_reussi) ? (
              <Button
                id="btn-commencer-quiz"
                className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
                onClick={startQuiz}
              >
                {quiz.ma_tentative ? 'Réessayer' : 'Commencer le quiz'}
              </Button>
            ) : (
              <Button
                className="w-full bg-gray-100 text-gray-500 cursor-default"
                disabled
              >
                {quiz.ma_tentative?.est_reussi ? 'Quiz déjà réussi' : 'Tentatives épuisées'}
              </Button>
            )}
            
            <Button variant="ghost" className="w-full text-gray-400" onClick={() => router.push('/student')}>
              Annuler
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );

  // ── QUIZ EN COURS ──────────────────────────────────────────────
  if ((pageState === 'quiz' || pageState === 'submitting') && quiz) {
    const question = quiz.questions[currentQ];

    return (
      <Layout role="student">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Barre de progression + Timer */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Question {currentQ + 1} / {quiz.questions.length}</span>
                <span>{Math.round(progress)}% complété</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            {timeLeft !== null && (
              <div className={`ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <Clock className="w-3.5 h-3.5" />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Question */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColor[question.difficulte]}`}>
                      {question.difficulte}
                    </span>
                    <span className="text-xs text-gray-400">{question.points} point{question.points > 1 ? 's' : ''}</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 leading-snug">
                    {question.enonce}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.choix.map((choix) => {
                const isSelected = (selectedChoix[question.id] ?? []).includes(choix.id);
                return (
                  <button
                    key={choix.id}
                    id={`choix-${choix.id}`}
                    onClick={() => toggleChoix(question.id, choix.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                      {choix.texte}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
              disabled={currentQ === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Précédent
            </Button>

            {/* Indicateurs */}
            <div className="flex items-center gap-1.5">
              {quiz.questions.map((q, i) => {
                const answered = (selectedChoix[q.id] ?? []).length > 0;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentQ ? 'bg-blue-600 scale-125' : answered ? 'bg-blue-300' : 'bg-gray-200'
                    }`}
                  />
                );
              })}
            </div>

            {currentQ < quiz.questions.length - 1 ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setCurrentQ(q => q + 1)}
              >
                Suivant <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                id="btn-soumettre-quiz"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={pageState === 'submitting'}
                onClick={handleSubmit}
              >
                {pageState === 'submitting' ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Envoi…</>
                ) : (
                  <><Send className="w-4 h-4 mr-1" /> Soumettre ({nbAnswered}/{quiz.questions.length})</>
                )}
              </Button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return null;
}
