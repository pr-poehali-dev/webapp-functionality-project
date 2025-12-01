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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Course {
  id: number;
  title: string;
  description: string;
  progress: number;
  category: string;
  duration: string;
  status: 'not-started' | 'in-progress' | 'completed';
  lessons?: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'text' | 'quiz';
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface VoiceStep {
  id: number;
  prompt: string;
  expectedKeywords: string[];
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
}

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  points: number;
  rank: number;
  coursesCompleted: number;
}

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Продажи стоматологических услуг',
    description: 'Техники продаж для администраторов стоматологии',
    progress: 75,
    category: 'Продажи',
    duration: '4 часа',
    status: 'in-progress',
    lessons: [
      { id: 1, title: 'Введение в продажи', duration: '15 мин', completed: true, type: 'video' },
      { id: 2, title: 'Техники активных продаж', duration: '30 мин', completed: true, type: 'video' },
      { id: 3, title: 'Тест: Основы продаж', duration: '10 мин', completed: false, type: 'quiz' },
    ]
  },
  {
    id: 2,
    title: 'Работа с пациентами',
    description: 'Общение с пациентами и работа с возражениями',
    progress: 100,
    category: 'Сервис',
    duration: '3 часа',
    status: 'completed',
    lessons: [
      { id: 4, title: 'Психология пациента', duration: '20 мин', completed: true, type: 'text' },
      { id: 5, title: 'Работа с возражениями', duration: '25 мин', completed: true, type: 'video' },
    ]
  },
  {
    id: 3,
    title: 'Презентация лечения',
    description: 'Как правильно представить план лечения пациенту',
    progress: 0,
    category: 'Продажи',
    duration: '5 часов',
    status: 'not-started',
    lessons: []
  }
];

const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Какой первый шаг в технике активных продаж?',
    options: ['Презентация услуги', 'Выявление потребностей', 'Закрытие сделки', 'Работа с возражениями'],
    correctAnswer: 1
  },
  {
    id: 2,
    question: 'Что важнее всего при работе с пациентом?',
    options: ['Скорость обслуживания', 'Эмпатия и понимание', 'Знание прайса', 'Красивая речь'],
    correctAnswer: 1
  },
  {
    id: 3,
    question: 'Как правильно реагировать на возражение "Дорого"?',
    options: ['Сразу дать скидку', 'Выяснить истинную причину', 'Сравнить с конкурентами', 'Перейти к другой услуге'],
    correctAnswer: 1
  }
];

const mockVoiceSteps: VoiceStep[] = [
  {
    id: 1,
    prompt: 'Поздоровайтесь с пациентом и представьтесь',
    expectedKeywords: ['здравствуйте', 'добрый день', 'меня зовут']
  },
  {
    id: 2,
    prompt: 'Спросите, как вы можете помочь пациенту',
    expectedKeywords: ['помочь', 'чем могу', 'обратились']
  },
  {
    id: 3,
    prompt: 'Предложите записаться на консультацию',
    expectedKeywords: ['записаться', 'консультация', 'прием', 'врач']
  }
];

const mockAchievements: Achievement[] = [
  {
    id: 1,
    title: 'Первый шаг',
    description: 'Завершите первый урок',
    icon: 'Award',
    unlocked: true,
    progress: 1,
    total: 1
  },
  {
    id: 2,
    title: 'Знаток продаж',
    description: 'Завершите 5 уроков по продажам',
    icon: 'TrendingUp',
    unlocked: true,
    progress: 5,
    total: 5
  },
  {
    id: 3,
    title: 'Мастер общения',
    description: 'Пройдите все тренажеры голосового общения',
    icon: 'Mic',
    unlocked: false,
    progress: 2,
    total: 5
  },
  {
    id: 4,
    title: 'Отличник',
    description: 'Наберите 90%+ в 10 тестах',
    icon: 'Star',
    unlocked: false,
    progress: 3,
    total: 10
  }
];

const mockLeaderboard: LeaderboardEntry[] = [
  { id: 1, name: 'Анна Смирнова', avatar: 'АС', points: 3500, rank: 1, coursesCompleted: 8 },
  { id: 2, name: 'Мария Петрова', avatar: 'МП', points: 3200, rank: 2, coursesCompleted: 7 },
  { id: 3, name: 'Елена Иванова', avatar: 'ЕИ', points: 2800, rank: 3, coursesCompleted: 6 },
  { id: 4, name: 'Ольга Васильева', avatar: 'ОВ', points: 2150, rank: 4, coursesCompleted: 5 },
  { id: 5, name: 'Дарья Козлова', avatar: 'ДК', points: 1900, rank: 5, coursesCompleted: 4 },
];

export default function Index() {
  const navigate = useNavigate();
  const currentUser = authService.getUser();
  
  // Main state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Trainer states
  const [quizDialog, setQuizDialog] = useState(false);
  const [voiceDialog, setVoiceDialog] = useState(false);
  const [doctorDialog, setDoctorDialog] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentVoiceStep, setCurrentVoiceStep] = useState(0);
  const [voiceResponse, setVoiceResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [doctorScenario, setDoctorScenario] = useState('consultation');
  const [doctorMessages, setDoctorMessages] = useState<Array<{ role: 'user' | 'doctor', content: string }>>([]);
  const [doctorInput, setDoctorInput] = useState('');
  
  // Profile state
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileBio, setProfileBio] = useState('');

  // Handlers
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

  const handleCompleteLesson = (courseId: number, lessonId: number) => {
    console.log(`Completing lesson ${lessonId} in course ${courseId}`);
  };

  const handleSubmitQuiz = () => {
    const correct = quizAnswers.filter((answer, index) => answer === mockQuizQuestions[index].correctAnswer).length;
    const score = Math.round((correct / mockQuizQuestions.length) * 100);
    setQuizScore(score);
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizQuestion < mockQuizQuestions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevQuizQuestion = () => {
    if (currentQuizQuestion > 0) {
      setCurrentQuizQuestion(currentQuizQuestion - 1);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuizQuestion(0);
    setQuizAnswers([]);
    setQuizScore(null);
  };

  const handleNextVoiceStep = () => {
    if (currentVoiceStep < mockVoiceSteps.length - 1) {
      setCurrentVoiceStep(currentVoiceStep + 1);
      setVoiceResponse('');
    } else {
      // Complete voice training
      setVoiceDialog(false);
      setCurrentVoiceStep(0);
      setVoiceResponse('');
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // In real app, start actual recording
    setTimeout(() => {
      setIsRecording(false);
      setVoiceResponse('Пример записанного ответа...');
    }, 2000);
  };

  const handleSendDoctorMessage = () => {
    if (doctorInput.trim()) {
      setDoctorMessages([...doctorMessages, { role: 'user', content: doctorInput }]);
      setDoctorInput('');
      
      // Simulate doctor response
      setTimeout(() => {
        const responses = [
          'Хорошо, я понимаю вашу ситуацию. Давайте обсудим варианты лечения.',
          'Отличный вопрос! В вашем случае я бы рекомендовал следующее...',
          'Спасибо за информацию. Это поможет мне составить оптимальный план лечения.',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setDoctorMessages(prev => [...prev, { role: 'doctor', content: randomResponse }]);
      }, 1000);
    }
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', { profileName, profileEmail, profileBio });
    // In real app, send to backend
  };

  // Render functions
  const renderDashboard = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Добро пожаловать, {currentUser?.full_name}!</h2>
        <p className="text-muted-foreground">Продолжайте обучение и развивайте свои навыки</p>
      </div>

      {/* AI Recommendations Card */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/my-learning')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Icon name="Sparkles" size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">AI рекомендации для вас</h3>
              <p className="text-sm text-muted-foreground">Персональные курсы и тренажеры на основе вашего прогресса</p>
            </div>
          </div>
          <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Continue Learning */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Продолжить обучение</h3>
        {mockCourses.filter(c => c.status === 'in-progress').map(course => (
          <Card key={course.id} className="p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-2">{course.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                <Progress value={course.progress} className="mb-2" />
                <p className="text-sm text-muted-foreground">{course.progress}% завершено</p>
              </div>
              <Button onClick={() => setSelectedCourse(course)} className="ml-4">
                Продолжить
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Achievements */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Недавние достижения</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAchievements.filter(a => a.unlocked).slice(0, 2).map(achievement => (
            <Card key={achievement.id} className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Icon name={achievement.icon as any} size={32} className="text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCourses = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6">Мои курсы</h2>
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
  );

  const renderTrainers = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6">Тренажеры</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quiz Trainer */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setQuizDialog(true)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="ClipboardCheck" size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Тестовый тренажер</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Проверьте свои знания с помощью интерактивных тестов
            </p>
            <Badge>12 тестов доступно</Badge>
          </div>
        </Card>

        {/* Voice Trainer */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setVoiceDialog(true)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="Mic" size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Голосовой тренажер</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Практикуйте общение с пациентами в голосовом формате
            </p>
            <Badge>8 сценариев</Badge>
          </div>
        </Card>

        {/* Doctor Trainer */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setDoctorDialog(true)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="Stethoscope" size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Тренажер с врачом</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Симуляция реальных диалогов с врачами и пациентами
            </p>
            <Badge>5 сценариев</Badge>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6">Аналитика</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Learning Progress */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Прогресс обучения</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Завершенные курсы</span>
                <span className="font-medium">33%</span>
              </div>
              <Progress value={33} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Активные курсы</span>
                <span className="font-medium">67%</span>
              </div>
              <Progress value={67} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Общий прогресс</span>
                <span className="font-medium">58%</span>
              </div>
              <Progress value={58} />
            </div>
          </div>
        </Card>

        {/* Activity Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Статистика активности</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Часов обучения</span>
              <span className="text-2xl font-bold">24.5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Завершено уроков</span>
              <span className="text-2xl font-bold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Средний балл тестов</span>
              <span className="text-2xl font-bold">87%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance by Category */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Результаты по категориям</h3>
        <div className="space-y-4">
          {[
            { name: 'Продажи', score: 92, color: 'bg-blue-500' },
            { name: 'Сервис', score: 88, color: 'bg-green-500' },
            { name: 'Коммуникация', score: 85, color: 'bg-purple-500' },
            { name: 'Техническая часть', score: 78, color: 'bg-orange-500' },
          ].map((category, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span>{category.name}</span>
                <span className="font-medium">{category.score}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className={`${category.color} h-2 rounded-full`} style={{ width: `${category.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAchievements = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6">Достижения</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAchievements.map((achievement) => (
          <Card key={achievement.id} className={`p-6 ${!achievement.unlocked && 'opacity-50'}`}>
            <div className="text-center">
              <div className={`w-20 h-20 ${achievement.unlocked ? 'bg-yellow-500/10' : 'bg-gray-500/10'} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                <Icon name={achievement.icon as any} size={40} className={achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
              {!achievement.unlocked && (
                <div>
                  <Progress value={(achievement.progress / achievement.total) * 100} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {achievement.progress} / {achievement.total}
                  </p>
                </div>
              )}
              {achievement.unlocked && (
                <Badge variant="default">Разблокировано</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6">Таблица лидеров</h2>
      <Card className="p-6">
        <div className="space-y-4">
          {mockLeaderboard.map((entry, index) => (
            <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-lg ${index === 3 ? 'bg-primary/5 border-2 border-primary' : 'bg-secondary/50'}`}>
              <div className="text-2xl font-bold w-8">
                {entry.rank === 1 && '🥇'}
                {entry.rank === 2 && '🥈'}
                {entry.rank === 3 && '🥉'}
                {entry.rank > 3 && entry.rank}
              </div>
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {entry.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold">{entry.name}</h4>
                <p className="text-sm text-muted-foreground">{entry.coursesCompleted} курсов завершено</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{entry.points}</p>
                <p className="text-xs text-muted-foreground">баллов</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div>
      <h2 className="text-3xl font-bold mb-6">Профиль</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Личная информация</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Имя</Label>
              <Input 
                id="name" 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileEmail} 
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="bio">О себе</Label>
              <Textarea 
                id="bio" 
                value={profileBio} 
                onChange={(e) => setProfileBio(e.target.value)}
                placeholder="Расскажите о себе"
                rows={4}
              />
            </div>
            <Button onClick={handleSaveProfile}>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить изменения
            </Button>
          </div>
        </Card>

        {/* Profile Stats */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {currentUser?.full_name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{currentUser?.full_name}</h3>
            <p className="text-sm text-muted-foreground">{currentUser?.role || 'Администратор'}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Уровень</span>
              <Badge variant="default">5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Баллы</span>
              <span className="font-bold">2150</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Место в рейтинге</span>
              <span className="font-bold">4</span>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">До следующего уровня</span>
                <span className="font-medium">350 баллов</span>
              </div>
              <Progress value={70} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

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
              <DropdownMenuItem onClick={() => setActiveTab('profile')}>
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
                  <DropdownMenuItem onClick={() => navigate('/admin/access-groups')}>
                    <Icon name="Shield" size={16} className="mr-2" />
                    Группы доступа
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                    <Icon name="Users" size={16} className="mr-2" />
                    Пользователи
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/companies')}>
                    <Icon name="Building2" size={16} className="mr-2" />
                    Компании и подразделения
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/audit')}>
                    <Icon name="FileText" size={16} className="mr-2" />
                    Журнал аудита
                  </DropdownMenuItem>
                </>
              )}
              {authService.hasPermission('courses.view') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/learning')}>
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    Курсы и тренажеры
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Icon name="LayoutDashboard" size={16} />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <Icon name="BookOpen" size={16} />
              <span className="hidden sm:inline">Курсы</span>
            </TabsTrigger>
            <TabsTrigger value="trainers" className="flex items-center gap-2">
              <Icon name="Dumbbell" size={16} />
              <span className="hidden sm:inline">Тренажеры</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              <span className="hidden sm:inline">Аналитика</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Icon name="Award" size={16} />
              <span className="hidden sm:inline">Достижения</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Icon name="Trophy" size={16} />
              <span className="hidden sm:inline">Рейтинг</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">{renderDashboard()}</TabsContent>
          <TabsContent value="courses">{renderCourses()}</TabsContent>
          <TabsContent value="trainers">{renderTrainers()}</TabsContent>
          <TabsContent value="analytics">{renderAnalytics()}</TabsContent>
          <TabsContent value="achievements">{renderAchievements()}</TabsContent>
          <TabsContent value="leaderboard">{renderLeaderboard()}</TabsContent>
          <TabsContent value="profile">{renderProfile()}</TabsContent>
        </Tabs>
      </main>

      {/* Quiz Dialog */}
      <Dialog open={quizDialog} onOpenChange={setQuizDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Тестовый тренажер</DialogTitle>
            <DialogDescription>
              {quizScore === null ? 'Ответьте на вопросы, чтобы проверить свои знания' : 'Результаты теста'}
            </DialogDescription>
          </DialogHeader>
          
          {quizScore === null ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Вопрос {currentQuizQuestion + 1} из {mockQuizQuestions.length}
                </span>
                <Progress value={((currentQuizQuestion + 1) / mockQuizQuestions.length) * 100} className="w-32" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {mockQuizQuestions[currentQuizQuestion].question}
                </h3>
                <div className="space-y-2">
                  {mockQuizQuestions[currentQuizQuestion].options.map((option, index) => (
                    <Button
                      key={index}
                      variant={quizAnswers[currentQuizQuestion] === index ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleQuizAnswer(currentQuizQuestion, index)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevQuizQuestion}
                  disabled={currentQuizQuestion === 0}
                >
                  <Icon name="ChevronLeft" size={16} className="mr-2" />
                  Назад
                </Button>
                <Button
                  onClick={handleNextQuizQuestion}
                  disabled={quizAnswers[currentQuizQuestion] === undefined}
                >
                  {currentQuizQuestion === mockQuizQuestions.length - 1 ? 'Завершить' : 'Далее'}
                  <Icon name="ChevronRight" size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${quizScore >= 70 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <span className="text-4xl font-bold" style={{ color: quizScore >= 70 ? '#22c55e' : '#ef4444' }}>
                  {quizScore}%
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {quizScore >= 70 ? 'Отлично!' : 'Нужно подучить'}
                </h3>
                <p className="text-muted-foreground">
                  Вы ответили правильно на {quizAnswers.filter((answer, index) => answer === mockQuizQuestions[index].correctAnswer).length} из {mockQuizQuestions.length} вопросов
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setQuizDialog(false)}>
                  Закрыть
                </Button>
                <Button onClick={handleRestartQuiz}>
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Пройти снова
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Voice Dialog */}
      <Dialog open={voiceDialog} onOpenChange={setVoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Голосовой тренажер</DialogTitle>
            <DialogDescription>
              Практикуйте общение с пациентами в голосовом формате
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Шаг {currentVoiceStep + 1} из {mockVoiceSteps.length}
              </span>
              <Progress value={((currentVoiceStep + 1) / mockVoiceSteps.length) * 100} className="w-32" />
            </div>
            
            <Card className="p-6 bg-primary/5">
              <p className="text-lg font-semibold mb-2">Ваша задача:</p>
              <p className="text-muted-foreground">{mockVoiceSteps[currentVoiceStep].prompt}</p>
            </Card>

            <div className="text-center">
              <Button
                size="lg"
                variant={isRecording ? 'destructive' : 'default'}
                className="w-32 h-32 rounded-full"
                onClick={handleStartRecording}
                disabled={isRecording}
              >
                <Icon name="Mic" size={48} />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                {isRecording ? 'Идет запись...' : 'Нажмите, чтобы начать запись'}
              </p>
            </div>

            {voiceResponse && (
              <Card className="p-4">
                <p className="text-sm font-semibold mb-2">Ваш ответ:</p>
                <p className="text-muted-foreground">{voiceResponse}</p>
              </Card>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setVoiceDialog(false)}
              >
                Закрыть
              </Button>
              <Button
                onClick={handleNextVoiceStep}
                disabled={!voiceResponse}
              >
                {currentVoiceStep === mockVoiceSteps.length - 1 ? 'Завершить' : 'Следующий шаг'}
                <Icon name="ChevronRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Doctor Dialog */}
      <Dialog open={doctorDialog} onOpenChange={setDoctorDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Тренажер с врачом</DialogTitle>
            <DialogDescription>
              Симуляция реального диалога с врачом
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={doctorScenario === 'consultation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDoctorScenario('consultation')}
              >
                Консультация
              </Button>
              <Button
                variant={doctorScenario === 'treatment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDoctorScenario('treatment')}
              >
                План лечения
              </Button>
              <Button
                variant={doctorScenario === 'emergency' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDoctorScenario('emergency')}
              >
                Экстренный случай
              </Button>
            </div>

            <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-4">
              {doctorMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Начните диалог с врачом</p>
                </div>
              ) : (
                doctorMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`p-3 max-w-[70%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      <p className="text-sm">{message.content}</p>
                    </Card>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={doctorInput}
                onChange={(e) => setDoctorInput(e.target.value)}
                placeholder="Введите ваше сообщение..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendDoctorMessage()}
              />
              <Button onClick={handleSendDoctorMessage} disabled={!doctorInput.trim()}>
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Details Dialog */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedCourse.title}</DialogTitle>
              <DialogDescription>{selectedCourse.description}</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge>{selectedCourse.category}</Badge>
                <Badge variant="outline">{selectedCourse.duration}</Badge>
                <div className="flex-1 text-right">
                  <span className="text-sm text-muted-foreground">
                    Прогресс: {selectedCourse.progress}%
                  </span>
                </div>
              </div>

              <Progress value={selectedCourse.progress} />

              <div className="space-y-2">
                <h4 className="font-semibold">Уроки:</h4>
                {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                  selectedCourse.lessons.map((lesson) => (
                    <Card key={lesson.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${lesson.completed ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                            <Icon 
                              name={lesson.completed ? 'CheckCircle2' : lesson.type === 'video' ? 'Play' : lesson.type === 'quiz' ? 'ClipboardCheck' : 'FileText'} 
                              size={20}
                              className={lesson.completed ? 'text-green-600' : 'text-gray-400'}
                            />
                          </div>
                          <div>
                            <h5 className="font-medium">{lesson.title}</h5>
                            <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                          </div>
                        </div>
                        <Button size="sm" variant={lesson.completed ? 'outline' : 'default'}>
                          {lesson.completed ? 'Повторить' : 'Начать'}
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Уроки скоро появятся
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}