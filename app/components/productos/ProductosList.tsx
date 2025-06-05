'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import NewProductoButton from './NewProductoButton';

// Tipos para los productos
interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  tipoProducto: string;
  categoria: string;
  marca?: string;
  precio: number;
  existencias: number;
  activo: boolean;
  enVenta: boolean;
  esServicio: boolean;
}

interface ProductosListProps {
  onSelectProducto: (id: string) => void;
  selectedProductoId: string | null;
  onCreateProducto?: () => void;
}

// Datos de ejemplo - hardcodeados como solicitaste
const PRODUCTOS_EJEMPLO: Producto[] = [
  {
    id: '1',
    codigo: '001-834WBL',
    nombre: 'GUITARRA ELECT. PLAYER II TELECASTER WHITE BLONDE RW FENDER',
    tipoProducto: 'GUITARRA',
    categoria: 'MUSICA',
    marca: 'FENDER',
    precio: 850.00,
    existencias: 5,
    activo: true,
    enVenta: true,
    esServicio: false
  },
  {
    id: '2',
    codigo: '003-1030',
    nombre: '150R SET DE CUERDAS P/ GUIT. ELECTRICA ORIGINAL PURE NICKEL 10-46 FENDER',
    tipoProducto: 'CUERDAS',
    categoria: 'MUSICA',
    marca: 'FENDER',
    precio: 12.50,
    existencias: 25,
    activo: true,
    enVenta: true,
    esServicio: false
  },
  {
    id: '3',
    codigo: '012-230',
    nombre: 'CABLE P/ INSTRUMENTO DE 1/4 A 1/4 DE 10FT TOM DELONGE FENDER',
    tipoProducto: 'CABLE',
    categoria: 'MUSICA',
    marca: 'FENDER',
    precio: 35.00,
    existencias: 10,
    activo: true,
    enVenta: true,
    esServicio: false
  },
  {
    id: '4',
    codigo: 'SRV-001',
    nombre: 'Servicio de Mantenimiento de Guitarra',
    tipoProducto: 'SERVICIO',
    categoria: 'SERVICIOS',
    marca: '',
    precio: 25.00,
    existencias: 0,
    activo: true,
    enVenta: true,
    esServicio: true
  },
  {
    id: '5',
    codigo: '006-OMEGA',
    nombre: 'MP HILO BORDADO OMEGA 06 HILO OMEGA',
    tipoProducto: 'MP HILO BORDADO',
    categoria: 'OMEGA',
    marca: 'OMEGA',
    precio: 8.75,
    existencias: 100,
    activo: true,
    enVenta: true,
    esServicio: false
  }
];

type FilterType = 'Todos' | 'Activos' | 'Inactivos' | 'EnVenta' | 'Servicios';

export default function ProductosList({ onSelectProducto, selectedProductoId, onCreateProducto }: ProductosListProps) {
  const [filter, setFilter] = useState<FilterType>('Activos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [productos] = useState<Producto[]>(PRODUCTOS_EJEMPLO);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Filtrar productos
  useEffect(() => {
    let filtered = productos.filter(producto => {
      // Filtro por término de búsqueda
      const matchesSearch = searchTerm === '' || 
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.tipoProducto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.marca && producto.marca.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Filtro por estado
      switch (filter) {
        case 'Activos':
          return producto.activo;
        case 'Inactivos':
          return !producto.activo;
        case 'EnVenta':
          return producto.enVenta;
        case 'Servicios':
          return producto.esServicio;
        default:
          return true;
      }
    });

    setFilteredProductos(filtered);
  }, [productos, filter, searchTerm]);

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Limpiar todos los filtros
  const limpiarTodosLosFiltros = () => {
    setFilter('Activos');
    setSearchTerm('');
  };

  // Determinar si hay filtros activos
  const hasFiltrosActivos = searchTerm.trim() !== '' || filter !== 'Activos';

  // Function to determine button class based on filter status
  const getButtonClass = (buttonFilter: FilterType) => {
    const isActive = filter === buttonFilter;
    let borderClass = '';
    
    if (isActive) {
      switch (buttonFilter) {
        case 'Activos':
          borderClass = 'border-b-2 border-green-500';
          break;
        case 'Inactivos':
          borderClass = 'border-b-2 border-red-500';
          break;
        case 'EnVenta':
          borderClass = 'border-b-2 border-blue-500';
          break;
        case 'Servicios':
          borderClass = 'border-b-2 border-purple-500';
          break;
        default:
          borderClass = 'border-b-2 border-gray-500';
      }
    }
    
    return `flex-1 py-2 text-center text-sm ${isActive ? borderClass + ' text-primary bg-tertiary' : 'text-tertiary hover:text-primary'}`;
  };

  // Function to get icon color based on filter
  const getIconColor = (buttonFilter: FilterType) => {
    switch (buttonFilter) {
      case 'Activos':
        return 'text-green-400';
      case 'Inactivos':
        return 'text-red-400';
      case 'EnVenta':
        return 'text-blue-400';
      case 'Servicios':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-full h-full bg-secondary flex flex-col transition-colors duration-300">
      {/* Título y búsqueda - área fija */}
      <div className="p-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-primary">Productos</h2>
          <NewProductoButton onClick={onCreateProducto || (() => {})} variant="icon" />
        </div>
        <div className="flex items-center bg-tertiary rounded-md relative">
          <input
            type="text"
            placeholder={isMobile ? "Buscar..." : "Buscar por código, nombre, tipo o categoría"}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 bg-transparent focus:outline-none flex-1 text-primary text-sm pr-8"
          />
          {searchTerm && (
            <button 
              onClick={handleClearSearch}
              className="absolute right-10 text-tertiary hover:text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button className="px-3">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${searchTerm ? 'text-green-400' : 'text-primary'}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Filtros aplicados */}
      {hasFiltrosActivos && (
        <div className="px-4 pb-2 -mt-2 flex-shrink-0 flex items-center text-sm">
          <span className="text-green-400 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros:
          </span>
          
          {searchTerm && (
            <span className="bg-primary text-primary px-2 py-1 rounded-full text-xs mr-2">
              {searchTerm}
            </span>
          )}
          
          <span className={`${
            filter === 'Activos' ? 'bg-green-600' : 
            filter === 'Inactivos' ? 'bg-red-600' : 
            filter === 'EnVenta' ? 'bg-blue-600' : 
            filter === 'Servicios' ? 'bg-purple-600' :
            'bg-gray-600'
          } text-primary px-2 py-1 rounded-full text-xs mr-2`}>
            {filter}
          </span>
          
          <button 
            onClick={limpiarTodosLosFiltros}
            className="ml-auto text-secondary hover:text-primary text-xs"
          >
            {isMobile ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              'Limpiar filtros'
            )}
          </button>
        </div>
      )}
      
      {/* Filtros - área fija */}
      <div className="flex border-y border-[#ffffff] flex-shrink-0 text-xs">
        <button
          className={getButtonClass('Activos')}
          onClick={() => setFilter('Activos')}
        >
          {filter === 'Activos' && (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline-block mr-1 ${getIconColor('Activos')}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          Activos
        </button>
        <button
          className={getButtonClass('Inactivos')}
          onClick={() => setFilter('Inactivos')}
        >
          {filter === 'Inactivos' && (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline-block mr-1 ${getIconColor('Inactivos')}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 8.586l1.293-1.293a1 1 0 001.414 1.414z" clipRule="evenodd" />
            </svg>
          )}
          Inactivos
        </button>
        <button
          className={getButtonClass('EnVenta')}
          onClick={() => setFilter('EnVenta')}
        >
          {filter === 'EnVenta' && (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline-block mr-1 ${getIconColor('EnVenta')}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          En Venta
        </button>
        <button
          className={getButtonClass('Servicios')}
          onClick={() => setFilter('Servicios')}
        >
          {filter === 'Servicios' && (
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 inline-block mr-1 ${getIconColor('Servicios')}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          Servicios
        </button>
      </div>
      
      {/* Lista de productos - área con scroll */}
      <div className="flex-1 overflow-auto">
        {filteredProductos.length > 0 ? (
          <>
            {filteredProductos.map((producto) => (
              <div 
                key={producto.id}
                className={`border-b border-primary hover:bg-accent cursor-pointer transition-colors duration-200 ${
                  selectedProductoId === producto.id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectProducto(producto.id)}
              >
                <div className="px-3 py-3 pr-3 relative">
                  {/* Línea 1: Nombre del producto */}
                  <div className={`${isMobile ? 'text-sm' : 'text-base'} font-bold mb-1 text-primary`}>
                    {producto.nombre}
                  </div>
                  
                  {/* Línea 2: Código y Precio */}
                  <div className="flex justify-between">
                    <div className="font-base text-primary">{producto.codigo}</div>
                    <div className={`text-primary font-bold ${isMobile ? 'text-sm' : ''}`}>
                      ${producto.precio.toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Línea 3: Tipo y Existencias */}
                  <div className="flex justify-between mt-0">
                    <div className={`font-base ${isMobile ? 'text-xs' : ''} text-secondary`}>
                      {producto.tipoProducto}
                    </div>
                    <div className={`font-semibold ${isMobile ? 'text-xs' : ''} text-secondary`}>
                      {producto.esServicio ? 'Servicio' : `Stock: ${producto.existencias}`}
                    </div>
                  </div>
                  
                  {/* Línea 4: Categoría y Estado */}
                  <div className="flex justify-between">
                    <div className={`font-base ${isMobile ? 'text-xs' : ''} text-secondary`}>
                      {producto.categoria}
                    </div>
                    <div className="flex items-center gap-2">
                      {producto.activo && (
                        <span className={`font-bold ${isMobile ? 'text-xs' : ''} text-green-400`}>
                          Activo
                        </span>
                      )}
                      {producto.enVenta && (
                        <span className={`font-bold ${isMobile ? 'text-xs' : ''} text-blue-400`}>
                          En Venta
                        </span>
                      )}
                      {producto.esServicio && (
                        <span className={`font-bold ${isMobile ? 'text-xs' : ''} text-purple-400`}>
                          Servicio
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-tertiary p-6">
            {searchTerm ? (
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
                <p className="text-sm">No hay productos que coincidan con "<strong>{searchTerm}</strong>"</p>
              </div>
            ) : (
              'No se encontraron productos'
            )}
          </div>
        )}
      </div>
      
      {/* Contador de resultados */}
      <div className="py-2 px-4 text-xs text-secondary border-t border-secondary flex items-center">
        <span>
          {filteredProductos.length} de {productos.length} productos mostrados
        </span>
        
        {hasFiltrosActivos && (
          <button
            onClick={limpiarTodosLosFiltros}
            className="ml-auto text-secondary hover:text-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {isMobile ? '' : 'Limpiar filtros'}
          </button>
        )}
      </div>
    </div>
  );
}