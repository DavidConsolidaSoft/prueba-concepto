import React from 'react';
import { Producto, UNIDADES_TRABAJO } from './productoTypes';

interface ProductoCaracteristicasProps {
  producto: Producto;
  isEditable: boolean;
  isCreatingInternal: boolean;
  isMobile: boolean;
  onFieldChange: (field: keyof Producto, value: any) => void;
}

export const ProductoCaracteristicas: React.FC<ProductoCaracteristicasProps> = ({
  producto,
  isEditable,
  isCreatingInternal,
  isMobile,
  onFieldChange
}) => {
  const handleInputChange = (field: keyof Producto) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onFieldChange(field, value);
  };

  if (isMobile) {
    return (
      <div className="bg-secondary rounded-md p-3 mb-3">
        <h3 className="text-lg font-semibold mb-3">Características y Maestros</h3>
        
        <div className="space-y-3">
          {/* Unidad de Trabajo */}
          <div>
            <label className="block text-sm text-secondary mb-1">Unidad de Trabajo:</label>
            <select
              value={producto.unidadTrabajo}
              onChange={handleInputChange('unidadTrabajo')}
              className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isEditable ? 'bg-tertiary' : 'bg-primary'
              }`}
              disabled={!isEditable}
            >
              {UNIDADES_TRABAJO.map(unidad => (
                <option key={unidad} value={unidad}>{unidad}</option>
              ))}
            </select>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-secondary mb-1">Precio con Impuesto:</label>
              <input
                type="number"
                step="0.01"
                value={producto.precioConImpuesto}
                onChange={handleInputChange('precioConImpuesto')}
                className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isEditable ? 'bg-tertiary' : 'bg-primary'
                }`}
                disabled={!isEditable}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Precio sin Impuesto:</label>
              <input
                type="number"
                step="0.01"
                value={producto.precioSinImpuesto}
                onChange={handleInputChange('precioSinImpuesto')}
                className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isEditable ? 'bg-tertiary' : 'bg-primary'
                }`}
                disabled={!isEditable}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Existencias */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-secondary mb-1">Existencia Mínima:</label>
              <input
                type="number"
                step="0.01"
                value={producto.existenciaMinima}
                onChange={handleInputChange('existenciaMinima')}
                className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isEditable ? 'bg-tertiary' : 'bg-primary'
                }`}
                disabled={!isEditable}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-secondary mb-1">Existencia Máxima:</label>
              <input
                type="number"
                step="0.01"
                value={producto.existenciaMaxima}
                onChange={handleInputChange('existenciaMaxima')}
                className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isEditable ? 'bg-tertiary' : 'bg-primary'
                }`}
                disabled={!isEditable}
                placeholder="0"
              />
            </div>
          </div>

          {/* Tiempo de Reposición */}
          <div>
            <label className="block text-sm text-secondary mb-1">Tiempo de Reposición (días):</label>
            <input
              type="number"
              value={producto.tiempoReposicion}
              onChange={handleInputChange('tiempoReposicion')}
              className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isEditable ? 'bg-tertiary' : 'bg-primary'
              }`}
              disabled={!isEditable}
              placeholder="0"
            />
          </div>
        </div>
      </div>
    );
  }

  // Versión escritorio
  return (
    <div className="bg-secondary rounded-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Características y Maestros</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Unidad de Trabajo */}
        <div>
          <label className="block text-sm text-secondary mb-1">Unidad de Trabajo:</label>
          <select
            value={producto.unidadTrabajo}
            onChange={handleInputChange('unidadTrabajo')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
          >
            {UNIDADES_TRABAJO.map(unidad => (
              <option key={unidad} value={unidad}>{unidad}</option>
            ))}
          </select>
        </div>

        {/* Consumo Mínimo */}
        <div>
          <label className="block text-sm text-secondary mb-1">Consumo Mínimo (diario):</label>
          <input
            type="number"
            step="0.01"
            value={producto.consumoMinimo}
            onChange={handleInputChange('consumoMinimo')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>

        {/* Consumo Máximo */}
        <div>
          <label className="block text-sm text-secondary mb-1">Consumo Máximo (diario):</label>
          <input
            type="number"
            step="0.01"
            value={producto.consumoMaximo}
            onChange={handleInputChange('consumoMaximo')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>

        {/* Tiempo de Reposición */}
        <div>
          <label className="block text-sm text-secondary mb-1">Tiempo de Reposición (días):</label>
          <input
            type="number"
            value={producto.tiempoReposicion}
            onChange={handleInputChange('tiempoReposicion')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0"
          />
        </div>

        {/* Promedio Ventas */}
        <div>
          <label className="block text-sm text-secondary mb-1">Promedio diario Ventas:</label>
          <input
            type="number"
            step="0.01"
            value={producto.promedioVentas}
            onChange={handleInputChange('promedioVentas')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>

        {/* Existencia Mínima */}
        <div>
          <label className="block text-sm text-secondary mb-1">Existencia Mínima:</label>
          <input
            type="number"
            step="0.01"
            value={producto.existenciaMinima}
            onChange={handleInputChange('existenciaMinima')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>

        {/* Existencia Máxima */}
        <div>
          <label className="block text-sm text-secondary mb-1">Existencia Máxima:</label>
          <input
            type="number"
            step="0.01"
            value={producto.existenciaMaxima}
            onChange={handleInputChange('existenciaMaxima')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>

        {/* Punto de Pedido */}
        <div>
          <label className="block text-sm text-secondary mb-1">Punto de Pedido:</label>
          <input
            type="number"
            step="0.01"
            value={producto.puntoPedido}
            onChange={handleInputChange('puntoPedido')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>

        {/* Factor Producción */}
        <div>
          <label className="block text-sm text-secondary mb-1">Factor Producción:</label>
          <input
            type="number"
            step="0.01"
            value={producto.factorProduccion}
            onChange={handleInputChange('factorProduccion')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="1.00"
          />
        </div>

        {/* Peso */}
        <div>
          <label className="block text-sm text-secondary mb-1">Peso:</label>
          <input
            type="number"
            step="0.01"
            value={producto.peso}
            onChange={handleInputChange('peso')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>

        {/* Precio Con Impuesto */}
        <div>
          <label className="block text-sm text-secondary mb-1">Precio Con Impuesto:</label>
          <input
            type="number"
            step="0.01"
            value={producto.precioConImpuesto}
            onChange={handleInputChange('precioConImpuesto')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>

        {/* Precio Sin Impuesto */}
        <div>
          <label className="block text-sm text-secondary mb-1">Precio sin impuesto:</label>
          <input
            type="number"
            step="0.01"
            value={producto.precioSinImpuesto}
            onChange={handleInputChange('precioSinImpuesto')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};