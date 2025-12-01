import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import { LEARNING_API_URL } from '@/lib/learning';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: number;
  title: string;
  description: string;
  content: string;
  duration_hours: number;
  is_active: boolean;
  creator_name: string;
  created_at: string;
  departments_count: number;
  departments?: Department[];
}

interface Trainer {
  id: number;
  title: string;
  description: string;
  content: string;
  difficulty_level: string;
  is_active: boolean;
  creator_name: string;
  created_at: string;
  departments_count: number;
  departments?: Department[];
}

interface Department {
  id: number;
  name: string;
  company_name: string;
}

export default function LearningAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'course' | 'trainer'>('course');
  const [editingItem, setEditingItem] = useState<Course | Trainer | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    content: '',
    duration_hours: 0,
    is_active: true,
  });

  const [trainerForm, setTrainerForm] = useState({
    title: '',
    description: '',
    content: '',
    difficulty_level: 'Начальный',
    is_active: true,
  });

  useEffect(() => {
    fetchCourses();
    fetchTrainers();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      const userId = authService.getUserId();
      const response = await fetch(`${LEARNING_API_URL}?resource=courses`, {
        headers: { 'X-User-Id': userId?.toString() || '' },
      });
      const data = await response.json();
      if (Array.isArray(data)) setCourses(data);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить курсы', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const userId = authService.getUserId();
      const response = await fetch(`${LEARNING_API_URL}?resource=trainers`, {
        headers: { 'X-User-Id': userId?.toString() || '' },
      });
      const data = await response.json();
      if (Array.isArray(data)) setTrainers(data);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить тренажеры', variant: 'destructive' });
    }
  };

  const fetchDepartments = async () => {
    try {
      const userId = authService.getUserId();
      const orgUrl = 'https://functions.poehali.dev/227369fe-07ca-4f0c-b8ee-f647263e78d9';
      const response = await fetch(`${orgUrl}?entity_type=department`, {
        headers: { 'X-User-Id': userId?.toString() || '' },
      });
      const data = await response.json();
      if (data.departments) {
        setDepartments(data.departments.map((d: any) => ({
          id: d.id,
          name: d.name,
          company_name: d.company_name
        })));
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const openCourseEdit = (course: Course) => {
    setEditingItem(course);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      content: course.content || '',
      duration_hours: course.duration_hours || 0,
      is_active: course.is_active,
    });
    setSelectedDepartments(course.departments?.map((d: Department) => d.id) || []);
    setDialogType('course');
    setShowDialog(true);
  };

  const openTrainerEdit = (trainer: Trainer) => {
    setEditingItem(trainer);
    setTrainerForm({
      title: trainer.title,
      description: trainer.description || '',
      content: trainer.content || '',
      difficulty_level: trainer.difficulty_level || 'Начальный',
      is_active: trainer.is_active,
    });
    setSelectedDepartments(trainer.departments?.map((d: Department) => d.id) || []);
    setDialogType('trainer');
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      const userId = authService.getUserId();
      const isEdit = !!editingItem;
      const isCourse = dialogType === 'course';
      const formData = isCourse ? courseForm : trainerForm;
      const resource = isCourse ? 'courses' : 'trainers';
      
      const response = await fetch(`${LEARNING_API_URL}?resource=${resource}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId?.toString() || '',
        },
        body: JSON.stringify({
          ...(isEdit && { id: editingItem.id }),
          ...formData,
          department_ids: selectedDepartments,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: isEdit ? `${isCourse ? 'Курс' : 'Тренажер'} обновлен` : `${isCourse ? 'Курс' : 'Тренажер'} создан` });
        setShowDialog(false);
        resetForm();
        isCourse ? fetchCourses() : fetchTrainers();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setCourseForm({ title: '', description: '', content: '', duration_hours: 0, is_active: true });
    setTrainerForm({ title: '', description: '', content: '', difficulty_level: 'Начальный', is_active: true });
    setSelectedDepartments([]);
    setEditingItem(null);
  };

  const toggleDepartment = (deptId: number) => {
    setSelectedDepartments(prev =>
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    );
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
                <h1 className="text-2xl font-bold">Курсы и тренажеры</h1>
                <p className="text-sm text-muted-foreground">Создание учебных материалов</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="courses" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="courses">Курсы</TabsTrigger>
              <TabsTrigger value="trainers">Тренажеры</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button onClick={() => { resetForm(); setDialogType('course'); setShowDialog(true); }}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать курс
              </Button>
              <Button onClick={() => { resetForm(); setDialogType('trainer'); setShowDialog(true); }} variant="secondary">
                <Icon name="Plus" size={18} className="mr-2" />
                Создать тренажер
              </Button>
            </div>
          </div>

          <TabsContent value="courses" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openCourseEdit(course)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="BookOpen" size={24} className="text-primary" />
                    </div>
                    <Badge>{course.departments_count} подр.</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Clock" size={14} />
                    <span>{course.duration_hours} ч.</span>
                    {!course.is_active && <Badge variant="destructive" className="ml-2">Неактивен</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trainers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openTrainerEdit(trainer)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Zap" size={24} className="text-secondary" />
                    </div>
                    <Badge>{trainer.departments_count} подр.</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{trainer.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{trainer.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{trainer.difficulty_level}</Badge>
                    {!trainer.is_active && <Badge variant="destructive">Неактивен</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Редактирование' : 'Создание'} {dialogType === 'course' ? 'курса' : 'тренажера'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {dialogType === 'course' ? (
              <>
                <div className="space-y-2">
                  <Label>Название курса *</Label>
                  <Input
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="Например: Основы стоматологии"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Краткое описание курса"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Содержание курса</Label>
                  <Textarea
                    value={courseForm.content}
                    onChange={(e) => setCourseForm({ ...courseForm, content: e.target.value })}
                    placeholder="Подробное содержание курса"
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Длительность (часы)</Label>
                  <Input
                    type="number"
                    value={courseForm.duration_hours}
                    onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Название тренажера *</Label>
                  <Input
                    value={trainerForm.title}
                    onChange={(e) => setTrainerForm({ ...trainerForm, title: e.target.value })}
                    placeholder="Например: Препарирование зубов"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={trainerForm.description}
                    onChange={(e) => setTrainerForm({ ...trainerForm, description: e.target.value })}
                    placeholder="Краткое описание тренажера"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Содержание</Label>
                  <Textarea
                    value={trainerForm.content}
                    onChange={(e) => setTrainerForm({ ...trainerForm, content: e.target.value })}
                    placeholder="Подробное описание упражнений"
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Уровень сложности</Label>
                  <Select
                    value={trainerForm.difficulty_level}
                    onValueChange={(value) => setTrainerForm({ ...trainerForm, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Начальный">Начальный</SelectItem>
                      <SelectItem value="Средний">Средний</SelectItem>
                      <SelectItem value="Продвинутый">Продвинутый</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-4">
              <Label>Доступ для подразделений</Label>
              {departments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Сначала создайте подразделения</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`dept-${dept.id}`}
                        checked={selectedDepartments.includes(dept.id)}
                        onCheckedChange={() => toggleDepartment(dept.id)}
                      />
                      <label htmlFor={`dept-${dept.id}`} className="text-sm cursor-pointer">
                        <div className="font-medium">{dept.name}</div>
                        <div className="text-muted-foreground">{dept.company_name}</div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}