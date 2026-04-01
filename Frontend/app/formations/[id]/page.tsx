'use client';

import { useRouter, useParams } from 'next/navigation';
import { PublicLayout } from '../../components/PublicLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  BookOpen, Clock, BarChart3, ArrowLeft, CheckCircle,
  Users, Star, Award, ChevronRight, Play, Target,
  Calendar, Layers, TrendingUp,
} from 'lucide-react';

// ── Static formation data (mirrored from /formations page) ─────────────────
const FORMATIONS = [
  {
    id: 1,
    title: 'Full Stack Web Development',
    description: 'Complete training in front-end and back-end web development. From HTML/CSS basics to advanced React and Node.js applications.',
    modules: 12,
    level: 'Intermediate',
    durationMonths: 6,
    duration: '6 months',
    category: 'Programming',
    students: 1240,
    rating: 4.8,
    instructor: 'Dr. Ahmed Benali',
    language: 'Français',
    certificate: true,
    prerequisites: ['HTML/CSS basics', 'JavaScript fundamentals'],
    skills: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'Git', 'Docker'],
    curriculum: [
      { title: 'HTML & CSS Fundamentals', lessons: 8, duration: '2 weeks' },
      { title: 'JavaScript Essentials', lessons: 10, duration: '2 weeks' },
      { title: 'React Framework', lessons: 14, duration: '3 weeks' },
      { title: 'Node.js & Express', lessons: 12, duration: '2 weeks' },
      { title: 'Database with MongoDB', lessons: 8, duration: '2 weeks' },
      { title: 'REST API Design', lessons: 10, duration: '2 weeks' },
      { title: 'Authentication & Security', lessons: 6, duration: '1 week' },
      { title: 'Deployment & DevOps', lessons: 8, duration: '2 weeks' },
    ],
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 2,
    title: 'Data Science Mastery',
    description: 'Comprehensive data science training from basics to advanced ML. Learn data analysis, visualization, and machine learning.',
    modules: 15,
    level: 'Advanced',
    durationMonths: 8,
    duration: '8 months',
    category: 'Data Science',
    students: 870,
    rating: 4.9,
    instructor: 'Prof. Leila Mansouri',
    language: 'Français',
    certificate: true,
    prerequisites: ['Python basics', 'Statistics fundamentals', 'Linear algebra'],
    skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'Tableau'],
    curriculum: [
      { title: 'Python for Data Science', lessons: 10, duration: '2 weeks' },
      { title: 'Data Wrangling with Pandas', lessons: 8, duration: '2 weeks' },
      { title: 'Statistics & Probability', lessons: 12, duration: '3 weeks' },
      { title: 'Data Visualization', lessons: 8, duration: '2 weeks' },
      { title: 'Machine Learning Basics', lessons: 14, duration: '3 weeks' },
      { title: 'Deep Learning', lessons: 12, duration: '3 weeks' },
      { title: 'Real-world Projects', lessons: 6, duration: '2 weeks' },
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 3,
    title: 'Digital Marketing Fundamentals',
    description: 'Learn the essentials of digital marketing and social media. Grow brands online with proven strategies.',
    modules: 8,
    level: 'Beginner',
    durationMonths: 3,
    duration: '3 months',
    category: 'Business',
    students: 2100,
    rating: 4.7,
    instructor: 'Mme. Sara Haddad',
    language: 'Français',
    certificate: true,
    prerequisites: ['Basic computer skills', 'Social media familiarity'],
    skills: ['SEO', 'Google Ads', 'Social Media', 'Email Marketing', 'Analytics'],
    curriculum: [
      { title: 'Digital Marketing Overview', lessons: 6, duration: '1 week' },
      { title: 'SEO & SEM Fundamentals', lessons: 10, duration: '2 weeks' },
      { title: 'Social Media Marketing', lessons: 8, duration: '2 weeks' },
      { title: 'Email Marketing', lessons: 6, duration: '1 week' },
      { title: 'Analytics & Reporting', lessons: 8, duration: '2 weeks' },
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 4,
    title: 'Python Programming Complete Course',
    description: 'Master Python programming from beginner to expert level with hands-on projects and real-world applications.',
    modules: 10,
    level: 'Beginner',
    durationMonths: 4,
    duration: '4 months',
    category: 'Programming',
    students: 3450,
    rating: 4.8,
    instructor: 'Dr. Karim Tazi',
    language: 'Français',
    certificate: true,
    prerequisites: ['No prior experience needed'],
    skills: ['Python', 'OOP', 'File I/O', 'Libraries', 'Automation', 'APIs'],
    curriculum: [
      { title: 'Python Basics', lessons: 10, duration: '2 weeks' },
      { title: 'Control Flow & Functions', lessons: 8, duration: '2 weeks' },
      { title: 'Object-Oriented Programming', lessons: 10, duration: '2 weeks' },
      { title: 'Modules & Packages', lessons: 6, duration: '1 week' },
      { title: 'File Handling & Databases', lessons: 8, duration: '2 weeks' },
      { title: 'Web Scraping & APIs', lessons: 8, duration: '2 weeks' },
    ],
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 5,
    title: 'Machine Learning Engineer',
    description: 'Become a machine learning engineer with practical projects. Industry-ready curriculum for AI professionals.',
    modules: 18,
    level: 'Advanced',
    durationMonths: 10,
    duration: '10 months',
    category: 'Data Science',
    students: 540,
    rating: 4.9,
    instructor: 'Prof. Hamid Reza',
    language: 'Français',
    certificate: true,
    prerequisites: ['Python proficiency', 'Linear algebra', 'Calculus', 'Statistics'],
    skills: ['ML Algorithms', 'Neural Networks', 'MLOps', 'PyTorch', 'Kubernetes', 'Feature Engineering'],
    curriculum: [
      { title: 'ML Fundamentals', lessons: 12, duration: '2 weeks' },
      { title: 'Supervised Learning', lessons: 14, duration: '3 weeks' },
      { title: 'Unsupervised Learning', lessons: 10, duration: '2 weeks' },
      { title: 'Deep Learning', lessons: 16, duration: '3 weeks' },
      { title: 'NLP & Computer Vision', lessons: 14, duration: '3 weeks' },
      { title: 'MLOps & Deployment', lessons: 10, duration: '2 weeks' },
    ],
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 6,
    title: 'UX/UI Design Professional',
    description: 'Learn user experience and interface design principles. Create stunning, user-centered digital products.',
    modules: 9,
    level: 'Intermediate',
    durationMonths: 5,
    duration: '5 months',
    category: 'Design',
    students: 980,
    rating: 4.7,
    instructor: 'Mme. Nadia Ouali',
    language: 'Français',
    certificate: true,
    prerequisites: ['Basic design sense', 'Familiarity with digital products'],
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility'],
    curriculum: [
      { title: 'Design Thinking', lessons: 8, duration: '2 weeks' },
      { title: 'User Research Methods', lessons: 10, duration: '2 weeks' },
      { title: 'Wireframing & Prototyping', lessons: 12, duration: '3 weeks' },
      { title: 'Visual Design Principles', lessons: 10, duration: '2 weeks' },
      { title: 'Design Systems', lessons: 8, duration: '2 weeks' },
    ],
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 7,
    title: 'Mobile App Development',
    description: 'Build native mobile applications for iOS and Android using React Native and Flutter frameworks.',
    modules: 14,
    level: 'Intermediate',
    durationMonths: 7,
    duration: '7 months',
    category: 'Programming',
    students: 760,
    rating: 4.6,
    instructor: 'M. Youssef Baraka',
    language: 'Français',
    certificate: true,
    prerequisites: ['JavaScript basics', 'React fundamentals'],
    skills: ['React Native', 'Flutter', 'Dart', 'iOS', 'Android', 'App Store'],
    curriculum: [
      { title: 'Mobile Dev Fundamentals', lessons: 8, duration: '2 weeks' },
      { title: 'React Native Core', lessons: 14, duration: '3 weeks' },
      { title: 'Flutter & Dart', lessons: 12, duration: '3 weeks' },
      { title: 'State Management', lessons: 8, duration: '2 weeks' },
      { title: 'Native APIs & Features', lessons: 10, duration: '2 weeks' },
      { title: 'Publishing & Monetization', lessons: 6, duration: '1 week' },
    ],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 8,
    title: 'Cybersecurity Specialist',
    description: 'Learn to protect systems and networks from cyber threats. Industry-recognized security certifications preparation.',
    modules: 16,
    level: 'Advanced',
    durationMonths: 9,
    duration: '9 months',
    category: 'Security',
    students: 430,
    rating: 4.8,
    instructor: 'Col. (ret.) Rachid Amara',
    language: 'Français',
    certificate: true,
    prerequisites: ['Networking basics', 'Linux familiarity', 'Basic programming knowledge'],
    skills: ['Ethical Hacking', 'Network Security', 'Cryptography', 'Penetration Testing', 'SIEM'],
    curriculum: [
      { title: 'Security Foundations', lessons: 10, duration: '2 weeks' },
      { title: 'Network Security', lessons: 12, duration: '3 weeks' },
      { title: 'Ethical Hacking', lessons: 14, duration: '3 weeks' },
      { title: 'Web Application Security', lessons: 10, duration: '2 weeks' },
      { title: 'Forensics & Incident Response', lessons: 8, duration: '2 weeks' },
      { title: 'Cert Prep (CEH/CISSP)', lessons: 10, duration: '2 weeks' },
    ],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
  {
    id: 9,
    title: 'Cloud Computing with AWS',
    description: 'Master cloud infrastructure and services with Amazon Web Services. Get AWS certifications ready.',
    modules: 11,
    level: 'Intermediate',
    durationMonths: 5,
    duration: '5 months',
    category: 'Cloud',
    students: 690,
    rating: 4.7,
    instructor: 'Dr. Farid Belkadi',
    language: 'Français',
    certificate: true,
    prerequisites: ['Basic Linux', 'Networking fundamentals', 'Programming basics'],
    skills: ['AWS EC2', 'S3', 'RDS', 'Lambda', 'CloudFormation', 'IAM'],
    curriculum: [
      { title: 'Cloud Fundamentals', lessons: 8, duration: '2 weeks' },
      { title: 'AWS Core Services', lessons: 12, duration: '2 weeks' },
      { title: 'Storage & Databases', lessons: 10, duration: '2 weeks' },
      { title: 'Networking & Security', lessons: 8, duration: '2 weeks' },
      { title: 'Serverless & DevOps', lessons: 10, duration: '2 weeks' },
    ],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner': return 'bg-green-100 text-green-700';
    case 'Intermediate': return 'bg-blue-100 text-blue-700';
    case 'Advanced': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    Programming: 'bg-blue-50 text-blue-700',
    'Data Science': 'bg-violet-50 text-violet-700',
    Business: 'bg-amber-50 text-amber-700',
    Design: 'bg-pink-50 text-pink-700',
    Security: 'bg-red-50 text-red-700',
    Cloud: 'bg-sky-50 text-sky-700',
  };
  return map[category] ?? 'bg-gray-50 text-gray-700';
};

// ── Page component ─────────────────────────────────────────────────────────
export default function FormationDetail() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const formation = FORMATIONS.find(f => f.id === id);

  if (!formation) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-300" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Formation introuvable</h1>
          <p className="text-gray-500 mb-8">Cette formation n&apos;existe pas ou a été supprimée.</p>
          <Button onClick={() => router.push('/formations')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux formations
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const totalLessons = formation.curriculum.reduce((s, m) => s + m.lessons, 0);

  return (
    <PublicLayout>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-900 overflow-hidden">
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(${formation.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-blue-950/70 to-indigo-900/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          {/* Breadcrumb */}
          <button
            onClick={() => router.push('/formations')}
            className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm font-medium mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux formations
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left – Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${getCategoryColor(formation.category)} border-0 font-semibold`}>
                  {formation.category}
                </Badge>
                <Badge className={`${getLevelColor(formation.level)} border-0 font-semibold`}>
                  {formation.level}
                </Badge>
                {formation.certificate && (
                  <Badge className="bg-yellow-50 text-yellow-700 border-0 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    Certificat inclus
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {formation.title}
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed">
                {formation.description}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Star className="w-5 h-5 fill-yellow-400" />
                  <span className="font-bold text-white">{formation.rating}</span>
                  <span className="text-blue-200 text-sm">({formation.students.toLocaleString()} étudiants)</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-200">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{formation.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-200">
                  <Layers className="w-4 h-4" />
                  <span className="text-sm">{formation.modules} modules</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-200">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">{totalLessons} leçons</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-400/30">
                  <Users className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <p className="text-sm text-blue-200">Instructor</p>
                  <p className="font-semibold text-white">{formation.instructor}</p>
                </div>
              </div>
            </div>

            {/* Right – CTA card */}
            <div className="lg:sticky lg:top-24">
              <Card className="shadow-2xl border-0 overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={formation.image}
                    alt={formation.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6 space-y-5">
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-base font-semibold py-6 rounded-xl shadow-lg shadow-blue-200"
                      onClick={() => router.push('/signup')}
                    >
                      S&apos;inscrire à cette formation
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-base font-semibold py-6 rounded-xl"
                      onClick={() => router.push('/login')}
                    >
                      J&apos;ai déjà un compte
                    </Button>
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    {[
                      { icon: Clock, text: `Durée : ${formation.duration}` },
                      { icon: Layers, text: `${formation.modules} modules · ${totalLessons} leçons` },
                      { icon: Calendar, text: `Langue : ${formation.language}` },
                      { icon: Users, text: `${formation.students.toLocaleString()} étudiants inscrits` },
                      { icon: Award, text: 'Certificat de réussite' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-sm text-gray-600">
                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>

      {/* ── BODY CONTENT ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-12">

            {/* What you'll learn */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Ce que vous allez apprendre
              </h2>
              <Card className="border border-gray-100">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formation.skills.map(skill => (
                      <div key={skill} className="flex items-center gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Prerequisites */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Prérequis
              </h2>
              <Card className="border border-gray-100">
                <CardContent className="p-6">
                  <ul className="space-y-2">
                    {formation.prerequisites.map(p => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Programme de la formation
              </h2>
              <div className="space-y-3">
                {formation.curriculum.map((module, index) => (
                  <Card
                    key={index}
                    className="border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-blue-600">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{module.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {module.lessons} leçons
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {module.duration}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

          </div>

          {/* Side column */}
          <div className="space-y-6 lg:pt-0">

            {/* Key stats */}
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-gray-900">Statistiques clés</h3>
                {[
                  { icon: Users, label: 'Étudiants', value: formation.students.toLocaleString() },
                  { icon: Star, label: 'Note moyenne', value: `${formation.rating}/5` },
                  { icon: Layers, label: 'Modules', value: formation.modules },
                  { icon: Play, label: 'Leçons totales', value: totalLessons },
                  { icon: TrendingUp, label: 'Niveau', value: formation.level },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Icon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="border border-blue-100 bg-blue-600 text-white overflow-hidden">
              <CardContent className="p-6 text-center space-y-4">
                <Award className="w-12 h-12 text-blue-200 mx-auto" />
                <h3 className="text-lg font-bold">Obtenez votre certificat</h3>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Terminez la formation et recevez un certificat reconnu par l&apos;industrie.
                </p>
                <Button
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                  onClick={() => router.push('/signup')}
                >
                  Commencer maintenant
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

    </PublicLayout>
  );
}
