import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { authService, ACCESS_GROUPS_API_URL } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AccessGroup {
  id: number;
  name: string;
  description: string;
  users_count: number;
  permissions?: Permission[];
}

interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionsByCategory {
  [category: string]: Permission[];
}

export default function AccessGroupsAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<PermissionsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccessGroup, setEditingAccessGroup] = useState<AccessGroup | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchAccessGroups();
    fetchPermissions();
  }, []);

  const fetchAccessGroups = async () => {
    try {
      const response = await fetch(`${ACCESS_GROUPS_API_URL}?resource=access_groups`, {
        headers: { 'X-Session-Token': authService.getSessionToken() || '' },
      });
      const data = await response.json();
      if (data.access_groups) setAccessGroups(data.access_groups);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить группы доступа', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${ACCESS_GROUPS_API_URL}?resource=permissions`, {
        headers: { 'X-Session-Token': authService.getSessionToken() || '' },
      });
      const data = await response.json();
      console.log('Permissions data:', data);
      if (data.permissions) {
        setPermissions(data.permissions);
        // Group by category if not already provided
        if (data.by_category) {
          console.log('Using by_category from backend:', data.by_category);
          setPermissionsByCategory(data.by_category);
        } else {
          console.log('Grouping permissions manually');
          const grouped: PermissionsByCategory = {};
          data.permissions.forEach((perm: Permission) => {
            const category = perm.category || 'Прочее';
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(perm);
          });
          console.log('Grouped permissions:', grouped);
          setPermissionsByCategory(grouped);
        }
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const fetchAccessGroupDetails = async (accessGroupId: number) => {
    try {
      const response = await fetch(`${ACCESS_GROUPS_API_URL}?resource=access_groups&id=${accessGroupId}`, {
        headers: { 'X-Session-Token': authService.getSessionToken() || '' },
      });
      const data = await response.json();
      if (data.access_group) {
        setEditingAccessGroup(data.access_group);
        setFormData({ name: data.access_group.name, description: data.access_group.description });
        setSelectedPermissions(data.access_group.permissions.map((p: Permission) => p.id));
        setShowDialog(true);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить группу доступа', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    try {
      const isEdit = !!editingAccessGroup;
      const response = await fetch(ACCESS_GROUPS_API_URL, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          ...(isEdit && { access_group_id: editingAccessGroup.id }),
          name: formData.name,
          description: formData.description,
          permission_ids: selectedPermissions,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: isEdit ? 'Группа доступа обновлена' : 'Группа доступа создана' });
        setShowDialog(false);
        resetForm();
        fetchAccessGroups();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить группу доступа', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setSelectedPermissions([]);
    setEditingAccessGroup(null);
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
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
                <h1 className="text-2xl font-bold">Управление группами доступа и правами</h1>
                <p className="text-sm text-muted-foreground">Создание и настройка профилей прав</p>
              </div>
            </div>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать группу доступа
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessGroups.map((accessGroup) => (
            <Card key={accessGroup.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fetchAccessGroupDetails(accessGroup.id)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="ShieldCheck" size={24} className="text-primary" />
                </div>
                <Badge>{accessGroup.users_count} польз.</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2">{accessGroup.name}</h3>
              <p className="text-sm text-muted-foreground">{accessGroup.description}</p>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccessGroup ? 'Редактирование группы доступа' : 'Создание группы доступа'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Название группы доступа</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Менеджер"
              />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание группы доступа"
              />
            </div>
            <div className="space-y-4">
              <Label>Права доступа</Label>
              {Object.keys(permissionsByCategory).length === 0 ? (
                <p className="text-sm text-muted-foreground">Загрузка прав доступа...</p>
              ) : (
                Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <Card key={category} className="p-4">
                    <h4 className="font-semibold mb-3">{category}</h4>
                    <div className="space-y-2">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={selectedPermissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <label htmlFor={`perm-${perm.id}`} className="text-sm cursor-pointer">
                            <div className="font-medium">{perm.name}</div>
                            <div className="text-muted-foreground">{perm.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingAccessGroup ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}