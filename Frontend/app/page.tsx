'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicLayout } from './components/PublicLayout';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import {
  Users, BookOpen, GraduationCap, ArrowRight, Share2, TrendingUp,
  Clock, Target, FileText, Star, Quote, CheckCircle, Sparkles,
  UserPlus, LayoutDashboard, Rocket,
} from 'lucide-react';

// ── Static data ───────────────────────────────────────────────────────────────

const features = [
  {
    title: 'Partage de ressources',
    description: 'Publiez vos supports pédagogiques en quelques secondes et rendez-les accessibles à toute la communauté.',
    icon: Share2,
    bg: 'bg-blue-100',
    color: 'text-blue-600',
  },
  {
    title: 'Collaboration active',
    description: 'Interagissez avec enseignants et étudiants dans un environnement structuré et bienveillant.',
    icon: Users,
    bg: 'bg-indigo-100',
    color: 'text-indigo-600',
  },
  {
    title: 'Apprentissage flexible',
    description: 'Accédez à vos contenus à tout moment, sur n\'importe quel appareil, à votre propre rythme.',
    icon: Clock,
    bg: 'bg-violet-100',
    color: 'text-violet-600',
  },
  {
    title: 'Suivi de progression',
    description: 'Visualisez vos avancées, identifiez vos points forts et les axes d\'amélioration en temps réel.',
    icon: TrendingUp,
    bg: 'bg-cyan-100',
    color: 'text-cyan-600',
  },
] as const;

const steps = [
  {
    number: '01',
    title: 'Créez votre compte',
    description: 'Inscrivez-vous gratuitement en quelques étapes. Choisissez votre profil : apprenant ou enseignant.',
    icon: UserPlus,
  },
  {
    number: '02',
    title: 'Explorez & partagez',
    description: 'Parcourez des milliers de ressources ou publiez vos propres supports pédagogiques.',
    icon: LayoutDashboard,
  },
  {
    number: '03',
    title: 'Apprenez & progressez',
    description: 'Participez à des quiz, suivez votre progression et collaborez avec votre communauté.',
    icon: Rocket,
  },
] as const;

const competences = [
  { icon: Target, label: 'Compétences orientées carrière', desc: 'Des ressources alignées avec les besoins du marché du travail actuel.' },
  { icon: FileText, label: 'Ressources actualisées', desc: 'Des contenus mis à jour régulièrement par des enseignants experts.' },
  { icon: BookOpen, label: 'Apprentissage autonome', desc: 'Apprenez à votre rythme avec des outils conçus pour l\'auto-formation.' },
] as const;

const testimonials = [
  {
    name: 'Sarah Dupont',
    role: 'Étudiante en informatique',
    feedback: 'EduShare m\'a permis d\'accéder à des ressources de qualité et de progresser rapidement dans mes études. Une plateforme vraiment indispensable !',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Marc Leblanc',
    role: 'Enseignant de mathématiques',
    feedback: 'Une plateforme intuitive qui facilite vraiment le partage de mes cours avec mes étudiants. Le gain de temps est considérable.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwc3R1ZGVudCUyMHBvcnRyYWl0JTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzcyNTM3ODE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Julie Martin',
    role: 'Formatrice en langues',
    feedback: 'Mes étudiants adorent la flexibilité et la variété des ressources disponibles sur EduShare. Je recommande à tous les formateurs.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1758685848006-1bc450061624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwd29tYW4lMjBwb3J0cmFpdCUyMHByb2Zlc3Npb25hbCUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NzI1Mzc4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
] as const;

const statistics = [
  { value: '10K+', label: 'Utilisateurs actifs', icon: Users },
  { value: '2K+', label: 'Ressources disponibles', icon: BookOpen },
  { value: '500+', label: 'Enseignants certifiés', icon: GraduationCap },
  { value: '95%', label: 'Taux de satisfaction', icon: Star },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();

  return (
    <PublicLayout>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden border-b border-gray-100">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl opacity-50 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4" />
                Plateforme éducative collaborative
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Une nouvelle façon d&apos;apprendre et de{' '}
                <span className="text-blue-600">partager le savoir</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                EduShare connecte étudiants et enseignants à travers une plateforme
                moderne de partage de ressources et d&apos;apprentissage collaboratif.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-base font-semibold px-8 py-6 rounded-xl shadow-lg shadow-blue-200"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/public-resources')}
                  className="text-base font-semibold px-8 py-6 rounded-xl border-gray-200"
                >
                  Parcourir les ressources
                </Button>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100">
                {[
                  { value: '10 000+', label: 'Étudiants actifs' },
                  { value: '500+', label: 'Enseignants' },
                  { value: '2 000+', label: 'Ressources' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – overlapping images */}
            <div className="relative h-[500px] lg:h-[600px]">
              <div className="absolute top-0 left-0 w-3/4 h-3/4 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1758270705902-f50dde4add9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjBncm91cCUyMGVkdWNhdGlvbiUyMGhhcHB5fGVufDF8fHx8MTc3MjUzNzgxOHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Étudiants heureux"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-2/3 h-2/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1620856900883-e12a5ea43735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMHRlYWNoZXJzJTIwZGlnaXRhbCUyMGxlYXJuaW5nJTIwY29sbGFib3JhdGlvbiUyMGxhcHRvcHxlbnwxfHx8fDE3NzIxODg0NzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Collaboration numérique"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-1/4 right-0 w-1/3 h-1/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1759884248009-92c5e957708e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGVhcm5pbmclMjBsYXB0b3AlMjBtb2Rlcm4lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcyNTM3ODE3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Apprentissage moderne"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute top-4 right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">+120 ressources</p>
                  <p className="text-xs text-gray-500">ajoutées cette semaine</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Fonctionnalités clés
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir EduShare ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour apprendre, enseigner et collaborer — au même endroit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 bg-white">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className={`w-7 h-7 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Simple &amp; rapide
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Lancez-vous en 3 étapes simples et rejoignez notre communauté.
            </p>
          </div>

          <div className="relative">
            {/* Connecting dashed line */}
            <div className="hidden lg:block absolute top-14 left-[calc(16.6%+2rem)] right-[calc(16.6%+2rem)] h-px border-t-2 border-dashed border-blue-200" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map((step, i) => (
                <div key={i} className="relative text-center group">
                  <div className="relative z-10 w-28 h-28 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
                    <step.icon className="w-8 h-8 mb-1" />
                    <span className="text-xs font-semibold opacity-80">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-14">
            <Button
              onClick={() => router.push('/signup')}
              className="bg-blue-600 hover:bg-blue-700 px-10 py-6 rounded-xl text-base font-semibold shadow-lg shadow-blue-200"
            >
              Démarrer maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── COMPETENCES ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="space-y-8">
              <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                Impact concret
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Développez les compétences{' '}
                <span className="text-blue-600">recherchées sur le marché</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                EduShare prépare les étudiants et enseignants aux exigences du monde
                numérique grâce à des ressources de qualité et des outils modernes.
              </p>
              <div className="space-y-4">
                {competences.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – image + floating stat card */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1759884248009-92c5e957708e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGVhcm5pbmclMjBsYXB0b3AlMjBtb2Rlcm4lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcyNTM3ODE3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Étudiant avec laptop"
                  className="w-full h-[520px] object-cover"
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">5+</p>
                    <p className="text-sm text-gray-600 mt-1">Années d&apos;expérience</p>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <p className="text-4xl font-bold text-blue-600">95%</p>
                    <p className="text-sm text-gray-600 mt-1">Taux de satisfaction</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-yellow-50 text-yellow-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              Témoignages
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Des milliers d&apos;utilisateurs nous font confiance chaque jour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 bg-white">
                <CardContent className="p-8">
                  <Quote className="w-8 h-8 text-blue-100 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, si) => (
                      <Star key={si} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    &ldquo;{t.feedback}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTICS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statistics.map(({ value, label, icon: Icon }, i) => (
              <div key={i} className="group">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-5xl md:text-6xl font-bold text-white mb-2">{value}</p>
                <p className="text-blue-100 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                🎓 Rejoignez 10 000+ apprenants
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Prêt à transformer votre expérience d&apos;apprentissage ?
              </h2>
              <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
                Créez votre compte gratuitement dès aujourd&apos;hui et rejoignez une
                communauté éducative innovante.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => router.push('/signup')}
                  className="bg-white text-blue-600 hover:bg-gray-50 text-lg font-bold px-10 py-6 rounded-xl shadow-2xl"
                >
                  S&apos;inscrire gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link
                  href="/public-resources"
                  className="text-blue-100 hover:text-white text-base font-medium underline-offset-4 hover:underline transition-colors"
                >
                  Parcourir sans inscription →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}