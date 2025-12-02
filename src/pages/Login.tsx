import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { authService } from '@/lib/auth';
import Icon from '@/components/ui/icon';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[LOGIN] Attempting login...', username);
      const result = await authService.login(username, password);
      console.log('[LOGIN] Login successful!', result);
      navigate('/');
    } catch (err) {
      console.error('[LOGIN] Login failed:', err);
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <img 
            src="https://cdn.poehali.dev/projects/5d628799-a66f-463d-92fd-2665c44b5a99/files/94ca50ae-e96b-4cdd-9762-1a33ba26f331.jpg" 
            alt="Команда мечты" 
            className="w-24 h-24 mx-auto mb-4 rounded-lg object-cover"
          />
          <h1 className="text-3xl font-bold mb-2">Вход в систему</h1>
          <p className="text-muted-foreground">
            Платформа обучения Команда мечты
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Логин
            </label>
            <div className="relative">
              <Icon name="User" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Пароль
            </label>
            <div className="relative">
              <Icon name="KeyRound" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Вход...
              </>
            ) : (
              <>
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>По умолчанию используйте:</p>
          <p className="mt-1 font-mono text-xs">admin / admin123</p>
        </div>
      </Card>
    </div>
  );
}