// lib/hooks/useFacturaCreacion.ts
import { useState, useEffect } from 'react';
import { FacturaData, ProductoFactura } from '../types/facturaTypes';
import FacturaCreateService, { NuevaFacturaData, ProductoFacturaData } from '../api/facturaCreateService';
import FacturaService from '../api/facturaService';

interface UseFacturaCreacionParams {
  facturaId?: string | number;
  isCreating: boolean;
}

interface UseFacturaCreacionResult {
  // Estado de la factura
  facturaData: FacturaData | null;
  
  // Estado de carga y errores
  loading: boolean;
  error: string | null;
  success: boolean;
  successMessage: string;
  
  // Funciones para manejar la factura
  setFacturaData: (data: FacturaData) => void;
  updateFacturaField: (field: string, value: any) => void;
  addProductoToFactura: (producto: ProductoFactura) => void;
  updateProductoInFactura: (index: number, producto: ProductoFactura) => void;
  removeProductoFromFactura: (index: number) => void;
  calcularTotales: () => void;
  
  // Funciones para persistencia
  saveFactura: () => Promise<{ success: boolean, id?: number }>;
  anularFactura: (motivo: string) => Promise<{ success: boolean }>;
}

export function useFacturaCreacion({
  facturaId,
  isCreating
}: UseFacturaCreacionParams): UseFacturaCreacionResult {
  // Estado de la factura
  const [facturaData, setFacturaDataState] = useState<FacturaData | null>(null);
  
  // Estados para manejar carga y errores
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Cargar datos de factura existente si no es creación
  useEffect(() => {
    if (!isCreating && facturaId && facturaId !== 'new') {
      const cargarFactura = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const facturaDetalle = await FacturaService.getFacturaDetalle(Number(facturaId));
          
          // Mapear datos de la API al formato de FacturaData
          const productos: ProductoFactura[] = facturaDetalle.productos.map(prod => ({
            id: prod.producto,
            kardexId: 0, // No disponible en la respuesta
            loteId: 0, // No disponible en la respuesta
            nombre: prod.nombre_producto,
            codigo: prod.codigo_producto,
            precio: prod.precio,
            cantidad: prod.cantidad,
            descuento: prod.descuento_porcentaje,
            subtotal: prod.subtotal,
            total: prod.total,
            esServicio: prod.servicio
          }));
          
          // Crear objeto FacturaData
          const facturaFormateada: FacturaData = {
            id: facturaDetalle.factura,
            numeroDocumento: facturaDetalle.numedocu,
            tipoDocumento: {
              id: 0, // No disponible directamente
              nombre: facturaDetalle.tipo_documento,
              correlativo: 0, // No disponible directamente
              aplicaIVA: true,
              esFactura: true,
              esNotaCredito: false,
              esExportacion: false,
              preferido: false,
              noAplicaIVA: false
            },
            fecha: facturaDetalle.fecha,
            cliente: {
              id: facturaDetalle.codigo_cliente,
              nombre: facturaDetalle.nombre_cliente,
              tipoDocumento: facturaDetalle.nit ? 'NIT' : 'DUI',
              numeroRegistro: facturaDetalle.registro || '',
              direccion: facturaDetalle.direccion || '',
              telefono: facturaDetalle.telefono || '',
              email: '',
              tipoCliente: facturaDetalle.tipo_cliente || '',
              contado: facturaDetalle.tipo_pago === 'Contado',
              credito: facturaDetalle.tipo_pago === 'Crédito',
              giro: facturaDetalle.giro || '',
              razonSocial: '',
              limiteCredito: 0,
              retencion: facturaDetalle.retencion > 0
            },
            vendedor: {
              id: facturaDetalle.codigo_vendedor,
              nombre: facturaDetalle.nombre_vendedor,
              activo: true,
              tipo: 'Vendedor'
            },
            formaPago: {
              id: 0, // No disponible directamente
              nombre: facturaDetalle.forma_pago,
              fijo: false,
              obra: false,
              comision: false,
              frecuente: false
            },
            condicionPago: {
              id: 0, // No disponible directamente
              nombre: facturaDetalle.tipo_pago,
              plazo: facturaDetalle.plazo,
              contado: facturaDetalle.tipo_pago === 'Contado',
              credito: facturaDetalle.tipo_pago === 'Crédito',
              tarjeta: false,
              cheque: false
            },
            productos: productos,
            subtotal: facturaDetalle.subtotal,
            descuento: facturaDetalle.descuento_aplicado,
            porcentajeDescuento: facturaDetalle.descuento_porcentaje,
            iva: facturaDetalle.iva,
            percepcion: facturaDetalle.percepcion,
            retencion: facturaDetalle.retencion,
            propina: facturaDetalle.propina,
            total: facturaDetalle.total_pagar,
            bodega: 1, // Valor por defecto
            caja: 1, // Valor por defecto
            moneda: 1,
            tasaCambio: facturaDetalle.tasa_cambio || 1,
            notas: facturaDetalle.notas,
            estado: facturaDetalle.estado
          };
          
          setFacturaDataState(facturaFormateada);
        } catch (err) {
          setError('Error al cargar factura: ' + (err instanceof Error ? err.message : String(err)));
          console.error('Error al cargar factura:', err);
        } finally {
          setLoading(false);
        }
      };
      
      cargarFactura();
    }
  }, [facturaId, isCreating]);
  
  // Función para establecer todos los datos de la factura
  const setFacturaData = (data: FacturaData) => {
    setFacturaDataState(data);
    // Recalcular totales al cambiar datos
    calcularTotales();
  };
  
  // Función para actualizar un campo específico de la factura
  const updateFacturaField = (field: string, value: any) => {
    if (!facturaData) return;
    
    setFacturaDataState(prevData => {
      if (!prevData) return null;
      
      // Crear copia para mantener inmutabilidad
      return {
        ...prevData,
        [field]: value
      };
    });
    
    // Recalcular totales si es necesario
    if (['productos', 'porcentajeDescuento'].includes(field)) {
      calcularTotales();
    }
  };
  
  // Función para agregar un producto a la factura
  const addProductoToFactura = (producto: ProductoFactura) => {
    if (!facturaData) return;
    
    setFacturaDataState(prevData => {
      if (!prevData) return null;
      
      return {
        ...prevData,
        productos: [...prevData.productos, producto]
      };
    });
    
    // Recalcular totales
    calcularTotales();
  };
  
  // Función para actualizar un producto en la factura
  const updateProductoInFactura = (index: number, producto: ProductoFactura) => {
    if (!facturaData || index < 0 || index >= facturaData.productos.length) return;
    
    setFacturaDataState(prevData => {
      if (!prevData) return null;
      
      const nuevosProductos = [...prevData.productos];
      nuevosProductos[index] = producto;
      
      return {
        ...prevData,
        productos: nuevosProductos
      };
    });
    
    // Recalcular totales
    calcularTotales();
  };
  
  // Función para eliminar un producto de la factura
  const removeProductoFromFactura = (index: number) => {
    if (!facturaData || index < 0 || index >= facturaData.productos.length) return;
    
    setFacturaDataState(prevData => {
      if (!prevData) return null;
      
      return {
        ...prevData,
        productos: prevData.productos.filter((_, i) => i !== index)
      };
    });
    
    // Recalcular totales
    calcularTotales();
  };
  
  // Función para calcular los totales de la factura
  const calcularTotales = () => {
    if (!facturaData) return;
    
    let subtotal = 0;
    
    // Calcular subtotal sumando los subtotales de los productos
    facturaData.productos.forEach(producto => {
      subtotal += producto.precio * producto.cantidad;
    });
    
    // Calcular descuento global
    const descuentoValor = subtotal * (facturaData.porcentajeDescuento / 100);
    
    // Base imponible después de descuento
    const baseImponible = subtotal - descuentoValor;
    
    // Calcular IVA (13% por defecto)
    const iva = baseImponible * 0.13;
    
    // Calcular total
    const total = baseImponible + iva + facturaData.propina - facturaData.retencion;
    
    // Actualizar facturaData con los nuevos valores
    setFacturaDataState(prevData => {
      if (!prevData) return null;
      
      return {
        ...prevData,
        subtotal: subtotal,
        descuento: descuentoValor,
        iva: iva,
        total: total
      };
    });
  };
  
  // Función para guardar la factura (crear o actualizar)
  const saveFactura = async (): Promise<{ success: boolean, id?: number }> => {
    if (!facturaData) {
      return { success: false };
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage('');
    
    try {
      // Convertir FacturaData a NuevaFacturaData
      const productosData: ProductoFacturaData[] = facturaData.productos.map(prod => ({
        kardex: prod.kardexId,
        producto: prod.id,
        cantidad: prod.cantidad,
        bonificado: 0,
        gratificado: 0,
        tprecio: prod.precio,
        descuentoporc: prod.descuento,
        descuentovalor: 0
      }));
      
      const facturaApiData: NuevaFacturaData = {
        tipomov: facturaData.tipoDocumento.id,
        correl: facturaData.tipoDocumento.correlativo,
        fecha: facturaData.fecha,
        clientes: facturaData.cliente.id,
        vendedor: facturaData.vendedor.id,
        formpago: facturaData.formaPago.id,
        condpago: facturaData.condicionPago.id,
        bodega: facturaData.bodega,
        caja: facturaData.caja,
        moneda: facturaData.moneda,
        tasacambio: facturaData.tasaCambio,
        neto: facturaData.subtotal - facturaData.descuento,
        iva: facturaData.iva,
        propina: facturaData.propina,
        percepcion: facturaData.percepcion,
        retencion: facturaData.retencion,
        descuentovalor: facturaData.descuento,
        descuentoporc: facturaData.porcentajeDescuento,
        productos: productosData,
        notas: facturaData.notas
      };
      
      let result;
      
      // Crear nueva factura o actualizar existente
      if (isCreating) {
        result = await FacturaCreateService.crearFactura(facturaApiData);
        setSuccessMessage(`Factura creada con éxito: ${result.numedocu}`);
      } else {
        if (!facturaData.id) {
          throw new Error('No se puede actualizar una factura sin ID');
        }
        
        result = await FacturaCreateService.actualizarFactura(
          facturaData.id,
          facturaApiData
        );
        setSuccessMessage(`Factura actualizada con éxito: ${result.numedocu}`);
      }
      
      setSuccess(true);
      return { success: true, id: result.factura };
    } catch (err) {
      const errorMessage = 'Error al guardar factura: ' + (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      console.error(errorMessage, err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  // Función para anular una factura
  const anularFactura = async (motivo: string): Promise<{ success: boolean }> => {
    if (!facturaData || !facturaData.id) {
      return { success: false };
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setSuccessMessage('');
    
    try {
      const result = await FacturaCreateService.anularFactura(facturaData.id, motivo);
      
      if (result.success) {
        setSuccessMessage('Factura anulada correctamente');
        setSuccess(true);
        
        // Actualizar estado de la factura en el estado local
        setFacturaDataState(prevData => {
          if (!prevData) return null;
          
          return {
            ...prevData,
            estado: 'Nula'
          };
        });
        
        return { success: true };
      } else {
        throw new Error(result.mensaje || 'Error desconocido al anular factura');
      }
    } catch (err) {
      const errorMessage = 'Error al anular factura: ' + (err instanceof Error ? err.message : String(err));
      setError(errorMessage);
      console.error(errorMessage, err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    facturaData,
    loading,
    error,
    success,
    successMessage,
    setFacturaData,
    updateFacturaField,
    addProductoToFactura,
    updateProductoInFactura,
    removeProductoFromFactura,
    calcularTotales,
    saveFactura,
    anularFactura
  };
}