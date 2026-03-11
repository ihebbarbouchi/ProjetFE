'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Code, Calculator, FlaskConical, Languages, Palette, Music, BookOpen, Briefcase } from 'lucide-react';

export default function Categories() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  // Categories data
  const categories: {
    id: number;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    resources: number;
    color: string;
    image: string;
  }[] = [];

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Try to determine role from URL
  const role = pathname.includes('super-admin') ? 'super-admin' : pathname.includes('teacher') ? 'teacher' : 'student';

  return (
    <Layout role={role} onSearch={handleSearch}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600 mt-1">Browse resources by category</p>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{categories.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {categories.reduce((sum, cat) => sum + cat.resources, 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Resources</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + cat.resources, 0) / categories.length) : 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Avg. per Category</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{filteredCategories.length}</p>
              <p className="text-sm text-gray-600 mt-1">Showing</p>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push('/resources')}
            >
              <div className="h-40 bg-gray-200 overflow-hidden relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <div className={`w-12 h-12 rounded-full bg-${category.color}-600 flex items-center justify-center`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                  <Badge variant="secondary">{category.resources}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors"
                >
                  Explore Resources
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found matching your search.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
