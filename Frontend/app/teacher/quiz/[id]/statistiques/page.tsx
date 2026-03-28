'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '../../../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  BarChart2, Users, CheckCircle2, XCircle, Clock, Trophy,
  ArrowLeft, Loader2, TrendingUp, Award, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

interface Stats {
  nb_tentatives: number;
  nb_reussites: number;
  score_moyen: number;
  score_max: number;
  score_min: number;
  taux_reussite: number;
  temps_moyen_sec: number | null;
}

interface Tentative {
  id: number;
  pourcentage: number;
  est_reussi: boolean;
  temps_passe: number | null;
  completee_le: string;
  apprenant: { id: number; nom: string; prenom: string; email: string };
}

interface QuizDetail {
  id: number;
  titre: string;
  status: string;
  score_passage: number;
  temps_limite: number | null;
  tentatives_count: number;
}

export default function QuizStatsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tentatives, setTentatives] = useState<Tentative[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/quiz/${id}/statistiques`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setQuiz(data.quiz);
        setStats(data.stats);
        setTentatives(data.tentatives);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatTime = (sec: number | null) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  if (loading) return (
    <Layout role="teacher">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    </Layout>
  );

  if (!quiz || !stats) return (
    <Layout role="teacher">
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Quiz introuvable</p>
        <Button className="mt-4" variant="outline" onClick={() => router.push('/teacher/quiz')}>Retour</Button>
      </div>
    </Layout>
  );

  const statCards = [
    { label: 'Tentatives', value: stats.nb_tentatives, icon: Users, color: 'emerald' },
    { label: 'Réussites', value: stats.nb_reussites, icon: Trophy, color: 'emerald' },
    { label: 'Taux de réussite', value: `${stats.taux_reussite}%`, icon: TrendingUp, color: stats.taux_reussite >= 50 ? 'emerald' : 'red' },
    { label: 'Score moyen', value: `${stats.score_moyen}%`, icon: BarChart2, color: 'emerald' },
  ];

  return (
    <Layout role="teacher">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/teacher/quiz')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{quiz.titre}</h2>
            <p className="text-sm text-gray-500">Statistiques des résultats</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className={`text-2xl font-bold text-${s.color}-600 mt-1`}>{s.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full bg-${s.color}-100 flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bande infos */}
        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600">
          <span>Score min: <strong className="text-red-600">{stats.score_min}%</strong></span>
          <span>Score max: <strong className="text-emerald-600">{stats.score_max}%</strong></span>
          <span>Temps moyen: <strong className="text-gray-900">{formatTime(stats.temps_moyen_sec)}</strong></span>
          <span>Seuil de réussite: <strong className="text-gray-900">{quiz.score_passage}%</strong></span>
        </div>

        {/* Liste des tentatives */}
        <Card>
          <CardHeader>
            <CardTitle>Résultats par apprenant</CardTitle>
            <CardDescription>{tentatives.length} soumission(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {tentatives.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Aucun apprenant n&apos;a encore passé ce quiz</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tentatives.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-700">
                        {(t.apprenant.prenom?.[0] ?? '') + (t.apprenant.nom?.[0] ?? '')}
                      </span>
                    </div>

                    {/* Nom */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {t.apprenant.prenom} {t.apprenant.nom}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{t.apprenant.email}</p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className={`text-lg font-bold ${t.est_reussi ? 'text-emerald-600' : 'text-red-500'}`}>
                        {t.pourcentage}%
                      </p>
                      <p className="text-xs text-gray-400">{formatTime(t.temps_passe)}</p>
                    </div>

                    {/* Badge */}
                    {t.est_reussi ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Réussi
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-600 border-red-200 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Échoué
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}
