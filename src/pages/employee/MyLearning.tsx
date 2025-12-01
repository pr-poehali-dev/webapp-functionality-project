import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import { LEARNING_API_URL } from '@/lib/learning';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  score: number;
  reason: string;
  duration_hours?: number;
  difficulty_level?: string;
  progress_percent?: number;
  status?: string;
}

interface ProgressItem {
  id: number;
  title: string;
  status: string;
  progress_percent: number;
  started_at: string;
  completed_at?: string;
}

interface RecommendationsData {
  courses: Recommendation[];
  trainers: Recommendation[];
  stats: {
    completed_courses: number;
    completed_trainers: number;
  };
}

export default function MyLearning() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [progress, setProgress] = useState<{ courses: ProgressItem[], trainers: ProgressItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchRecommendations();
    fetchProgress();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${LEARNING_API_URL}?entity_type=recommendations`, {
        headers: { 'X-Session-Token': authService.getSessionToken() || '' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить рекомендации', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${LEARNING_API_URL}?entity_type=progress`, {
        headers: { 'X-Session-Token': authService.getSessionToken() || '' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const handleStartCourse = async (courseId: number) => {
    setActionLoading(courseId);
    try {
      const response = await fetch(LEARNING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'progress',
          type: 'course',
          id: courseId,
          status: 'in_progress',
          progress_percent: 0,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Курс начат!' });
        await fetchProgress();
        await fetchRecommendations();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось начать курс', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartTrainer = async (trainerId: number) => {
    setActionLoading(trainerId + 10000);
    try {
      const response = await fetch(LEARNING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'progress',
          type: 'trainer',
          id: trainerId,
          status: 'in_progress',
          progress_percent: 0,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Тренажер начат!' });
        await fetchProgress();
        await fetchRecommendations();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось начать тренажер', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteCourse = async (courseId: number) => {
    setActionLoading(courseId);
    try {
      const response = await fetch(LEARNING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'progress',
          type: 'course',
          id: courseId,
          status: 'completed',
          progress_percent: 100,
        }),
      });

      if (response.ok) {
        toast({ title: 'Поздравляем!', description: 'Курс завершен!' });
        await fetchProgress();
        await fetchRecommendations();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось завершить курс', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTrainer = async (trainerId: number) => {
    setActionLoading(trainerId + 10000);
    try {
      const response = await fetch(LEARNING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'progress',
          type: 'trainer',
          id: trainerId,
          status: 'completed',
          progress_percent: 100,
        }),
      });

      if (response.ok) {
        toast({ title: 'Поздравляем!', description: 'Тренажер завершен!' });
        await fetchProgress();
        await fetchRecommendations();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось завершить тренажер', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const getProgressForItem = (type: 'course' | 'trainer', itemId: number) => {
    if (!progress) return null;
    const items = type === 'course' ? progress.courses : progress.trainers;
    return items.find(p => p.id === itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const hasProgress = recommendations && (recommendations.stats.completed_courses > 0 || recommendations.stats.completed_trainers > 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Мое обучение</h1>
                <p className="text-sm text-muted-foreground">
                  {hasProgress 
                    ? `Завершено: ${recommendations.stats.completed_courses} курсов, ${recommendations.stats.completed_trainers} тренажеров`
                    : 'Начните свое обучение с рекомендованных материалов'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!hasProgress && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Sparkles" size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">AI подобрал для вас первые материалы</h2>
                <p className="text-muted-foreground">
                  Начните с рекомендованных курсов и тренажеров для быстрого старта в обучении.
                  По мере прохождения материалов система будет подбирать для вас персональные рекомендации.
                </p>
              </div>
            </div>
          </Card>
        )}

        {hasProgress && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="TrendingUp" size={24} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Отличная работа!</h2>
                <p className="text-muted-foreground">
                  На основе ваших завершенных курсов и тренажеров AI подобрал персональные рекомендации для дальнейшего роста.
                </p>
              </div>
            </div>
          </Card>
        )}

        {recommendations && recommendations.courses.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="BookOpen" size={24} className="text-primary" />
              <h2 className="text-2xl font-bold">Рекомендованные курсы</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.courses.map((course) => {
                const courseProgress = getProgressForItem('course', course.id);
                const isInProgress = courseProgress?.status === 'in_progress';
                const isCompleted = courseProgress?.status === 'completed';
                const isLoading = actionLoading === course.id;
                
                return (
                  <Card key={course.id} className="p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="BookOpen" size={24} className="text-primary" />
                      </div>
                      <Badge variant="secondary" className="font-semibold">
                        {Math.round(course.score)} баллов
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      {course.duration_hours && (
                        <>
                          <Icon name="Clock" size={14} />
                          <span>{course.duration_hours} ч.</span>
                        </>
                      )}
                    </div>
                    
                    {courseProgress && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Прогресс</span>
                          <span className="font-semibold">{courseProgress.progress_percent}%</span>
                        </div>
                        <Progress value={courseProgress.progress_percent} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 mb-3">
                      <Icon name="Lightbulb" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-primary font-medium">{course.reason}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {!courseProgress && (
                        <Button 
                          onClick={() => handleStartCourse(course.id)} 
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <Icon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Icon name="Play" size={16} className="mr-2" />
                              Начать
                            </>
                          )}
                        </Button>
                      )}
                      {isInProgress && (
                        <Button 
                          onClick={() => handleCompleteCourse(course.id)} 
                          disabled={isLoading}
                          className="w-full"
                          variant="outline"
                        >
                          {isLoading ? (
                            <Icon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Icon name="CheckCircle2" size={16} className="mr-2" />
                              Завершить
                            </>
                          )}
                        </Button>
                      )}
                      {isCompleted && (
                        <Badge variant="default" className="w-full justify-center py-2">
                          <Icon name="Award" size={16} className="mr-2" />
                          Завершено
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {recommendations && recommendations.trainers.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Icon name="Zap" size={24} className="text-secondary" />
              <h2 className="text-2xl font-bold">Рекомендованные тренажеры</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.trainers.map((trainer) => {
                const trainerProgress = getProgressForItem('trainer', trainer.id);
                const isInProgress = trainerProgress?.status === 'in_progress';
                const isCompleted = trainerProgress?.status === 'completed';
                const isLoading = actionLoading === (trainer.id + 10000);
                
                return (
                  <Card key={trainer.id} className="p-6 hover:shadow-lg transition-all hover:scale-[1.02]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Icon name="Zap" size={24} className="text-secondary" />
                      </div>
                      <Badge variant="secondary" className="font-semibold">
                        {Math.round(trainer.score)} баллов
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{trainer.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{trainer.description}</p>
                    
                    <div className="mb-3">
                      {trainer.difficulty_level && (
                        <Badge variant="outline">{trainer.difficulty_level}</Badge>
                      )}
                    </div>
                    
                    {trainerProgress && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Прогресс</span>
                          <span className="font-semibold">{trainerProgress.progress_percent}%</span>
                        </div>
                        <Progress value={trainerProgress.progress_percent} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2 p-3 bg-secondary/5 rounded-lg border border-secondary/10 mb-3">
                      <Icon name="Lightbulb" size={16} className="text-secondary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-secondary font-medium">{trainer.reason}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {!trainerProgress && (
                        <Button 
                          onClick={() => handleStartTrainer(trainer.id)} 
                          disabled={isLoading}
                          className="w-full"
                          variant="secondary"
                        >
                          {isLoading ? (
                            <Icon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Icon name="Play" size={16} className="mr-2" />
                              Начать
                            </>
                          )}
                        </Button>
                      )}
                      {isInProgress && (
                        <Button 
                          onClick={() => handleCompleteTrainer(trainer.id)} 
                          disabled={isLoading}
                          className="w-full"
                          variant="outline"
                        >
                          {isLoading ? (
                            <Icon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <>
                              <Icon name="CheckCircle2" size={16} className="mr-2" />
                              Завершить
                            </>
                          )}
                        </Button>
                      )}
                      {isCompleted && (
                        <Badge variant="default" className="w-full justify-center py-2">
                          <Icon name="Award" size={16} className="mr-2" />
                          Завершено
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {recommendations && recommendations.courses.length === 0 && recommendations.trainers.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="BookOpen" size={40} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Пока нет доступных материалов</h3>
            <p className="text-muted-foreground">
              Обратитесь к администратору для добавления курсов и тренажеров в вашу систему
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}