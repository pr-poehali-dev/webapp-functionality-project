import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { AdminSimulator, SIMULATOR_SCENARIOS, DialogueChoice } from '@/lib/adminSimulator';

interface AdminSimulatorDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSimulatorDialog({ open, onClose }: AdminSimulatorDialogProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [simulator, setSimulator] = useState<AdminSimulator | null>(null);
  const [currentChoices, setCurrentChoices] = useState<DialogueChoice[]>([]);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const dialogueEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (simulator) {
      setCurrentChoices(simulator.getCurrentChoices());
    }
  }, [simulator]);

  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simulator?.getState().dialogue]);

  const handleStartScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setSimulator(new AdminSimulator(scenarioId));
    setShowExplanation(null);
  };

  const handleChoice = (choiceId: number) => {
    if (!simulator) return;
    
    const choice = currentChoices.find(c => c.id === choiceId);
    if (!choice) return;

    simulator.makeChoice(choiceId);
    
    // Форсируем ре-рендер через изменение состояния
    setCurrentChoices([...simulator.getCurrentChoices()]);
    setSimulator({ ...simulator } as AdminSimulator);
    
    if (choice.explanation) {
      setShowExplanation(choice.explanation);
      setTimeout(() => setShowExplanation(null), 4000);
    }
  };

  const handleRestart = () => {
    setSelectedScenario(null);
    setSimulator(null);
    setCurrentChoices([]);
    setShowExplanation(null);
  };

  const handleClose = () => {
    handleRestart();
    onClose();
  };

  const state = simulator?.getState();
  const progress = simulator?.getProgress() || 0;

  const getParameterColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Превосходно!';
    if (score >= 75) return 'Отлично!';
    if (score >= 60) return 'Хорошо';
    if (score >= 40) return 'Удовлетворительно';
    return 'Нужно улучшить';
  };

  // Выбор сценария
  if (!selectedScenario || !simulator) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <Icon name="Users" size={28} className="text-purple-600" />
              Симулятор администратора
            </DialogTitle>
            <p className="text-muted-foreground mt-2">
              Практикуйте навыки общения с пациентами в реалистичных сценариях
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {SIMULATOR_SCENARIOS.map((scenario) => {
              const difficultyColors = {
                easy: 'bg-green-500/10 text-green-600 border-green-500/20',
                medium: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
                hard: 'bg-red-500/10 text-red-600 border-red-500/20'
              };

              const difficultyText = {
                easy: 'Легко',
                medium: 'Средне',
                hard: 'Сложно'
              };

              return (
                <Card
                  key={scenario.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleStartScenario(scenario.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge 
                      className={difficultyColors[scenario.difficulty]}
                      variant="outline"
                    >
                      {difficultyText[scenario.difficulty]}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {scenario.description}
                  </p>
                  
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="User" size={14} />
                      <span>{scenario.patientName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scenario.situation}
                    </p>
                  </div>
                  
                  <Button className="w-full mt-4 group-hover:scale-105 transition-transform">
                    Начать сценарий
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Игровой процесс
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl mb-1">{state?.scenario.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{state?.scenario.patientName}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleRestart}>
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Другой сценарий
            </Button>
          </div>
        </DialogHeader>

        {/* Прогресс */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Прогресс диалога</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Диалог */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {state?.dialogue.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.speaker === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.speaker === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon
                          name={message.speaker === 'admin' ? 'UserCircle' : 'User'}
                          size={16}
                        />
                        <span className="text-xs font-semibold">
                          {message.speaker === 'admin' ? 'Вы' : state.scenario.patientName}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={dialogueEndRef} />
              </div>
            </Card>

            {/* Объяснение */}
            {showExplanation && (
              <Card className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Icon name="Lightbulb" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Анализ вашего ответа:</p>
                    <p className="text-sm text-muted-foreground">{showExplanation}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Варианты ответа */}
            {!state?.isCompleted && currentChoices.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">Выберите ваш ответ:</p>
                {currentChoices.map((choice) => {
                  const typeColors = {
                    good: 'border-green-500/30 hover:border-green-500/50 hover:bg-green-50 dark:hover:bg-green-950/20',
                    neutral: 'border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950/20',
                    bad: 'border-red-500/30 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950/20'
                  };

                  return (
                    <Card
                      key={choice.id}
                      className={`p-4 cursor-pointer transition-all border-2 ${typeColors[choice.type]}`}
                      onClick={() => handleChoice(choice.id)}
                    >
                      <p className="text-sm">{choice.text}</p>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Результаты */}
            {state?.isCompleted && (
              <Card className="mt-4 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Trophy" size={40} className="text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">Сценарий завершён!</h3>
                  <p className={`text-4xl font-bold mb-4 ${getScoreColor(state.finalScore!)}`}>
                    {state.finalScore} / 100
                  </p>
                  <p className="text-lg text-muted-foreground mb-6">
                    {getScoreText(state.finalScore!)}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleRestart} variant="outline">
                      <Icon name="RotateCcw" size={16} className="mr-2" />
                      Другой сценарий
                    </Button>
                    <Button onClick={() => handleStartScenario(selectedScenario)}>
                      <Icon name="Play" size={16} className="mr-2" />
                      Повторить
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Параметры */}
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="BarChart3" size={18} />
                Ваши навыки
              </h4>
              
              <div className="space-y-4">
                {[
                  { key: 'empathy', label: 'Эмпатия', icon: 'Heart' },
                  { key: 'professionalism', label: 'Профессионализм', icon: 'Briefcase' },
                  { key: 'efficiency', label: 'Эффективность', icon: 'Zap' },
                  { key: 'salesSkill', label: 'Продажи', icon: 'TrendingUp' },
                  { key: 'conflictResolution', label: 'Разрешение конфликтов', icon: 'Shield' }
                ].map(({ key, label, icon }) => {
                  const value = state?.parameters[key as keyof typeof state.parameters] || 0;
                  const target = state?.scenario.targetParameters[key as keyof typeof state.scenario.targetParameters] || 100;
                  const percentage = Math.round((value / target) * 100);
                  
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon name={icon as any} size={14} className="text-muted-foreground" />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <span className={`text-sm font-bold ${getParameterColor(value, target)}`}>
                          {value}/{target}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Target" size={18} />
                Цели сценария
              </h4>
              <ul className="space-y-2 text-sm">
                {state?.scenario.correctBehaviors.slice(0, 4).map((behavior, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icon name="CheckCircle2" size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{behavior}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="AlertTriangle" size={18} className="text-orange-600" />
                Избегайте
              </h4>
              <ul className="space-y-2 text-sm">
                {state?.scenario.wrongBehaviors.slice(0, 3).map((behavior, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Icon name="XCircle" size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{behavior}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}