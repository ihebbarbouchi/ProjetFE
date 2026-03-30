'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  PlusCircle, Upload, Brain, FileText, Clock, Users,
  Eye, Trash2, BarChart2, CheckCircle2, AlertCircle, Loader2,
  HelpCircle, XCircle, PlayCircle, Archive, Database, BookOpen,
  ChevronRight, Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

interface Quiz {
  id: number;
  titre: string;
  slug: string;
  status: 'brouillon' | 'publie' | 'archive';
  nb_questions?: number;
  temps_limite: number | null;
  score_passage: number;
  tentatives_count?: number;
  questions_count?: number;
  created_at: string;
}

interface QcmBib {
  id: number;
  titre: string;
  description?: string;
  nb_questions: number;
  nb_facile: number;
  nb_moyen: number;
  nb_difficile: number;
  discipline?: { id: number; discipline: string };
  niveau?: { id: number; niveau: string };
  created_at: string;
}

type ModalStep = 'idle' | 'uploading' | 'generating' | 'done' | 'error';
type ModalTab = 'ia' | 'bibliotheque';

export default function TeacherQuizPage() {
  const router = useRouter();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal état
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<ModalStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [titre, setTitre] = useState('');
  const [nbQuestions, setNbQuestions] = useState(10);
  const [tempsLimite, setTempsLimite] = useState<number | ''>('');
  const [scorePassage, setScorePassage] = useState(50);
  const [modalTab, setModalTab] = useState<ModalTab>('ia');

  // Bibliothèque
  const [qcmList, setQcmList] = useState<QcmBib[]>([]);
  const [qcmLoading, setQcmLoading] = useState(false);
  const [selectedQcm, setSelectedQcm] = useState<QcmBib | null>(null);
  const [qcmSearch, setQcmSearch] = useState('');

  // ── Chargement des quizzes ──────────────────────────────────────
  const fetchQuizzes = async () => {
    try {
      const tokenToUse = token || localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/quiz`, {
        headers: { Authorization: `Bearer ${tokenToUse}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuizzes(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // ── Chargement de la bibliothèque ───────────────────────────────
  const fetchQcmBibliotheque = async () => {
    setQcmLoading(true);
    try {
      const tokenToUse = token || localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/qcm-bibliotheque`, {
        headers: { Authorization: `Bearer ${tokenToUse}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQcmList(data);
    } catch {
      setQcmList([]);
    } finally {
      setQcmLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  // ── Génération IA ───────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!file || !titre.trim()) return;
    const tokenToUse = token || localStorage.getItem('auth_token');
    if (!tokenToUse) { setStep('error'); setErrorMsg('Session expirée. Reconnectez-vous.'); return; }

    setStep('uploading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('titre', titre.trim());
    formData.append('nb_questions', String(nbQuestions));
    if (tempsLimite) formData.append('temps_limite', String(tempsLimite));
    formData.append('score_passage', String(scorePassage));

    try {
      setStep('generating');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000);

      const res = await fetch(`${API_URL}/quiz/generer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenToUse}`, Accept: 'application/json' },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur de génération');

      setStep('done');
      fetchQuizzes();
      setTimeout(() => { setShowModal(false); resetModal(); }, 2000);
    } catch (err: unknown) {
      setStep('error');
      if (err instanceof DOMException && err.name === 'AbortError') {
        setErrorMsg('La génération a pris trop de temps. Réessayez avec moins de questions.');
      } else {
        setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    }
  };

  // ── Importer depuis la bibliothèque ────────────────────────────
  const handleBiblioImport = async () => {
    if (!selectedQcm || !titre.trim()) return;
    const tokenToUse = token || localStorage.getItem('auth_token');
    if (!tokenToUse) { setStep('error'); setErrorMsg('Session expirée.'); return; }

    setStep('generating');
    setErrorMsg('');

    try {
      const body: Record<string, string | number> = { titre: titre.trim(), score_passage: scorePassage };
      if (tempsLimite) body['temps_limite'] = Number(tempsLimite);

      const res = await fetch(`${API_URL}/qcm-bibliotheque/${selectedQcm.id}/importer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur d\'import');

      setStep('done');
      fetchQuizzes();
      setTimeout(() => { setShowModal(false); resetModal(); }, 2000);
    } catch (err: unknown) {
      setStep('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  // ── Publier / Archiver / Supprimer ──────────────────────────────
  const handlePublish = async (id: number) => {
    const tokenToUse = token || localStorage.getItem('auth_token');
    await fetch(`${API_URL}/quiz/${id}/publier`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenToUse}`, Accept: 'application/json' },
    });
    fetchQuizzes();
  };

  const handleArchive = async (id: number) => {
    const tokenToUse = token || localStorage.getItem('auth_token');
    await fetch(`${API_URL}/quiz/${id}/archiver`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenToUse}`, Accept: 'application/json' },
    });
    fetchQuizzes();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce quiz définitivement ?')) return;
    const tokenToUse = token || localStorage.getItem('auth_token');
    await fetch(`${API_URL}/quiz/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenToUse}`, Accept: 'application/json' },
    });
    fetchQuizzes();
  };

  const resetModal = () => {
    setFile(null);
    setTitre('');
    setNbQuestions(10);
    setTempsLimite('');
    setScorePassage(50);
    setStep('idle');
    setErrorMsg('');
    setSelectedQcm(null);
    setQcmSearch('');
    setModalTab('ia');
  };

  const openModal = () => {
    resetModal();
    setShowModal(true);
    fetchQcmBibliotheque();
  };

  // ── Badge statut ────────────────────────────────────────────────
  const statusBadge = (status: Quiz['status']) => {
    if (status === 'publie') return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Publié</Badge>;
    if (status === 'archive') return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Archivé</Badge>;
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Brouillon</Badge>;
  };

  const filteredQcm = qcmList.filter(q =>
    q.titre.toLowerCase().includes(qcmSearch.toLowerCase()) ||
    (q.discipline?.discipline || '').toLowerCase().includes(qcmSearch.toLowerCase())
  );

  const canSubmitBiblio = selectedQcm && titre.trim();

  // ── Rendu ──────────────────────────────────────────────────────
  return (
    <Layout role="teacher">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mes Quiz</h2>
            <p className="text-gray-600 mt-1">Générez via l&apos;IA ou depuis votre bibliothèque de QCM</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              id="btn-bibliotheque"
              variant="outline"
              onClick={() => router.push('/teacher/qcm-bibliotheque')}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Ma bibliothèque
            </Button>
            <Button
              id="btn-generer-quiz"
              onClick={openModal}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Nouveau Quiz
            </Button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total quiz', value: quizzes.length, icon: HelpCircle, color: 'emerald' },
            { label: 'Publiés', value: quizzes.filter(q => q.status === 'publie').length, icon: CheckCircle2, color: 'emerald' },
            { label: 'Brouillons', value: quizzes.filter(q => q.status === 'brouillon').length, icon: FileText, color: 'amber' },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full bg-${s.color}-100 flex items-center justify-center`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Liste des quiz */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des quiz</CardTitle>
            <CardDescription>Gérez, publiez et suivez les résultats de vos quiz</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Chargement…</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                <Brain className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Aucun quiz créé</p>
                <p className="text-sm text-gray-400 mb-5">Générez votre premier quiz via l&apos;IA ou importez depuis votre bibliothèque</p>
                <Button onClick={openModal} className="bg-emerald-600 hover:bg-emerald-700">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Créer mon premier quiz
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-emerald-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">{quiz.titre}</p>
                        {statusBadge(quiz.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          {quiz.questions_count ?? 0} questions
                        </span>
                        {quiz.temps_limite && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {quiz.temps_limite} min
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {quiz.tentatives_count ?? 0} tentatives
                        </span>
                        <span>Score passage: {quiz.score_passage}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-gray-200 hover:border-emerald-300 hover:text-emerald-700"
                        onClick={() => router.push(`/teacher/quiz/${quiz.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Voir & Éditer
                      </Button>
                      {quiz.status === 'brouillon' && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          onClick={() => handlePublish(quiz.id)}
                        >
                          <PlayCircle className="w-3.5 h-3.5 mr-1" />
                          Publier
                        </Button>
                      )}
                      {quiz.status === 'publie' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-gray-200"
                            onClick={() => router.push(`/teacher/quiz/${quiz.id}/statistiques`)}
                          >
                            <BarChart2 className="w-3.5 h-3.5 mr-1" />
                            Stats
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-gray-200"
                            onClick={() => handleArchive(quiz.id)}
                          >
                            <Archive className="w-3.5 h-3.5 mr-1" />
                            Archiver
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Modal Création Quiz ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (step === 'idle' || step === 'done' || step === 'error') { setShowModal(false); resetModal(); } }}
          />

          {/* Panneau */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  {modalTab === 'ia' ? <Brain className="w-5 h-5 text-emerald-600" /> : <Database className="w-5 h-5 text-emerald-600" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Nouveau Quiz</h3>
                  <p className="text-xs text-gray-400">Choisissez votre méthode de création</p>
                </div>
              </div>
              {(step === 'idle' || step === 'error') && (
                <button
                  onClick={() => { setShowModal(false); resetModal(); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Onglets */}
            {step === 'idle' && (
              <div className="flex border-b border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setModalTab('ia')}
                  className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${modalTab === 'ia' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Brain className="w-4 h-4" />
                    Générer avec l&apos;IA
                  </div>
                </button>
                <button
                  onClick={() => setModalTab('bibliotheque')}
                  className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 ${modalTab === 'bibliotheque' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Database className="w-4 h-4" />
                    Depuis ma bibliothèque
                    {qcmList.length > 0 && (
                      <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5">{qcmList.length}</span>
                    )}
                  </div>
                </button>
              </div>
            )}

            {/* Contenu scrollable */}
            <div className="p-6 overflow-y-auto flex-1">

              {/* États de chargement / done / error */}
              {step === 'uploading' || step === 'generating' ? (
                <div className="text-center py-10">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                    {modalTab === 'ia'
                      ? <Brain className="absolute inset-0 m-auto w-6 h-6 text-emerald-600" />
                      : <Database className="absolute inset-0 m-auto w-6 h-6 text-emerald-600" />}
                  </div>
                  <p className="font-semibold text-gray-900">
                    {modalTab === 'ia'
                      ? (step === 'uploading' ? 'Envoi du document…' : 'L&apos;IA génère vos questions…')
                      : 'Création du quiz depuis la bibliothèque…'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {modalTab === 'ia' ? 'Cela peut prendre 10–30 secondes' : 'Veuillez patienter'}
                  </p>
                </div>
              ) : step === 'done' ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Quiz créé avec succès !</p>
                  <p className="text-sm text-gray-400 mt-1">Révisez les questions avant de publier</p>
                </div>
              ) : step === 'error' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700 text-sm">Erreur</p>
                      <p className="text-xs text-red-500 mt-0.5">{errorMsg}</p>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep('idle')}>
                    Réessayer
                  </Button>
                </div>

              ) : modalTab === 'ia' ? (
                /* ── Onglet IA ── */
                <div className="space-y-5">
                  {/* Fichier */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Document source *</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${file ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'}`}
                    >
                      {file ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700 truncate max-w-[280px]">{file.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Cliquez pour sélectionner un fichier</p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — max 10 Mo</p>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </div>

                  {/* Titre */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Titre du quiz *</Label>
                    <Input placeholder="Ex: Quiz — Introduction au Machine Learning" value={titre} onChange={(e) => setTitre(e.target.value)} />
                  </div>

                  {/* Paramètres */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Nb questions</Label>
                      <Input type="number" min={3} max={30} value={nbQuestions} onChange={(e) => setNbQuestions(Number(e.target.value))} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Temps (min)</Label>
                      <Input type="number" min={5} max={180} placeholder="Illimité" value={tempsLimite}
                        onChange={(e) => setTempsLimite(e.target.value ? Number(e.target.value) : '')} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Score passage %</Label>
                      <Input type="number" min={0} max={100} value={scorePassage} onChange={(e) => setScorePassage(Number(e.target.value))} />
                    </div>
                  </div>

                  <Button
                    id="btn-lancer-generation"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-200"
                    disabled={!file || !titre.trim()}
                    onClick={handleGenerate}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Générer le quiz avec l&apos;IA
                  </Button>
                </div>

              ) : (
                /* ── Onglet Bibliothèque ── */
                <div className="space-y-4">
                  {qcmLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Chargement de la bibliothèque…</p>
                    </div>
                  ) : qcmList.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
                      <Database className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Bibliothèque vide</p>
                      <p className="text-sm text-gray-400 mt-1 mb-4">Ajoutez des QCM depuis la page bibliothèque</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setShowModal(false); router.push('/teacher/qcm-bibliotheque'); }}
                        className="border-emerald-200 text-emerald-700"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Aller à ma bibliothèque
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Recherche */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Rechercher un QCM…"
                          value={qcmSearch}
                          onChange={(e) => setQcmSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      {/* Liste QCM */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredQcm.length === 0 ? (
                          <p className="text-center text-sm text-gray-400 py-4">Aucun résultat</p>
                        ) : filteredQcm.map(qcm => (
                          <button
                            key={qcm.id}
                            onClick={() => setSelectedQcm(selectedQcm?.id === qcm.id ? null : qcm)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${selectedQcm?.id === qcm.id
                              ? 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-300'
                              : 'border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedQcm?.id === qcm.id ? 'bg-emerald-200' : 'bg-gray-100'}`}>
                                  <FileText className={`w-4 h-4 ${selectedQcm?.id === qcm.id ? 'text-emerald-700' : 'text-gray-500'}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm text-gray-900 truncate">{qcm.titre}</p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-xs text-gray-500">{qcm.nb_questions} questions</span>
                                    {qcm.discipline && <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{qcm.discipline.discipline}</span>}
                                    {qcm.niveau && <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{qcm.niveau.niveau}</span>}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${selectedQcm?.id === qcm.id ? 'text-emerald-500 rotate-90' : 'text-gray-300'}`} />
                            </div>

                            {/* Stats difficulté */}
                            {selectedQcm?.id === qcm.id && (
                              <div className="flex gap-2 mt-2 pt-2 border-t border-emerald-100">
                                {qcm.nb_facile > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{qcm.nb_facile} facile</span>}
                                {qcm.nb_moyen > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{qcm.nb_moyen} moyen</span>}
                                {qcm.nb_difficile > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{qcm.nb_difficile} difficile</span>}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Formulaire si un QCM est sélectionné */}
                      {selectedQcm && (
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Paramètres du quiz</p>
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Titre du quiz *</Label>
                            <Input placeholder={`Quiz — ${selectedQcm.titre}`} value={titre} onChange={(e) => setTitre(e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-500 mb-1 block">Temps limite (min)</Label>
                              <Input type="number" min={5} max={180} placeholder="Illimité" value={tempsLimite}
                                onChange={(e) => setTempsLimite(e.target.value ? Number(e.target.value) : '')} />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 mb-1 block">Score de passage %</Label>
                              <Input type="number" min={0} max={100} value={scorePassage} onChange={(e) => setScorePassage(Number(e.target.value))} />
                            </div>
                          </div>
                        </div>
                      )}

                      <Button
                        id="btn-creer-depuis-biblio"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-200"
                        disabled={!canSubmitBiblio}
                        onClick={handleBiblioImport}
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Créer le quiz depuis ce QCM
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
