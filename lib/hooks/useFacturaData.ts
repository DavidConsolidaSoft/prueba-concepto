// lib/hooks/useFacturaData.ts
import { useState, useEffect } from 'react';
import ClienteService from '../api/clienteService';
import VendedorService from '../api/vendedorService';
import TipoDocumentoService from '../api/tipoDocumentoService';
import FormaPagoService from '../api/formaPagoService';
import CondicionPagoService from '../api/condicionPagoService';
import { 
  ClienteFactura, 
  VendedorFactura, 
  TipoDocumentoFactura,
  FormaPagoFactura,
  CondicionPagoFactura
} from '../types/facturaTypes';

interface UseFacturaDataResult {
  // Listas
  clientes: ClienteFactura[];
  vendedores: VendedorFactura[];
  tiposDocumento: TipoDocumentoFactura[];
  formasPago: FormaPagoFactura[];
  condicionesPago: CondicionPagoFactura[];
  
  // Estado de carga
  loading: boolean;
  error: string | null;
  
  // Métodos para refrescar datos
  refreshClientes: () => Promise<void>;
  refreshVendedores: () => Promise<void>;
  refreshTiposDocumento: () => Promise<void>;
  refreshFormasPago: () => Promise<void>;
  refreshCondicionesPago: () => Promise<void>;
}

export function useFacturaData(): UseFacturaDataResult {
  // Estados para cada tipo de datos
  const [clientes, setClientes] = useState<ClienteFactura[]>([]);
  const [vendedores, setVendedores] = useState<VendedorFactura[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumentoFactura[]>([]);
  const [formasPago, setFormasPago] = useState<FormaPagoFactura[]>([]);
  const [condicionesPago, setCondicionesPago] = useState<CondicionPagoFactura[]>([]);
  
  // Estados para manejar carga y errores
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Función para obtener clientes
  const refreshClientes = async () => {
    try {
      const clientesData = await ClienteService.getClientes(true);
      
      // Mapear respuesta de API a formato para la factura
      const clientesMapped = clientesData.items.map(cliente => ({
        id: cliente.clientes,
        nombre: cliente.nclientes || '',
        tipoDocumento: cliente.nit ? 'NIT' : 'DUI',
        numeroRegistro: cliente.registro || '',
        direccion: cliente.direccion || '',
        telefono: cliente.telefono1 || '',
        email: cliente.email || '',
        tipoCliente: String(cliente.tipcli || ''),
        contado: cliente.contado || false,
        credito: !cliente.contado,
        giro: cliente.giro || '',
        razonSocial: cliente.razonsoc || '',
        limiteCredito: cliente.limitecredito || 0,
        exento: cliente.exento || false,
        retencion: cliente.retencion || false,
        percepcion: cliente.percepcion || false,
        gobierno: cliente.gobierno || false
      }));
      
      setClientes(clientesMapped);
    } catch (err) {
      setError('Error al cargar clientes: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error al cargar clientes:', err);
    }
  };
  
  // Función para obtener vendedores
  const refreshVendedores = async () => {
    try {
      const vendedoresData = await VendedorService.getVendedores(true);
      
      // Mapear respuesta de API a formato para la factura
      const vendedoresMapped = vendedoresData.map(vendedor => ({
        id: vendedor.vendedor,
        nombre: vendedor.nvendedor,
        activo: vendedor.activo,
        tipo: vendedor.lvendedor ? 'Vendedor' : 'Cobrador',
        email: vendedor.vcorreo
      }));
      
      setVendedores(vendedoresMapped);
    } catch (err) {
      setError('Error al cargar vendedores: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error al cargar vendedores:', err);
    }
  };
  
  // Función para obtener tipos de documento
  const refreshTiposDocumento = async () => {
    try {
      const tiposDocumentoData = await TipoDocumentoService.getTiposDocumento(true, 'factura');
      
      // Mapear respuesta de API a formato para la factura
      const tiposDocumentoMapped = tiposDocumentoData.map(tipoDoc => ({
        id: tipoDoc.tipomov,
        nombre: tipoDoc.ntipomov,
        correlativo: tipoDoc.correl,
        aplicaIVA: true, // Valor por defecto, ajustar según API
        esFactura: tipoDoc.factura,
        esNotaCredito: tipoDoc.notacred,
        esExportacion: false, // Valor por defecto, ajustar según API
        preferido: false, // Valor por defecto, ajustar según API
        noAplicaIVA: false // Valor por defecto, ajustar según API
      }));
      
      setTiposDocumento(tiposDocumentoMapped);
    } catch (err) {
      setError('Error al cargar tipos de documento: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error al cargar tipos de documento:', err);
    }
  };
  
  // Función para obtener formas de pago
  const refreshFormasPago = async () => {
    try {
      const formasPagoResponse = await FormaPagoService.getFormasPagoPorTipo();
      
      // Obtener todas las formas de pago y combinarlas, dando prioridad a las frecuentes
      const todasFormasPago = [
        ...formasPagoResponse.frecuentes,
        ...formasPagoResponse.fijas.filter(fp => 
          !formasPagoResponse.frecuentes.some(freq => freq.formpago === fp.formpago)
        ),
        ...formasPagoResponse.por_obra.filter(fp => 
          !formasPagoResponse.frecuentes.some(freq => freq.formpago === fp.formpago)
        ),
        ...formasPagoResponse.comision.filter(fp => 
          !formasPagoResponse.frecuentes.some(freq => freq.formpago === fp.formpago)
        )
      ];
      
      // Mapear respuesta de API a formato para la factura
      const formasPagoMapped = todasFormasPago.map(formaPago => ({
        id: formaPago.formpago,
        nombre: formaPago.nformpago,
        fijo: formasPagoResponse.fijas.some(fp => fp.formpago === formaPago.formpago),
        obra: formasPagoResponse.por_obra.some(fp => fp.formpago === formaPago.formpago),
        comision: formasPagoResponse.comision.some(fp => fp.formpago === formaPago.formpago),
        frecuente: formaPago.frecuente
      }));
      
      setFormasPago(formasPagoMapped);
    } catch (err) {
      setError('Error al cargar formas de pago: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error al cargar formas de pago:', err);
    }
  };
  
  // Función para obtener condiciones de pago
  const refreshCondicionesPago = async () => {
    try {
      const condicionesPagoData = await CondicionPagoService.getCondicionesPago('todos');
      
      // Mapear respuesta de API a formato para la factura
      const condicionesPagoMapped = condicionesPagoData.map(condPago => ({
        id: condPago.condpago,
        nombre: condPago.ncondpago,
        plazo: condPago.plazo,
        contado: condPago.contado,
        credito: !condPago.contado && !condPago.cheque && !condPago.tarjeta,
        tarjeta: condPago.tarjeta,
        cheque: condPago.cheque
      }));
      
      setCondicionesPago(condicionesPagoMapped);
    } catch (err) {
      setError('Error al cargar condiciones de pago: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error al cargar condiciones de pago:', err);
    }
  };
  
  // Cargar todos los datos necesarios al montar el componente
  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        await Promise.all([
          refreshClientes(),
          refreshVendedores(),
          refreshTiposDocumento(),
          refreshFormasPago(),
          refreshCondicionesPago()
        ]);
      } catch (err) {
        setError('Error al cargar datos: ' + (err instanceof Error ? err.message : String(err)));
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadAllData();
  }, []);
  
  return {
    clientes,
    vendedores,
    tiposDocumento,
    formasPago,
    condicionesPago,
    loading,
    error,
    refreshClientes,
    refreshVendedores,
    refreshTiposDocumento,
    refreshFormasPago,
    refreshCondicionesPago
  };
}