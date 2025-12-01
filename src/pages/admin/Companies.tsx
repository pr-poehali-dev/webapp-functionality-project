import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { authService, ACCESS_GROUPS_API_URL } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/227369fe-07ca-4f0c-b8ee-f647263e78d9';

interface Company {
  id: number;
  name: string;
  description: string;
  departments_count: number;
  users_count: number;
  is_active: boolean;
  created_at?: string;
}

interface Department {
  id: number;
  company_id: number;
  company_name: string;
  name: string;
  description: string;
  users_count: number;
  access_group_id?: number;
  access_group_name?: string;
  is_active: boolean;
  created_at?: string;
}

interface AccessGroup {
  id: number;
  name: string;
  description: string;
}

export default function CompaniesAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  const [departmentForm, setDepartmentForm] = useState({
    company_id: '',
    name: '',
    description: '',
    access_group_id: '',
    is_active: true,
  });

  const currentUser = authService.getUser();
  const hasViewPermission = authService.hasPermission('companies.view');
  const hasCreatePermission = authService.hasPermission('companies.create');
  const hasEditPermission = authService.hasPermission('companies.edit');

  useEffect(() => {
    if (!hasViewPermission) {
      navigate('/');
      return;
    }
    fetchCompanies();
    fetchDepartments();
    fetchAccessGroups();
  }, [hasViewPermission, navigate]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}?entity_type=company`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
      });
      const data = await response.json();
      if (data.companies) setCompanies(data.companies);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить компании', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}?entity_type=department`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
      });
      const data = await response.json();
      if (data.departments) setDepartments(data.departments);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить подразделения', variant: 'destructive' });
    }
  };

  const fetchAccessGroups = async () => {
    try {
      const response = await fetch(`${ACCESS_GROUPS_API_URL}?resource=access_groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
      });
      const data = await response.json();
      if (data.access_groups) setAccessGroups(data.access_groups);
    } catch (error) {
      console.error('Failed to fetch access groups:', error);
    }
  };

  const handleCreateCompany = async () => {
    if (!hasCreatePermission) {
      toast({ title: 'Ошибка', description: 'Нет прав на создание', variant: 'destructive' });
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
          entity_type: 'company',
          ...companyForm,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Компания создана' });
        setShowCompanyDialog(false);
        setCompanyForm({ name: '', description: '', is_active: true });
        fetchCompanies();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error || 'Не удалось создать компанию', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать компанию', variant: 'destructive' });
    }
  };

  const handleUpdateCompany = async () => {
    if (!hasEditPermission || !editingCompany) {
      toast({ title: 'Ошибка', description: 'Нет прав на редактирование', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'company',
          id: editingCompany.id,
          ...companyForm,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Компания обновлена' });
        setShowCompanyDialog(false);
        setEditingCompany(null);
        setCompanyForm({ name: '', description: '', is_active: true });
        fetchCompanies();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error || 'Не удалось обновить компанию', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить компанию', variant: 'destructive' });
    }
  };

  const handleCreateDepartment = async () => {
    if (!hasCreatePermission) {
      toast({ title: 'Ошибка', description: 'Нет прав на создание', variant: 'destructive' });
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
          entity_type: 'department',
          company_id: parseInt(departmentForm.company_id),
          name: departmentForm.name,
          description: departmentForm.description,
          access_group_id: departmentForm.access_group_id ? parseInt(departmentForm.access_group_id) : null,
          is_active: departmentForm.is_active,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Подразделение создано' });
        setShowDepartmentDialog(false);
        setDepartmentForm({ company_id: '', name: '', description: '', access_group_id: '', is_active: true });
        fetchDepartments();
        fetchCompanies();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error || 'Не удалось создать подразделение', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать подразделение', variant: 'destructive' });
    }
  };

  const handleUpdateDepartment = async () => {
    if (!hasEditPermission || !editingDepartment) {
      toast({ title: 'Ошибка', description: 'Нет прав на редактирование', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'department',
          id: editingDepartment.id,
          company_id: parseInt(departmentForm.company_id),
          name: departmentForm.name,
          description: departmentForm.description,
          access_group_id: departmentForm.access_group_id ? parseInt(departmentForm.access_group_id) : null,
          is_active: departmentForm.is_active,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: 'Подразделение обновлено' });
        setShowDepartmentDialog(false);
        setEditingDepartment(null);
        setDepartmentForm({ company_id: '', name: '', description: '', is_active: true });
        fetchDepartments();
        fetchCompanies();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error || 'Не удалось обновить подразделение', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить подразделение', variant: 'destructive' });
    }
  };

  const openEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      description: company.description,
      is_active: company.is_active,
    });
    setShowCompanyDialog(true);
  };

  const openEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      company_id: department.company_id.toString(),
      name: department.name,
      description: department.description,
      access_group_id: department.access_group_id?.toString() || '',
      is_active: department.is_active,
    });
    setShowDepartmentDialog(true);
  };

  const handleToggleCompanyStatus = async (company: Company) => {
    if (!hasEditPermission) {
      toast({ title: 'Ошибка', description: 'Нет прав на редактирование', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'company',
          id: company.id,
          name: company.name,
          description: company.description,
          is_active: !company.is_active,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: company.is_active ? 'Компания деактивирована' : 'Компания активирована' });
        fetchCompanies();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось изменить статус', variant: 'destructive' });
    }
  };

  const handleToggleDepartmentStatus = async (department: Department) => {
    if (!hasEditPermission) {
      toast({ title: 'Ошибка', description: 'Нет прав на редактирование', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          entity_type: 'department',
          id: department.id,
          company_id: department.company_id,
          name: department.name,
          description: department.description,
          is_active: !department.is_active,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: department.is_active ? 'Подразделение деактивировано' : 'Подразделение активировано' });
        fetchDepartments();
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
                <h1 className="text-2xl font-bold">Управление компаниями и подразделениями</h1>
                <p className="text-sm text-muted-foreground">Создание и редактирование организационной структуры</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="companies">Компании</TabsTrigger>
              <TabsTrigger value="departments">Подразделения</TabsTrigger>
            </TabsList>
            {hasCreatePermission && (
              <Button onClick={() => activeTab === 'companies' ? setShowCompanyDialog(true) : setShowDepartmentDialog(true)}>
                <Icon name="Plus" size={18} className="mr-2" />
                {activeTab === 'companies' ? 'Создать компанию' : 'Создать подразделение'}
              </Button>
            )}
          </div>

          <TabsContent value="companies">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead className="text-center">Подразделения</TableHead>
                    <TableHead className="text-center">Сотрудники</TableHead>
                    <TableHead className="text-center">Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Нет компаний
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell className="text-muted-foreground">{company.description}</TableCell>
                        <TableCell className="text-center">{company.departments_count}</TableCell>
                        <TableCell className="text-center">{company.users_count}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={company.is_active ? 'default' : 'secondary'}>
                            {company.is_active ? 'Активна' : 'Неактивна'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasEditPermission && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditCompany(company)}
                                >
                                  <Icon name="Edit" size={16} className="mr-1" />
                                  Изменить
                                </Button>
                                <Button
                                  variant={company.is_active ? 'ghost' : 'default'}
                                  size="sm"
                                  onClick={() => handleToggleCompanyStatus(company)}
                                >
                                  <Icon name={company.is_active ? 'XCircle' : 'CheckCircle'} size={16} className="mr-1" />
                                  {company.is_active ? 'Деактивировать' : 'Активировать'}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Компания</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Группа доступа</TableHead>
                    <TableHead className="text-center">Сотрудники</TableHead>
                    <TableHead className="text-center">Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Нет подразделений
                      </TableCell>
                    </TableRow>
                  ) : (
                    departments.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell className="font-medium">{department.company_name}</TableCell>
                        <TableCell>{department.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {department.access_group_name ? (
                            <Badge variant="outline">{department.access_group_name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Не назначена</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{department.users_count}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={department.is_active ? 'default' : 'secondary'}>
                            {department.is_active ? 'Активно' : 'Неактивно'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasEditPermission && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDepartment(department)}
                                >
                                  <Icon name="Edit" size={16} className="mr-1" />
                                  Изменить
                                </Button>
                                <Button
                                  variant={department.is_active ? 'ghost' : 'default'}
                                  size="sm"
                                  onClick={() => handleToggleDepartmentStatus(department)}
                                >
                                  <Icon name={department.is_active ? 'XCircle' : 'CheckCircle'} size={16} className="mr-1" />
                                  {department.is_active ? 'Деактивировать' : 'Активировать'}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Company Dialog */}
      <Dialog open={showCompanyDialog} onOpenChange={(open) => {
        setShowCompanyDialog(open);
        if (!open) {
          setEditingCompany(null);
          setCompanyForm({ name: '', description: '', is_active: true });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Редактирование компании' : 'Создание компании'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Название</Label>
              <Input
                id="company-name"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                placeholder="ООО Компания"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-description">Описание</Label>
              <Textarea
                id="company-description"
                value={companyForm.description}
                onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                placeholder="Описание компании"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="company-active">Активна</Label>
              <Switch
                id="company-active"
                checked={companyForm.is_active}
                onCheckedChange={(checked) => setCompanyForm({ ...companyForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompanyDialog(false)}>
              Отмена
            </Button>
            <Button onClick={editingCompany ? handleUpdateCompany : handleCreateCompany}>
              {editingCompany ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Department Dialog */}
      <Dialog open={showDepartmentDialog} onOpenChange={(open) => {
        setShowDepartmentDialog(open);
        if (!open) {
          setEditingDepartment(null);
          setDepartmentForm({ company_id: '', name: '', description: '', access_group_id: '', is_active: true });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDepartment ? 'Редактирование подразделения' : 'Создание подразделения'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department-company">Компания</Label>
              <Select
                value={departmentForm.company_id}
                onValueChange={(value) => setDepartmentForm({ ...departmentForm, company_id: value })}
              >
                <SelectTrigger id="department-company">
                  <SelectValue placeholder="Выберите компанию" />
                </SelectTrigger>
                <SelectContent>
                  {companies.filter(c => c.is_active).map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-name">Название</Label>
              <Input
                id="department-name"
                value={departmentForm.name}
                onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                placeholder="Отдел продаж"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-description">Описание</Label>
              <Textarea
                id="department-description"
                value={departmentForm.description}
                onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                placeholder="Описание подразделения"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department-access-group">Группа доступа</Label>
              <Select
                value={departmentForm.access_group_id}
                onValueChange={(value) => setDepartmentForm({ ...departmentForm, access_group_id: value })}
              >
                <SelectTrigger id="department-access-group">
                  <SelectValue placeholder="Выберите группу доступа" />
                </SelectTrigger>
                <SelectContent>
                  {accessGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="department-active">Активно</Label>
              <Switch
                id="department-active"
                checked={departmentForm.is_active}
                onCheckedChange={(checked) => setDepartmentForm({ ...departmentForm, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepartmentDialog(false)}>
              Отмена
            </Button>
            <Button onClick={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}>
              {editingDepartment ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}