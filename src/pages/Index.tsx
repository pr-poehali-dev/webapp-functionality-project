import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { authService } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Course {
  id: number;
  title: string;
  description: string;
  progress: number;
  category: string;
  duration: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Продажи стоматологических услуг',
    description: 'Техники продаж для администраторов стоматологии',
    progress: 75,
    category: 'Продажи',
    duration: '4 часа',
    status: 'in-progress'
  },
  {
    id: 2,
    title: 'Работа с пациентами',
    description: 'Общение с пациентами и работа с возражениями',
    progress: 100,
    category: 'Сервис',
    duration: '3 часа',
    status: 'completed'
  },
  {
    id: 3,
    title: 'Презентация лечения',
    description: 'Как правильно представить план лечения пациенту',
    progress: 0,
    category: 'Продажи',
    duration: '5 часов',
    status: 'not-started'
  }
];

export default function Index() {
  const navigate = useNavigate();
  const currentUser = authService.getUser();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getStatusBadge = (status: Course['status']) => {
    const variants = {
      'not-started': { variant: 'secondary' as const, text: 'Не начат' },
      'in-progress': { variant: 'default' as const, text: 'В процессе' },
      'completed': { variant: 'outline' as const, text: 'Завершён' }
    };
    return variants[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Платформа обучения</h1>
              <p className="text-xs text-muted-foreground">Стоматологическая клиника</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {currentUser?.full_name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{currentUser?.full_name || 'Администратор'}</span>
                <Icon name="ChevronDown" size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="User" size={16} className="mr-2" />
                Профиль
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </DropdownMenuItem>
              {authService.hasPermission('users.view') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                    <Icon name="Users" size={16} className="mr-2" />
                    Управление пользователями
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/roles')}>
                    <Icon name="Shield" size={16} className="mr-2" />
                    Роли и права
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/audit')}>
                    <Icon name="FileText" size={16} className="mr-2" />
                    Журнал аудита
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Добро пожаловать, {currentUser?.full_name}!</h2>
          <p className="text-muted-foreground">Продолжайте обучение и развивайте свои навыки</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="BookOpen" size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Активных курсов</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle2" size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Завершено уроков</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Icon name="Award" size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Достижений</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2150</p>
                <p className="text-sm text-muted-foreground">Баллов</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Courses */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Мои курсы</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCourses.map((course) => {
              const statusInfo = getStatusBadge(course.status);
              return (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCourse(course)}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>
                      <Badge variant="outline">{course.category}</Badge>
                    </div>
                    
                    <h4 className="text-lg font-semibold mb-2">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Прогресс</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Icon name="Clock" size={14} />
                        <span>{course.duration}</span>
                      </div>
                      <Button size="sm">
                        {course.status === 'completed' ? 'Повторить' : course.status === 'in-progress' ? 'Продолжить' : 'Начать'}
                        <Icon name="ArrowRight" size={14} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
