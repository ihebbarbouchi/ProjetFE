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
  Database, Upload, FileText, Trash2, Eye, Loader2,
  PlusCircle, XCircle, CheckCircle2, AlertCircle,
  HelpCircle, BookOpen, Search, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

interface Discipline { id: number; discipline: string; }
interface Niveau { id: number; niveau: string; }

interface QcmBib {
  id: number;
  titre: string;
  description?: string;
  nb_questions: number;
  nb_facile: number;
  nb_moyen: number;
  nb_difficile: number;
  is_active: boolean;
  discipline?: Discipline;
  niveau?: Niveau;
  created_at: string;
}

type UploadStep = 'idle' | 'uploading' | 'done' | 'error';

export default function QcmBibliothequePage() {
  const router = useRouter();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [qcmList, setQcmList] = useState<QcmBib[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Modal upload
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<UploadStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [disciplineId, setDisciplineId] = useState<number | ''>('');
  const [niveauId, setNiveauId] = useState<number | ''>('');

  // Données méta
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);

  const getToken = () => token || localStorage.getItem('auth_token') || '';

  // ── Chargements ────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const t = getToken();
      const [resQcm, resMeta] = await Promise.all([
        fetch(`${API_URL}/qcm-bibliotheque`, { headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' } }),
        fetch(`${API_URL}/qcm-bibliotheque/meta`, { headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' } }),
      ]);
      if (resQcm.ok) setQcmList(await resQcm.json());
      if (resMeta.ok) {
        const meta = await resMeta.json();
        setDisciplines(meta.disciplines ?? []);
        setNiveaux(meta.niveaux ?? []);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Upload ─────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file || !titre.trim()) return;
    const t = getToken();
    setStep('uploading');
    setErrorMsg('');

    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('titre', titre.trim());
    if (description.trim()) formData.append('description', description.trim());
    if (disciplineId) formData.append('discipline_id', String(disciplineId));
    if (niveauId) formData.append('niveau_id', String(niveauId));

    try {
      const res = await fetch(`${API_URL}/qcm-bibliotheque`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur d\'upload');

      setStep('done');
      fetchAll();
      setTimeout(() => { setShowModal(false); resetModal(); }, 1800);
    } catch (err: unknown) {
      setStep('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  // ── Suppression ────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce QCM de la bibliothèque ? Cette action est irréversible.')) return;
    const t = getToken();
    try {
      const res = await fetch(`${API_URL}/qcm-bibliotheque/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}`, Accept: 'application/json' },
      });
      if (res.ok) {
        setQcmList(prev => prev.filter(q => q.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch { /* silent */ }
  };

  const resetModal = () => {
    setFile(null);
    setTitre('');
    setDescription('');
    setDisciplineId('');
    setNiveauId('');
    setStep('idle');
    setErrorMsg('');
  };

  const filtered = qcmList.filter(q =>
    q.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.discipline?.discipline || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Rendu ──────────────────────────────────────────────────────
  return (
    <Layout role="teacher">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Bibliothèque QCM</h2>
            <p className="text-gray-600 mt-1">Gérez votre collection de bases de questions QCM</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/teacher/quiz')}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Mes Quiz
            </Button>
            <Button
              id="btn-ajouter-qcm"
              onClick={() => { resetModal(); setShowModal(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Ajouter un QCM
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total QCM', value: qcmList.length, color: 'emerald' },
            { label: 'Questions au total', value: qcmList.reduce((s, q) => s + q.nb_questions, 0), color: 'emerald' },
            { label: 'Disciplines couvertes', value: new Set(qcmList.map(q => q.discipline?.id)).size, color: 'emerald' },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full bg-${s.color}-100 flex items-center justify-center`}>
                  <Database className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Liste */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle>Mes QCM</CardTitle>
                <CardDescription>Cliquez sur un QCM pour voir le détail</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Chargement…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-xl">
                <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  {qcmList.length === 0 ? 'Bibliothèque vide' : 'Aucun résultat'}
                </p>
                <p className="text-sm text-gray-400 mb-5">
                  {qcmList.length === 0
                    ? 'Ajoutez votre premier fichier QCM JSON'
                    : 'Modifiez votre recherche'}
                </p>
                {qcmList.length === 0 && (
                  <Button
                    onClick={() => { resetModal(); setShowModal(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Ajouter mon premier QCM
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(qcm => (
                  <div key={qcm.id} className="border border-gray-100 rounded-xl overflow-hidden hover:border-emerald-200 transition-all">
                    {/* Row principale */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-emerald-50/30 transition-colors"
                      onClick={() => setExpandedId(expandedId === qcm.id ? null : qcm.id)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 truncate">{qcm.titre}</p>
                          {qcm.discipline && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{qcm.discipline.discipline}</span>
                          )}
                          {qcm.niveau && (
                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">{qcm.niveau.niveau}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                          <span>{qcm.nb_questions} questions</span>
                          {qcm.nb_facile > 0 && <span className="text-emerald-600">{qcm.nb_facile} facile</span>}
                          {qcm.nb_moyen > 0 && <span className="text-emerald-500 opacity-80">{qcm.nb_moyen} moyen</span>}
                          {qcm.nb_difficile > 0 && <span className="text-emerald-700 font-semibold">{qcm.nb_difficile} difficile</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          onClick={(e) => { e.stopPropagation(); router.push('/teacher/quiz'); }}
                        >
                          <HelpCircle className="w-3.5 h-3.5 mr-1" />
                          Créer un quiz
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={(e) => { e.stopPropagation(); handleDelete(qcm.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {expandedId === qcm.id
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Détail expandable */}
                    {expandedId === qcm.id && (
                      <div className="border-t border-gray-50 px-4 py-4 bg-gray-50/50">
                        {qcm.description && (
                          <p className="text-sm text-gray-600 mb-3">{qcm.description}</p>
                        )}
                        {/* Barre de progression difficulté */}
                        {qcm.nb_questions > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Répartition des difficultés</p>
                            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                              {qcm.nb_facile > 0 && (
                                <div className="bg-emerald-400 transition-all" style={{ width: `${(qcm.nb_facile / qcm.nb_questions) * 100}%` }} title={`${qcm.nb_facile} facile(s)`} />
                              )}
                              {qcm.nb_moyen > 0 && (
                                <div className="bg-emerald-300 transition-all" style={{ width: `${(qcm.nb_moyen / qcm.nb_questions) * 100}%` }} title={`${qcm.nb_moyen} moyen(s)`} />
                              )}
                              {qcm.nb_difficile > 0 && (
                                <div className="bg-emerald-600 transition-all" style={{ width: `${(qcm.nb_difficile / qcm.nb_questions) * 100}%` }} title={`${qcm.nb_difficile} difficile(s)`} />
                              )}
                            </div>
                            <div className="flex gap-4 text-xs">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{qcm.nb_facile} facile</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-300 inline-block" />{qcm.nb_moyen} moyen</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />{qcm.nb_difficile} difficile</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Modal Upload QCM ───────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (step === 'idle' || step === 'error') { setShowModal(false); resetModal(); } }}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Database className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Ajouter un QCM</h3>
                  <p className="text-xs text-gray-400">Importez un fichier JSON structuré</p>
                </div>
              </div>
              {(step === 'idle' || step === 'error') && (
                <button onClick={() => { setShowModal(false); resetModal(); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Contenu */}
            <div className="p-6">
              {step === 'uploading' ? (
                <div className="text-center py-10">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                    <Database className="absolute inset-0 m-auto w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-gray-900">Import en cours…</p>
                  <p className="text-sm text-gray-400 mt-1">Validation et sauvegarde du QCM</p>
                </div>
              ) : step === 'done' ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-gray-900">QCM ajouté avec succès !</p>
                  <p className="text-sm text-gray-400 mt-1">Il est disponible dans votre bibliothèque</p>
                </div>
              ) : step === 'error' ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-800 text-sm">Erreur d&apos;import</p>
                      <p className="text-xs text-emerald-600 mt-0.5">{errorMsg}</p>
                    </div>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setStep('idle')}>
                    Réessayer
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Fichier JSON */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Fichier JSON *</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${file ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'}`}
                    >
                      {file ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700 truncate max-w-[220px]">{file.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Cliquez pour sélectionner</p>
                          <p className="text-xs text-gray-400 mt-1">Fichier .json — max 5 Mo</p>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden"
                      onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  </div>

                  {/* Titre */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Titre *</Label>
                    <Input placeholder="Ex: QCM Algorithmique — Niveau débutant" value={titre} onChange={e => setTitre(e.target.value)} />
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Description</Label>
                    <Input placeholder="Description courte (optionnel)" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>

                  {/* Discipline & Niveau */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Discipline</Label>
                      <select
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={disciplineId}
                        onChange={e => setDisciplineId(e.target.value ? Number(e.target.value) : '')}
                      >
                        <option value="">— aucune —</option>
                        {disciplines.map(d => <option key={d.id} value={d.id}>{d.discipline}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Niveau</Label>
                      <select
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={niveauId}
                        onChange={e => setNiveauId(e.target.value ? Number(e.target.value) : '')}
                      >
                        <option value="">— aucun —</option>
                        {niveaux.map(n => <option key={n.id} value={n.id}>{n.niveau}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Bouton */}
                  <Button
                    id="btn-confirmer-upload-qcm"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02] shadow-lg shadow-emerald-200"
                    disabled={!file || !titre.trim()}
                    onClick={handleUpload}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Ajouter à ma bibliothèque
                  </Button>

                  {/* Format attendu */}
                  <details className="text-xs text-gray-400 cursor-pointer">
                    <summary className="hover:text-gray-600 select-none">Voir le format JSON attendu</summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-lg overflow-auto text-[11px] text-gray-600 border border-gray-100">{`[
  {
    "enonce": "Question ici ?",
    "difficulte": "facile",
    "points": 1,
    "explication": "Explication.",
    "choix": [
      { "texte": "Choix A", "est_correct": true },
      { "texte": "Choix B", "est_correct": false }
    ]
  }
]`}</pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
