import React, { useState, useEffect } from 'react';
import { Producto, TIPOS_PRODUCTO, CATEGORIAS_PRODUCTO, MARCAS_PRODUCTO } from './productoTypes';
import TipoProductoSelector from '../maestros/TipoProductoSelector';
import CategoriaProductoSelector from '../maestros/CategoriaProductoSelector';
import { MarcaProductoSelector } from '../maestros/MarcaProductoSelector';
import { TipoProducto, CategoriaProducto, MarcaProducto } from '../maestros/tiposProductoTypes';

interface ProductoInfoProps {
  producto: Producto;
  isEditable: boolean;
  isCreatingInternal: boolean;
  isMobile: boolean;
  onFieldChange: (field: keyof Producto, value: any) => void;
  onSelectorStateChange?: (selectorOpen: boolean) => void;
}

// Tipo para identificar cuál selector está abierto
type SelectorType = 'tipo' | 'categoria' | 'marca' | null;

export const ProductoInfo: React.FC<ProductoInfoProps> = ({
  producto,
  isEditable,
  isCreatingInternal,
  isMobile,
  onFieldChange,
  onSelectorStateChange 
}) => {
  // ✅ CAMBIO PRINCIPAL: Un solo estado para controlar qué selector está abierto
  const [activeSelector, setActiveSelector] = useState<SelectorType>(null);

  const handleInputChange = (field: keyof Producto) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onFieldChange(field, value);
  };

  // Manejadores para los selectores de maestros
  const handleTipoSelected = (tipo: TipoProducto) => {
    onFieldChange('tipoProducto', tipo.nombre);
    setActiveSelector(null); // Cerrar selector
  };

  const handleCategoriaSelected = (categoria: CategoriaProducto) => {
    onFieldChange('categoria', categoria.nombre);
    setActiveSelector(null); // Cerrar selector
  };

  const handleMarcaSelected = (marca: MarcaProducto) => {
    onFieldChange('marca', marca.nombre);
    setActiveSelector(null); // Cerrar selector
  };

  // ✅ Funciones para abrir selectores (cierran automáticamente otros)
  const openTipoSelector = () => setActiveSelector('tipo');
  const openCategoriaSelector = () => setActiveSelector('categoria');
  const openMarcaSelector = () => setActiveSelector('marca');

  // ✅ Función para cerrar cualquier selector
  const closeSelector = () => setActiveSelector(null);

  // ✅ ÚNICO useEffect para comunicar estado de selectores
  useEffect(() => {
    const isAnySelectorOpen = activeSelector !== null;
    
    // Comunicar al padre el estado actual
    if (onSelectorStateChange) {
      onSelectorStateChange(isAnySelectorOpen);
    }
    
    // Manejar el evento maestro (z-index) solo en desktop
    if (isAnySelectorOpen && !isMobile) {
      document.body.setAttribute('data-maestro-selector-open', 'true');
      const event = new CustomEvent('maestroSelectorStateChange', { 
        detail: { isOpen: true } 
      });
      document.dispatchEvent(event);
    } else {
      document.body.removeAttribute('data-maestro-selector-open');
      const event = new CustomEvent('maestroSelectorStateChange', { 
        detail: { isOpen: false } 
      });
      document.dispatchEvent(event);
    }

    return () => {
      document.body.removeAttribute('data-maestro-selector-open');
    };
  }, [activeSelector, isMobile, onSelectorStateChange]);

  // Componente para campo con selector de maestro
  const MaestroField = ({ 
    label, 
    value, 
    placeholder, 
    onSelectorOpen,
    disabled = false
  }: {
    label: string;
    value: string;
    placeholder: string;
    onSelectorOpen: () => void;
    disabled?: boolean;
  }) => (
    <div>
      <label className="block text-sm text-secondary mb-1">{label}:</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          className={`w-full p-2 pr-10 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isEditable && !disabled ? 'bg-tertiary cursor-pointer' : 'bg-primary'
          }`}
          disabled={!isEditable || disabled}
          placeholder={placeholder}
          readOnly
          onClick={isEditable && !disabled ? onSelectorOpen : undefined}
        />
        {isEditable && !disabled && (
          <button
            type="button"
            onClick={onSelectorOpen}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary"
            title={`Seleccionar ${label.toLowerCase()}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  const renderMobileVersion = () => (
    <div className="bg-secondary rounded-md p-3 mb-3">
      <h3 className="text-lg font-semibold mb-3">Información Básica</h3>
      
      <div className="space-y-3">
        {/* Código */}
        <div>
          <label className="block text-sm text-secondary mb-1">Código:</label>
          <input
            type="text"
            value={producto.codigo}
            onChange={handleInputChange('codigo')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Código del producto"
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm text-secondary mb-1">Nombre del Producto:</label>
          <input
            type="text"
            value={producto.nombre}
            onChange={handleInputChange('nombre')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Nombre completo del producto"
          />
        </div>

        {/* Tipo de Producto */}
        <MaestroField
          label="Tipo de Producto"
          value={producto.tipoProducto}
          placeholder="Seleccione un tipo"
          onSelectorOpen={openTipoSelector}
        />

        {/* Categoría */}
        <MaestroField
          label="Categoría"
          value={producto.categoria}
          placeholder="Seleccione una categoría"
          onSelectorOpen={openCategoriaSelector}
        />

        {/* Marca */}
        <MaestroField
          label="Marca"
          value={producto.marca}
          placeholder="Seleccione una marca"
          onSelectorOpen={openMarcaSelector}
        />

        {/* Ubicación */}
        <div>
          <label className="block text-sm text-secondary mb-1">Ubicación:</label>
          <input
            type="text"
            value={producto.ubicacion}
            onChange={handleInputChange('ubicacion')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Ubicación en bodega"
          />
        </div>

        {/* Referencias */}
        <div>
          <label className="block text-sm text-secondary mb-1">Referencia:</label>
          <input
            type="text"
            value={producto.referencia}
            onChange={handleInputChange('referencia')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Referencia principal"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm text-secondary mb-1">Descripción:</label>
          <textarea
            value={producto.descripcion}
            onChange={handleInputChange('descripcion')}
            rows={3}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Descripción detallada del producto"
          />
        </div>
      </div>
    </div>
  );

  const renderDesktopVersion = () => (
    <div className="bg-secondary rounded-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Código */}
        <div>
          <label className="block text-sm text-secondary mb-1">Código:</label>
          <input
            type="text"
            value={producto.codigo}
            onChange={handleInputChange('codigo')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Código del producto"
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm text-secondary mb-1">Nombre del Producto:</label>
          <input
            type="text"
            value={producto.nombre}
            onChange={handleInputChange('nombre')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Nombre completo del producto"
          />
        </div>

        {/* Tipo de Producto */}
        <MaestroField
          label="Tipo de Producto"
          value={producto.tipoProducto}
          placeholder="Seleccione un tipo"
          onSelectorOpen={openTipoSelector}
        />

        {/* Categoría */}
        <MaestroField
          label="Categoría"
          value={producto.categoria}
          placeholder="Seleccione una categoría"
          onSelectorOpen={openCategoriaSelector}
        />

        {/* Marca */}
        <MaestroField
          label="Marca"
          value={producto.marca}
          placeholder="Seleccione una marca"
          onSelectorOpen={openMarcaSelector}
        />

        {/* Ubicación */}
        <div>
          <label className="block text-sm text-secondary mb-1">Ubicación:</label>
          <input
            type="text"
            value={producto.ubicacion}
            onChange={handleInputChange('ubicacion')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Ubicación en bodega"
          />
        </div>

        {/* Referencia */}
        <div>
          <label className="block text-sm text-secondary mb-1">Referencia:</label>
          <input
            type="text"
            value={producto.referencia}
            onChange={handleInputChange('referencia')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Referencia principal"
          />
        </div>

        {/* Referencia 1 */}
        <div>
          <label className="block text-sm text-secondary mb-1">Referencia 1:</label>
          <input
            type="text"
            value={producto.referencia1}
            onChange={handleInputChange('referencia1')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Referencia secundaria"
          />
        </div>

        {/* Referencia 2 */}
        <div>
          <label className="block text-sm text-secondary mb-1">Referencia 2:</label>
          <input
            type="text"
            value={producto.referencia2}
            onChange={handleInputChange('referencia2')}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isEditable ? 'bg-tertiary' : 'bg-primary'
            }`}
            disabled={!isEditable}
            placeholder="Referencia adicional"
          />
        </div>
      </div>

      {/* Descripción - campo completo */}
      <div className="mt-4">
        <label className="block text-sm text-secondary mb-1">Descripción:</label>
        <textarea
          value={producto.descripcion}
          onChange={handleInputChange('descripcion')}
          rows={3}
          className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${
            isEditable ? 'bg-tertiary' : 'bg-primary'
          }`}
          disabled={!isEditable}
          placeholder="Descripción detallada del producto"
        />
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? renderMobileVersion() : renderDesktopVersion()}
      
      {/* ✅ Selectores de maestros - solo renderizar el activo */}
      {activeSelector === 'tipo' && !isMobile && (
        <div className="fixed right-[50px] top-14 bottom-0 w-96 border-l border-primary transform transition-transform duration-300 ease-in-out z-10">
          <TipoProductoSelector 
            onClose={closeSelector}
            onTipoSelected={handleTipoSelected}
            tipoActual={null}
          />
        </div>
      )}

      {activeSelector === 'categoria' && !isMobile && (
        <div className="fixed right-[50px] top-14 bottom-0 w-96 border-l border-primary transform transition-transform duration-300 ease-in-out z-10">
          <CategoriaProductoSelector 
            onClose={closeSelector}
            onCategoriaSelected={handleCategoriaSelected}
            categoriaActual={null}
          />
        </div>
      )}

      {activeSelector === 'marca' && !isMobile && (
        <div className="fixed right-[50px] top-14 bottom-0 w-96 z-10 border-l border-primary transform transition-transform duration-300 ease-in-out">
          <MarcaProductoSelector 
            onClose={closeSelector}
            onMarcaSelected={handleMarcaSelected}
            marcaActual={null}
          />
        </div>
      )}
    </>
  );
};