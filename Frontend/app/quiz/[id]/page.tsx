'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react';

export default function Quiz() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const quiz: { id: number; title: string; description: string; category: string; passingScore: number; timeLimit: string; questions: { id: number; question: string; options: string[]; correctAnswer: number }[] } = {
    id: Number(id),
    title: 'Quiz Name',
    description: 'Quiz description',
    category: 'Category',
    passingScore: 70,
    timeLimit: '30 minutes',
    questions: [],
  };

  const handleSelectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / quiz.questions.length) * 100;
  };

  const score = calculateScore();
  const passed = score >= quiz.passingScore;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  if (showResults) {
    return (
      <Layout role="student">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {passed ? (
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="w-10 h-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl">{passed ? 'Congratulations!' : 'Keep Trying!'}</CardTitle>
              <CardDescription>
                {passed
                  ? 'You have successfully passed the quiz'
                  : 'You need more practice. Review the material and try again.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">{Math.round(score)}%</div>
                <p className="text-gray-600">
                  Your Score ({quiz.questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length} out of{' '}
                  {quiz.questions.length} correct)
                </p>
                <Badge className="mt-2" variant={passed ? 'default' : 'destructive'}>
                  {passed ? 'Passed' : 'Failed'} (Passing: {quiz.passingScore}%)
                </Badge>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Question Review</h3>
                <div className="space-y-4">
                  {quiz.questions.map((q, index) => {
                    const isCorrect = selectedAnswers[index] === q.correctAnswer;
                    return (
                      <Card key={q.id} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-2">
                                {index + 1}. {q.question}
                              </p>
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-600">
                                  Your answer:{' '}
                                  <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                    {q.options[selectedAnswers[index]] || 'Not answered'}
                                  </span>
                                </p>
                                {!isCorrect && (
                                  <p className="text-gray-600">
                                    Correct answer: <span className="text-green-600">{q.options[q.correctAnswer]}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-4">
                <Button onClick={() => router.push('/student')} className="bg-blue-600 hover:bg-blue-700">
                  Back to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setSelectedAnswers([]);
                  }}
                >
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <Layout role="student">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge>{quiz.category}</Badge>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {quiz.timeLimit}
              </div>
            </div>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {quiz.questions.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">{question.question}</h3>

                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswers[currentQuestion] === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswers[currentQuestion] === index
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                            }`}
                        >
                          {selectedAnswers[currentQuestion] === index && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No questions available for this quiz.
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-3 h-3 rounded-full ${index === currentQuestion
                      ? 'bg-blue-600'
                      : selectedAnswers[index] !== undefined
                        ? 'bg-blue-300'
                        : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>

              {currentQuestion === quiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedAnswers.filter((a) => a !== undefined).length !== quiz.questions.length}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Answered: {selectedAnswers.filter((a) => a !== undefined).length} / {quiz.questions.length}
              </span>
              <span className="text-gray-600">Passing Score: {quiz.passingScore}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
