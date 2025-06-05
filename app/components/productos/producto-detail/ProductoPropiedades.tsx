import React from 'react';
import { Producto } from './productoTypes';

interface ProductoPropiedadesProps {
  producto: Producto;
  isEditable: boolean;
  isCreatingInternal: boolean;
  isMobile: boolean;
  onFieldChange: (field: keyof Producto, value: any) => void;
}

export const ProductoPropiedades: React.FC<ProductoPropiedadesProps> = ({
  producto,
  isEditable,
  isCreatingInternal,
  isMobile,
  onFieldChange
}) => {
  const handleCheckboxChange = (field: keyof Producto) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFieldChange(field, e.target.checked);
  };

  // Definir las propiedades organizadas en grupos
  const propiedadesBasicas = [
    { key: 'activo' as keyof Producto, label: 'Activo', description: 'Producto activo en el sistema' },
    { key: 'exento' as keyof Producto, label: 'Exento', description: 'Exento de impuestos' },
    { key: 'enVenta' as keyof Producto, label: 'En venta', description: 'Disponible para venta' },
    { key: 'esServicio' as keyof Producto, label: 'Servicios', description: 'Es un servicio' },
  ];

  const propiedadesProduccion = [
    { key: 'ingredienteProduccion' as keyof Producto, label: 'Ing. Producción', description: 'Ingrediente de producción' },
    { key: 'esControlado' as keyof Producto, label: 'Es Controlado', description: 'Producto controlado' },
    { key: 'productoGenerico' as keyof Producto, label: 'Producto Genérico', description: 'Producto genérico' },
  ];

  const propiedadesFiscales = [
    { key: 'noSujeto' as keyof Producto, label: 'No sujeto', description: 'No sujeto a impuestos' },
    { key: 'noAplicaDescuento' as keyof Producto, label: 'No aplica Desc.', description: 'No aplica descuentos' },
    { key: 'impuestoSeguridad' as keyof Producto, label: 'Impuesto a la seguridad', description: 'Aplica impuesto de seguridad' },
  ];

  const propiedadesEspeciales = [
    { key: 'taller' as keyof Producto, label: 'Taller', description: 'Producto de taller' },
    { key: 'propio' as keyof Producto, label: 'Propio', description: 'Producto propio' },
    { key: 'vineta' as keyof Producto, label: 'Viñeta', description: 'Tiene viñeta' },
    { key: 'prepago' as keyof Producto, label: 'Prepago', description: 'Producto prepago' },
    { key: 'disponibilidad' as keyof Producto, label: 'Disponibilidad', description: 'Disponible' },
    { key: 'noAfecto' as keyof Producto, label: 'No Afecto', description: 'No afecto' },
    { key: 'sinPropina' as keyof Producto, label: 'Sin propina', description: 'Sin propina' },
  ];

  const CheckboxGroup = ({ 
    title, 
    properties, 
    columns = 2 
  }: { 
    title: string; 
    properties: typeof propiedadesBasicas; 
    columns?: number;
  }) => (
    <div className="mb-4">
      <h4 className="text-md font-medium mb-3 text-primary border-b border-tertiary pb-1">{title}</h4>
      <div className={`grid ${isMobile ? 'grid-cols-1' : `grid-cols-${columns}`} gap-2`}>
        {properties.map(({ key, label, description }) => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={producto[key] as boolean}
              onChange={handleCheckboxChange(key)}
              className="mr-2 h-4 w-4 text-blue-600 bg-tertiary border-secondary rounded focus:ring-blue-500 focus:ring-2"
              disabled={!isEditable}
            />
            <label 
              htmlFor={key} 
              className="text-sm text-primary cursor-pointer"
              title={description}
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="bg-secondary rounded-md p-3 mb-3">
        <h3 className="text-lg font-semibold mb-4">Propiedades</h3>
        
        <CheckboxGroup title="Propiedades Básicas" properties={propiedadesBasicas} columns={1} />
        <CheckboxGroup title="Producción" properties={propiedadesProduccion} columns={1} />
        <CheckboxGroup title="Fiscales" properties={propiedadesFiscales} columns={1} />
        <CheckboxGroup title="Especiales" properties={propiedadesEspeciales} columns={1} />
      </div>
    );
  }

  // Versión escritorio
  return (
    <div className="bg-secondary rounded-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Propiedades</h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <CheckboxGroup title="Propiedades Básicas" properties={propiedadesBasicas} columns={1} />
          <CheckboxGroup title="Producción" properties={propiedadesProduccion} columns={1} />
        </div>
        
        <div>
          <CheckboxGroup title="Fiscales" properties={propiedadesFiscales} columns={1} />
          <CheckboxGroup title="Especiales" properties={propiedadesEspeciales} columns={1} />
        </div>
      </div>

      {/* Vista del producto - placeholder para imagen */}
      <div className="mt-6 border-t border-tertiary pt-4">
        <h4 className="text-md font-medium mb-3 text-primary">Vista del producto</h4>
        <div className="w-full h-48 bg-tertiary rounded-lg flex items-center justify-center border-2 border-dashed border-gray-400">
          <div className="text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002-2z" />
            </svg>
            <p className="text-sm">Imagen del producto</p>
            <p className="text-xs mt-1">Formatos permitidos: JPG, PNG, GIF</p>
            {isEditable && (
              <button 
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                onClick={() => console.log('Subir imagen')}
              >
                Subir Imagen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};