import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

type Section = 'dashboard' | 'courses' | 'trainers' | 'analytics' | 'achievements' | 'profile';

interface Course {
  id: number;
  title: string;
  description: string;
  progress: number;
  category: string;
  duration: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

interface Trainer {
  id: number;
  title: string;
  type: 'voice' | 'quiz' | 'practice';
  difficulty: 'easy' | 'medium' | 'hard';
  completed: number;
  total: number;
}

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Основы продаж',
    description: 'Изучите базовые техники продаж и работы с клиентами',
    progress: 75,
    category: 'Продажи',
    duration: '4 часа',
    status: 'in-progress'
  },
  {
    id: 2,
    title: 'Клиентский сервис',
    description: 'Научитесь работать с возражениями и сложными клиентами',
    progress: 100,
    category: 'Сервис',
    duration: '3 часа',
    status: 'completed'
  },
  {
    id: 3,
    title: 'Презентация продукта',
    description: 'Эффективные методы демонстрации продуктов',
    progress: 0,
    category: 'Продажи',
    duration: '5 часов',
    status: 'not-started'
  },
  {
    id: 4,
    title: 'Работа в команде',
    description: 'Коммуникация и кооперация с коллегами',
    progress: 30,
    category: 'Soft Skills',
    duration: '2 часа',
    status: 'in-progress'
  }
];

const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: 'Первый курс',
    description: 'Завершите свой первый курс',
    icon: '🎯',
    unlocked: true,
    date: '15 нояб 2025'
  },
  {
    id: 2,
    title: 'Неделя учёбы',
    description: 'Учитесь 7 дней подряд',
    icon: '🔥',
    unlocked: true,
    date: '22 нояб 2025'
  },
  {
    id: 3,
    title: 'Топ-10',
    description: 'Войдите в топ-10 лучших учеников',
    icon: '⭐',
    unlocked: false
  },
  {
    id: 4,
    title: 'Мастер голоса',
    description: 'Пройдите 50 голосовых тренажеров',
    icon: '🎤',
    unlocked: false
  }
];

const mockTrainers: Trainer[] = [
  {
    id: 1,
    title: 'Голосовые диалоги',
    type: 'voice',
    difficulty: 'medium',
    completed: 12,
    total: 20
  },
  {
    id: 2,
    title: 'Тесты знаний',
    type: 'quiz',
    difficulty: 'easy',
    completed: 45,
    total: 50
  },
  {
    id: 3,
    title: 'Симуляция переговоров',
    type: 'practice',
    difficulty: 'hard',
    completed: 3,
    total: 15
  }
];

const leaderboardData = [
  { name: 'Анна Смирнова', points: 2450, avatar: '👩‍💼' },
  { name: 'Дмитрий Петров', points: 2380, avatar: '👨‍💼' },
  { name: 'Вы', points: 2150, avatar: '😊', isCurrentUser: true },
  { name: 'Елена Иванова', points: 2050, avatar: '👩‍💼' },
  { name: 'Михаил Козлов', points: 1980, avatar: '👨‍💼' }
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const userStats = {
    coursesCompleted: 12,
    hoursLearned: 48,
    currentStreak: 7,
    rank: 3,
    totalPoints: 2150
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary to-secondary border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Завершено курсов</p>
              <p className="text-3xl font-bold mt-1">{userStats.coursesCompleted}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="BookOpen" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent to-orange-400 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Часов обучения</p>
              <p className="text-3xl font-bold mt-1">{userStats.hoursLearned}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="Clock" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-success to-cyan-400 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Дней подряд</p>
              <p className="text-3xl font-bold mt-1">{userStats.currentStreak} 🔥</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="Flame" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-600 to-pink-500 border-0 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Место в рейтинге</p>
              <p className="text-3xl font-bold mt-1">#{userStats.rank}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="Trophy" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-xl font-semibold mb-4">Активные курсы</h2>
          <div className="space-y-4">
            {mockCourses.filter(c => c.status === 'in-progress').map(course => (
              <div key={course.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <Button className="w-full mt-3" size="sm">Продолжить</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Недавние достижения</h2>
          <div className="space-y-3">
            {mockAchievements.filter(a => a.unlocked).map(achievement => (
              <div key={achievement.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-3xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{achievement.title}</h3>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.date && (
                    <p className="text-xs text-primary mt-1">{achievement.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Каталог курсов</h1>
        <Tabs defaultValue="all" className="w-auto">
          <TabsList>
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="in-progress">В процессе</TabsTrigger>
            <TabsTrigger value="completed">Завершённые</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map(course => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
            <div className={`h-2 ${course.status === 'completed' ? 'bg-success' : course.status === 'in-progress' ? 'bg-primary' : 'bg-muted'}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                  {course.category}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  {course.duration}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
              
              {course.progress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="font-semibold">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}
              
              <Button className="w-full" variant={course.status === 'not-started' ? 'outline' : 'default'}>
                {course.status === 'completed' ? 'Повторить' : course.status === 'in-progress' ? 'Продолжить' : 'Начать курс'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTrainers = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Тренажёры</h1>
        <p className="text-muted-foreground">Практикуйте навыки с интерактивными упражнениями</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTrainers.map(trainer => (
          <Card key={trainer.id} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                trainer.type === 'voice' ? 'bg-primary/10 text-primary' :
                trainer.type === 'quiz' ? 'bg-accent/10 text-accent' :
                'bg-success/10 text-success'
              }`}>
                <Icon name={trainer.type === 'voice' ? 'Mic' : trainer.type === 'quiz' ? 'ClipboardList' : 'Lightbulb'} size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{trainer.title}</h3>
                <Badge variant="outline" className="mt-1">
                  {trainer.difficulty === 'easy' ? '🟢 Легко' : trainer.difficulty === 'medium' ? '🟡 Средне' : '🔴 Сложно'}
                </Badge>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-semibold">{trainer.completed}/{trainer.total}</span>
              </div>
              <Progress value={(trainer.completed / trainer.total) * 100} className="h-2" />
            </div>

            <Button className="w-full">
              {trainer.completed === 0 ? 'Начать' : 'Продолжить'}
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="Mic" size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Голосовой тренажёр</h2>
            <p className="text-muted-foreground">
              Практикуйте переговоры с ИИ-ассистентом. Получайте мгновенную обратную связь по интонации, аргументации и технике продаж.
            </p>
          </div>
          <Button size="lg" className="px-8 flex-shrink-0">
            Попробовать
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Аналитика и прогресс</h1>
        <p className="text-muted-foreground">Отслеживайте своё развитие и достижения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-3">
              {userStats.coursesCompleted}
            </div>
            <h3 className="font-semibold mb-1">Завершённых курсов</h3>
            <p className="text-sm text-muted-foreground">+3 за последний месяц</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-accent/10 text-accent rounded-full flex items-center justify-center text-3xl font-bold mb-3">
              {userStats.hoursLearned}
            </div>
            <h3 className="font-semibold mb-1">Часов обучения</h3>
            <p className="text-sm text-muted-foreground">В среднем 12 ч/месяц</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-success/10 text-success rounded-full flex items-center justify-center text-3xl font-bold mb-3">
              92%
            </div>
            <h3 className="font-semibold mb-1">Средний балл</h3>
            <p className="text-sm text-muted-foreground">Отлично! 📈</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Активность за последние 30 дней</h2>
        <div className="flex items-end justify-between gap-2 h-64">
          {[12, 8, 15, 10, 18, 14, 20, 16, 22, 18, 25, 20, 28, 24].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-md hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: `${(height / 30) * 100}%` }}
                title={`${height} минут`}
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">Минут обучения по дням</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Сильные стороны</h2>
          <div className="space-y-3">
            {[
              { skill: 'Работа с возражениями', level: 95 },
              { skill: 'Презентация', level: 88 },
              { skill: 'Клиентский сервис', level: 82 }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.skill}</span>
                  <span className="font-semibold">{item.level}%</span>
                </div>
                <Progress value={item.level} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Зоны роста</h2>
          <div className="space-y-3">
            {[
              { skill: 'Холодные звонки', level: 45 },
              { skill: 'Переговоры', level: 58 },
              { skill: 'Тайм-менеджмент', level: 62 }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{item.skill}</span>
                  <span className="font-semibold">{item.level}%</span>
                </div>
                <Progress value={item.level} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Достижения и рейтинг</h1>
          <p className="text-muted-foreground">Соревнуйтесь с коллегами и получайте награды</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-sm text-muted-foreground">Ваши баллы</p>
          <p className="text-3xl font-bold text-primary">{userStats.totalPoints}</p>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Топ-5 учеников</h2>
        <div className="space-y-3">
          {leaderboardData.map((user, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                user.isCurrentUser ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-orange-600 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              <Avatar>
                <AvatarFallback>{user.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.points} баллов</p>
              </div>
              {user.isCurrentUser && (
                <Badge variant="default">Вы</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Ваши достижения</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockAchievements.map(achievement => (
            <Card
              key={achievement.id}
              className={`p-6 text-center ${
                achievement.unlocked ? 'bg-gradient-to-br from-primary/10 to-secondary/10' : 'opacity-50 grayscale'
              }`}
            >
              <div className="text-5xl mb-3">{achievement.icon}</div>
              <h3 className="font-semibold mb-1">{achievement.title}</h3>
              <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
              {achievement.unlocked && achievement.date && (
                <Badge variant="secondary" className="text-xs">{achievement.date}</Badge>
              )}
              {!achievement.unlocked && (
                <Badge variant="outline" className="text-xs">Заблокировано</Badge>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-3xl">😊</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Иван Петров</h1>
            <p className="text-muted-foreground mb-4">Менеджер по продажам · Отдел B2B</p>
            <div className="flex gap-4 flex-wrap">
              <Button>Редактировать профиль</Button>
              <Button variant="outline">Настройки</Button>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">Рейтинг</p>
            <p className="text-4xl font-bold text-primary">#{userStats.rank}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <Icon name="BookOpen" size={32} className="mx-auto mb-2 text-primary" />
          <p className="text-3xl font-bold mb-1">{userStats.coursesCompleted}</p>
          <p className="text-sm text-muted-foreground">Курсов завершено</p>
        </Card>
        <Card className="p-6 text-center">
          <Icon name="Award" size={32} className="mx-auto mb-2 text-accent" />
          <p className="text-3xl font-bold mb-1">{mockAchievements.filter(a => a.unlocked).length}</p>
          <p className="text-sm text-muted-foreground">Достижений получено</p>
        </Card>
        <Card className="p-6 text-center">
          <Icon name="Clock" size={32} className="mx-auto mb-2 text-success" />
          <p className="text-3xl font-bold mb-1">{userStats.hoursLearned}</p>
          <p className="text-sm text-muted-foreground">Часов обучения</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Полученные сертификаты</h2>
        <div className="space-y-4">
          {[
            { title: 'Основы продаж', date: '15 ноя 2025', id: 'CERT-2025-001' },
            { title: 'Клиентский сервис', date: '22 ноя 2025', id: 'CERT-2025-002' }
          ].map((cert, i) => (
            <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Award" size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground">Выдан {cert.date} · ID: {cert.id}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Скачать
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">История активности</h2>
        <div className="space-y-3">
          {[
            { action: 'Завершён курс "Клиентский сервис"', time: '2 часа назад', icon: 'BookCheck' },
            { action: 'Получено достижение "Неделя учёбы"', time: '1 день назад', icon: 'Award' },
            { action: 'Пройден тренажёр "Голосовые диалоги"', time: '2 дня назад', icon: 'Mic' },
            { action: 'Начат курс "Работа в команде"', time: '3 дня назад', icon: 'Users' }
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name={activity.icon as any} size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
                Л
              </div>
              <div>
                <h1 className="text-xl font-bold">ЛидерПро</h1>
                <p className="text-xs text-muted-foreground">Обучающая платформа</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              {[
                { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
                { id: 'courses', label: 'Курсы', icon: 'BookOpen' },
                { id: 'trainers', label: 'Тренажёры', icon: 'Dumbbell' },
                { id: 'analytics', label: 'Аналитика', icon: 'BarChart3' },
                { id: 'achievements', label: 'Достижения', icon: 'Trophy' },
                { id: 'profile', label: 'Профиль', icon: 'User' }
              ].map(item => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  onClick={() => setActiveSection(item.id as Section)}
                  className="gap-2"
                >
                  <Icon name={item.icon as any} size={18} />
                  {item.label}
                </Button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Icon name="Bell" size={20} />
              </Button>
              <Avatar>
                <AvatarFallback>😊</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 pb-24 md:pb-8">
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'courses' && renderCourses()}
        {activeSection === 'trainers' && renderTrainers()}
        {activeSection === 'analytics' && renderAnalytics()}
        {activeSection === 'achievements' && renderAchievements()}
        {activeSection === 'profile' && renderProfile()}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t p-2 z-50">
        <div className="grid grid-cols-6 gap-1">
          {[
            { id: 'dashboard', icon: 'LayoutDashboard' },
            { id: 'courses', icon: 'BookOpen' },
            { id: 'trainers', icon: 'Dumbbell' },
            { id: 'analytics', icon: 'BarChart3' },
            { id: 'achievements', icon: 'Trophy' },
            { id: 'profile', icon: 'User' }
          ].map(item => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection(item.id as Section)}
              className="flex flex-col h-auto py-2"
            >
              <Icon name={item.icon as any} size={20} />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;