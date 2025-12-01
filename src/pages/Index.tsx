import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface Lesson {
  id: number;
  title: string;
  content: string;
  completed: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface VoiceScenario {
  id: number;
  clientMessage: string;
  tips: string[];
}

interface DoctorCase {
  id: number;
  patientDescription: string;
  situation: string;
  questions: string[];
  correctActions: string[];
}

export default function Index() {
  const navigate = useNavigate();
  const currentUser = authService.getUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

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
  },
  {
    id: 4,
    title: 'Работа с записью',
    description: 'Эффективное ведение расписания и коммуникация с врачами',
    progress: 30,
    category: 'Администрирование',
    duration: '2 часа',
    status: 'in-progress'
  },
  {
    id: 5,
    title: 'Курс для врачей: Коммуникация',
    description: 'Построение доверительных отношений с пациентами',
    progress: 0,
    category: 'Для врачей',
    duration: '3 часа',
    status: 'not-started'
  },
  {
    id: 6,
    title: 'Курс для врачей: Сложные случаи',
    description: 'Работа со страхом и тревогой пациентов',
    progress: 0,
    category: 'Для врачей',
    duration: '4 часа',
    status: 'not-started'
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
    title: 'Диалоги с пациентами',
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
    title: 'Тренажёр для врачей',
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

const courseLessons: Record<number, Lesson[]> = {
  1: [
    { id: 1, title: 'Первый контакт с пациентом', content: 'Как создать позитивное первое впечатление и выявить потребности пациента', completed: true },
    { id: 2, title: 'Презентация услуг', content: 'Техники представления стоматологических услуг и планов лечения', completed: true },
    { id: 3, title: 'Работа с ценой', content: 'Как правильно объяснить стоимость лечения и работать с возражениями', completed: true },
    { id: 4, title: 'Запись на лечение', content: 'Эффективное завершение консультации и запись на процедуры', completed: false },
    { id: 5, title: 'Допродажи', content: 'Как предлагать дополнительные услуги и программы', completed: false }
  ],
  2: [
    { id: 1, title: 'Психология пациента', content: 'Понимание страхов и опасений пациентов перед стоматологом', completed: true },
    { id: 2, title: 'Конфликтные ситуации', content: 'Работа с недовольными пациентами и жалобами', completed: true },
    { id: 3, title: 'Стандарты сервиса', content: 'Как создать premium-опыт для пациента', completed: true }
  ],
  3: [
    { id: 1, title: 'Подготовка плана', content: 'Как составить понятный план лечения для пациента', completed: false },
    { id: 2, title: 'Язык презентации', content: 'Как объяснять сложные процедуры простым языком', completed: false },
    { id: 3, title: 'Визуализация', content: 'Использование фото и видео для презентации результатов', completed: false }
  ],
  4: [
    { id: 1, title: 'Система записи', content: 'Эффективное управление расписанием врачей', completed: true },
    { id: 2, title: 'Взаимодействие с врачами', content: 'Коммуникация между администратором и медперсоналом', completed: false },
    { id: 3, title: 'Напоминания', content: 'Работа с напоминаниями о приёмах и продлением лечения', completed: false }
  ],
  5: [
    { id: 1, title: 'Первичный контакт', content: 'Как установить доверительные отношения с пациентом с первой минуты', completed: false },
    { id: 2, title: 'Эмпатия', content: 'Понимание чувств пациента и работа с тревожностью', completed: false },
    { id: 3, title: 'Донесение информации', content: 'Объяснение диагноза и плана лечения простым языком', completed: false }
  ],
  6: [
    { id: 1, title: 'Страх перед лечением', content: 'Техники работы с фобиями и дентофобией', completed: false },
    { id: 2, title: 'Тревожные пациенты', content: 'Как успокоить и поддержать пациента во время процедуры', completed: false },
    { id: 3, title: 'Работа с болью', content: 'Управление болевыми ощущениями и комфорт пациента', completed: false },
    { id: 4, title: 'Послеоперационный период', content: 'Поддержка пациента после сложных процедур', completed: false }
  ]
};

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Какой первый шаг при общении с пациентом?',
    options: ['Сразу назвать цены', 'Выявить потребности и страхи', 'Показать клинику', 'Отправить к врачу'],
    correct: 1
  },
  {
    id: 2,
    question: 'Как работать с возражением "Дорого"?',
    options: ['Сразу дать скидку', 'Показать ценность и результат', 'Сказать, что у всех такие цены', 'Согласиться с клиентом'],
    correct: 1
  },
  {
    id: 3,
    question: 'Что важно при презентации плана лечения?',
    options: ['Использовать медицинские термины', 'Показать визуальные примеры', 'Говорить быстро', 'Проговорить только о цене'],
    correct: 1
  },
  {
    id: 4,
    question: 'Как работать с страхом пациента?',
    options: ['Игнорировать его', 'Проявить эмпатию и успокоить', 'Сказать, что это глупости', 'Поторопить с решением'],
    correct: 1
  },
  {
    id: 5,
    question: 'Когда предлагать дополнительные услуги?',
    options: ['Сразу при звонке', 'После основного лечения', 'Никогда', 'Перед первым приёмом'],
    correct: 1
  }
];

const voiceScenarios: VoiceScenario[] = [
  {
    id: 1,
    clientMessage: 'У вас слишком дорогое лечение. В другой клинике дешевле.',
    tips: ['Не спорьте о цене, а покажите ценность', 'Узнайте, что именно сравнивает пациент', 'Расскажите о качестве материалов и опыте врачей']
  },
  {
    id: 2,
    clientMessage: 'Я очень боюсь стоматологов. Мне нужно подумать.',
    tips: ['Проявите эмпатию и понимание', 'Расскажите о методах анестезии', 'Предложите познакомиться с врачом']
  },
  {
    id: 3,
    clientMessage: 'Мне сказали, что это будет больно. Я не готов к этому.',
    tips: ['Успокойте и объясните реальность', 'Расскажите о современных технологиях', 'Предложите посмотреть отзывы']
  },
  {
    id: 4,
    clientMessage: 'Можно сделать дешевле? Может, какие-то другие материалы?',
    tips: ['Объясните разницу в качестве', 'Покажите долгосрочную выгоду', 'Предложите рассрочку']
  }
];

const doctorCases: DoctorCase[] = [
  {
    id: 1,
    patientDescription: 'Пациентка Марина, 35 лет, пришла на первичный осмотр',
    situation: 'Пациентка очень нервничает, руки дрожат, говорит, что последний раз была у стоматолога 5 лет назад из-за негативного опыта.',
    questions: [
      'Как вы начнёте разговор?',
      'Какие действия предпримете для успокоения?',
      'Как объясните процесс осмотра?'
    ],
    correctActions: [
      'Установить зрительный контакт и улыбнуться',
      'Спросить о прошлом опыте и проявить эмпатию',
      'Объяснить, что сегодня только осмотр, без болезненных процедур',
      'Показать инструменты и объяснить их назначение',
      'Предложить сигнал рукой, если нужна пауза'
    ]
  },
  {
    id: 2,
    patientDescription: 'Пациент Алексей, 42 года, нужно удаление зуба',
    situation: 'Пациент насторожен, спрашивает про боль, сколько будет заживать, можно ли обойтись без удаления.',
    questions: [
      'Как объясните необходимость удаления?',
      'Как расскажете о процессе анестезии?',
      'Что скажете про реабилитацию?'
    ],
    correctActions: [
      'Показать рентген и объяснить проблему',
      'Объяснить последствия отказа от удаления',
      'Рассказать о современной анестезии',
      'Дать чёткие рекомендации по уходу',
      'Предложить консультацию по имплантации'
    ]
  },
  {
    id: 3,
    patientDescription: 'Ребёнок Саша, 8 лет, с мамой, первый визит',
    situation: 'Ребёнок напуган, прячется за маму, не хочет садиться в кресло. У ребёнка кариес.',
    questions: [
      'Как наладить контакт с ребёнком?',
      'Как объяснить процедуру ребёнку?',
      'Как вовлечь родителя?'
    ],
    correctActions: [
      'Опуститься до уровня глаз ребёнка',
      'Использовать игровую форму общения',
      'Показать инструменты как "игрушки"',
      'Похвалить за смелость',
      'Объяснить родителю важность спокойствия'
    ]
  }
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [voiceResponse, setVoiceResponse] = useState('');
  const [voiceStep, setVoiceStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [doctorCaseStep, setDoctorCaseStep] = useState(0);
  const [doctorAnswers, setDoctorAnswers] = useState<string[]>([]);

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
                <Button className="w-full mt-3" size="sm" onClick={() => setSelectedCourse(course)}>Продолжить</Button>
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
              
              <Button 
                className="w-full" 
                variant={course.status === 'not-started' ? 'outline' : 'default'}
                onClick={() => setSelectedCourse(course)}
              >
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

            <Button className="w-full" onClick={() => setSelectedTrainer(trainer)}>
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
          <Button size="lg" className="px-8 flex-shrink-0" onClick={() => setSelectedTrainer(mockTrainers[0])}>
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
            <h1 className="text-2xl font-bold mb-1">Анна Смирнова</h1>
            <p className="text-muted-foreground mb-4">Администратор · Стоматология "Смайл"</p>
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
            { title: 'Продажи стоматологических услуг', date: '15 ноя 2025', id: 'CERT-2025-001' },
            { title: 'Работа с пациентами', date: '22 ноя 2025', id: 'CERT-2025-002' }
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
            { action: 'Завершён курс "Работа с пациентами"', time: '2 часа назад', icon: 'BookCheck' },
            { action: 'Получено достижение "Неделя учёбы"', time: '1 день назад', icon: 'Award' },
            { action: 'Пройден тренажёр "Диалоги с пациентами"', time: '2 дня назад', icon: 'Mic' },
            { action: 'Начат курс "Работа с записью"', time: '3 дня назад', icon: 'Calendar' }
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

  const handleCompleteLesson = () => {
    const lessons = selectedCourse ? courseLessons[selectedCourse.id] : [];
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else {
      setSelectedCourse(null);
      setCurrentLesson(0);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const handleNextVoiceStep = () => {
    if (voiceStep < voiceScenarios.length - 1) {
      setVoiceStep(voiceStep + 1);
      setVoiceResponse('');
    } else {
      setSelectedTrainer(null);
      setVoiceStep(0);
      setVoiceResponse('');
    }
  };

  const correctAnswers = Object.entries(quizAnswers).filter(
    ([qId, answer]) => quizQuestions[parseInt(qId)].correct === answer
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold">
                🦷
              </div>
              <div>
                <h1 className="text-xl font-bold">СтомаПро</h1>
                <p className="text-xs text-muted-foreground">Обучение для стоматологии</p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {currentUser?.full_name.split(' ').map(n => n[0]).join('').substring(0, 2) || '👤'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{currentUser?.full_name || 'Пользователь'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{currentUser?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs mt-1">
                        {currentUser?.role_name}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveSection('profile')}>
                    <Icon name="User" size={16} className="mr-2" />
                    Профиль
                  </DropdownMenuItem>
                  {authService.hasAnyPermission(['users.view', 'roles.view']) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin/users')}>
                        <Icon name="Users" size={16} className="mr-2" />
                        Управление пользователями
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/roles')}>
                        <Icon name="ShieldCheck" size={16} className="mr-2" />
                        Управление ролями
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выход
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

      <Dialog open={!!selectedCourse} onOpenChange={() => { setSelectedCourse(null); setCurrentLesson(0); }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCourse.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {courseLessons[selectedCourse.id]?.map((lesson, index) => (
                    <Button
                      key={lesson.id}
                      variant={currentLesson === index ? 'default' : lesson.completed ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentLesson(index)}
                      className="flex-shrink-0"
                    >
                      {lesson.completed && <Icon name="Check" size={14} className="mr-1" />}
                      Урок {lesson.id}
                    </Button>
                  ))}
                </div>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {courseLessons[selectedCourse.id]?.[currentLesson]?.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {courseLessons[selectedCourse.id]?.[currentLesson]?.content}
                  </p>
                  
                  <div className="bg-primary/5 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="Lightbulb" size={18} className="text-primary" />
                      Ключевые моменты:
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Применяйте изученные техники на практике</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Записывайте важные инсайты для дальнейшего использования</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Попробуйте закрепить знания на тренажёрах</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      disabled={currentLesson === 0}
                      onClick={() => setCurrentLesson(currentLesson - 1)}
                    >
                      <Icon name="ChevronLeft" size={18} className="mr-2" />
                      Назад
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleCompleteLesson}
                    >
                      {currentLesson < (courseLessons[selectedCourse.id]?.length || 0) - 1 ? 'Следующий урок' : 'Завершить курс'}
                      <Icon name="ChevronRight" size={18} className="ml-2" />
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTrainer} onOpenChange={() => { 
        setSelectedTrainer(null); 
        setQuizAnswers({}); 
        setVoiceResponse(''); 
        setVoiceStep(0); 
        setShowResults(false);
        setDoctorCaseStep(0);
        setDoctorAnswers([]); 
      }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedTrainer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    selectedTrainer.type === 'voice' ? 'bg-primary/10 text-primary' :
                    selectedTrainer.type === 'quiz' ? 'bg-accent/10 text-accent' :
                    'bg-success/10 text-success'
                  }`}>
                    <Icon name={selectedTrainer.type === 'voice' ? 'Mic' : selectedTrainer.type === 'quiz' ? 'ClipboardList' : 'Lightbulb'} size={24} />
                  </div>
                  {selectedTrainer.title}
                </DialogTitle>
              </DialogHeader>

              {selectedTrainer.type === 'quiz' && (
                <div className="space-y-6">
                  {!showResults ? (
                    <>
                      {quizQuestions.map((q, index) => (
                        <Card key={q.id} className="p-6">
                          <h3 className="font-semibold mb-4">
                            Вопрос {index + 1}: {q.question}
                          </h3>
                          <RadioGroup
                            value={quizAnswers[index]?.toString()}
                            onValueChange={(value) => setQuizAnswers({ ...quizAnswers, [index]: parseInt(value) })}
                          >
                            {q.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                                <RadioGroupItem value={optIndex.toString()} id={`q${index}-opt${optIndex}`} />
                                <Label htmlFor={`q${index}-opt${optIndex}`} className="flex-1 cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </Card>
                      ))}
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                      >
                        Завершить тест
                      </Button>
                    </>
                  ) : (
                    <Card className="p-8 text-center">
                      <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        correctAnswers >= 4 ? 'bg-success/10 text-success' : 
                        correctAnswers >= 3 ? 'bg-accent/10 text-accent' : 
                        'bg-destructive/10 text-destructive'
                      }`}>
                        <span className="text-4xl font-bold">{correctAnswers}/{quizQuestions.length}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">
                        {correctAnswers >= 4 ? 'Отлично! 🎉' : correctAnswers >= 3 ? 'Хорошо! 👍' : 'Можно лучше 💪'}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {correctAnswers >= 4 
                          ? 'Вы отлично усвоили материал!' 
                          : correctAnswers >= 3 
                          ? 'Неплохой результат, но есть куда расти'
                          : 'Рекомендуем повторить материал курса'}
                      </p>
                      <Button onClick={() => { setShowResults(false); setQuizAnswers({}); }}>
                        Пройти ещё раз
                      </Button>
                    </Card>
                  )}
                </div>
              )}

              {selectedTrainer.type === 'voice' && (
                <div className="space-y-6">
                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>👤</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold mb-1">Клиент говорит:</p>
                        <p className="text-lg">{voiceScenarios[voiceStep]?.clientMessage}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Icon name="Lightbulb" size={18} className="text-primary" />
                      Подсказки:
                    </h3>
                    <ul className="space-y-2 mb-4">
                      {voiceScenarios[voiceStep]?.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <Label className="mb-2 block">Ваш ответ:</Label>
                    <Textarea
                      value={voiceResponse}
                      onChange={(e) => setVoiceResponse(e.target.value)}
                      placeholder="Напишите, как бы вы ответили клиенту..."
                      className="min-h-32 mb-4"
                    />
                    <Button 
                      className="w-full" 
                      onClick={handleNextVoiceStep}
                      disabled={!voiceResponse.trim()}
                    >
                      {voiceStep < voiceScenarios.length - 1 ? 'Следующий сценарий' : 'Завершить тренажёр'}
                    </Button>
                  </Card>
                </div>
              )}

              {selectedTrainer.type === 'practice' && (
                <div className="space-y-6">
                  {doctorCaseStep < doctorCases.length ? (
                    <>
                      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon name="Stethoscope" size={24} className="text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Случай {doctorCaseStep + 1}</h3>
                            <p className="text-sm text-muted-foreground">{doctorCases[doctorCaseStep].patientDescription}</p>
                          </div>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Icon name="AlertCircle" size={18} className="text-warning" />
                            Ситуация:
                          </h4>
                          <p className="text-muted-foreground">{doctorCases[doctorCaseStep].situation}</p>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Icon name="MessageSquare" size={18} className="text-primary" />
                          Вопросы для анализа:
                        </h4>
                        <div className="space-y-4 mb-6">
                          {doctorCases[doctorCaseStep].questions.map((question, i) => (
                            <div key={i} className="space-y-2">
                              <Label className="text-sm font-medium">{i + 1}. {question}</Label>
                              <Textarea
                                value={doctorAnswers[i] || ''}
                                onChange={(e) => {
                                  const newAnswers = [...doctorAnswers];
                                  newAnswers[i] = e.target.value;
                                  setDoctorAnswers(newAnswers);
                                }}
                                placeholder="Ваш ответ..."
                                className="min-h-20"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg mb-6">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Icon name="CheckCircle2" size={18} className="text-success" />
                            Правильные действия:
                          </h4>
                          <ul className="space-y-2">
                            {doctorCases[doctorCaseStep].correctActions.map((action, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-success mt-0.5">✓</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={doctorCaseStep === 0}
                            onClick={() => {
                              setDoctorCaseStep(doctorCaseStep - 1);
                              setDoctorAnswers([]);
                            }}
                          >
                            <Icon name="ChevronLeft" size={18} className="mr-2" />
                            Предыдущий случай
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => {
                              if (doctorCaseStep < doctorCases.length - 1) {
                                setDoctorCaseStep(doctorCaseStep + 1);
                                setDoctorAnswers([]);
                              } else {
                                setDoctorCaseStep(0);
                                setDoctorAnswers([]);
                                setSelectedTrainer(null);
                              }
                            }}
                            disabled={doctorAnswers.filter(a => a.trim()).length < doctorCases[doctorCaseStep].questions.length}
                          >
                            {doctorCaseStep < doctorCases.length - 1 ? 'Следующий случай' : 'Завершить тренажёр'}
                            <Icon name="ChevronRight" size={18} className="ml-2" />
                          </Button>
                        </div>
                      </Card>
                    </>
                  ) : null}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

}