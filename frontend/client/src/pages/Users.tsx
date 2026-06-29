import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  status: 'Active' | 'Expired' | 'Banned';
  lastLogin: string;
  ip: string;
  hwid: string;
}

export default function Users() {
  const users: User[] = [
    {
      id: '1',
      username: 'developer1',
      status: 'Active',
      lastLogin: '2026-06-29',
      ip: '192.168.1.100',
      hwid: 'HWID-ABC123XYZ',
    },
    {
      id: '2',
      username: 'user_test',
      status: 'Active',
      lastLogin: '2026-06-28',
      ip: '10.0.0.50',
      hwid: 'HWID-DEF456UVW',
    },
    {
      id: '3',
      username: 'expired_user',
      status: 'Expired',
      lastLogin: '2026-05-15',
      ip: '172.16.0.1',
      hwid: 'HWID-GHI789RST',
    },
  ];

  const handleDeleteUser = (_id: string) => {
    toast.success('Usuario eliminado');
    // Aquí se conectaría con la API real
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Expired':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Banned':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Gestión de Usuarios</h2>
            <p className="text-muted-foreground mt-2">Monitorea y administra los usuarios registrados</p>
          </div>
        </div>

        {/* Users Table */}
        <Card className="p-6 border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>HWID</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-card/50">
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                    <TableCell className="font-mono text-sm">{user.ip}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{user.hwid}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
