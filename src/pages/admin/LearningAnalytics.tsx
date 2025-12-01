import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import { LEARNING_API_URL } from '@/lib/learning';
import { useToast } from '@/hooks/use-toast';

interface UserProgress {
  user_id: number;
  username: string;
  full_name: string;
  department_name: string;
  course_id?: number;
  trainer_id?: number;
  title: string;
  status: string;
  progress_percentage?: number;
  score?: number;
  started_at: string;
  completed_at?: string;
}

interface CourseStats {
  course_id: number;
  title: string;
  total_users: number;
  in_progress: number;
  completed: number;
  avg_progress: number;
}

interface TrainerStats {
  trainer_id: number;
  title: string;
  total_users: number;
  in_progress: number;
  completed: number;
  avg_score: number;
}

interface Department {
  id: number;
  name: string;
}

export default function LearningAnalytics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courseProgress, setCourseProgress] = useState<UserProgress[]>([]);
  const [trainerProgress, setTrainerProgress] = useState<UserProgress[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [trainerStats, setTrainerStats] = useState<TrainerStats[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
    fetchAnalytics();
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    const userId = authService.getUserId();
    if (!userId) return;

    try {
      const orgUrl = 'https://functions.poehali.dev/227369fe-07ca-4f0c-b8ee-f647263e78d9';
      const response = await fetch(`${orgUrl}?entity_type=department`, {
        headers: { 'X-User-Id': userId.toString() },
      });
      const data = await response.json();
      if (data.departments) {
        setDepartments(data.departments.map((d: any) => ({ id: d.id, name: d.name })));
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchAnalytics = async () => {
    const userId = authService.getUserId();
    if (!userId) return;

    setLoading(true);
    try {
      const [courseProg, trainerProg] = await Promise.all([
        fetch(`${LEARNING_API_URL}?resource=progress&type=course`, {
          headers: { 'X-User-Id': userId.toString() },
        }),
        fetch(`${LEARNING_API_URL}?resource=progress&type=trainer`, {
          headers: { 'X-User-Id': userId.toString() },
        }),
      ]);

      if (courseProg.ok) {
        const data = await courseProg.json();
        setCourseProgress(data);
        calculateCourseStats(data);
      }

      if (trainerProg.ok) {
        const data = await trainerProg.json();
        setTrainerProgress(data);
        calculateTrainerStats(data);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить аналитику', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const calculateCourseStats = (progressData: UserProgress[]) => {
    const courseMap = new Map<number, CourseStats>();

    progressData.forEach((prog) => {
      if (!prog.course_id) return;

      if (!courseMap.has(prog.course_id)) {
        courseMap.set(prog.course_id, {
          course_id: prog.course_id,
          title: prog.title,
          total_users: 0,
          in_progress: 0,
          completed: 0,
          avg_progress: 0,
        });
      }

      const stats = courseMap.get(prog.course_id)!;
      stats.total_users++;
      
      if (prog.status === 'Завершен') {
        stats.completed++;
      } else {
        stats.in_progress++;
      }
      
      stats.avg_progress += prog.progress_percentage || 0;
    });

    const statsArray = Array.from(courseMap.values()).map(stat => ({
      ...stat,
      avg_progress: Math.round(stat.avg_progress / stat.total_users),
    }));

    setCourseStats(statsArray);
  };

  const calculateTrainerStats = (progressData: UserProgress[]) => {
    const trainerMap = new Map<number, TrainerStats>();

    progressData.forEach((prog) => {
      if (!prog.trainer_id) return;

      if (!trainerMap.has(prog.trainer_id)) {
        trainerMap.set(prog.trainer_id, {
          trainer_id: prog.trainer_id,
          title: prog.title,
          total_users: 0,
          in_progress: 0,
          completed: 0,
          avg_score: 0,
        });
      }

      const stats = trainerMap.get(prog.trainer_id)!;
      stats.total_users++;
      
      if (prog.status === 'Завершен') {
        stats.completed++;
      } else {
        stats.in_progress++;
      }
      
      stats.avg_score += prog.score || 0;
    });

    const statsArray = Array.from(trainerMap.values()).map(stat => ({
      ...stat,
      avg_score: Math.round(stat.avg_score / stat.total_users),
    }));

    setTrainerStats(statsArray);
  };

  const getFilteredProgress = (progress: UserProgress[]) => {
    if (selectedDepartment === 'all') return progress;
    return progress.filter(p => p.department_name === departments.find(d => d.id.toString() === selectedDepartment)?.name);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Завершен':
        return 'bg-green-500';
      case 'В процессе':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const filteredCourseProgress = getFilteredProgress(courseProgress);
  const filteredTrainerProgress = getFilteredProgress(trainerProgress);

  const totalCompleted = filteredCourseProgress.filter(p => p.status === 'Завершен').length + 
                         filteredTrainerProgress.filter(p => p.status === 'Завершен').length;
  const totalInProgress = filteredCourseProgress.filter(p => p.status === 'В процессе').length + 
                          filteredTrainerProgress.filter(p => p.status === 'В процессе').length;

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
                <h1 className="text-2xl font-bold">Аналитика обучения</h1>
                <p className="text-sm text-muted-foreground">Прогресс сотрудников и статистика</p>
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите отдел" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все отделы</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Icon name="BookOpen" size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">В процессе</p>
                <p className="text-2xl font-bold">{totalInProgress}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Завершено</p>
                <p className="text-2xl font-bold">{totalCompleted}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={24} className="text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего активностей</p>
                <p className="text-2xl font-bold">{totalInProgress + totalCompleted}</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Курсы</TabsTrigger>
            <TabsTrigger value="trainers">Тренажеры</TabsTrigger>
            <TabsTrigger value="users">По сотрудникам</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Статистика по курсам</h2>
              <div className="space-y-4">
                {courseStats.map((stat) => (
                  <Card key={stat.course_id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{stat.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stat.total_users} сотрудников
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{stat.in_progress} в процессе</Badge>
                        <Badge className="bg-green-500">{stat.completed} завершено</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Средний прогресс</span>
                        <span className="font-semibold">{stat.avg_progress}%</span>
                      </div>
                      <Progress value={stat.avg_progress} className="h-2" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Детальный прогресс по курсам</h2>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Сотрудник</th>
                        <th className="text-left p-4 font-medium">Отдел</th>
                        <th className="text-left p-4 font-medium">Курс</th>
                        <th className="text-left p-4 font-medium">Статус</th>
                        <th className="text-left p-4 font-medium">Прогресс</th>
                        <th className="text-left p-4 font-medium">Начат</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourseProgress.map((prog, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{prog.full_name}</p>
                              <p className="text-sm text-muted-foreground">{prog.username}</p>
                            </div>
                          </td>
                          <td className="p-4">{prog.department_name}</td>
                          <td className="p-4">{prog.title}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(prog.status)}>{prog.status}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Progress value={prog.progress_percentage || 0} className="w-20 h-2" />
                              <span className="text-sm">{prog.progress_percentage || 0}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(prog.started_at).toLocaleDateString('ru-RU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trainers" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Статистика по тренажерам</h2>
              <div className="space-y-4">
                {trainerStats.map((stat) => (
                  <Card key={stat.trainer_id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{stat.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stat.total_users} сотрудников
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{stat.in_progress} в процессе</Badge>
                        <Badge className="bg-green-500">{stat.completed} завершено</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Award" size={20} className="text-yellow-500" />
                      <span className="text-sm">Средний результат: <strong>{stat.avg_score}%</strong></span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Детальный прогресс по тренажерам</h2>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Сотрудник</th>
                        <th className="text-left p-4 font-medium">Отдел</th>
                        <th className="text-left p-4 font-medium">Тренажер</th>
                        <th className="text-left p-4 font-medium">Статус</th>
                        <th className="text-left p-4 font-medium">Результат</th>
                        <th className="text-left p-4 font-medium">Начат</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrainerProgress.map((prog, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{prog.full_name}</p>
                              <p className="text-sm text-muted-foreground">{prog.username}</p>
                            </div>
                          </td>
                          <td className="p-4">{prog.department_name}</td>
                          <td className="p-4">{prog.title}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(prog.status)}>{prog.status}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Icon name="Award" size={16} className="text-yellow-500" />
                              <span className="font-semibold">{prog.score || 0}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(prog.started_at).toLocaleDateString('ru-RU')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Активность сотрудников</h2>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Сотрудник</th>
                        <th className="text-left p-4 font-medium">Отдел</th>
                        <th className="text-left p-4 font-medium">Курсов начато</th>
                        <th className="text-left p-4 font-medium">Курсов завершено</th>
                        <th className="text-left p-4 font-medium">Тренажеров начато</th>
                        <th className="text-left p-4 font-medium">Тренажеров завершено</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Set([
                        ...filteredCourseProgress.map(p => p.user_id),
                        ...filteredTrainerProgress.map(p => p.user_id)
                      ])).map((userId) => {
                        const userCourses = filteredCourseProgress.filter(p => p.user_id === userId);
                        const userTrainers = filteredTrainerProgress.filter(p => p.user_id === userId);
                        const user = userCourses[0] || userTrainers[0];

                        return (
                          <tr key={userId} className="border-t">
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-sm text-muted-foreground">{user.username}</p>
                              </div>
                            </td>
                            <td className="p-4">{user.department_name}</td>
                            <td className="p-4">{userCourses.length}</td>
                            <td className="p-4">
                              <Badge className="bg-green-500">
                                {userCourses.filter(c => c.status === 'Завершен').length}
                              </Badge>
                            </td>
                            <td className="p-4">{userTrainers.length}</td>
                            <td className="p-4">
                              <Badge className="bg-green-500">
                                {userTrainers.filter(t => t.status === 'Завершен').length}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
