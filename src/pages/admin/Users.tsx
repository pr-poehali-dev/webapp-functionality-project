import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { authService, USERS_API_URL, ROLES_API_URL } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role_id: number;
  role_name: string;
  company_id?: number;
  company_name?: string;
  department_id?: number;
  department_name?: string;
  is_blocked: boolean;
  created_at: string;
  last_login?: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Company {
  id: number;
  name: string;
  is_active: boolean;
}

interface Department {
  id: number;
  company_id: number;
  name: string;
  is_active: boolean;
}

const COMPANIES_API_URL = 'https://functions.poehali.dev/227369fe-07ca-4f0c-b8ee-f647263e78d9';

export default function UsersAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role_id: '',
    company_id: '',
    department_id: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (formData.company_id) {
      fetchDepartments(parseInt(formData.company_id));
    } else {
      setDepartments([]);
    }
  }, [formData.company_id]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(USERS_API_URL, {
        headers: {
          'X-Session-Token': authService.getSessionToken() || '',
        },
      });
      const data = await response.json();
      if (data.users) setUsers(data.users);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить пользователей', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${ROLES_API_URL}?resource=roles`, {
        headers: {
          'X-Session-Token': authService.getSessionToken() || '',
        },
      });
      const data = await response.json();
      if (data.roles) setRoles(data.roles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${COMPANIES_API_URL}?entity_type=company`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
      });
      const data = await response.json();
      if (data.companies) setCompanies(data.companies.filter((c: Company) => c.is_active));
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchDepartments = async (company_id: number) => {
    try {
      const response = await fetch(`${COMPANIES_API_URL}?entity_type=department&company_id=${company_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
      });
      const data = await response.json();
      if (data.departments) {
        setDepartments(data.departments.filter((d: Department) => d.is_active && d.company_id === company_id));
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch(USERS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          ...formData,
          role_id: parseInt(formData.role_id),
          company_id: formData.company_id ? parseInt(formData.company_id) : undefined,
          department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Пользователь создан' });
        setShowCreateDialog(false);
        setFormData({ username: '', email: '', full_name: '', password: '', role_id: '', company_id: '', department_id: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать пользователя', variant: 'destructive' });
    }
  };

  const handleToggleBlock = async (user: User) => {
    try {
      const response = await fetch(USERS_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          action: 'block',
          user_id: user.id,
          is_blocked: !user.is_blocked,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: user.is_blocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован' });
        fetchUsers();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось изменить статус', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Управление пользователями</h1>
                <p className="text-sm text-muted-foreground">Создание, редактирование и блокировка учетных записей</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Icon name="UserPlus" size={18} className="mr-2" />
              Создать пользователя
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card>
          <div className="p-6">
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="User" size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username} • {user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{user.role_name}</Badge>
                          {user.company_name && <Badge variant="outline">{user.company_name}</Badge>}
                          {user.department_name && <Badge variant="outline">{user.department_name}</Badge>}
                          {user.is_blocked && <Badge variant="destructive">Заблокирован</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={user.is_blocked ? "default" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleBlock(user)}
                    >
                      <Icon name={user.is_blocked ? "Unlock" : "Lock"} size={16} className="mr-1" />
                      {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </main>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создание пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Полное имя</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Иван Иванов"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select value={formData.role_id} onValueChange={(value) => setFormData({ ...formData, role_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Компания</Label>
              <Select 
                value={formData.company_id} 
                onValueChange={(value) => {
                  setFormData({ ...formData, company_id: value, department_id: '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите компанию" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Подразделение</Label>
              <Select 
                value={formData.department_id} 
                onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                disabled={!formData.company_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подразделение" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id.toString()}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateUser}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}