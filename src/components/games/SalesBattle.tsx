import { useState } from 'react';
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

interface Company {
  id: string;
  name: string;
  color: string;
  logo?: string;
}

interface SalesManager {
  id: string;
  name: string;
  companyId: string;
  avatar: string;
  level: number;
  wins: number;
  losses: number;
}

interface Match {
  id: string;
  round: number;
  player1: SalesManager | null;
  player2: SalesManager | null;
  winner: SalesManager | null;
  score1?: number;
  score2?: number;
  status: 'pending' | 'in-progress' | 'completed';
}

interface Tournament {
  id: string;
  name: string;
  companyA: Company;
  companyB: Company;
  prizePool: number;
  status: 'setup' | 'in-progress' | 'completed';
  matches: Match[];
  winner: SalesManager | null;
}

const mockCompanies: Company[] = [
  { id: '1', name: 'СтомаЛюкс', color: 'blue' },
  { id: '2', name: 'ДентаПро', color: 'purple' },
  { id: '3', name: 'ЗдоровоДент', color: 'green' },
  { id: '4', name: 'МедиСмайл', color: 'orange' },
];

const mockManagers: SalesManager[] = [
  { id: '1', name: 'Анна Петрова', companyId: '1', avatar: 'АП', level: 8, wins: 24, losses: 6 },
  { id: '2', name: 'Игорь Смирнов', companyId: '1', avatar: 'ИС', level: 7, wins: 18, losses: 12 },
  { id: '3', name: 'Мария Козлова', companyId: '1', avatar: 'МК', level: 9, wins: 31, losses: 4 },
  { id: '4', name: 'Дмитрий Волков', companyId: '1', avatar: 'ДВ', level: 6, wins: 15, losses: 15 },
  { id: '5', name: 'Елена Новикова', companyId: '2', avatar: 'ЕН', level: 8, wins: 22, losses: 8 },
  { id: '6', name: 'Сергей Морозов', companyId: '2', avatar: 'СМ', level: 7, wins: 19, losses: 11 },
  { id: '7', name: 'Ольга Соколова', companyId: '2', avatar: 'ОС', level: 10, wins: 35, losses: 2 },
  { id: '8', name: 'Алексей Лебедев', companyId: '2', avatar: 'АЛ', level: 5, wins: 12, losses: 18 },
];

export default function SalesBattle() {
  const { toast } = useToast();
  const [setupDialog, setSetupDialog] = useState(false);
  const [battleDialog, setBattleDialog] = useState(false);
  const [selectedCompanyA, setSelectedCompanyA] = useState<string>('');
  const [selectedCompanyB, setSelectedCompanyB] = useState<string>('');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [battleTimer, setBattleTimer] = useState(300);
  const [battlePhase, setBattlePhase] = useState<'greeting' | 'needs' | 'presentation' | 'objections' | 'closing'>('greeting');

  const handleCreateTournament = () => {
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

    const companyA = mockCompanies.find(c => c.id === selectedCompanyA)!;
    const companyB = mockCompanies.find(c => c.id === selectedCompanyB)!;
    
    const managersA = mockManagers.filter(m => m.companyId === selectedCompanyA);
    const managersB = mockManagers.filter(m => m.companyId === selectedCompanyB);

    // Создаём турнирную сетку (олимпийская система)
    const totalPlayers = Math.max(managersA.length, managersB.length);
    const rounds = Math.ceil(Math.log2(totalPlayers * 2));
    
    // Первый раунд - все менеджеры
    const firstRoundMatches: Match[] = [];
    const maxMatches = Math.max(managersA.length, managersB.length);
    
    for (let i = 0; i < maxMatches; i++) {
      firstRoundMatches.push({
        id: `r1-m${i}`,
        round: 1,
        player1: managersA[i] || null,
        player2: managersB[i] || null,
        winner: null,
        status: 'pending',
      });
    }

    const newTournament: Tournament = {
      id: Date.now().toString(),
      name: `${companyA.name} VS ${companyB.name}`,
      companyA,
      companyB,
      prizePool: 20000,
      status: 'in-progress',
      matches: firstRoundMatches,
      winner: null,
    };

    setTournament(newTournament);
    setSetupDialog(false);
    
    toast({
      title: 'Турнир создан!',
      description: `${companyA.name} против ${companyB.name}. Призовой фонд: 20 000₽`,
    });
  };

  const handleStartMatch = (match: Match) => {
    if (!match.player1 || !match.player2) {
      toast({
        title: 'Ошибка',
        description: 'Не хватает участников для боя',
        variant: 'destructive',
      });
      return;
    }

    setCurrentMatch({
      ...match,
      status: 'in-progress',
      score1: 0,
      score2: 0,
    });
    setBattleDialog(true);
    setBattleTimer(300);
    setBattlePhase('greeting');
  };

  const handleFinishMatch = (winnerId: string) => {
    if (!currentMatch || !tournament) return;

    const winner = currentMatch.player1?.id === winnerId ? currentMatch.player1 : currentMatch.player2;
    
    // Обновляем матч
    const updatedMatches = tournament.matches.map(m => 
      m.id === currentMatch.id 
        ? { ...m, winner, status: 'completed' as const, score1: 850, score2: 720 }
        : m
    );

    // Проверяем, все ли матчи текущего раунда завершены
    const currentRound = currentMatch.round;
    const roundMatches = updatedMatches.filter(m => m.round === currentRound);
    const allRoundCompleted = roundMatches.every(m => m.status === 'completed');

    if (allRoundCompleted) {
      // Создаём следующий раунд
      const winners = roundMatches.map(m => m.winner).filter(Boolean) as SalesManager[];
      
      if (winners.length === 1) {
        // Финал! Есть победитель
        setTournament({
          ...tournament,
          matches: updatedMatches,
          winner: winners[0],
          status: 'completed',
        });
        
        toast({
          title: '🏆 Победитель турнира!',
          description: `${winners[0].name} выигрывает 20 000₽!`,
        });
      } else {
        // Создаём матчи следующего раунда
        const nextRoundMatches: Match[] = [];
        for (let i = 0; i < winners.length; i += 2) {
          nextRoundMatches.push({
            id: `r${currentRound + 1}-m${i / 2}`,
            round: currentRound + 1,
            player1: winners[i],
            player2: winners[i + 1] || null,
            winner: null,
            status: 'pending',
          });
        }
        
        setTournament({
          ...tournament,
          matches: [...updatedMatches, ...nextRoundMatches],
        });
        
        toast({
          title: 'Раунд завершён!',
          description: `Следующий раунд: ${nextRoundMatches.length} ${nextRoundMatches.length === 1 ? 'финал' : 'матчей'}`,
        });
      }
    } else {
      setTournament({
        ...tournament,
        matches: updatedMatches,
      });
    }

    setBattleDialog(false);
    setCurrentMatch(null);
  };

  const renderTournamentBracket = () => {
    if (!tournament) return null;

    const rounds = Array.from(new Set(tournament.matches.map(m => m.round))).sort();
    
    return (
      <div className="space-y-8">
        {rounds.map(round => {
          const roundMatches = tournament.matches.filter(m => m.round === round);
          const roundName = round === rounds.length ? 'Финал' : `Раунд ${round}`;
          
          return (
            <div key={round}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="Zap" size={20} />
                {roundName}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roundMatches.map(match => (
                  <Card key={match.id} className={`p-6 ${match.status === 'completed' ? 'opacity-60' : ''}`}>
                    <div className="space-y-4">
                      {/* Player 1 */}
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        match.winner?.id === match.player1?.id ? 'bg-green-500/10 border border-green-500/30' : 'bg-card'
                      }`}>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-500/10 text-blue-600">
                            {match.player1?.avatar || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{match.player1?.name || 'TBD'}</p>
                          <p className="text-xs text-muted-foreground">
                            {match.player1 && `Lv.${match.player1.level} • ${match.player1.wins}W/${match.player1.losses}L`}
                          </p>
                        </div>
                        {match.status === 'completed' && match.score1 && (
                          <Badge variant={match.winner?.id === match.player1?.id ? 'default' : 'secondary'}>
                            {match.score1}
                          </Badge>
                        )}
                        {match.winner?.id === match.player1?.id && (
                          <Icon name="Crown" size={20} className="text-yellow-600" />
                        )}
                      </div>

                      {/* VS */}
                      <div className="text-center text-sm font-bold text-muted-foreground">
                        VS
                      </div>

                      {/* Player 2 */}
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        match.winner?.id === match.player2?.id ? 'bg-green-500/10 border border-green-500/30' : 'bg-card'
                      }`}>
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-purple-500/10 text-purple-600">
                            {match.player2?.avatar || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{match.player2?.name || 'TBD'}</p>
                          <p className="text-xs text-muted-foreground">
                            {match.player2 && `Lv.${match.player2.level} • ${match.player2.wins}W/${match.player2.losses}L`}
                          </p>
                        </div>
                        {match.status === 'completed' && match.score2 && (
                          <Badge variant={match.winner?.id === match.player2?.id ? 'default' : 'secondary'}>
                            {match.score2}
                          </Badge>
                        )}
                        {match.winner?.id === match.player2?.id && (
                          <Icon name="Crown" size={20} className="text-yellow-600" />
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        {match.status === 'pending' && match.player1 && match.player2 && (
                          <Button 
                            className="w-full bg-brand hover:bg-brand/90"
                            onClick={() => handleStartMatch(match)}
                          >
                            <Icon name="Play" size={16} className="mr-2" />
                            Начать бой
                          </Button>
                        )}
                        {match.status === 'completed' && (
                          <div className="text-center text-sm text-muted-foreground">
                            Победитель: <span className="font-bold text-foreground">{match.winner?.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">⚔️ Битва продаж</h2>
          <p className="text-muted-foreground">
            Корпоративный турнир между компаниями. Олимпийская система. Призовой фонд: 20 000₽
          </p>
        </div>
        <Button 
          onClick={() => setSetupDialog(true)} 
          className="bg-brand hover:bg-brand/90"
          disabled={!!tournament && tournament.status !== 'completed'}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Создать турнир
        </Button>
      </div>

      {/* Tournament Info */}
      {tournament && (
        <Card className="p-6 mb-8 bg-gradient-to-r from-brand/10 to-brand/5 border-brand/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Icon name="Building2" size={32} className="text-blue-600" />
                </div>
                <p className="font-bold">{tournament.companyA.name}</p>
              </div>
              
              <div className="text-4xl font-bold text-brand">VS</div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mb-2">
                  <Icon name="Building2" size={32} className="text-purple-600" />
                </div>
                <p className="font-bold">{tournament.companyB.name}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Призовой фонд</p>
              <p className="text-3xl font-bold text-green-600">
                {tournament.prizePool.toLocaleString('ru-RU')}₽
              </p>
              {tournament.status === 'completed' && tournament.winner && (
                <Badge className="mt-2 bg-yellow-600">
                  <Icon name="Crown" size={12} className="mr-1" />
                  Победитель: {tournament.winner.name}
                </Badge>
              )}
            </div>
          </div>

          {tournament.status === 'in-progress' && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Zap" size={14} className="text-brand" />
              <span className="text-muted-foreground">Турнир в процессе</span>
            </div>
          )}
        </Card>
      )}

      {/* Tournament Bracket */}
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

      {/* Setup Dialog */}
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
              <Select value={selectedCompanyA} onValueChange={setSelectedCompanyA}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите компанию" />
                </SelectTrigger>
                <SelectContent>
                  {mockCompanies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name} ({mockManagers.filter(m => m.companyId === company.id).length} менеджеров)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Компания B</Label>
              <Select value={selectedCompanyB} onValueChange={setSelectedCompanyB}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите компанию" />
                </SelectTrigger>
                <SelectContent>
                  {mockCompanies.map(company => (
                    <SelectItem key={company.id} value={company.id} disabled={company.id === selectedCompanyA}>
                      {company.name} ({mockManagers.filter(m => m.companyId === company.id).length} менеджеров)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Правила турнира</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Олимпийская система - проигравший выбывает</li>
                    <li>Менеджеры с ролью "менеджер по продажам"</li>
                    <li>Призовой фонд: 20 000₽ победителю</li>
                    <li>Длительность боя: 5 минут</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Button 
              onClick={handleCreateTournament} 
              className="w-full bg-brand hover:bg-brand/90"
              disabled={!selectedCompanyA || !selectedCompanyB}
            >
              <Icon name="Trophy" size={16} className="mr-2" />
              Создать турнир
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Battle Dialog */}
      <Dialog open={battleDialog} onOpenChange={setBattleDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>⚔️ Битва продаж</DialogTitle>
            <DialogDescription>
              Олимпийская система - победитель проходит дальше
            </DialogDescription>
          </DialogHeader>

          {currentMatch && (
            <div className="space-y-6 py-4">
              {/* Timer & Phase */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {Math.floor(battleTimer / 60)}:{(battleTimer % 60).toString().padStart(2, '0')}
                </div>
                <Badge className="bg-brand">
                  Фаза: {battlePhase === 'greeting' ? 'Приветствие' : 
                         battlePhase === 'needs' ? 'Выявление потребности' :
                         battlePhase === 'presentation' ? 'Презентация' :
                         battlePhase === 'objections' ? 'Возражения' : 'Закрытие'}
                </Badge>
              </div>

              {/* Players */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 bg-blue-500/5 border-blue-500/30">
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarFallback className="bg-blue-500/20 text-blue-600 text-xl">
                        {currentMatch.player1?.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg mb-1">{currentMatch.player1?.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Уровень {currentMatch.player1?.level}
                    </p>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {currentMatch.score1 || 0}
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </Card>

                <Card className="p-6 bg-purple-500/5 border-purple-500/30">
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarFallback className="bg-purple-500/20 text-purple-600 text-xl">
                        {currentMatch.player2?.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg mb-1">{currentMatch.player2?.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Уровень {currentMatch.player2?.level}
                    </p>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {currentMatch.score2 || 0}
                    </div>
                    <Progress value={38} className="h-2" />
                  </div>
                </Card>
              </div>

              {/* Demo Actions */}
              <Card className="p-6 bg-muted/50">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Демо-режим. Выберите победителя:
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleFinishMatch(currentMatch.player1!.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Icon name="Crown" size={16} className="mr-2" />
                    {currentMatch.player1?.name} побеждает
                  </Button>
                  <Button 
                    onClick={() => handleFinishMatch(currentMatch.player2!.id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Icon name="Crown" size={16} className="mr-2" />
                    {currentMatch.player2?.name} побеждает
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}