'use client';

import { PublicLayout } from '../components/PublicLayout';
import { Card, CardContent } from '../components/ui/card';
import { Target, Users, Lightbulb, Shield, Globe, Award } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Notre Mission',
      description: 'Démocratiser l\'éducation en créant une plateforme où le savoir est librement partagé et accessible à tous les apprenants du monde entier.',
      color: 'blue',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Nous innovons continuellement pour offrir les meilleurs outils et fonctionnalités pour des expériences d\'enseignement et d\'apprentissage efficaces.',
      color: 'purple',
    },
    {
      icon: Users,
      title: 'Communauté',
      description: 'Construire une communauté solidaire d\'éducateurs et d\'apprenants qui collaborent et grandissent ensemble.',
      color: 'green',
    },
    {
      icon: Shield,
      title: 'Qualité',
      description: 'Garantir que tout le contenu respecte des normes éducatives élevées grâce à notre processus de vérification des enseignants.',
      color: 'orange',
    },
    {
      icon: Globe,
      title: 'Accessibilité',
      description: 'Rendre l\'éducation de qualité accessible à tous, indépendamment de la localisation ou de l\'origine.',
      color: 'teal',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Viser l\'excellence dans chaque aspect de notre plateforme pour offrir les meilleurs résultats d\'apprentissage.',
      color: 'red',
    },
  ];

  const stats = [
    { label: 'Fondée en', value: '2024' },
    { label: 'Pays', value: '50+' },
    { label: 'Membres de l\'équipe', value: '25+' },
    { label: 'Utilisateurs satisfaits', value: '10K+' },
  ];

  return (
    <PublicLayout>
      {/* Section Héro */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              À propos d&apos;EduShare
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Nous avons pour mission de transformer l&apos;éducation grâce au partage collaboratif de ressources
              et de rendre l&apos;apprentissage de qualité accessible à tous.
            </p>
          </div>
        </div>
      </section>

      {/* Section Histoire */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
            <div className="prose prose-lg">
              <p className="text-gray-600 mb-4">
                EduShare a été fondée avec une vision simple mais puissante : créer une plateforme où les éducateurs
                peuvent facilement partager leurs connaissances et où les étudiants peuvent accéder à des ressources
                éducatives de qualité depuis n&apos;importe où dans le monde.
              </p>
              <p className="text-gray-600 mb-4">
                Nous avons constaté un manque dans le paysage éducatif où les enseignants avaient du contenu précieux
                à partager, mais ne disposaient pas d&apos;une plateforme efficace pour le diffuser. En même temps, les
                étudiants cherchaient des supports d&apos;apprentissage fiables et structurés au-delà des manuels traditionnels.
              </p>
              <p className="text-gray-600">
                Aujourd&apos;hui, EduShare sert des milliers d&apos;enseignants et d&apos;étudiants à travers le monde, facilitant
                l&apos;échange de cours, de documents et de quiz interactifs. Nous sommes fiers de faire partie du
                parcours éducatif de tant d&apos;apprenants et continuons d&apos;évoluer grâce aux retours de la communauté.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Valeurs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
            <p className="text-lg text-gray-600">
              Les principes qui guident tout ce que nous faisons
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-${value.color}-100 flex items-center justify-center mb-4`}>
                    <value.icon className={`w-6 h-6 text-${value.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Objectifs éducatifs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Nos Objectifs Éducatifs</h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Autonomiser les éducateurs</h3>
                  <p className="text-gray-600">
                    Fournir aux enseignants des outils puissants pour créer, organiser et distribuer du contenu
                    éducatif efficacement. Nous croyons en le soutien aux éducateurs pour qu&apos;ils puissent se
                    concentrer sur ce qu&apos;ils font le mieux — enseigner.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Améliorer les résultats d&apos;apprentissage</h3>
                  <p className="text-gray-600">
                    Aider les étudiants à obtenir de meilleurs résultats grâce à l&apos;accès à des ressources diversifiées
                    et de haute qualité. Notre plateforme prend en charge différents styles et rythmes d&apos;apprentissage,
                    garantissant que chaque étudiant peut réussir.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Favoriser la collaboration</h3>
                  <p className="text-gray-600">
                    Créer un environnement collaboratif où les éducateurs peuvent partager les meilleures pratiques,
                    les étudiants peuvent apprendre de multiples perspectives, et chacun contribue à une base de
                    connaissances collective.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">Combler les inégalités éducatives</h3>
                  <p className="text-gray-600">
                    Réduire les inégalités éducatives en offrant un accès gratuit ou abordable à des supports
                    d&apos;apprentissage de qualité, contribuant à niveler le terrain de jeu pour les étudiants du monde entier.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section Engagement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Engagement</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nous nous engageons à améliorer continuellement notre plateforme sur la base des retours de notre communauté.
              Chaque fonctionnalité que nous développons et chaque décision que nous prenons est guidée par notre mission
              fondamentale de rendre l&apos;éducation meilleure et plus accessible pour tous.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
