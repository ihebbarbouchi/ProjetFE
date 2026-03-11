'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';

export default function AddResource() {
  const router = useRouter();
  const [resourceType, setResourceType] = useState('course');

  // Course form state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseLevel, setCourseLevel] = useState('');

  // Document form state
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState('');
  const [docFile, setDocFile] = useState('');

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizCategory, setQuizCategory] = useState('');
  const [quizPassingScore, setQuizPassingScore] = useState('70');
  const [questions, setQuestions] = useState([
    { id: 1, question: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: questions.length + 1, question: '', options: ['', '', '', ''], correctAnswer: 0 },
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) }
          : q
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting resource:', resourceType);
    router.push('/teacher');
  };

  return (
    <Layout role="teacher">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Add New Resource</h2>
          <p className="text-gray-600 mt-1">Create a new course, document, or quiz for your students</p>
        </div>

        <Tabs value={resourceType} onValueChange={setResourceType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="course">Course</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          {/* Course Form */}
          <TabsContent value="course">
            <Card>
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
                <CardDescription>Add a comprehensive learning course for students</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="course-title">Course Title *</Label>
                    <Input
                      id="course-title"
                      placeholder="e.g., Introduction to Python Programming"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-description">Description *</Label>
                    <Textarea
                      id="course-description"
                      placeholder="Describe what students will learn in this course..."
                      rows={4}
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-category">Category *</Label>
                      <Select value={courseCategory} onValueChange={setCourseCategory}>
                        <SelectTrigger id="course-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="languages">Languages</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-level">Level *</Label>
                      <Select value={courseLevel} onValueChange={setCourseLevel}>
                        <SelectTrigger id="course-level">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-duration">Estimated Duration *</Label>
                    <Input
                      id="course-duration"
                      placeholder="e.g., 8 hours, 4 weeks"
                      value={courseDuration}
                      onChange={(e) => setCourseDuration(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-image">Course Cover Image</Label>
                    <Input id="course-image" type="file" accept="image/*" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-content">Course Content Files</Label>
                    <Input id="course-content" type="file" multiple />
                    <p className="text-sm text-gray-500">Upload videos, PDFs, and other learning materials</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Create Course
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/teacher')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Form */}
          <TabsContent value="document">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Share study materials, guides, and reference documents</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="doc-title">Document Title *</Label>
                    <Input
                      id="doc-title"
                      placeholder="e.g., Python Cheat Sheet"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-description">Description *</Label>
                    <Textarea
                      id="doc-description"
                      placeholder="Brief description of the document content..."
                      rows={4}
                      value={docDescription}
                      onChange={(e) => setDocDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-category">Category *</Label>
                    <Select value={docCategory} onValueChange={setDocCategory}>
                      <SelectTrigger id="doc-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="languages">Languages</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-file">Upload Document *</Label>
                    <Input
                      id="doc-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) => setDocFile(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX, PPT, PPTX</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-thumbnail">Thumbnail Image (Optional)</Label>
                    <Input id="doc-thumbnail" type="file" accept="image/*" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Upload Document
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/teacher')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Form */}
          <TabsContent value="quiz">
            <Card>
              <CardHeader>
                <CardTitle>Create Quiz</CardTitle>
                <CardDescription>Test student knowledge with interactive quizzes</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="quiz-title">Quiz Title *</Label>
                    <Input
                      id="quiz-title"
                      placeholder="e.g., Python Fundamentals Quiz"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quiz-description">Description *</Label>
                    <Textarea
                      id="quiz-description"
                      placeholder="What topics does this quiz cover?"
                      rows={3}
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quiz-category">Category *</Label>
                      <Select value={quizCategory} onValueChange={setQuizCategory}>
                        <SelectTrigger id="quiz-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                          <SelectItem value="languages">Languages</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quiz-passing">Passing Score (%) *</Label>
                      <Input
                        id="quiz-passing"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="70"
                        value={quizPassingScore}
                        onChange={(e) => setQuizPassingScore(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Questions</h3>
                      <Button type="button" variant="outline" onClick={addQuestion}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {questions.map((q, qIndex) => (
                        <Card key={q.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="font-medium">Question {qIndex + 1}</h4>
                              {questions.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeQuestion(q.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Question Text *</Label>
                                <Input
                                  placeholder="Enter your question"
                                  value={q.question}
                                  onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Answer Options *</Label>
                                {q.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-${q.id}`}
                                      checked={q.correctAnswer === optIndex}
                                      onChange={() => updateQuestion(q.id, 'correctAnswer', optIndex)}
                                      className="mt-1"
                                    />
                                    <Input
                                      placeholder={`Option ${optIndex + 1}`}
                                      value={option}
                                      onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                                      required
                                    />
                                  </div>
                                ))}
                                <p className="text-xs text-gray-500">Select the radio button for the correct answer</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Create Quiz
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.push('/teacher')}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
