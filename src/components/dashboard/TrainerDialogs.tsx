import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { QuizQuestion, VoiceStep } from './types';
import { mockQuizQuestions, mockVoiceSteps } from './mockData';
import VoiceVisualizer from './VoiceVisualizer';
import { SpeechAnalysisResult } from '@/lib/speechAnalyzer';
import { ConversationAnalysis } from '@/lib/patientAI';

interface TrainerDialogsProps {
  quizDialog: boolean;
  setQuizDialog: (open: boolean) => void;
  voiceDialog: boolean;
  setVoiceDialog: (open: boolean) => void;
  doctorDialog: boolean;
  setDoctorDialog: (open: boolean) => void;
  currentQuizQuestion: number;
  quizAnswers: number[];
  quizScore: number | null;
  currentVoiceStep: number;
  voiceResponse: string;
  isRecording: boolean;
  voiceAnalysis: SpeechAnalysisResult | null;
  doctorScenario: string;
  setDoctorScenario: (scenario: string) => void;
  doctorMessages: Array<{ role: 'admin' | 'patient'; content: string }>;
  doctorInput: string;
  setDoctorInput: (input: string) => void;
  conversationAnalysis: ConversationAnalysis | null;
  isDoctorRecording: boolean;
  handleFinishConversation: () => void;
  handleRestartConversation: () => void;
  handleChangeScenario: (scenario: 'consultation' | 'treatment' | 'emergency' | 'objections') => void;
  handleStartDoctorRecording: () => void;
  handleStopDoctorRecording: () => void;
  handleQuizAnswer: (questionIndex: number, answerIndex: number) => void;
  handleNextQuizQuestion: () => void;
  handlePrevQuizQuestion: () => void;
  handleRestartQuiz: () => void;
  handleStartRecording: () => void;
  handleStopRecording: () => void;
  handleNextVoiceStep: () => void;
  handleSendDoctorMessage: () => void;
}

export default function TrainerDialogs({
  quizDialog,
  setQuizDialog,
  voiceDialog,
  setVoiceDialog,
  doctorDialog,
  setDoctorDialog,
  currentQuizQuestion,
  quizAnswers,
  quizScore,
  currentVoiceStep,
  voiceResponse,
  isRecording,
  voiceAnalysis,
  doctorScenario,
  setDoctorScenario,
  doctorMessages,
  doctorInput,
  setDoctorInput,
  conversationAnalysis,
  isDoctorRecording,
  handleQuizAnswer,
  handleNextQuizQuestion,
  handlePrevQuizQuestion,
  handleRestartQuiz,
  handleStartRecording,
  handleStopRecording,
  handleNextVoiceStep,
  handleSendDoctorMessage,
  handleFinishConversation,
  handleRestartConversation,
  handleChangeScenario,
  handleStartDoctorRecording,
  handleStopDoctorRecording,
}: TrainerDialogsProps) {
  return (
    <>
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

            <div className="bg-secondary/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Задание:</h3>
              <p>{mockVoiceSteps[currentVoiceStep].prompt}</p>
            </div>

            <VoiceVisualizer isRecording={isRecording} />

            <div className="text-center space-y-4">
              <Button
                size="lg"
                variant={isRecording ? 'destructive' : 'default'}
                className="w-32 h-32 rounded-full"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
              >
                {isRecording ? (
                  <Icon name="Square" size={48} />
                ) : (
                  <Icon name="Mic" size={48} />
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isRecording ? 'Нажмите для остановки записи' : 'Нажмите на микрофон, чтобы начать'}
              </p>
            </div>

            {voiceResponse && (
              <div className="bg-primary/10 p-4 rounded-lg space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Ваш ответ:</h4>
                  <p className="text-sm">{voiceResponse}</p>
                </div>
                
                {voiceAnalysis && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Оценка:</span>
                      <Badge variant={voiceAnalysis.confidence >= 70 ? 'default' : voiceAnalysis.confidence >= 50 ? 'secondary' : 'destructive'}>
                        {voiceAnalysis.confidence}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Слов:</span>
                        <span className="ml-2 font-medium">{voiceAnalysis.wordCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Темп:</span>
                        <span className="ml-2 font-medium">{voiceAnalysis.wordsPerMinute} сл/мин</span>
                      </div>
                    </div>

                    {voiceAnalysis.keywordsFound.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Ключевые фразы:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {voiceAnalysis.keywordsFound.map((kw, idx) => (
                            <Badge key={idx} variant="outline" className="text-green-600">
                              ✓ {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {voiceAnalysis.keywordsMissing.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Не хватает:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {voiceAnalysis.keywordsMissing.map((kw, idx) => (
                            <Badge key={idx} variant="outline" className="text-orange-600">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-muted p-3 rounded text-sm">
                      <p className="font-medium mb-1">Рекомендации:</p>
                      <p className="text-muted-foreground">{voiceAnalysis.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleNextVoiceStep} disabled={!voiceResponse || !voiceAnalysis}>
                {currentVoiceStep === mockVoiceSteps.length - 1 ? 'Завершить' : 'Следующий шаг'}
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Doctor Dialog */}
      <Dialog open={doctorDialog} onOpenChange={setDoctorDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Тренажер общения с пациентом</DialogTitle>
            <DialogDescription>
              Практика реальных диалогов с виртуальным пациентом
            </DialogDescription>
          </DialogHeader>

          {!conversationAnalysis ? (
            <>
              <Tabs value={doctorScenario} onValueChange={(val) => handleChangeScenario(val as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="consultation">Консультация</TabsTrigger>
                  <TabsTrigger value="treatment">План лечения</TabsTrigger>
                  <TabsTrigger value="emergency">Экстренный</TabsTrigger>
                  <TabsTrigger value="objections">Возражения</TabsTrigger>
                </TabsList>

                <TabsContent value={doctorScenario} className="space-y-4">
                  <div className="h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4 bg-muted/20">
                    {doctorMessages.length === 0 ? (
                      <div className="text-center py-12 space-y-4">
                        <div className="text-muted-foreground">
                          <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                          <p className="text-lg font-medium">Начните диалог с пациентом</p>
                          <p className="text-sm mt-2">Напишите приветствие и представьтесь</p>
                        </div>
                      </div>
                    ) : (
                      doctorMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.role === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon 
                                name={message.role === 'admin' ? 'UserCircle' : 'User'} 
                                size={14} 
                                className={message.role === 'admin' ? '' : 'text-muted-foreground'}
                              />
                              <span className="text-xs font-medium">
                                {message.role === 'admin' ? 'Вы (Администратор)' : 'Пациент'}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    <VoiceVisualizer isRecording={isDoctorRecording} />
                    
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant={isDoctorRecording ? 'destructive' : 'outline'}
                        onClick={isDoctorRecording ? handleStopDoctorRecording : handleStartDoctorRecording}
                        disabled={conversationAnalysis !== null}
                      >
                        <Icon name={isDoctorRecording ? 'Square' : 'Mic'} size={20} />
                      </Button>
                      
                      <Input
                        placeholder={isDoctorRecording ? 'Говорите...' : 'Или введите текст...'}
                        value={doctorInput}
                        onChange={(e) => setDoctorInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendDoctorMessage();
                          }
                        }}
                        disabled={conversationAnalysis !== null || isDoctorRecording}
                      />
                      <Button onClick={handleSendDoctorMessage} disabled={!doctorInput.trim() || isDoctorRecording}>
                        <Icon name="Send" size={16} />
                      </Button>
                    </div>
                    
                    {doctorMessages.length >= 6 && (
                      <div className="flex justify-end">
                        <Button onClick={handleFinishConversation} variant="outline" size="sm">
                          <Icon name="CheckCircle" size={16} className="mr-2" />
                          Завершить и получить оценку
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-4">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                  conversationAnalysis.overallScore >= 70 ? 'bg-green-500/10' : 
                  conversationAnalysis.overallScore >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10'
                }`}>
                  <span className="text-4xl font-bold" style={{ 
                    color: conversationAnalysis.overallScore >= 70 ? '#22c55e' : 
                           conversationAnalysis.overallScore >= 50 ? '#eab308' : '#ef4444'
                  }}>
                    {conversationAnalysis.overallScore}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {conversationAnalysis.overallScore >= 70 ? 'Отличная работа!' : 
                     conversationAnalysis.overallScore >= 50 ? 'Хорошо, но есть что улучшить' : 'Нужно больше практики'}
                  </h3>
                  <p className="text-muted-foreground">Результаты анализа диалога</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{conversationAnalysis.empathyScore}</div>
                  <div className="text-sm text-muted-foreground mt-1">Эмпатия</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{conversationAnalysis.clarityScore}</div>
                  <div className="text-sm text-muted-foreground mt-1">Ясность</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{conversationAnalysis.professionalismScore}</div>
                  <div className="text-sm text-muted-foreground mt-1">Профессионализм</div>
                </Card>
              </div>

              {conversationAnalysis.goodPoints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600 flex items-center gap-2">
                    <Icon name="ThumbsUp" size={16} />
                    Сильные стороны
                  </h4>
                  <ul className="space-y-1">
                    {conversationAnalysis.goodPoints.map((point, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <Icon name="Check" size={14} className="text-green-600 mt-1" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {conversationAnalysis.missedOpportunities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} />
                    Упущенные моменты
                  </h4>
                  <ul className="space-y-1">
                    {conversationAnalysis.missedOpportunities.map((point, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <Icon name="X" size={14} className="text-orange-600 mt-1" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {conversationAnalysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                    <Icon name="Lightbulb" size={16} />
                    Рекомендации
                  </h4>
                  <ul className="space-y-1">
                    {conversationAnalysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <Icon name="ArrowRight" size={14} className="text-blue-600 mt-1" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleRestartConversation}>
                  Попробовать снова
                </Button>
                <Button onClick={() => setDoctorDialog(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}