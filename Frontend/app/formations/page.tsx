'use client';

import { useRouter } from 'next/navigation';
import { PublicLayout } from '../components/PublicLayout';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BookOpen, Clock, BarChart3 } from 'lucide-react';

export default function Formations() {
  const router = useRouter();

  // Mock formations data
  const formations = [
    {
      id: 1,
      title: 'Full Stack Web Development',
      description: 'Complete training in front-end and back-end web development',
      modules: 12,
      level: 'Intermediate',
      durationMonths: 6,
      duration: '6 months',
      category: 'Programming',
    },
    {
      id: 2,
      title: 'Data Science Mastery',
      description: 'Comprehensive data science training from basics to advanced',
      modules: 15,
      level: 'Advanced',
      durationMonths: 8,
      duration: '8 months',
      category: 'Data Science',
    },
    {
      id: 3,
      title: 'Digital Marketing Fundamentals',
      description: 'Learn the essentials of digital marketing and social media',
      modules: 8,
      level: 'Beginner',
      durationMonths: 3,
      duration: '3 months',
      category: 'Business',
    },
    {
      id: 4,
      title: 'Python Programming Complete Course',
      description: 'Master Python programming from beginner to expert level',
      modules: 10,
      level: 'Beginner',
      durationMonths: 4,
      duration: '4 months',
      category: 'Programming',
    },
    {
      id: 5,
      title: 'Machine Learning Engineer',
      description: 'Become a machine learning engineer with practical projects',
      modules: 18,
      level: 'Advanced',
      durationMonths: 10,
      duration: '10 months',
      category: 'Data Science',
    },
    {
      id: 6,
      title: 'UX/UI Design Professional',
      description: 'Learn user experience and interface design principles',
      modules: 9,
      level: 'Intermediate',
      durationMonths: 5,
      duration: '5 months',
      category: 'Design',
    },
    {
      id: 7,
      title: 'Mobile App Development',
      description: 'Build native mobile applications for iOS and Android',
      modules: 14,
      level: 'Intermediate',
      durationMonths: 7,
      duration: '7 months',
      category: 'Programming',
    },
    {
      id: 8,
      title: 'Cybersecurity Specialist',
      description: 'Learn to protect systems and networks from cyber threats',
      modules: 16,
      level: 'Advanced',
      durationMonths: 9,
      duration: '9 months',
      category: 'Security',
    },
    {
      id: 9,
      title: 'Cloud Computing with AWS',
      description: 'Master cloud infrastructure and services with Amazon Web Services',
      modules: 11,
      level: 'Intermediate',
      durationMonths: 5,
      duration: '5 months',
      category: 'Cloud',
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'Advanced':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const avgDuration = Math.round(
    formations.reduce((sum, f) => sum + f.durationMonths, 0) / formations.length
  );

  const avgModules = Math.round(
    formations.reduce((sum, f) => sum + f.modules, 0) / formations.length
  );

  return (
    <PublicLayout>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Formations</h1>
          <p className="text-lg text-gray-600">
            Browse our comprehensive training programs designed to help you master new skills and advance your career
          </p>
        </div>
      </div>

      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{formations.length}</p>
                <p className="text-sm text-gray-600">Total Formations</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{avgDuration}</p>
                <p className="text-sm text-gray-600">Avg. Duration (months)</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{avgModules}</p>
                <p className="text-sm text-gray-600">Avg. Modules</p>
              </CardContent>
            </Card>
          </div>

          {/* Formations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation) => (
              <Card key={formation.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary">{formation.category}</Badge>
                    <Badge className={getLevelColor(formation.level)}>{formation.level}</Badge>
                  </div>

                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                    {formation.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{formation.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{formation.modules} Modules</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{formation.duration}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={() => router.push(`/formations/${formation.id}`)}
                  >
                    View Formation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}