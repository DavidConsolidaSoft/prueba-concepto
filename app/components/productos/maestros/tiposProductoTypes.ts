// Interfaces para los maestros de productos
export interface TipoProducto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface CategoriaProducto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface MarcaProducto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
}

// Props para los selectores
export interface TipoProductoSelectorProps {
  onClose: () => void;
  onTipoSelected: (tipo: TipoProducto) => void;
  tipoActual?: TipoProducto | null;
}

export interface CategoriaProductoSelectorProps {
  onClose: () => void;
  onCategoriaSelected: (categoria: CategoriaProducto) => void;
  categoriaActual?: CategoriaProducto | null;
}

export interface MarcaProductoSelectorProps {
  onClose: () => void;
  onMarcaSelected: (marca: MarcaProducto) => void;
  marcaActual?: MarcaProducto | null;
}

// Props genéricas para reutilizar componentes
export interface MaestroListProps<T> {
  items: T[];
  filteredItems: T[];
  selectedItem: T | null;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectItem: (item: T) => void;
  onCreateNew: () => void;
  isLoading: boolean;
  entityName: string; // "Tipo", "Categoría", "Marca"
}

export interface MaestroFormHeaderProps {
  mode: 'view' | 'edit' | 'create';
  entityName: string;
  onListView: () => void;
  onCreateNew: () => void;
  onRequestUnlock: () => void;
}

export interface MaestroFormActionsProps {
  mode: 'list' | 'view' | 'edit' | 'create';
  editMode: boolean;
  entityName: string;
  onCancelEdit: () => void;
  onSaveChanges: () => void;
  onShowList: () => void;
  onConfirmSelection: () => void;
  onDelete?: () => void;
}

// Constantes con datos de ejemplo
export const TIPOS_PRODUCTO_EJEMPLO: TipoProducto[] = [
  {
    id: 1,
    codigo: 'GUIT',
    nombre: 'GUITARRA',
    descripcion: 'Instrumentos de cuerda tipo guitarra',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 2,
    codigo: 'CUER',
    nombre: 'CUERDAS',
    descripcion: 'Cuerdas para instrumentos musicales',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 3,
    codigo: 'CABL',
    nombre: 'CABLE',
    descripcion: 'Cables para instrumentos musicales',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 4,
    codigo: 'SERV',
    nombre: 'SERVICIO',
    descripcion: 'Servicios varios',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 5,
    codigo: 'HILO',
    nombre: 'MP HILO BORDADO',
    descripcion: 'Materia prima hilo para bordado',
    activo: true,
    fechaCreacion: '2024-01-15'
  }
];

export const CATEGORIAS_PRODUCTO_EJEMPLO: CategoriaProducto[] = [
  {
    id: 1,
    codigo: 'MUS',
    nombre: 'MUSICA',
    descripcion: 'Productos relacionados con música',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 2,
    codigo: 'OME',
    nombre: 'OMEGA',
    descripcion: 'Productos línea Omega',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 3,
    codigo: 'SRV',
    nombre: 'SERVICIOS',
    descripcion: 'Servicios diversos',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 4,
    codigo: 'ELE',
    nombre: 'ELECTRONICA',
    descripcion: 'Productos electrónicos',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 5,
    codigo: 'ACC',
    nombre: 'ACCESORIOS',
    descripcion: 'Accesorios diversos',
    activo: true,
    fechaCreacion: '2024-01-15'
  }
];

export const MARCAS_PRODUCTO_EJEMPLO: MarcaProducto[] = [
  {
    id: 1,
    codigo: 'FEND',
    nombre: 'FENDER',
    descripcion: 'Instrumentos musicales Fender',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 2,
    codigo: 'GIBS',
    nombre: 'GIBSON',
    descripcion: 'Instrumentos musicales Gibson',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 3,
    codigo: 'OMEG',
    nombre: 'OMEGA',
    descripcion: 'Productos marca Omega',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 4,
    codigo: 'YAMA',
    nombre: 'YAMAHA',
    descripcion: 'Instrumentos musicales Yamaha',
    activo: true,
    fechaCreacion: '2024-01-15'
  },
  {
    id: 5,
    codigo: 'ROLA',
    nombre: 'ROLAND',
    descripcion: 'Equipos musicales Roland',
    activo: true,
    fechaCreacion: '2024-01-15'
  }
];

// Funciones helper para crear elementos vacíos
export const createEmptyTipoProducto = (): TipoProducto => ({
  id: 0,
  codigo: '',
  nombre: '',
  descripcion: '',
  activo: true
});

export const createEmptyCategoriaProducto = (): CategoriaProducto => ({
  id: 0,
  codigo: '',
  nombre: '',
  descripcion: '',
  activo: true
});

export const createEmptyMarcaProducto = (): MarcaProducto => ({
  id: 0,
  codigo: '',
  nombre: '',
  descripcion: '',
  activo: true
});