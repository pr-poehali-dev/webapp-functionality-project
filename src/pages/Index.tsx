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
import LearningStats from '@/components/dashboard/LearningStats';
import VoiceRecorder from '@/lib/voiceRecorder';
import SpeechAnalyzer, { SpeechAnalysisResult } from '@/lib/speechAnalyzer';
import PatientAI, { ConversationAnalysis } from '@/lib/patientAI';
import { useToast } from '@/hooks/use-toast';
import AdminSimulatorDialog from '@/components/simulator/AdminSimulatorDialog';

export default function Index() {
  const navigate = useNavigate();
  const currentUser = authService.getUser();
  
  // Main state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourseCategory, setSelectedCourseCategory] = useState<string | null>(null);
  
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
  const [voiceStream, setVoiceStream] = useState<MediaStream | null>(null);
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const speechAnalyzerRef = useRef<SpeechAnalyzer>(new SpeechAnalyzer());
  const { toast } = useToast();
  const [doctorScenario, setDoctorScenario] = useState<'consultation' | 'treatment' | 'emergency' | 'objections'>('consultation');
  const [doctorMessages, setDoctorMessages] = useState<Array<{ role: 'admin' | 'patient', content: string }>>([]);
  const [doctorInput, setDoctorInput] = useState('');
  const [conversationAnalysis, setConversationAnalysis] = useState<ConversationAnalysis | null>(null);
  const [isDoctorRecording, setIsDoctorRecording] = useState(false);
  const [doctorRecordingStartTime, setDoctorRecordingStartTime] = useState<number>(0);
  const [doctorVoiceStream, setDoctorVoiceStream] = useState<MediaStream | null>(null);
  const patientAIRef = useRef<PatientAI | null>(null);
  const doctorVoiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const [learningStatsKey, setLearningStatsKey] = useState(0);
  const [simulatorDialog, setSimulatorDialog] = useState(false);
  
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setVoiceStream(stream);
      
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
      
      if (voiceStream) {
        voiceStream.getTracks().forEach(track => track.stop());
        setVoiceStream(null);
      }

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
      setLearningStatsKey(prev => prev + 1);
    }
  };

  const handleRestartConversation = () => {
    setDoctorMessages([]);
    setConversationAnalysis(null);
    patientAIRef.current = null;
    setLearningStatsKey(prev => prev + 1);
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setDoctorVoiceStream(stream);
      
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
      
      if (doctorVoiceStream) {
        doctorVoiceStream.getTracks().forEach(track => track.stop());
        setDoctorVoiceStream(null);
      }

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

      {/* Learning AI Statistics */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Обучение ИИ пациента</h3>
        <LearningStats 
          key={learningStatsKey}
          stats={patientAIRef.current?.getLearningStatistics() || {
            totalObjections: 0,
            totalSuccessful: 0,
            totalUnsuccessful: 0,
            mostLearnedObjection: '',
            maxLearningCount: 0
          }} 
        />
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

  const renderCourses = () => {
    const courseCategories = [
      { id: 'onboarding', title: 'Адаптация новых сотрудников', icon: 'UserPlus', color: 'orange', description: 'Базовые знания для новичков' },
      { id: 'doctors', title: 'Курсы для врачей', icon: 'Stethoscope', color: 'purple', description: 'Клиническая практика и технологии' },
      { id: 'sales', title: 'Курсы по продажам', icon: 'TrendingUp', color: 'green', description: 'Техники продаж и увеличение чека' },
      { id: 'admins', title: 'Курсы для администраторов', icon: 'Users', color: 'blue', description: 'Сервис и работа с пациентами' }
    ];

    // Если выбрана категория, показываем курсы внутри неё
    if (selectedCourseCategory) {
      const category = courseCategories.find(c => c.id === selectedCourseCategory);
      const typeCourses = selectedCourseCategory === 'onboarding' 
        ? [] 
        : mockCourses.filter(c => c.type === selectedCourseCategory);
      
      return (
        <div>
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => setSelectedCourseCategory(null)}
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад к категориям
          </Button>
          
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-12 h-12 bg-${category?.color}-500/10 rounded-lg flex items-center justify-center`}>
                <Icon name={category?.icon as any} size={24} className={`text-${category?.color}-600`} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{category?.title}</h2>
                <p className="text-muted-foreground">{category?.description}</p>
              </div>
            </div>
          </div>

          {selectedCourseCategory === 'onboarding' ? (
            <Card className="p-8 text-center">
              <Icon name="Construction" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Курсы находятся в разработке</h3>
              <p className="text-muted-foreground">Скоро здесь появятся курсы для адаптации новых сотрудников</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {typeCourses.map((course) => {
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
          )}
        </div>
      );
    }

    // Показываем категории курсов
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">Мои курсы</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courseCategories.map((category) => {
            const coursesCount = category.id === 'onboarding' 
              ? 0 
              : mockCourses.filter(c => c.type === category.id).length;
            
            return (
              <Card 
                key={category.id} 
                className="p-8 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedCourseCategory(category.id)}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 bg-${category.color}-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon name={category.icon as any} size={32} className={`text-${category.color}-600`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="BookOpen" size={16} />
                        <span>{coursesCount} {category.id === 'onboarding' ? 'скоро' : 'курсов'}</span>
                      </div>
                      
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

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

        {/* Admin Simulator */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5" onClick={() => setSimulatorDialog(true)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon name="Users" size={32} className="text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">Симулятор администратора</h3>
              <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                <Icon name="Sparkles" size={12} className="mr-1" />
                НОВОЕ
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Игра с реалистичными диалогами и оценкой 5 навыков
            </p>
            <Badge className="bg-purple-500/10 text-purple-600">7 сценариев</Badge>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <h2 className="text-3xl font-bold mb-8">Аналитика обучения</h2>
      
      {/* Section 1: Overview Stats */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 text-muted-foreground uppercase tracking-wide text-sm">
          Общая статистика
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Серия дней</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Вы учитесь 12 дней подряд! 🔥
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Icon name="Target" size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Выполнение цели</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Осталось 3 урока до недельной цели
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Icon name="Brain" size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Рейтинг навыков</p>
                <p className="text-2xl font-bold">4.3</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              AI оценка ваших компетенций
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Место в рейтинге</p>
                <p className="text-2xl font-bold">#4</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Вы обогнали 3 коллег за неделю
            </p>
          </Card>
        </div>

        {/* Recommended Courses */}
        <div className="mt-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="BookMarked" size={18} />
            Рекомендуемые курсы
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('courses')}>
              <div className="flex items-start justify-between mb-3">
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Icon name="Sparkles" size={12} className="mr-1" />
                  AI рекомендация
                </Badge>
                <Badge variant="outline">Продажи</Badge>
              </div>
              <h5 className="font-semibold mb-2">Презентация лечения</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Продвинутые техники представления плана лечения пациенту
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Clock" size={14} />
                <span>5 часов</span>
                <span>•</span>
                <Icon name="Star" size={14} className="text-yellow-500" />
                <span>Продвинутый</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('courses')}>
              <div className="flex items-start justify-between mb-3">
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Icon name="Sparkles" size={12} className="mr-1" />
                  AI рекомендация
                </Badge>
                <Badge variant="outline">Техническое</Badge>
              </div>
              <h5 className="font-semibold mb-2">Работа с CRM системой</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Эффективное использование CRM для управления пациентами
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Clock" size={14} />
                <span>3 часа</span>
                <span>•</span>
                <Icon name="Circle" size={14} className="text-green-500" />
                <span>Базовый</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('trainers')}>
              <div className="flex items-start justify-between mb-3">
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Icon name="Sparkles" size={12} className="mr-1" />
                  AI рекомендация
                </Badge>
                <Badge variant="outline">Коммуникация</Badge>
              </div>
              <h5 className="font-semibold mb-2">Работа с возражениями</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Практические сценарии преодоления возражений пациентов
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Clock" size={14} />
                <span>2 часа</span>
                <span>•</span>
                <Icon name="Mic" size={14} className="text-green-600" />
                <span>Тренажер</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Section 2: Progress & Forecast */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 text-muted-foreground uppercase tracking-wide text-sm">
          Прогресс и прогноз
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Level Progress Forecast */}
          <Card className="p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="Rocket" size={18} />
              Прогноз достижения уровня 8
            </h4>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  7
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">Текущий</p>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">2150 / 2500 баллов</span>
                  <span className="text-sm font-bold">86%</span>
                </div>
                <Progress value={86} className="h-3 mb-3" />
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Осталось</p>
                    <p className="text-sm font-bold">350 б</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Прогноз</p>
                    <p className="text-sm font-bold">~3 дня</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Темп</p>
                    <p className="text-sm font-bold">120 б/д</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Icon name="Lightbulb" size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Завершите 2 курса и 1 тренажер для +400 баллов и быстрого достижения уровня 8
              </p>
            </div>
          </Card>

          {/* Learning Progress */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Icon name="BookOpen" size={18} />
              Прогресс обучения
            </h4>
            <div className="space-y-4 mb-4">
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

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Часов обучения</span>
                <span className="font-bold">24.5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Завершено уроков</span>
                <span className="font-bold">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Средний балл тестов</span>
                <span className="font-bold">87%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="LineChart" size={18} />
            График прогресса по неделям
          </h4>
          <div className="space-y-4">
            {[
              { week: 'Неделя 1', points: 350, courses: 1, tests: 2, hours: 4.5 },
              { week: 'Неделя 2', points: 520, courses: 2, tests: 3, hours: 6.2 },
              { week: 'Неделя 3', points: 680, courses: 1, tests: 4, hours: 7.8 },
              { week: 'Неделя 4', points: 800, courses: 3, tests: 5, hours: 8.5 },
            ].map((weekData, index) => {
              const maxPoints = 800;
              const percentage = (weekData.points / maxPoints) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium min-w-[90px]">{weekData.week}</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Trophy" size={14} className="text-yellow-600" />
                          {weekData.points}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <Icon name="BookOpen" size={14} className="text-blue-600" />
                          {weekData.courses}
                        </span>
                        <span className="hidden md:flex items-center gap-1">
                          <Icon name="Clock" size={14} className="text-purple-600" />
                          {weekData.hours} ч
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-6 bg-secondary rounded-lg overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icon name="TrendingUp" size={16} className="text-green-600" />
              <span className="font-medium">+128 б/неделю</span>
            </div>
            <Badge variant="outline" className="text-green-600">
              <Icon name="ArrowUp" size={12} className="mr-1" />
              +35% за месяц
            </Badge>
          </div>
        </Card>
      </div>

      {/* Section 3: Trainer Performance */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 text-muted-foreground uppercase tracking-wide text-sm">
          Статистика по тренажерам
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quiz Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Icon name="ClipboardCheck" size={24} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Тестовый тренажер</h4>
                <p className="text-xs text-muted-foreground">Проверка знаний</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Пройдено тестов</span>
                <span className="text-lg font-bold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Средний балл</span>
                <span className="text-lg font-bold text-blue-600">87%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Лучший результат</span>
                <span className="text-lg font-bold text-green-600">95%</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Вы в топ 15% по результатам тестов
              </p>
            </div>
          </Card>

          {/* Voice Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Icon name="Mic" size={24} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Голосовой тренажер</h4>
                <p className="text-xs text-muted-foreground">Практика общения</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Сценариев пройдено</span>
                <span className="text-lg font-bold">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Успешность</span>
                <span className="text-lg font-bold text-green-600">82%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Время практики</span>
                <span className="text-lg font-bold">3.5 ч</span>
              </div>
              <Progress value={82} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Улучшение на +12% за последний месяц
              </p>
            </div>
          </Card>

          {/* Doctor AI Stats */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Icon name="Stethoscope" size={24} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold">Тренажер с врачом</h4>
                <p className="text-xs text-muted-foreground">AI симуляции</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Диалогов завершено</span>
                <span className="text-lg font-bold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Возражений обработано</span>
                <span className="text-lg font-bold text-purple-600">28</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Успешно закрыто</span>
                <span className="text-lg font-bold text-green-600">23</span>
              </div>
              <Progress value={82} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                AI оценивает вашу речь на 4.2/5
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 4: Activity Timeline */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 text-muted-foreground uppercase tracking-wide text-sm">
          История активности
        </h3>
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Icon name="History" size={18} />
            Последняя активность
          </h4>
          <div className="space-y-4">
            {[
              {
                date: 'Сегодня, 14:30',
                type: 'course',
                title: 'Завершен урок "Техники активных продаж"',
                points: '+50',
                icon: 'BookOpen',
                color: 'blue',
              },
              {
                date: 'Сегодня, 12:15',
                type: 'quiz',
                title: 'Пройден тест по работе с пациентами',
                points: '+80',
                score: '95%',
                icon: 'ClipboardCheck',
                color: 'green',
              },
              {
                date: 'Вчера, 18:45',
                type: 'trainer',
                title: 'Завершен голосовой тренажер "Консультация"',
                points: '+100',
                icon: 'Mic',
                color: 'purple',
              },
              {
                date: 'Вчера, 16:20',
                type: 'achievement',
                title: 'Получено достижение "Знаток продаж"',
                points: '+150',
                icon: 'Award',
                color: 'yellow',
              },
              {
                date: '2 дня назад',
                type: 'course',
                title: 'Завершен курс "Работа с пациентами"',
                points: '+200',
                icon: 'BookOpen',
                color: 'blue',
              },
              {
                date: '3 дня назад',
                type: 'trainer',
                title: 'Практика с AI врачом: сценарий "Возражения"',
                points: '+120',
                success: '82%',
                icon: 'Stethoscope',
                color: 'pink',
              },
            ].map((activity, index) => {
              const colorClasses = {
                blue: 'bg-blue-500/10 text-blue-600',
                green: 'bg-green-500/10 text-green-600',
                purple: 'bg-purple-500/10 text-purple-600',
                yellow: 'bg-yellow-500/10 text-yellow-600',
                pink: 'bg-pink-500/10 text-pink-600',
              };

              return (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
                    <Icon name={activity.icon as any} size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1">{activity.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={12} />
                        {activity.date}
                      </span>
                      {activity.score && (
                        <span className="flex items-center gap-1 text-green-600">
                          <Icon name="CheckCircle2" size={12} />
                          Результат: {activity.score}
                        </span>
                      )}
                      {activity.success && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Icon name="Target" size={12} />
                          Успешность: {activity.success}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-green-600 font-semibold flex-shrink-0">
                    {activity.points}
                  </Badge>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <Button variant="outline" className="w-full sm:w-auto">
              <Icon name="ChevronDown" size={16} className="mr-2" />
              Показать больше
            </Button>
          </div>
        </Card>
      </div>

      {/* Section 5: AI Recommendations */}
      <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 text-muted-foreground uppercase tracking-wide text-sm">
          AI рекомендации
        </h3>
        
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="Sparkles" size={24} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-3">Персональные рекомендации</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Icon name="TrendingUp" size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Высокие результаты в продажах (92%)</p>
                    <p className="text-sm text-muted-foreground">Вы отлично справляетесь с техниками продаж. Рекомендуем перейти к продвинутым курсам по презентации лечения.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="AlertCircle" size={18} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Есть потенциал для улучшения (78%)</p>
                    <p className="text-sm text-muted-foreground">Технические навыки можно усилить. Пройдите дополнительные тренажеры по работе с CRM и документацией.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Target" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Рекомендуем практику</p>
                    <p className="text-sm text-muted-foreground">Вы прошли 3 голосовых тренажера. Продолжайте практиковать сценарии работы с возражениями для закрепления навыков.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Таблица лидеров</h2>
          <p className="text-muted-foreground">Соревнуйтесь с коллегами и повышайте свой уровень</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Icon name="Users" size={18} className="mr-2" />
          {mockLeaderboard.length} участников
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {mockLeaderboard.slice(0, 3).map((entry, index) => (
          <Card 
            key={entry.id} 
            className={`p-6 text-center relative overflow-hidden ${
              index === 0 ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20' :
              index === 1 ? 'border-gray-400/50 bg-gradient-to-br from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20' :
              'border-amber-600/50 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20'
            }`}
          >
            <div className="absolute top-2 right-2 text-4xl opacity-20">
              {entry.rank === 1 && '🥇'}
              {entry.rank === 2 && '🥈'}
              {entry.rank === 3 && '🥉'}
            </div>
            
            <div className="relative">
              <Avatar className="w-20 h-20 mx-auto mb-3 border-4 border-background">
                <AvatarFallback className={`text-xl font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-700' :
                  index === 1 ? 'bg-gray-400/20 text-gray-700' :
                  'bg-amber-600/20 text-amber-700'
                }`}>
                  {entry.avatar}
                </AvatarFallback>
              </Avatar>
              
              <div className="mb-2">
                <h3 className="font-bold text-lg">{entry.name}</h3>
                <p className="text-sm text-muted-foreground">{entry.position}</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">
                  <Icon name="Award" size={12} className="mr-1" />
                  Уровень {entry.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {entry.coursesCompleted} курсов
                </Badge>
              </div>
              
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
                {entry.points}
              </div>
              <p className="text-xs text-muted-foreground">баллов</p>
              
              {entry.achievements.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Достижения</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {entry.achievements.map((achievement, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        ✨ {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="List" size={20} />
          Остальные участники
        </h3>
        <div className="space-y-3">
          {mockLeaderboard.slice(3).map((entry, index) => (
            <div 
              key={entry.id} 
              className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-md border ${
                index === 0 ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 'bg-card hover:bg-accent/50 border-border'
              }`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 font-bold text-muted-foreground">
                {entry.rank}
              </div>
              
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {entry.avatar}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{entry.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    Lv. {entry.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{entry.position}</p>
              </div>
              
              <div className="hidden sm:flex flex-col items-center gap-1 px-4">
                <div className="flex items-center gap-1 text-sm">
                  <Icon name="BookOpen" size={14} className="text-muted-foreground" />
                  <span className="font-medium">{entry.coursesCompleted}</span>
                </div>
                <span className="text-xs text-muted-foreground">курсов</span>
              </div>
              
              {entry.achievements.length > 0 && (
                <div className="hidden md:flex items-center gap-1">
                  {entry.achievements.slice(0, 2).map((achievement, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                  {entry.achievements.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{entry.achievements.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
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
        voiceStream={voiceStream}
        doctorScenario={doctorScenario}
        setDoctorScenario={setDoctorScenario}
        doctorMessages={doctorMessages}
        doctorInput={doctorInput}
        setDoctorInput={setDoctorInput}
        conversationAnalysis={conversationAnalysis}
        isDoctorRecording={isDoctorRecording}
        doctorVoiceStream={doctorVoiceStream}
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

      <AdminSimulatorDialog
        open={simulatorDialog}
        onClose={() => setSimulatorDialog(false)}
      />
    </div>
  );
}