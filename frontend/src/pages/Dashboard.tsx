import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUp, Zap, Users, Lock } from 'lucide-react';
import { fetchSellerData } from '@/api';

interface Stats {
  totalLicenses: number;
  activeLicenses: number;
  totalUsers: number;
  activeUsers: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalLicenses: 0,
    activeLicenses: 0,
    totalUsers: 0,
    activeUsers: 0,
  });

  const [loading, setLoading] = useState(true);
  const ownerId = 'testowner'; // Hardcoded for now, should come from auth context
  const secret = 'testsecret'; // Hardcoded for now, should come from auth context

  useEffect(() => {
    const loadStats = async () => {
      try {
        const licensesData = await fetchSellerData('licenses', ownerId, secret);
        const usersData = await fetchSellerData('users', ownerId, secret);

        const totalLicenses = licensesData.length;
        const activeLicenses = licensesData.filter((lic: any) => lic.status === 'Used').length;
        const totalUsers = usersData.length;
        const activeUsers = usersData.filter((user: any) => user.status === 'Active').length;

        setStats({
          totalLicenses,
          activeLicenses,
          totalUsers,
          activeUsers,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const chartData = [
    { name: 'Ene', licenses: 40, users: 24 },
    { name: 'Feb', licenses: 50, users: 32 },
    { name: 'Mar', licenses: 65, users: 45 },
    { name: 'Abr', licenses: 80, users: 58 },
    { name: 'May', licenses: 100, users: 72 },
    { name: 'Jun', licenses: 142, users: 76 },
  ];

  const statCards = [
    {
      title: 'Total de Licencias',
      value: stats.totalLicenses,
      icon: <Lock className="w-6 h-6" />,
      color: 'from-accent to-cyan-500',
    },
    {
      title: 'Licencias Activas',
      value: stats.activeLicenses,
      icon: <Zap className="w-6 h-6" />,
      color: 'from-secondary to-purple-500',
    },
    {
      title: 'Total de Usuarios',
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-400',
    },
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: <ArrowUp className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-400',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Bienvenido al Dashboard</h2>
            <p className="text-muted-foreground mt-2">Gestiona tus licencias y usuarios en tiempo real</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Generar Licencias
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <Card
              key={idx}
              className="p-6 border-border hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold mt-2">{loading ? '...' : stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 border-border">
            <h3 className="text-lg font-bold mb-6">Tendencia de Crecimiento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#CBD5E1" />
                <YAxis stroke="#CBD5E1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  cursor={{ fill: 'rgba(0, 217, 255, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="licenses" fill="#00D9FF" radius={[8, 8, 0, 0]} />
                <Bar dataKey="users" fill="#A855F7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border-border flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-6">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  📋 Ver Licencias
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  👥 Gestionar Usuarios
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  ⚙️ Configuración
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
