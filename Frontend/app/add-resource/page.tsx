'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  ArrowLeft, BookOpen, FileText, HelpCircle, Plus, Trash2,
  Globe, Lock, CloudUpload, Paperclip, Info, CheckCircle2,
  AlignLeft, Layers,
} from 'lucide-react';

// ── Reusable Section Card ──────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  iconBg = 'bg-emerald-100',
  iconColor = 'text-emerald-600',
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Visibility Toggle ──────────────────────────────────────────────────────────
function VisibilityToggle({
  value,
  onChange,
}: {
  value: 'public' | 'private';
  onChange: (v: 'public' | 'private') => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { v: 'public' as const,  Icon: Globe, label: 'Public',  sub: 'VISIBLE PAR TOUS' },
        { v: 'private' as const, Icon: Lock,  label: 'Privé',   sub: 'UNIQUEMENT MOI'   },
      ].map(({ v, Icon, label, sub }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
            value === v
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          {value === v && (
            <span className="absolute top-3 right-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </span>
          )}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${value === v ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <Icon className={`w-6 h-6 ${value === v ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <div className="text-center">
            <p className={`font-bold text-sm ${value === v ? 'text-emerald-700' : 'text-gray-700'}`}>{label}</p>
            <p className={`text-[10px] font-semibold tracking-widest uppercase mt-0.5 ${value === v ? 'text-emerald-500' : 'text-gray-400'}`}>{sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Drag-and-Drop Upload Zone ──────────────────────────────────────────────────
function UploadZone({
  accept,
  label,
  hint,
  multiple = false,
  onChange,
}: {
  accept: string;
  label: string;
  hint: string[];
  multiple?: boolean;
  onChange?: (files: FileList | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setFileNames(Array.from(files).map(f => f.name));
    onChange?.(files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 transition-all ${
        dragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/40'
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
        <CloudUpload className="w-7 h-7 text-emerald-600" />
      </div>
      {fileNames.length > 0 ? (
        <div className="text-center">
          {fileNames.map(name => (
            <p key={name} className="text-sm font-semibold text-emerald-700">{name}</p>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-sm text-gray-500 mt-1">
            ou <span className="text-emerald-600 underline cursor-pointer">cliquez pour parcourir</span> vos fichiers
          </p>
        </div>
      )}
      <div className="flex gap-2 mt-1">
        {hint.map(h => (
          <span key={h} className="text-[10px] font-bold tracking-widest uppercase text-gray-400 border border-gray-200 rounded-full px-3 py-1 bg-white">
            {h}
          </span>
        ))}
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}

// ── Action Buttons ─────────────────────────────────────────────────────────────
function FormActions({ submitLabel, onCancel }: { submitLabel: string; onCancel: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 pt-2">
      <button
        type="submit"
        className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01] active:scale-95"
      >
        <CloudUpload className="w-5 h-5" />
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-14 rounded-2xl border border-gray-200 bg-white text-gray-500 font-semibold text-base hover:bg-gray-50 transition-all"
      >
        Annuler
      </button>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function AddResource() {
  const router = useRouter();
  const [resourceType, setResourceType] = useState<'pdf' | 'course' | 'quiz'>('pdf');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  // PDF / Document state
  const [docCategory, setDocCategory] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');

  // Course state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseLevel, setCourseLevel] = useState('');

  // Quiz state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizCategory, setQuizCategory] = useState('');
  const [quizPassingScore, setQuizPassingScore] = useState('70');
  const [questions, setQuestions] = useState([
    { id: 1, question: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);

  const addQuestion = () =>
    setQuestions([...questions, { id: questions.length + 1, question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const removeQuestion = (id: number) => setQuestions(questions.filter(q => q.id !== id));
  const updateQuestion = (id: number, field: string, value: unknown) =>
    setQuestions(questions.map(q => (q.id === id ? { ...q, [field]: value } : q)));
  const updateOption = (qId: number, idx: number, val: string) =>
    setQuestions(questions.map(q => q.id === qId ? { ...q, options: q.options.map((o, i) => i === idx ? val : o) } : q));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/teacher');
  };

  const tabs = [
    { key: 'pdf',    label: 'PDF / Document', Icon: Paperclip   },
    { key: 'course', label: 'Cours',           Icon: BookOpen    },
    { key: 'quiz',   label: 'Quiz',            Icon: HelpCircle  },
  ] as const;

  return (
    <Layout role="teacher">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/teacher')}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ajouter une ressource</h2>
            <p className="text-sm text-gray-500 mt-0.5">Partagez vos contenus pédagogiques avec vos apprenants</p>
          </div>
        </div>

        {/* ── Type Tabs ── */}
        <div className="flex gap-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-1.5">
          {tabs.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setResourceType(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                resourceType === key
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════ PDF FORM ══════════════════ */}
        {resourceType === 'pdf' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Catégorie */}
            <SectionCard icon={Layers} title="Sélectionnez la catégorie" description="Choisissez la catégorie existante à laquelle vous voulez ajouter ce PDF.">
              <p className="text-sm font-semibold text-emerald-600">La catégorie détermine la discipline et le niveau.</p>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Select value={docCategory} onValueChange={setDocCategory}>
                  <SelectTrigger id="pdf-category" className="pl-9 rounded-xl border-gray-200 h-12">
                    <SelectValue placeholder="Choisir une catégorie du catalogue..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">Programmation</SelectItem>
                    <SelectItem value="mathematics">Mathématiques</SelectItem>
                    <SelectItem value="science">Sciences</SelectItem>
                    <SelectItem value="languages">Langues</SelectItem>
                    <SelectItem value="business">Gestion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SectionCard>

            {/* Upload */}
            <SectionCard icon={Paperclip} iconBg="bg-emerald-100" title="Téléversez votre fichier PDF" description="Glissez-déposez votre fichier ou cliquez pour parcourir vos fichiers.">
              <UploadZone
                accept=".pdf"
                label="Glissez-déposez votre fichier"
                hint={['.PDF UNIQUEMENT', 'MAX 10 FICHIERS']}
                multiple
              />
            </SectionCard>

            {/* Informations */}
            <SectionCard icon={Info} iconBg="bg-emerald-100" title="Informations sur la ressource" description="Structurez et décrivez votre contenu">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Titre du PDF</label>
                  <Input
                    id="pdf-title"
                    placeholder='Ex : "Introduction à l&apos;algèbre linéaire"'
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                    className="rounded-xl border-gray-200 h-12"
                    required
                  />
                  <p className="text-xs text-gray-400">Donnez un titre clair pour votre PDF</p>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <AlignLeft className="w-3.5 h-3.5" /> Description détaillée
                  </label>
                  <Textarea
                    id="pdf-description"
                    placeholder="Décrivez le contenu, les objectifs pédagogiques et le public visé..."
                    rows={4}
                    value={docDescription}
                    onChange={e => setDocDescription(e.target.value)}
                    className="rounded-xl border-gray-200 resize-none"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Visibilité */}
            <SectionCard icon={Globe} iconBg="bg-emerald-100" title="Visibilité" description="Choisissez qui pourra voir cette ressource">
              <VisibilityToggle value={visibility} onChange={setVisibility} />
            </SectionCard>

            <FormActions submitLabel="Publier mon PDF" onCancel={() => router.push('/teacher')} />
          </form>
        )}

        {/* ══════════════════ COURSE FORM ══════════════════ */}
        {resourceType === 'course' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <SectionCard icon={BookOpen} title="Informations sur le cours" description="Décrivez votre cours pour les apprenants">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Titre du cours *</label>
                  <Input id="course-title" placeholder="Ex : Introduction à la programmation Python" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className="rounded-xl border-gray-200 h-12" required />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <AlignLeft className="w-3.5 h-3.5" /> Description
                  </label>
                  <Textarea id="course-description" placeholder="Décrivez ce que les apprenants vont apprendre..." rows={4} value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className="rounded-xl border-gray-200 resize-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Catégorie *</label>
                    <Select value={courseCategory} onValueChange={setCourseCategory}>
                      <SelectTrigger id="course-category" className="rounded-xl border-gray-200 h-12"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programming">Programmation</SelectItem>
                        <SelectItem value="mathematics">Mathématiques</SelectItem>
                        <SelectItem value="science">Sciences</SelectItem>
                        <SelectItem value="languages">Langues</SelectItem>
                        <SelectItem value="business">Gestion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Niveau *</label>
                    <Select value={courseLevel} onValueChange={setCourseLevel}>
                      <SelectTrigger id="course-level" className="rounded-xl border-gray-200 h-12"><SelectValue placeholder="Niveau" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Débutant</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Durée estimée *</label>
                  <Input id="course-duration" placeholder="Ex : 8 heures, 4 semaines" value={courseDuration} onChange={e => setCourseDuration(e.target.value)} className="rounded-xl border-gray-200 h-12" required />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={CloudUpload} title="Contenu du cours" description="Téléversez vos fichiers de cours (vidéos, PDFs, etc.)">
              <UploadZone accept="*" label="Glissez-déposez vos fichiers" hint={['VIDÉOS', 'PDF', 'TOUT FORMAT']} multiple />
            </SectionCard>

            <SectionCard icon={Globe} iconBg="bg-emerald-100" title="Visibilité" description="Choisissez qui pourra voir ce cours">
              <VisibilityToggle value={visibility} onChange={setVisibility} />
            </SectionCard>

            <FormActions submitLabel="Publier le cours" onCancel={() => router.push('/teacher')} />
          </form>
        )}

        {/* ══════════════════ QUIZ FORM ══════════════════ */}
        {resourceType === 'quiz' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <SectionCard icon={HelpCircle} title="Informations sur le quiz" description="Configurez votre quiz pour les apprenants">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Titre du quiz *</label>
                  <Input id="quiz-title" placeholder="Ex : Quiz Python — Fondamentaux" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} className="rounded-xl border-gray-200 h-12" required />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    <AlignLeft className="w-3.5 h-3.5" /> Description
                  </label>
                  <Textarea id="quiz-description" placeholder="Quels sujets ce quiz couvre-t-il ?" rows={3} value={quizDescription} onChange={e => setQuizDescription(e.target.value)} className="rounded-xl border-gray-200 resize-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Catégorie *</label>
                    <Select value={quizCategory} onValueChange={setQuizCategory}>
                      <SelectTrigger id="quiz-category" className="rounded-xl border-gray-200 h-12"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programming">Programmation</SelectItem>
                        <SelectItem value="mathematics">Mathématiques</SelectItem>
                        <SelectItem value="science">Sciences</SelectItem>
                        <SelectItem value="languages">Langues</SelectItem>
                        <SelectItem value="business">Gestion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Score minimum (%)</label>
                    <Input id="quiz-passing" type="number" min="0" max="100" value={quizPassingScore} onChange={e => setQuizPassingScore(e.target.value)} className="rounded-xl border-gray-200 h-12" />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Questions */}
            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Question {qi + 1}</span>
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(q.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Input placeholder="Saisissez votre question" value={q.question} onChange={e => updateQuestion(q.id, 'question', e.target.value)} className="rounded-xl border-gray-200 h-11" required />
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctAnswer === oi}
                          onChange={() => updateQuestion(q.id, 'correctAnswer', oi)}
                          className="w-4 h-4 accent-emerald-600"
                        />
                        <Input placeholder={`Option ${oi + 1}`} value={opt} onChange={e => updateOption(q.id, oi, e.target.value)} className="rounded-xl border-gray-200 h-10" required />
                      </div>
                    ))}
                    <p className="text-xs text-gray-400">Sélectionnez le bouton radio pour la bonne réponse</p>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addQuestion}
                className="w-full h-12 rounded-2xl border-2 border-dashed border-emerald-300 text-emerald-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Ajouter une question
              </button>
            </div>

            <SectionCard icon={Globe} iconBg="bg-emerald-100" title="Visibilité" description="Choisissez qui pourra voir ce quiz">
              <VisibilityToggle value={visibility} onChange={setVisibility} />
            </SectionCard>

            <FormActions submitLabel="Publier le quiz" onCancel={() => router.push('/teacher')} />
          </form>
        )}

      </div>
    </Layout>
  );
}
