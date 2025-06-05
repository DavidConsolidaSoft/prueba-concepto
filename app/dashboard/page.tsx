'use client';
import AppLayout from '@/app/components/layout/AppLayout';
import RightBar from '@/app/components/layout/RightBar';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Contenido principal del dashboard */}
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Facturas Totales</h2>
              <p className="text-4xl font-bold">120</p>
              <p className="text-green-500 mt-2">+12% este mes</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Ingresos</h2>
              <p className="text-4xl font-bold">$45,782</p>
              <p className="text-red-500 mt-2">-3% este mes</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Clientes Activos</h2>
              <p className="text-4xl font-bold">38</p>
              <p className="text-green-500 mt-2">+5% este mes</p>
            </div>
          </div>
          <div className="mt-8 bg-gray-900 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-4">
                <p className="font-medium">Factura creada: S00090</p>
                <p className="text-gray-400">Cliente: Interior Key S.A de C.V</p>
                <p className="text-sm text-gray-400">Hace 2 horas</p>
              </div>
              <div className="border-b border-gray-700 pb-4">
                <p className="font-medium">Factura pagada: S00085</p>
                <p className="text-gray-400">Cliente: Key Process Black Pearl Sea S.A de C.V</p>
                <p className="text-sm text-gray-400">Hace 5 horas</p>
              </div>
              <div className="border-b border-gray-700 pb-4">
                <p className="font-medium">Nuevo cliente registrado</p>
                <p className="text-gray-400">Tecnología Avanzada S.A de C.V</p>
                <p className="text-sm text-gray-400">Ayer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}