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
import { authService, ROLES_API_URL } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Role {
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

export default function RolesAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<PermissionsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${ROLES_API_URL}?resource=roles`, {
        headers: { 'X-Session-Token': authService.getSessionToken() || '' },
      });
      const data = await response.json();
      if (data.roles) setRoles(data.roles);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить роли', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${ROLES_API_URL}?resource=permissions`, {
        headers: { 'X-Session-Token': authService.getSessionToken() || '' },
      });
      const data = await response.json();
      if (data.permissions) setPermissions(data.permissions);
      if (data.by_category) setPermissionsByCategory(data.by_category);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const fetchRoleDetails = async (roleId: number) => {
    try {
      const response = await fetch(`${ROLES_API_URL}?resource=roles&id=${roleId}`, {
        headers: { 'X-Session-Token': authService.getSessionToken() || '' },
      });
      const data = await response.json();
      if (data.role) {
        setEditingRole(data.role);
        setFormData({ name: data.role.name, description: data.role.description });
        setSelectedPermissions(data.role.permissions.map((p: Permission) => p.id));
        setShowDialog(true);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить роль', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    try {
      const isEdit = !!editingRole;
      const response = await fetch(ROLES_API_URL, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': authService.getSessionToken() || '',
        },
        body: JSON.stringify({
          ...(isEdit && { role_id: editingRole.id }),
          name: formData.name,
          description: formData.description,
          permission_ids: selectedPermissions,
        }),
      });

      if (response.ok) {
        toast({ title: 'Успех', description: isEdit ? 'Роль обновлена' : 'Роль создана' });
        setShowDialog(false);
        resetForm();
        fetchRoles();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: error.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить роль', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setSelectedPermissions([]);
    setEditingRole(null);
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
                <h1 className="text-2xl font-bold">Управление ролями и правами</h1>
                <p className="text-sm text-muted-foreground">Создание и настройка профилей прав</p>
              </div>
            </div>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать роль
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fetchRoleDetails(role.id)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="ShieldCheck" size={24} className="text-primary" />
                </div>
                <Badge>{role.users_count} польз.</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2">{role.name}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Редактирование роли' : 'Создание роли'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Название роли</Label>
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
                placeholder="Краткое описание роли"
              />
            </div>
            <div className="space-y-4">
              <Label>Права доступа</Label>
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <Card key={category} className="p-4">
                  <h4 className="font-semibold mb-3 capitalize">{category}</h4>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`perm-${perm.id}`}
                          checked={selectedPermissions.includes(perm.id)}
                          onCheckedChange={() => togglePermission(perm.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`perm-${perm.id}`} className="font-normal cursor-pointer">
                            {perm.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">{perm.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingRole ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
