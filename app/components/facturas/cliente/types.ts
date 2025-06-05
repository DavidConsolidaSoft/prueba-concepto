export interface Cliente {
  id: number;
  codigo: string;
  nombre: string;
  tipoDocumento: string;
  numeroRegistro: string;
  tipoCliente: string;
  giro: string;
  razonSocial: string;
  conglomerado: string;
  limiteCredito: string;
  email: string;
  emailAlterno: string;
  telefono: string;
  telefonoAlterno: string;
  pais: string;
  departamento: string;
  municipio: string;
  direccion: string;
  saldoDisponible?: string;
  vencidas?: string | number;
  montoAdeudado?: string | number;
  verificadoDICOM: boolean;
  retencion: boolean;
  aplicaIVAPropia: boolean;
  noRestringirCredito: boolean;
  tasaCero: boolean;
  percepcion: boolean;
  gobierno: boolean;
  noSujeto: boolean;
  propioTalSol: boolean;
  autoConsumo: boolean;
  clienteExportacion: boolean;
  excentoImpuestos: boolean;
}

export interface ClienteSelectorProps {
  onClose: () => void;
  onClienteSelected: (cliente: Cliente) => void;
  clienteActual?: Cliente | null;
  isEdition?: boolean;
}

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export interface ClienteListProps {
  clientes: Cliente[];
  filteredClientes: Cliente[];
  selectedCliente: Cliente | null;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectCliente: (cliente: Cliente) => void;
  onCreateNewClient: () => void;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSearch: (query: string) => void;
  searchMode: boolean;
}

export interface ClienteFormHeaderProps {
  mode: 'view' | 'edit' | 'create';
  onListView: () => void;
  onCreateNew: () => void;
  onRequestUnlock: () => void;
}

export interface ClienteFormActionsProps {
  mode: 'list' | 'view' | 'edit' | 'create';
  editMode: boolean;
  onCancelEdit: () => void;
  onSaveChanges: () => void;
  onShowList: () => void;
  onConfirmSelection: () => void;
  onDeleteCliente?: () => void;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

// Constantes
export const CLIENTE_VACIO: Cliente = {
  id: 0,
  codigo: '',
  nombre: '',
  tipoDocumento: 'NIT',
  numeroRegistro: '',
  tipoCliente: '1',
  giro: '',
  razonSocial: '',
  conglomerado: '',
  limiteCredito: '$0.00',
  email: '',
  emailAlterno: '',
  telefono: '',
  telefonoAlterno: '',
  pais: 'El Salvador',
  departamento: 'San Salvador',
  municipio: '',
  direccion: '',
  saldoDisponible: '$0.00',
  vencidas: '0.00',
  montoAdeudado: '0.00',
  verificadoDICOM: false,
  retencion: false,
  aplicaIVAPropia: false,
  noRestringirCredito: false,
  tasaCero: false,
  percepcion: false,
  gobierno: false,
  noSujeto: false,
  propioTalSol: false,
  autoConsumo: false,
  clienteExportacion: false,
  excentoImpuestos: false
};