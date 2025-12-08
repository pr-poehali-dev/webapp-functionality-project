import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { authService } from '@/lib/auth';

const API_URL = 'https://functions.poehali.dev/227369fe-07ca-4f0c-b8ee-f647263e78d9';

interface Company {
  id: string;
  name: string;
  color: string;
}

interface SalesManager {
  id: number;
  name: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
  company_id: number;
}

interface Match {
  id: number;
  round: number;
  match_order: number;
  player1_id: number | null;
  player2_id: number | null;
  player1_name?: string;
  player2_name?: string;
  player1_avatar?: string;
  player2_avatar?: string;
  winner_id: number | null;
  score1: number;
  score2: number;
  status: string;
}

interface Tournament {
  id: number;
  name: string;
  company_a_id: number;
  company_b_id: number;
  company_a_name: string;
  company_b_name: string;
  prize_pool: number;
  status: string;
  matches: Match[];
  winner_id: number | null;
}

interface ChatMessage {
  role: 'manager' | 'client';
  content: string;
  timestamp?: string;
}

export default function SalesBattle() {
  const { toast } = useToast();
  const [setupDialog, setSetupDialog] = useState(false);
  const [battleDialog, setBattleDialog] = useState(false);
  const [selectedCompanyA, setSelectedCompanyA] = useState<string>('');
  const [selectedCompanyB, setSelectedCompanyB] = useState<string>('');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [battleTimer, setBattleTimer] = useState(300);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [playerInput, setPlayerInput] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [managers, setManagers] = useState<SalesManager[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (!battleDialog || battleTimer <= 0) return;

    const timer = setInterval(() => {
      setBattleTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [battleDialog, battleTimer]);

  const loadCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await fetch(
        `${API_URL}?entity_type=company`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': authService.getSessionToken() || '',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load companies');

      const data = await response.json();
      if (data.companies && Array.isArray(data.companies)) {
        const loadedCompanies: Company[] = data.companies.map((c: any, idx: number) => ({
          id: c.id.toString(),
          name: c.name,
          color: ['blue', 'purple', 'green', 'orange', 'red', 'pink'][idx % 6],
        }));
        setCompanies(loadedCompanies);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список компаний',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const loadManagers = async (companyId: string) => {
    try {
      const response = await fetch(
        `${API_URL}?entity_type=sales_manager&company_id=${companyId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': authService.getSessionToken() || '',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load managers');

      const data = await response.json();
      return data.managers || [];
    } catch (error) {
      console.error('Error loading managers:', error);
      return [];
    }
  };

  const handleCreateTournament = async () => {
    if (!selectedCompanyA || !selectedCompanyB) {
      toast({
        title: 'Ошибка',
        description: 'Выберите обе компании для турнира',
        variant: 'destructive',
      });
      return;
    }

    if (selectedCompanyA === selectedCompanyB) {
      toast({
        title: 'Ошибка',
        description: 'Компании должны быть разными',
        variant: 'destructive',
      });
      return;
    }

    const companyA = companies.find(c => c.id === selectedCompanyA)!;
    const companyB = companies.find(c => c.id === selectedCompanyB)!;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'tournament',
          name: `${companyA.name} VS ${companyB.name}`,
          company_a_id: parseInt(selectedCompanyA),
          company_b_id: parseInt(selectedCompanyB),
          prize_pool: 20000,
        }),
      });

      if (!response.ok) throw new Error('Failed to create tournament');

      const data = await response.json();
      
      await loadTournament(data.tournament_id);
      setSetupDialog(false);
      
      toast({
        title: 'Турнир создан!',
        description: `${companyA.name} против ${companyB.name}. Призовой фонд: 20 000₽`,
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать турнир',
        variant: 'destructive',
      });
    }
  };

  const loadTournament = async (tournamentId: number) => {
    try {
      const response = await fetch(
        `${API_URL}?entity_type=tournament&tournament_id=${tournamentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': authService.getSessionToken() || '',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load tournament');

      const data = await response.json();
      setTournament(data.tournament);
    } catch (error) {
      console.error('Error loading tournament:', error);
    }
  };

  const handleStartMatch = async (match: Match) => {
    if (!match.player1_id || !match.player2_id) {
      toast({
        title: 'Ошибка',
        description: 'Не хватает участников для боя',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'battle',
          action: 'start_match',
          match_id: match.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to start match');

      const data = await response.json();
      setSessionId(data.session_id);
      setCurrentMatch(match);
      setBattleDialog(true);
      setBattleTimer(300);
      setChatHistory([
        { role: 'client', content: 'Здравствуйте! Меня зовут Мария. Я ищу стоматологическую клинику.' }
      ]);
      setTotalScore(0);
    } catch (error) {
      console.error('Error starting match:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось начать бой',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!playerInput.trim() || !sessionId) return;

    const newMessage: ChatMessage = { role: 'manager', content: playerInput };
    setChatHistory(prev => [...prev, newMessage]);
    setPlayerInput('');
    setIsAIThinking(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'battle',
          action: 'send_message',
          session_id: sessionId,
          message: playerInput,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      setChatHistory(prev => [...prev, { role: 'client', content: data.ai_response }]);
      setTotalScore(data.total_score);
      setIsAIThinking(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsAIThinking(false);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  const handleFinishMatch = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'battle',
          action: 'finish_match',
          session_id: sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to finish match');

      const data = await response.json();
      
      setBattleDialog(false);
      
      if (tournament) {
        await loadTournament(tournament.id);
      }

      toast({
        title: data.winner === 'player' ? 'Победа!' : 'Поражение',
        description: `Ваш счёт: ${data.player_score}. Счёт противника: ${data.opponent_score}`,
        variant: data.winner === 'player' ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error finishing match:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить бой',
        variant: 'destructive',
      });
    }
  };

  const renderTournamentBracket = () => {
    if (!tournament) return null;

    const rounds = Array.from(new Set(tournament.matches.map(m => m.round))).sort((a, b) => a - b);

    return (
      <div className="space-y-8">
        {rounds.map(round => (
          <div key={round}>
            <h3 className="text-lg font-bold mb-4">Раунд {round}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournament.matches
                .filter(m => m.round === round)
                .map(match => (
                  <Card key={match.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={
                        match.status === 'pending' ? 'outline' :
                        match.status === 'in-progress' ? 'default' :
                        'secondary'
                      }>
                        {match.status === 'pending' ? 'Ожидает' :
                         match.status === 'in-progress' ? 'В процессе' :
                         'Завершён'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className={`flex items-center gap-2 p-2 rounded ${match.winner_id === match.player1_id ? 'bg-green-50' : ''}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{match.player1_avatar || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{match.player1_name || 'Нет участника'}</p>
                        </div>
                        {match.status === 'completed' && <Badge variant="outline">{match.score1}</Badge>}
                      </div>

                      <div className={`flex items-center gap-2 p-2 rounded ${match.winner_id === match.player2_id ? 'bg-green-50' : ''}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{match.player2_avatar || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{match.player2_name || 'Нет участника'}</p>
                        </div>
                        {match.status === 'completed' && <Badge variant="outline">{match.score2}</Badge>}
                      </div>
                    </div>

                    {match.status === 'pending' && match.player1_id && match.player2_id && (
                      <Button
                        onClick={() => handleStartMatch(match)}
                        className="w-full bg-brand hover:bg-brand/90"
                        size="sm"
                      >
                        <Icon name="Swords" size={14} className="mr-2" />
                        Начать бой
                      </Button>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Icon name="Swords" size={32} className="text-brand" />
            Битва продаж
          </h1>
          <p className="text-muted-foreground mt-1">
            Корпоративные турниры между менеджерами по продажам
          </p>
        </div>
        <Button onClick={() => setSetupDialog(true)} className="bg-brand hover:bg-brand/90">
          <Icon name="Plus" size={16} className="mr-2" />
          Создать турнир
        </Button>
      </div>

      {tournament && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{tournament.name}</h2>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <p className="font-bold">{tournament.company_a_name}</p>
                </div>
                <Icon name="Swords" size={20} className="text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500" />
                  <p className="font-bold">{tournament.company_b_name}</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Призовой фонд</p>
              <p className="text-3xl font-bold text-green-600">
                {tournament.prize_pool.toLocaleString('ru-RU')}₽
              </p>
            </div>
          </div>
        </Card>
      )}

      {tournament ? (
        renderTournamentBracket()
      ) : (
        <Card className="p-12 text-center">
          <Icon name="Trophy" size={64} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-2">Турнир не создан</h3>
          <p className="text-muted-foreground mb-6">
            Создайте новый турнир между компаниями и начните битву продаж
          </p>
          <Button onClick={() => setSetupDialog(true)} className="bg-brand hover:bg-brand/90">
            <Icon name="Plus" size={16} className="mr-2" />
            Создать первый турнир
          </Button>
        </Card>
      )}

      <Dialog open={setupDialog} onOpenChange={setSetupDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Настройка турнира</DialogTitle>
            <DialogDescription>
              Выберите две компании для корпоративной битвы продаж
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label>Компания A</Label>
              <Select value={selectedCompanyA} onValueChange={setSelectedCompanyA} disabled={isLoadingCompanies}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCompanies ? 'Загрузка...' : 'Выберите компанию'} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Компания B</Label>
              <Select value={selectedCompanyB} onValueChange={setSelectedCompanyB} disabled={isLoadingCompanies}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCompanies ? 'Загрузка...' : 'Выберите компанию'} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id} disabled={company.id === selectedCompanyA}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Правила турнира
                  </p>
                  <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• Менеджеры соревнуются в симуляции продаж с AI-пациентом</li>
                    <li>• Победитель определяется по набранным очкам</li>
                    <li>• Призовой фонд: 20 000₽</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSetupDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateTournament} className="bg-brand hover:bg-brand/90">
              Создать турнир
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={battleDialog} onOpenChange={setBattleDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Битва продаж</DialogTitle>
            <DialogDescription>
              Проведите переговоры с клиентом и наберите максимум очков
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <Icon name="Timer" size={20} className="text-brand" />
                <div>
                  <p className="text-sm text-muted-foreground">Время</p>
                  <p className="text-lg font-bold">
                    {Math.floor(battleTimer / 60)}:{(battleTimer % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ваш счёт</p>
                <p className="text-lg font-bold text-green-600">{totalScore}</p>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg p-4">
              <div className="space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === 'manager' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.role === 'manager'
                          ? 'bg-brand text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isAIThinking && (
                  <div className="flex gap-2 justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Печатает...</p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                placeholder="Введите ваш ответ клиенту..."
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={handleSendMessage} disabled={!playerInput.trim() || isAIThinking}>
                  <Icon name="Send" size={16} />
                </Button>
                <Button variant="destructive" onClick={handleFinishMatch}>
                  <Icon name="Flag" size={16} />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
