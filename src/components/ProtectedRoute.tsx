import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import Icon from '@/components/ui/icon';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
}: ProtectedRouteProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const validate = async () => {
      const isValid = await authService.validateSession();
      setIsAuthenticated(isValid);

      if (isValid) {
        if (requiredPermission) {
          setHasAccess(authService.hasPermission(requiredPermission));
        } else if (requiredPermissions && requiredPermissions.length > 0) {
          setHasAccess(
            requireAll
              ? authService.hasAllPermissions(requiredPermissions)
              : authService.hasAnyPermission(requiredPermissions)
          );
        } else {
          setHasAccess(true);
        }
      }

      setIsValidating(false);
    };

    validate();
  }, [requiredPermission, requiredPermissions, requireAll]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
            <Icon name="ShieldAlert" size={32} className="text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Доступ запрещён</h1>
          <p className="text-muted-foreground mb-6">
            У вас нет прав для доступа к этому разделу
          </p>
          <a href="/" className="text-primary hover:underline">
            Вернуться на главную
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
