import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSellerData, postSellerData } from '@/api';

interface License {
  id: string;
  key: string;
  status: 'Used' | 'Not Used';
  subLevel: number;
  expiresAt: string;
}

export default function Licenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [count, setCount] = useState(10);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(true);

  const ownerId = 'testowner'; // Hardcoded for now
  const secret = 'testsecret'; // Hardcoded for now

  const loadLicenses = async () => {
    setLoading(true);
    try {
      const data = await fetchSellerData('licenses', ownerId, secret);
      setLicenses(data.map((lic: any) => ({
        id: lic.id,
        key: lic.key,
        status: lic.status,
        subLevel: lic.subLevel,
        expiresAt: new Date(lic.expiresAt).toLocaleDateString(),
      })));
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast.error('Error al cargar las licencias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  const handleGenerateLicenses = async () => {
    if (count < 1 || duration < 1) {
      toast.error('La cantidad y duración deben ser al menos 1.');
      return;
    }
    try {
      const data = await postSellerData('licenses/generate', { count, durationDays: duration, subLevel: 1 }, ownerId, secret);
      toast.success(`${data.licenses.length} licencias generadas exitosamente.`);
      loadLicenses(); // Recargar licencias después de generar
    } catch (error) {
      console.error('Error generating licenses:', error);
      toast.error('Error al generar licencias.');
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Licencia copiada al portapapeles');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Gestión de Licencias</h2>
            <p className="text-muted-foreground mt-2">Genera y administra claves de licencia</p>
          </div>
        </div>

        {/* Generate Section */}
        <Card className="p-8 border-border bg-gradient-to-br from-card to-card/50">
          <h3 className="text-xl font-bold mb-6">Generar Nuevas Licencias</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Cantidad</label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min="1"
                max="1000"
                className="bg-input border-border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duración (días)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="1"
                max="3650"
                className="bg-input border-border"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateLicenses}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <Plus size={18} />
                Generar
              </Button>
            </div>
          </div>
        </Card>

        {/* Licenses Table */}
        <Card className="p-6 border-border overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Licencias Activas</h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={16} />
              Exportar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Clave de Licencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Cargando licencias...
                    </TableCell>
                  </TableRow>
                ) : licenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay licencias disponibles.
                    </TableCell>
                  </TableRow>
                ) : (
                  licenses.map((license) => (
                    <TableRow key={license.id} className="border-border hover:bg-card/50">
                      <TableCell className="font-mono text-sm">{license.key}</TableCell>
                      <TableCell>
                        <Badge
                          variant={license.status === 'Used' ? 'default' : 'outline'}
                          className={
                            license.status === 'Used'
                              ? 'bg-accent text-accent-foreground'
                              : 'border-secondary text-secondary'
                          }
                        >
                          {license.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{license.subLevel}</TableCell>
                      <TableCell>{license.expiresAt}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(license.key)}
                          className="gap-2"
                        >
                          <Copy size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
