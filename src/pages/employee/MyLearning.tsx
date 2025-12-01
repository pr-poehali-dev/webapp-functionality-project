import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import { LEARNING_API_URL } from '@/lib/learning';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: number;
  title: string;
  description: string;
  duration_hours: number;
}

interface Trainer {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
}

interface CourseProgress {
  id: number;
  course_id: number;
  title: string;
  status: string;
  progress_percentage: number;
  started_at: string;
}

interface TrainerProgress {
  id: number;
  trainer_id: number;
  title: string;
  status: string;
  score: number;
  started_at: string;
}

export default function MyLearning() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [trainerProgress, setTrainerProgress] = useState<TrainerProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = authService.getUserId();
    if (!userId) return;

    try {
      const [coursesRes, trainersRes, courseProgRes, trainerProgRes] = await Promise.all([
        fetch(`${LEARNING_API_URL}?resource=courses`, {
          headers: { 'X-User-Id': userId.toString() },
        }),
        fetch(`${LEARNING_API_URL}?resource=trainers`, {
          headers: { 'X-User-Id': userId.toString() },
        }),
        fetch(`${LEARNING_API_URL}?resource=progress&type=course`, {
          headers: { 'X-User-Id': userId.toString() },
        }),
        fetch(`${LEARNING_API_URL}?resource=progress&type=trainer`, {
          headers: { 'X-User-Id': userId.toString() },
        }),
      ]);

      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (trainersRes.ok) setTrainers(await trainersRes.json());
      if (courseProgRes.ok) setCourseProgress(await courseProgRes.json());
      if (trainerProgRes.ok) setTrainerProgress(await trainerProgRes.json());
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить данные', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = async (courseId: number) => {
    const userId = authService.getUserId();
    if (!userId) return;

    setActionLoading(courseId);
    try {
      const response = await fetch(`${LEARNING_API_URL}?resource=progress&type=course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({ item_id: courseId }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Курс начат!' });
        fetchData();
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
    const userId = authService.getUserId();
    if (!userId) return;

    setActionLoading(trainerId);
    try {
      const response = await fetch(`${LEARNING_API_URL}?resource=progress&type=trainer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({ item_id: trainerId }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Тренажер начат!' });
        fetchData();
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

  const updateProgress = async (progressId: number, type: 'course' | 'trainer', data: any) => {
    const userId = authService.getUserId();
    if (!userId) return;

    try {
      const response = await fetch(`${LEARNING_API_URL}?resource=progress&type=${type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({ id: progressId, ...data }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Прогресс обновлен!' });
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить прогресс', variant: 'destructive' });
    }
  };

  const isStarted = (itemId: number, type: 'course' | 'trainer') => {
    if (type === 'course') {
      return courseProgress.some(p => p.course_id === itemId);
    }
    return trainerProgress.some(p => p.trainer_id === itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

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
                <p className="text-sm text-muted-foreground">Курсы и тренажеры</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="in-progress">В процессе</TabsTrigger>
            <TabsTrigger value="available">Доступные</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Курсы в процессе</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseProgress.map((prog) => (
                  <Card key={prog.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="BookOpen" size={24} className="text-primary" />
                      </div>
                      <Badge>{prog.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{prog.title}</h3>
                    <div className="space-y-2">
                      <Progress value={prog.progress_percentage} className="h-2" />
                      <p className="text-sm text-muted-foreground">{prog.progress_percentage}% завершено</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => updateProgress(prog.id, 'course', { 
                          progress_percentage: Math.min(100, prog.progress_percentage + 25),
                          ...(prog.progress_percentage + 25 >= 100 && { status: 'Завершен', completed_at: true })
                        })}
                      >
                        Прогресс +25%
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Тренажеры в процессе</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainerProgress.map((prog) => (
                  <Card key={prog.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <Icon name="Zap" size={24} className="text-secondary" />
                      </div>
                      <Badge>{prog.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{prog.title}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="Award" size={16} />
                      <span>Результат: {prog.score}%</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => updateProgress(prog.id, 'trainer', { 
                          score: Math.min(100, prog.score + 10),
                          ...(prog.score + 10 >= 80 && { status: 'Завершен', completed_at: true })
                        })}
                      >
                        Улучшить результат
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="available" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Доступные курсы</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon name="BookOpen" size={24} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Icon name="Clock" size={14} />
                      <span>{course.duration_hours} ч.</span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartCourse(course.id)}
                      disabled={isStarted(course.id, 'course') || actionLoading === course.id}
                    >
                      {actionLoading === course.id ? (
                        <Icon name="Loader2" size={16} className="animate-spin" />
                      ) : isStarted(course.id, 'course') ? (
                        'Уже начат'
                      ) : (
                        'Начать курс'
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Доступные тренажеры</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trainers.map((trainer) => (
                  <Card key={trainer.id} className="p-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon name="Zap" size={24} className="text-secondary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{trainer.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{trainer.description}</p>
                    <Badge variant="outline" className="mb-4">{trainer.difficulty_level}</Badge>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartTrainer(trainer.id)}
                      disabled={isStarted(trainer.id, 'trainer') || actionLoading === trainer.id}
                    >
                      {actionLoading === trainer.id ? (
                        <Icon name="Loader2" size={16} className="animate-spin" />
                      ) : isStarted(trainer.id, 'trainer') ? (
                        'Уже начат'
                      ) : (
                        'Начать тренажер'
                      )}
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
