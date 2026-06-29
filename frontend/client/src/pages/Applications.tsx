import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Application {
  id: string;
  name: string;
  version: string;
  status: 'Active' | 'Paused';
  ownerId: string;
}

export default function Applications() {
  const [apps, setApps] = useState<Application[]>([
    {
      id: '1',
      name: 'MyTestApp',
      version: '1.0.0',
      status: 'Active',
      ownerId: 'testowner',
    },
    {
      id: '2',
      name: 'SecureApp',
      version: '2.1.5',
      status: 'Active',
      ownerId: 'owner2',
    },
    {
      id: '3',
      name: 'LegacyApp',
      version: '0.9.0',
      status: 'Paused',
      ownerId: 'owner3',
    },
  ]);

  const handleDeleteApp = (id: string) => {
    setApps(apps.filter((app) => app.id !== id));
    toast.success('Aplicación eliminada');
  };

  const handleToggleStatus = (id: string) => {
    setApps(
      apps.map((app) =>
        app.id === id
          ? { ...app, status: app.status === 'Active' ? 'Paused' : 'Active' }
          : app
      )
    );
    toast.success('Estado actualizado');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Gestión de Aplicaciones</h2>
            <p className="text-muted-foreground mt-2">Administra tus aplicaciones registradas</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Plus size={18} />
            Nueva Aplicación
          </Button>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card
              key={app.id}
              className="p-6 border-border hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{app.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">v{app.version}</p>
                  </div>
                  <Badge
                    variant={app.status === 'Active' ? 'default' : 'outline'}
                    className={
                      app.status === 'Active'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Owner ID:</span>{' '}
                    <span className="font-mono">{app.ownerId}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(app.id)}
                  className="flex-1"
                >
                  <Edit2 size={16} className="mr-2" />
                  Cambiar Estado
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteApp(app.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
