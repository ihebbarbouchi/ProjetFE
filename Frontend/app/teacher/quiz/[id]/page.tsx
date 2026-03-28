'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '../../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  ArrowLeft, Edit3, Save, PlayCircle, Archive, Trash2,
  CheckCircle2, XCircle, HelpCircle, Clock, Award, Users,
  ChevronDown, ChevronUp, AlertCircle, Loader2, Plus, Minus,
  BarChart2, BookOpen, PenLine,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

interface Choix {
  id?: number;
  texte: string;
  est_correct: boolean;
  ordre?: number;
}

interface Question {
  id?: number;
  enonce: string;
  difficulte: 'facile' | 'moyen' | 'difficile';
  points: number;
  explication: string | null;
  ordre?: number;
  choix: Choix[];
}

interface QuizDetail {
  id: number;
  titre: string;
  slug: string;
  description: string | null;
  temps_limite: number | null;
  score_passage: number;
  melange_questions: boolean;
  melange_reponses: boolean;
  afficher_correction: boolean;
  nb_tentatives_max: number;
  status: 'brouillon' | 'publie' | 'archive';
  questions: Question[];
  tentatives_count?: number;
  questions_count?: number;
}

export default function TeacherQuizDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const id = params?.id as string;

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // État éditable
  const [editTitre, setEditTitre] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTemps, setEditTemps] = useState<number | ''>('');
  const [editScore, setEditScore] = useState(50);
  const [editAfficherCorrection, setEditAfficherCorrection] = useState(false);
  const [editNbTentatives, setEditNbTentatives] = useState(0);
  const [editQuestions, setEditQuestions] = useState<Question[]>([]);
  const [expandedQs, setExpandedQs] = useState<Set<number>>(new Set());

  const authHeader = { Authorization: `Bearer ${token || localStorage.getItem('auth_token')}`, 'Content-Type': 'application/json', Accept: 'application/json' };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quiz/${id}`, { headers: authHeader });
      if (!res.ok) throw new Error();
      const data: QuizDetail = await res.json();
      setQuiz(data);
      initEditState(data);
    } catch {
      showToast('error', 'Impossible de charger le quiz.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

  const initEditState = (q: QuizDetail) => {
    setEditTitre(q.titre);
    setEditDescription(q.description ?? '');
    setEditTemps(q.temps_limite ?? '');
    setEditScore(q.score_passage);
    setEditAfficherCorrection(q.afficher_correction);
    setEditNbTentatives(q.nb_tentatives_max);
    setEditQuestions(q.questions.map(q => ({ ...q, choix: [...q.choix] })));
    // Expand first question by default
    if (q.questions.length > 0 && q.questions[0].id) {
      setExpandedQs(new Set([0]));
    }
  };

  const toggleExpand = (idx: number) => {
    setExpandedQs(prev => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });
  };

  // ── Save metadata ──────────────────────────────────────────────
  const handleSaveMetadata = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/quiz/${id}`, {
        method: 'PUT',
        headers: authHeader,
        body: JSON.stringify({
          titre: editTitre,
          description: editDescription || null,
          temps_limite: editTemps || null,
          score_passage: editScore,
          afficher_correction: editAfficherCorrection,
          nb_tentatives_max: editNbTentatives,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const updatedQuiz = data.quiz;
      setQuiz(updatedQuiz);
      initEditState(updatedQuiz);
      showToast('success', 'Paramètres sauvegardés !');
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Erreur de sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  // ── Save questions ─────────────────────────────────────────────
  const handleSaveQuestions = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/quiz/${id}/questions`, {
        method: 'PUT',
        headers: authHeader,
        body: JSON.stringify({ questions: editQuestions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const updatedQuiz = data.quiz;
      setQuiz(updatedQuiz);
      initEditState(updatedQuiz);
      setEditMode(false);
      showToast('success', 'Questions sauvegardées !');
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Erreur de sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  // ── Publish ────────────────────────────────────────────────────
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/quiz/${id}/publier`, {
        method: 'PUT',
        headers: authHeader,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setQuiz(prev => prev ? { ...prev, status: 'publie' } : prev);
      showToast('success', 'Quiz publié ! Les apprenants peuvent maintenant y accéder.');
    } catch (e: unknown) {
      showToast('error', e instanceof Error ? e.message : 'Erreur lors de la publication.');
    } finally {
      setPublishing(false);
    }
  };

  // ── Archive ────────────────────────────────────────────────────
  const handleArchive = async () => {
    if (!confirm('Archiver ce quiz ? Les apprenants ne pourront plus y accéder.')) return;
    const res = await fetch(`${API_URL}/quiz/${id}/archiver`, { method: 'PUT', headers: authHeader });
    if (res.ok) {
      setQuiz(prev => prev ? { ...prev, status: 'archive' } : prev);
      showToast('success', 'Quiz archivé.');
    }
  };

  // ── Question edit helpers ──────────────────────────────────────
  const updateQuestion = (qIdx: number, field: keyof Question, value: unknown) => {
    setEditQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, [field]: value } : q));
  };

  const updateChoix = (qIdx: number, cIdx: number, field: keyof Choix, value: unknown) => {
    setEditQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      return {
        ...q,
        choix: q.choix.map((c, j) => j === cIdx ? { ...c, [field]: value } : c),
      };
    }));
  };

  const toggleCorrect = (qIdx: number, cIdx: number) => {
    updateChoix(qIdx, cIdx, 'est_correct', !editQuestions[qIdx].choix[cIdx].est_correct);
  };

  const deleteQuestion = (qIdx: number) => {
    setEditQuestions(prev => prev.filter((_, i) => i !== qIdx));
    setExpandedQs(prev => {
      const s = new Set<number>();
      prev.forEach(v => { if (v < qIdx) s.add(v); else if (v > qIdx) s.add(v - 1); });
      return s;
    });
  };

  const addChoix = (qIdx: number) => {
    setEditQuestions(prev => prev.map((q, i) => i === qIdx
      ? { ...q, choix: [...q.choix, { texte: '', est_correct: false }] }
      : q
    ));
  };

  const removeChoix = (qIdx: number, cIdx: number) => {
    setEditQuestions(prev => prev.map((q, i) => i === qIdx
      ? { ...q, choix: q.choix.filter((_, j) => j !== cIdx) }
      : q
    ));
  };

  // ── Helpers UI ─────────────────────────────────────────────────
  const statusBadge = (status: QuizDetail['status']) => {
    if (status === 'publie') return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Publié</Badge>;
    if (status === 'archive') return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Archivé</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Brouillon</Badge>;
  };

  const difficulteColor = (d: string) => {
    if (d === 'facile') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (d === 'difficile') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  if (loading) return (
    <Layout role="teacher">
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    </Layout>
  );

  if (!quiz) return (
    <Layout role="teacher">
      <div className="text-center py-32">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Quiz introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/teacher/quiz')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la liste
        </Button>
      </div>
    </Layout>
  );

  return (
    <Layout role="teacher">
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/teacher/quiz')}
              className="p-2 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-gray-500 hover:text-emerald-700"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">{quiz.titre}</h2>
                {statusBadge(quiz.status)}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">
                {quiz.questions?.length ?? 0} questions · Score passage : {quiz.score_passage}%
                {quiz.temps_limite && ` · ${quiz.temps_limite} min`}
              </p>
            </div>
          </div>

          {/* Actions principales */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {quiz.status === 'brouillon' && (
              <Button
                id="btn-publier-quiz"
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:scale-105"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                Publier le quiz
              </Button>
            )}
            {quiz.status === 'publie' && (
              <>
                <Button
                  variant="outline"
                  className="border-gray-200"
                  onClick={() => router.push(`/teacher/quiz/${id}/statistiques`)}
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Statistiques
                </Button>
                <Button variant="outline" className="border-gray-200 text-gray-500" onClick={handleArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archiver
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Avertissement Brouillon ─────────────────────────────── */}
        {quiz.status === 'brouillon' && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Ce quiz est en brouillon</p>
              <p className="text-xs text-amber-600 mt-0.5">Révisez et corrigez les questions générées par l&apos;IA avant de publier. Les apprenants ne peuvent pas encore y accéder.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Colonne gauche : Paramètres ─────────────────────── */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Paramètres</CardTitle>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 transition-colors"
                  >
                    <PenLine className="w-3 h-3" />
                    {editMode ? 'Annuler' : 'Modifier'}
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Titre</Label>
                      <Input value={editTitre} onChange={e => setEditTitre(e.target.value)} className="text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Description (optionnel)</Label>
                      <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} className="text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Temps (min)</Label>
                        <Input type="number" placeholder="Illimité" value={editTemps} onChange={e => setEditTemps(e.target.value ? Number(e.target.value) : '')} className="text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Score passage %</Label>
                        <Input type="number" min={0} max={100} value={editScore} onChange={e => setEditScore(Number(e.target.value))} className="text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Tentatives max (0 = illimité)</Label>
                      <Input type="number" min={0} value={editNbTentatives} onChange={e => setEditNbTentatives(Number(e.target.value))} className="text-sm" />
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-xs text-gray-600">Afficher correction</span>
                      <button
                        onClick={() => setEditAfficherCorrection(!editAfficherCorrection)}
                        className={`w-10 h-5 rounded-full transition-colors relative ${editAfficherCorrection ? 'bg-emerald-500' : 'bg-gray-200'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editAfficherCorrection ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <Button
                      id="btn-save-metadata"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm"
                      onClick={handleSaveMetadata}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Enregistrer
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    {[
                      { icon: BookOpen, label: 'Titre', val: quiz.titre },
                      { icon: HelpCircle, label: 'Questions', val: `${quiz.questions?.length ?? 0}` },
                      { icon: Clock, label: 'Temps limite', val: quiz.temps_limite ? `${quiz.temps_limite} min` : 'Illimité' },
                      { icon: Award, label: 'Score passage', val: `${quiz.score_passage}%` },
                      { icon: Users, label: 'Tentatives max', val: quiz.nb_tentatives_max === 0 ? 'Illimitées' : String(quiz.nb_tentatives_max) },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Total de points */}
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 mb-1">Points total possible</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(quiz.questions ?? []).reduce((sum, q) => sum + q.points, 0)}
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['facile', 'moyen', 'difficile'].map(d => {
                    const count = (quiz.questions ?? []).filter(q => q.difficulte === d).length;
                    return count > 0 ? (
                      <span key={d} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficulteColor(d)}`}>
                        {count} {d}
                      </span>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Colonne droite : Questions ─────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Questions ({editMode ? editQuestions.length : quiz.questions?.length ?? 0})</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editMode ? 'Mode édition activé — modifiez les énoncés et les bonnes réponses' : 'Cliquez sur une question pour la développer'}</p>
              </div>
              {editMode ? (
                <div className="flex gap-2">
                  <Button
                    id="btn-save-questions"
                    className="bg-emerald-600 hover:bg-emerald-700 text-sm"
                    onClick={handleSaveQuestions}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Sauvegarder
                  </Button>
                  <Button variant="outline" className="text-sm border-gray-200" onClick={() => { setEditMode(false); initEditState(quiz); }}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button
                  id="btn-edit-questions"
                  variant="outline"
                  className="text-sm border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                  onClick={() => setEditMode(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier les questions
                </Button>
              )}
            </div>

            {/* Liste des questions */}
            {(editMode ? editQuestions : (quiz.questions ?? [])).map((q, qIdx) => (
              <Card
                key={qIdx}
                className={`border transition-all ${expandedQs.has(qIdx) ? 'border-emerald-200 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
              >
                {/* Question header */}
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full text-left cursor-pointer"
                  onClick={() => toggleExpand(qIdx)}
                  onKeyDown={e => e.key === 'Enter' && toggleExpand(qIdx)}
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {qIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editMode ? (
                        <Input
                          value={(editQuestions[qIdx] as Question).enonce}
                          onChange={e => updateQuestion(qIdx, 'enonce', e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="text-sm font-medium border-0 shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                          placeholder="Énoncé de la question..."
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 truncate">{q.enonce}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {editMode ? (
                          <select
                            value={(editQuestions[qIdx] as Question).difficulte}
                            onChange={e => updateQuestion(qIdx, 'difficulte', e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium bg-background cursor-pointer ${difficulteColor((editQuestions[qIdx] as Question).difficulte)}`}
                          >
                            <option value="facile">facile (1pt)</option>
                            <option value="moyen">moyen (2pts)</option>
                            <option value="difficile">difficile (3pts)</option>
                          </select>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficulteColor(q.difficulte)}`}>
                            {q.difficulte}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{q.points} pt{q.points > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {editMode && (
                        <button
                          onClick={e => { e.stopPropagation(); deleteQuestion(qIdx); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {expandedQs.has(qIdx) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Question body (expanded) */}
                {expandedQs.has(qIdx) && (
                  <div className="border-t border-gray-100 p-4 space-y-2">
                    {/* Choices */}
                    <p className="text-xs font-medium text-gray-500 mb-2">Choix de réponses :</p>
                    {(editMode ? (editQuestions[qIdx] as Question) : q).choix.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${c.est_correct ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <button
                          onClick={() => editMode && toggleCorrect(qIdx, cIdx)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${c.est_correct ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white'} ${editMode ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                        >
                          {c.est_correct && <CheckCircle2 className="w-3.5 h-3.5 text-white fill-white" />}
                        </button>
                        {editMode ? (
                          <Input
                            value={(editQuestions[qIdx] as Question).choix[cIdx].texte}
                            onChange={e => updateChoix(qIdx, cIdx, 'texte', e.target.value)}
                            className={`flex-1 text-sm border-0 shadow-none p-0 h-auto focus-visible:ring-0 ${c.est_correct ? 'bg-transparent font-medium text-emerald-800' : 'bg-transparent text-gray-700'}`}
                            placeholder="Texte du choix..."
                          />
                        ) : (
                          <span className={`flex-1 text-sm ${c.est_correct ? 'font-medium text-emerald-800' : 'text-gray-700'}`}>{c.texte}</span>
                        )}
                        {c.est_correct && !editMode && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                        {editMode && (
                          <button
                            onClick={() => removeChoix(qIdx, cIdx)}
                            className="text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    {editMode && (
                      <button
                        onClick={() => addChoix(qIdx)}
                        className="w-full py-2 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter un choix
                      </button>
                    )}

                    {/* Explication */}
                    {(editMode || q.explication) && (
                      <div className={`mt-3 p-3 rounded-xl border ${editMode ? 'border-gray-200 bg-gray-50' : 'border-blue-100 bg-blue-50'}`}>
                        <p className="text-xs font-medium text-gray-500 mb-1">💡 Explication</p>
                        {editMode ? (
                          <Textarea
                            value={(editQuestions[qIdx] as Question).explication ?? ''}
                            onChange={e => updateQuestion(qIdx, 'explication', e.target.value || null)}
                            rows={2}
                            className="text-xs bg-white"
                            placeholder="Explication de la bonne réponse (optionnel)..."
                          />
                        ) : (
                          <p className="text-xs text-blue-700">{q.explication}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
