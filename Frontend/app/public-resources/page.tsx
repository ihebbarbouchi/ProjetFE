'use client';

import { useState } from 'react';
import { PublicLayout } from '../components/PublicLayout';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, BookOpen, FileText, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PublicResources() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  // Mock resources data
  const resources = [
    {
      id: 1,
      title: 'Introduction to Python Programming',
      type: 'Course',
      category: 'Programming',
      level: 'Beginner',
      description: 'Learn Python fundamentals from scratch',
    },
    {
      id: 2,
      title: 'Advanced JavaScript Concepts',
      type: 'Course',
      category: 'Programming',
      level: 'Advanced',
      description: 'Master advanced JavaScript techniques',
    },
    {
      id: 3,
      title: 'Calculus Study Guide',
      type: 'Document',
      category: 'Mathematics',
      level: 'Intermediate',
      description: 'Comprehensive calculus reference material',
    },
    {
      id: 4,
      title: 'Physics Fundamentals Quiz',
      type: 'Quiz',
      category: 'Science',
      level: 'Beginner',
      description: 'Test your knowledge of basic physics',
    },
    {
      id: 5,
      title: 'Web Development Bootcamp',
      type: 'Course',
      category: 'Programming',
      level: 'Intermediate',
      description: 'Complete web development course',
    },
    {
      id: 6,
      title: 'Algebra Formulas Sheet',
      type: 'Document',
      category: 'Mathematics',
      level: 'Beginner',
      description: 'Quick reference for algebra formulas',
    },
    {
      id: 7,
      title: 'Data Science with Python',
      type: 'Course',
      category: 'Data Science',
      level: 'Advanced',
      description: 'Learn data analysis and visualization',
    },
    {
      id: 8,
      title: 'English Grammar Quiz',
      type: 'Quiz',
      category: 'Languages',
      level: 'Intermediate',
      description: 'Test your English grammar skills',
    },
    {
      id: 9,
      title: 'Chemistry Lab Manual',
      type: 'Document',
      category: 'Science',
      level: 'Intermediate',
      description: 'Laboratory procedures and experiments',
    },
  ];

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || resource.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || resource.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Course':
        return BookOpen;
      case 'Document':
        return FileText;
      case 'Quiz':
        return HelpCircle;
      default:
        return BookOpen;
    }
  };

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

  return (
    <PublicLayout>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Resources</h1>
          <p className="text-lg text-gray-600">
            Explore our collection of educational resources including courses, documents, and quizzes
          </p>
        </div>
      </div>

      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Section */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="md:col-span-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Languages">Languages</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Level</label>
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredResources.length} of {resources.length} resources
            </p>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <Badge variant="secondary">{resource.type}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={getLevelColor(resource.level)}>{resource.level}</Badge>
                      <span className="text-sm text-gray-500">{resource.category}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push(`/public-resources/${resource.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No resources found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setLevelFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}