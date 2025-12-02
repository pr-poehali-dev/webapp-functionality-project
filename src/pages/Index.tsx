import { useState, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Course } from '@/components/dashboard/types';
import { mockCourses, mockQuizQuestions, mockVoiceSteps, mockAchievements, mockLeaderboard } from '@/components/dashboard/mockData';
import TrainerDialogs from '@/components/dashboard/TrainerDialogs';
import CourseDialog from '@/components/dashboard/CourseDialog';
import VoiceRecorder from '@/lib/voiceRecorder';
import SpeechAnalyzer, { SpeechAnalysisResult } from '@/lib/speechAnalyzer';
import PatientAI, { ConversationAnalysis } from '@/lib/patientAI';
import { useToast } from '@/hooks/use-toast';

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
  const [voiceAnalysis, setVoiceAnalysis] = useState<SpeechAnalysisResult | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const speechAnalyzerRef = useRef<SpeechAnalyzer>(new SpeechAnalyzer());
  const { toast } = useToast();
  const [doctorScenario, setDoctorScenario] = useState<'consultation' | 'treatment' | 'emergency' | 'objections'>('consultation');
  const [doctorMessages, setDoctorMessages] = useState<Array<{ role: 'admin' | 'patient', content: string }>>([]);
  const [doctorInput, setDoctorInput] = useState('');
  const [conversationAnalysis, setConversationAnalysis] = useState<ConversationAnalysis | null>(null);
  const [isDoctorRecording, setIsDoctorRecording] = useState(false);
  const [doctorRecordingStartTime, setDoctorRecordingStartTime] = useState<number>(0);
  const patientAIRef = useRef<PatientAI | null>(null);
  const doctorVoiceRecorderRef = useRef<VoiceRecorder | null>(null);
  
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
      setVoiceDialog(false);
      setCurrentVoiceStep(0);
      setVoiceResponse('');
    }
  };

  const handleStartRecording = async () => {
    if (!voiceRecorderRef.current) {
      voiceRecorderRef.current = new VoiceRecorder({
        onTranscript: (text) => {
          setVoiceResponse(text);
        },
        onError: (error) => {
          console.warn('Voice recording error:', error);
        },
      });
    }

    if (!voiceRecorderRef.current.isSupported()) {
      toast({
        title: 'Запись не поддерживается',
        description: 'Ваш браузер не поддерживает запись аудио',
        variant: 'destructive',
      });
      return;
    }

    try {
      await voiceRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setVoiceResponse('');
      setVoiceAnalysis(null);
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      
      let description = 'Не удалось получить доступ к микрофону';
      if (error.name === 'NotAllowedError') {
        description = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.';
      } else if (error.name === 'NotFoundError') {
        description = 'Микрофон не найден. Подключите микрофон и попробуйте снова.';
      }
      
      toast({
        title: 'Ошибка доступа к микрофону',
        description,
        variant: 'destructive',
      });
    }
  };

  const handleStopRecording = () => {
    if (voiceRecorderRef.current && isRecording) {
      voiceRecorderRef.current.stopRecording();
      setIsRecording(false);

      const duration = (Date.now() - recordingStartTime) / 1000;
      const currentStep = mockVoiceSteps[currentVoiceStep];
      
      setTimeout(() => {
        const finalResponse = voiceResponse || 'Не удалось распознать речь. Попробуйте еще раз.';
        
        if (!voiceResponse) {
          setVoiceResponse(finalResponse);
          toast({
            title: 'Речь не распознана',
            description: 'Попробуйте говорить громче и четче',
            variant: 'destructive',
          });
        }
        
        if (finalResponse && speechAnalyzerRef.current) {
          const analysis = speechAnalyzerRef.current.analyzeTranscript(
            finalResponse,
            currentStep.expectedKeywords,
            duration
          );
          setVoiceAnalysis(analysis);
        }
      }, 500);
    }
  };

  const handleSendDoctorMessage = () => {
    if (!doctorInput.trim()) return;

    if (!patientAIRef.current) {
      patientAIRef.current = new PatientAI(doctorScenario);
      const initialResponse = patientAIRef.current.generateResponse('Здравствуйте');
      setDoctorMessages([{ role: 'patient', content: initialResponse.message }]);
    }

    setDoctorMessages(prev => [...prev, { role: 'admin', content: doctorInput }]);
    const userMessage = doctorInput;
    setDoctorInput('');
    
    setTimeout(() => {
      if (patientAIRef.current) {
        const response = patientAIRef.current.generateResponse(userMessage);
        setDoctorMessages(prev => [...prev, { role: 'patient', content: response.message }]);
      }
    }, 800);
  };

  const handleFinishConversation = () => {
    if (patientAIRef.current) {
      const analysis = patientAIRef.current.analyzeConversation();
      setConversationAnalysis(analysis);
    }
  };

  const handleRestartConversation = () => {
    setDoctorMessages([]);
    setConversationAnalysis(null);
    patientAIRef.current = null;
  };

  const handleChangeScenario = (newScenario: 'consultation' | 'treatment' | 'emergency' | 'objections') => {
    setDoctorScenario(newScenario);
    handleRestartConversation();
  };

  const handleStartDoctorRecording = async () => {
    if (!doctorVoiceRecorderRef.current) {
      doctorVoiceRecorderRef.current = new VoiceRecorder({
        onTranscript: (text) => {
          setDoctorInput(text);
        },
        onError: (error) => {
          console.warn('Doctor voice recording error:', error);
        },
      });
    }

    if (!doctorVoiceRecorderRef.current.isSupported()) {
      toast({
        title: 'Запись не поддерживается',
        description: 'Ваш браузер не поддерживает запись аудио',
        variant: 'destructive',
      });
      return;
    }

    try {
      await doctorVoiceRecorderRef.current.startRecording();
      setIsDoctorRecording(true);
      setDoctorRecordingStartTime(Date.now());
      setDoctorInput('');
    } catch (error: any) {
      console.error('Failed to start doctor recording:', error);
      
      let description = 'Не удалось получить доступ к микрофону';
      if (error.name === 'NotAllowedError') {
        description = 'Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.';
      } else if (error.name === 'NotFoundError') {
        description = 'Микрофон не найден. Подключите микрофон и попробуйте снова.';
      }
      
      toast({
        title: 'Ошибка доступа к микрофону',
        description,
        variant: 'destructive',
      });
    }
  };

  const handleStopDoctorRecording = () => {
    if (doctorVoiceRecorderRef.current && isDoctorRecording) {
      doctorVoiceRecorderRef.current.stopRecording();
      setIsDoctorRecording(false);

      setTimeout(() => {
        if (!doctorInput || doctorInput.trim().length === 0) {
          toast({
            title: 'Речь не распознана',
            description: 'Попробуйте говорить громче и четче',
            variant: 'destructive',
          });
        }
      }, 500);
    }
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', { profileName, profileEmail, profileBio });
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
                <p className="text-sm text-muted-foreground">баллов</p>
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
        <Card className="p-6 md:col-span-1">
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {currentUser?.full_name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold mb-2">{currentUser?.full_name || 'Администратор'}</h3>
            <p className="text-sm text-muted-foreground mb-4">{currentUser?.email || 'admin@clinic.com'}</p>
            <Badge>Администратор</Badge>
          </div>
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold mb-6">Редактировать профиль</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Полное имя</Label>
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
                placeholder="Введите ваш email"
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="GraduationCap" size={32} className="text-primary" />
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
                    <DropdownMenuItem onClick={() => navigate('/admin/learning-analytics')}>
                      <Icon name="BarChart3" size={16} className="mr-2" />
                      Аналитика обучения
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

      {/* Dialogs */}
      <TrainerDialogs
        quizDialog={quizDialog}
        setQuizDialog={setQuizDialog}
        voiceDialog={voiceDialog}
        setVoiceDialog={setVoiceDialog}
        doctorDialog={doctorDialog}
        setDoctorDialog={setDoctorDialog}
        currentQuizQuestion={currentQuizQuestion}
        quizAnswers={quizAnswers}
        quizScore={quizScore}
        currentVoiceStep={currentVoiceStep}
        voiceResponse={voiceResponse}
        isRecording={isRecording}
        voiceAnalysis={voiceAnalysis}
        doctorScenario={doctorScenario}
        setDoctorScenario={setDoctorScenario}
        doctorMessages={doctorMessages}
        doctorInput={doctorInput}
        setDoctorInput={setDoctorInput}
        conversationAnalysis={conversationAnalysis}
        isDoctorRecording={isDoctorRecording}
        handleQuizAnswer={handleQuizAnswer}
        handleNextQuizQuestion={handleNextQuizQuestion}
        handlePrevQuizQuestion={handlePrevQuizQuestion}
        handleRestartQuiz={handleRestartQuiz}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        handleNextVoiceStep={handleNextVoiceStep}
        handleSendDoctorMessage={handleSendDoctorMessage}
        handleFinishConversation={handleFinishConversation}
        handleRestartConversation={handleRestartConversation}
        handleChangeScenario={handleChangeScenario}
        handleStartDoctorRecording={handleStartDoctorRecording}
        handleStopDoctorRecording={handleStopDoctorRecording}
      />

      <CourseDialog
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onCompleteLesson={handleCompleteLesson}
      />
    </div>
  );
}