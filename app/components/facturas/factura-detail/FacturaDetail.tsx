'use client';
import React, { useState, useEffect, useCallback } from 'react';
import ProductSelector from '../producto/ProductSelector';
import MobileProductSelector from '../../mobile/producto/MobileProductoSelector';
import ClienteSelector from '../cliente/ClienteSelector';
import { 
  type Cliente as ClienteType, 
  CLIENTE_VACIO 
} from '../cliente/types';
import MobileClienteSelector from '../../mobile/cliente/MobileClienteSelector';
import { FacturaHeader } from './FacturaHeader';
import { FacturaInfo } from './FacturaInfo';
import { FacturaFinanciera } from './FacturaFinanciera';
import { ProductosList } from './ProductosList';
import { SuccessMessage } from '../../ui/SuccessMessage';
import { AlertModal } from '../../ui/AlertModal';
import { Toast } from '../ui/Toast';
import FacturaService, { FacturaDetalle, ProductoDetalle } from '@/lib/api/facturaService';
import ProductoService from '@/lib/api/productoService';
import { 
  type Factura, 
  type Producto, 
  createEmptyFactura, 
  MOCK_FACTURA_DETAIL 
} from './facturaTypes';

interface FacturaDetailProps {
  facturaId: string;
  onBackToList?: () => void;
  onShowProductSelector: () => void;
  productosSeleccionados: any[];
  setProductosSeleccionados: (productos: any[]) => void;
  isCreating?: boolean;
}

// Interface para productos con cantidad y descuento del ProductSelector
interface ProductoConCantidad {
  id: number;
  nombre: string;
  codigo: string;
  precio: string;
  precioNumerico: number;
  cantidad: number;
  descuento: number;
  imagen: string;
  existencias: number;
  esServicio: boolean;
  isUpdate?: boolean;
}

export default function FacturaDetail({
  facturaId, 
  onBackToList,
  onShowProductSelector,
  productosSeleccionados,
  setProductosSeleccionados,
  isCreating = false
}: FacturaDetailProps) {
  const [isCreatingInternal, setIsCreatingInternal] = useState(isCreating);
  const [factura, setFactura] = useState<Factura>(
    isCreatingInternal ? createEmptyFactura() : MOCK_FACTURA_DETAIL
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isEditable, setIsEditable] = useState(isCreatingInternal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para modales
  const [showEditModeAlert, setShowEditModeAlert] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showMobileProductSelector, setShowMobileProductSelector] = useState(false);
  const [showClienteSelector, setShowClienteSelector] = useState(false);
  const [showMobileClienteSelector, setShowMobileClienteSelector] = useState(false);
  
  // Estados para el Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  // ✅ NUEVO: Estado para trackear si hay un selector abierto
  const [isFacturaSelectorOpen, setIsFacturaSelectorOpen] = useState(false);
  
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

  // ✅ EFECTO CRÍTICO: Comunicar estado de selectores a nivel global
  useEffect(() => {
    const isSelectorOpen = showProductSelector || showClienteSelector;
    setIsFacturaSelectorOpen(isSelectorOpen);
    
    // Emitir evento custom cuando cambia el estado del selector
    const event = new CustomEvent('facturaSelectorStateChange', { 
      detail: { isOpen: isSelectorOpen } 
    });
    document.dispatchEvent(event);
    
    // Establecer atributo en body para CSS y compatibilidad
    if (isSelectorOpen && !isMobile) {
      document.body.setAttribute('data-selector-open', 'true');
      document.body.setAttribute('data-factura-selector-open', 'true');
    } else {
      document.body.removeAttribute('data-selector-open');
      document.body.removeAttribute('data-factura-selector-open');
    }

    return () => {
      document.body.removeAttribute('data-selector-open');
      document.body.removeAttribute('data-factura-selector-open');
    };
  }, [showProductSelector, showClienteSelector, isMobile]);

  // Función para mostrar toast
  const showToastNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  }, []);

  // FUNCIÓN HELPER: Convertir precio string a número
  const parsePrice = (priceString: string): number => {
    if (typeof priceString === 'number') return priceString;
    const cleanPrice = priceString.replace(/[$,\s]/g, '');
    const numericPrice = parseFloat(cleanPrice);
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  // FUNCIÓN HELPER: Formatear número a precio
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // FUNCIÓN MEJORADA: Calcular totales de la factura
  const calcularTotalesFactura = useCallback((productos: Producto[], descuentoGeneral: string) => {
    // 1. Calcular subtotal de todos los productos (incluyendo sus descuentos individuales)
    const subtotal = productos.reduce((sum, producto) => {
      const precioUnitario = parsePrice(producto.total);
      const cantidad = producto.cantidad;
      const descuentoProducto = parseFloat(producto.descuento.replace('%', '')) || 0;
      
      // Calcular precio con descuento individual del producto
      const precioConDescuentoIndividual = (precioUnitario / cantidad) * (1 - descuentoProducto / 100);
      const totalProducto = precioConDescuentoIndividual * cantidad;
      
      return sum + totalProducto;
    }, 0);

    // 2. Aplicar descuento general sobre el subtotal
    const descuentoGeneralPorcentaje = parseFloat(descuentoGeneral.replace('%', '')) || 0;
    const descuentoGeneralMonto = subtotal * (descuentoGeneralPorcentaje / 100);
    const totalFinal = subtotal - descuentoGeneralMonto;

    return {
      subtotal,
      descuentoGeneralMonto,
      descuentoGeneralPorcentaje,
      totalFinal
    };
  }, []);

  const handleUpdateProducto = useCallback((productId: number, updates: { cantidad?: number; descuento?: string }) => {
    if (isEditable) {
      setFactura(prevFactura => {
        const updatedProducts = prevFactura.productos.map(producto => {
          if (producto.id === productId) {
            const updatedProduct = { ...producto };
            
            // Actualizar cantidad si se proporciona
            if (updates.cantidad !== undefined) {
              updatedProduct.cantidad = updates.cantidad;
            }
            
            // Actualizar descuento si se proporciona
            if (updates.descuento !== undefined) {
              updatedProduct.descuento = updates.descuento;
            }
            
            // Recalcular el total del producto
            const precioUnitarioOriginal = parsePrice(producto.total) / producto.cantidad;
            const nuevaCantidad = updatedProduct.cantidad;
            const nuevoDescuentoPorcentaje = parseFloat(updatedProduct.descuento.replace('%', '')) || 0;
            
            // Calcular nuevo total con descuento individual
            const precioConDescuento = precioUnitarioOriginal * (1 - nuevoDescuentoPorcentaje / 100);
            const nuevoTotal = precioConDescuento * nuevaCantidad;
            
            updatedProduct.total = formatPrice(nuevoTotal);
            
            return updatedProduct;
          }
          return producto;
        });
        
        return {
          ...prevFactura,
          productos: updatedProducts
        };
      });
      
      // Mostrar toast de confirmación
      if (updates.cantidad !== undefined && updates.descuento !== undefined) {
        showToastNotification('Producto actualizado: cantidad y descuento', 'success');
      } else if (updates.cantidad !== undefined) {
        showToastNotification(`Cantidad actualizada: ${updates.cantidad}`, 'success');
      } else if (updates.descuento !== undefined) {
        showToastNotification(`Descuento actualizado: ${updates.descuento}`, 'success');
      }
    }
  }, [isEditable, showToastNotification]);

  // Cargar datos de la factura desde la API
  useEffect(() => {
    if (!isCreatingInternal && facturaId && facturaId !== 'new') {
      loadFacturaData();
    }
  }, [facturaId, isCreatingInternal]);

  const loadFacturaData = async () => {
    if (!facturaId || facturaId === 'new') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const detalleFactura = await FacturaService.getFacturaDetalle(parseInt(facturaId));
      setFactura(mapFacturaDetalleToFactura(detalleFactura));
    } catch (err) {
      setError('Error al cargar los datos de la factura');
      console.error('Error loading factura:', err);
      setFactura(MOCK_FACTURA_DETAIL);
    } finally {
      setLoading(false);
    }
  };

  // Mapear los datos de la API al formato del frontend
  const mapFacturaDetalleToFactura = (detalle: FacturaDetalle): Factura => {
    const cliente: ClienteType = {
      id: 0,
      codigo: detalle.codigo_cliente,
      nombre: detalle.nombre_cliente.trim(),
      tipoDocumento: detalle.nit ? 'NIT' : 'DUI',
      numeroRegistro: detalle.registro.trim(),
      tipoCliente: detalle.tipo_cliente.trim(),
      giro: detalle.giro.trim(),
      razonSocial: detalle.nombre_cliente.trim(),
      conglomerado: '',
      limiteCredito: '$0',
      email: '',
      emailAlterno: '',
      telefono: detalle.telefono.trim(),
      telefonoAlterno: '',
      pais: 'El Salvador',
      departamento: '',
      municipio: '',
      direccion: detalle.direccion.trim(),
      saldoDisponible: FacturaService.formatMoneda(detalle.saldo_disponible),
      vencidas: detalle.vencidas.toString(),
      montoAdeudado: detalle.monto_adeudado.toString(),
      verificadoDICOM: false,
      retencion: detalle.retencion > 0,
      aplicaIVAPropia: false,
      noRestringirCredito: false,
      tasaCero: false,
      percepcion: detalle.percepcion > 0,
      gobierno: false,
      noSujeto: false,
      propioTalSol: false,
      autoConsumo: false,
      clienteExportacion: false,
      excentoImpuestos: false
    };

    const productos: Producto[] = detalle.productos.map((prod: ProductoDetalle) => ({
      id: prod.producto,
      nombre: prod.nombre_producto.trim(),
      cantidad: prod.cantidad,
      descuento: `${prod.descuento_porcentaje}%`,
      total: FacturaService.formatMoneda(prod.total),
      imagen: '/taladro.png',
      codigo: prod.codigo_producto.trim()
    }));

    return {
      id: detalle.numedocu.trim(),
      tipoDocumento: detalle.tipo_documento.trim(),
      estado: detalle.estado,
      cliente: cliente,
      formaPago: detalle.forma_pago.trim(),
      descuento: `${detalle.descuento_porcentaje}%`,
      vendedor: detalle.nombre_vendedor.trim(),
      totalPagar: FacturaService.formatMoneda(detalle.total_pagar),
      saldoDisponible: FacturaService.formatMoneda(detalle.saldo_disponible),
      vencidas: detalle.vencidas.toString(),
      montoAdeudado: detalle.monto_adeudado.toString(),
      fecha: FacturaService.formatFecha(detalle.fecha),
      tipoCliente: detalle.tipo_cliente.trim(),
      productos: productos
    };
  };

  useEffect(() => {
    if (isCreatingInternal) {
      setFactura(createEmptyFactura());
      setProductosSeleccionados([]);
    }
  }, [isCreatingInternal]);

  // EFECTO MEJORADO: Calcular el total automáticamente cuando cambien los productos o el descuento
  useEffect(() => {
    if (isCreatingInternal || isEditable) {
      const totales = calcularTotalesFactura(factura.productos, factura.descuento);
      
      setFactura(prev => ({
        ...prev,
        totalPagar: formatPrice(totales.totalFinal),
        // Agregar campos adicionales para el desglose si es necesario
        subtotal: totales.subtotal,
        descuentoGeneralMonto: totales.descuentoGeneralMonto
      }));
    }
  }, [factura.productos, factura.descuento, isCreatingInternal, isEditable, calcularTotalesFactura]);

  const handleBackClick = () => {
    if (onBackToList) {
      onBackToList();
    }
  };

  const enableEditMode = () => {
    setIsEditable(true);
  };

  const disableEditMode = () => {
    setIsEditable(false);
  };

  const handleLockToggle = () => {
    if (!isEditable && !isCreatingInternal) {
      setShowEditModeAlert(true);
    } else {
      disableEditMode();
    }
  };

  const handleSaveFactura = () => {
    if (isCreatingInternal) {
      if (!factura.cliente) {
        showToastNotification('seleccione un cliente', 'error');
        return;
      }
      if (!factura.vendedor) {
        showToastNotification('seleccione un vendedor', 'error');
        return;
      }
      if (factura.productos.length === 0) {
        showToastNotification('agregue al menos un producto', 'error');
        return;
      }
      
      setShowSaveConfirmation(true);
    } else {
      console.log('Actualizando factura:', factura);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        disableEditMode();
      }, 2000);
    }
  };

  const confirmSaveFactura = () => {
    const generateFacturaId = () => {
      const lastId = 100;
      return `S${String(lastId + 1).padStart(5, '0')}`;
    };
    
    const newFacturaId = generateFacturaId();
    const newFactura = {
      ...factura,
      id: newFacturaId,
      estado: 'Abierta'
    };
    
    console.log('Guardando nueva factura:', newFactura);
    
    setFactura(newFactura);
    setIsCreatingInternal(false);
    setIsEditable(false);
    setShowSuccessMessage(true);
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  useEffect(() => {
    if (productosSeleccionados.length > 0 && isEditable) {
      const procesarProductos = () => {
        const productosToProcess = [...productosSeleccionados];
        agregarProductos(productosToProcess);
        setProductosSeleccionados([]);
      };
      
      procesarProductos();
    }
  }, [productosSeleccionados, isEditable]);

  const agregarProductos = useCallback((nuevosProductos: ProductoConCantidad[]) => {
    if (isEditable) {
      const productosToProcess = [];
      const productosToUpdate = [];
      
      for (const prod of nuevosProductos) {
        // Verificar si es una actualización usando optional chaining
        if (prod.isUpdate === true) {
          // Es una actualización de cantidad
          const existingProductIndex = factura.productos.findIndex(p => p.id === prod.id);
          if (existingProductIndex !== -1) {
            productosToUpdate.push({
              id: prod.id,
              cantidad: prod.cantidad,
              descuento: `${prod.descuento}%`
            });
          }
        } else {
          // Verificar si el producto ya existe
          const existingProduct = factura.productos.find(p => p.id === prod.id);
          if (existingProduct) {
            // Producto duplicado - sumar cantidades automáticamente
            const nuevaCantidad = existingProduct.cantidad + prod.cantidad;
            productosToUpdate.push({
              id: prod.id,
              cantidad: nuevaCantidad
            });
          } else {
            // Producto nuevo
            productosToProcess.push(prod);
          }
        }
      }
      
      // Procesar actualizaciones
      for (const update of productosToUpdate) {
        handleUpdateProducto(update.id, { 
          cantidad: update.cantidad, 
          ...(update.descuento && { descuento: update.descuento })
        });
      }
      
      // Procesar productos nuevos
      if (productosToProcess.length > 0) {
        const productosFormateados = productosToProcess.map(prod => {
          const precioUnitario = prod.precioNumerico || parsePrice(prod.precio);
          const descuentoProducto = prod.descuento || 0;
          const precioConDescuento = precioUnitario * (1 - descuentoProducto / 100);
          const totalProducto = precioConDescuento * prod.cantidad;

          return {
            id: prod.id,
            nombre: prod.nombre,
            cantidad: prod.cantidad,
            descuento: `${descuentoProducto}%`,
            total: formatPrice(totalProducto),
            imagen: prod.imagen || '/producto-default.png',
            codigo: prod.codigo
          } as Producto;
        });
        
        setFactura(prev => ({
          ...prev, 
          productos: [...prev.productos, ...productosFormateados]
        }));
      }
      
      // Toast de confirmación
      const totalNuevos = productosToProcess.length;
      const totalActualizados = productosToUpdate.length;
      
      if (totalNuevos > 0 && totalActualizados > 0) {
        showToastNotification(
          `${totalNuevos} productos nuevos agregados y ${totalActualizados} actualizados`, 
          'success'
        );
      } else if (totalNuevos > 0) {
        const cantidadTotal = productosToProcess.reduce((sum, p) => sum + p.cantidad, 0);
        const mensaje = totalNuevos === 1 
          ? `Producto agregado exitosamente (${cantidadTotal} ${cantidadTotal === 1 ? 'unidad' : 'unidades'})`
          : `${totalNuevos} productos agregados exitosamente (${cantidadTotal} unidades totales)`;
        showToastNotification(mensaje, 'success');
      } else if (totalActualizados > 0) {
        showToastNotification(
          `${totalActualizados} producto${totalActualizados > 1 ? 's' : ''} actualizado${totalActualizados > 1 ? 's' : ''}`, 
          'success'
        );
      }
    }
  }, [isEditable, factura.productos, handleUpdateProducto, showToastNotification, parsePrice, formatPrice]);

  // ✅ FUNCIÓN MEJORADA: Mostrar selector de productos con coordinación
  const handleShowProductSelector = useCallback(() => {
    if (isEditable) {
      if (isMobile) {
        setShowMobileProductSelector(true);
      } else {
        setShowProductSelector(true);
        
        // ✅ Disparar evento para cerrar el chat (coordinación mejorada)
        if (typeof document !== 'undefined') {
          try {
            const event = new CustomEvent('closeRightPanels');
            document.dispatchEvent(event);
          } catch (error) {
            console.error('Error al disparar evento:', error);
          }
        }
      }
    }
  }, [isEditable, isMobile]);

  const handleClienteSelected = (clienteSeleccionado: ClienteType) => {
    if (isEditable) {
      setFactura(prevFactura => ({
        ...prevFactura,
        cliente: clienteSeleccionado,
        ...(isCreatingInternal && {
          saldoDisponible: clienteSeleccionado.saldoDisponible || '$2,000.00',
          vencidas: clienteSeleccionado.vencidas || '0.00',
          montoAdeudado: clienteSeleccionado.montoAdeudado || '0.00'
        })
      }));
      setShowClienteSelector(false);
      
      showToastNotification(`Cliente "${clienteSeleccionado.nombre}" seleccionado exitosamente`, 'success');
    }
  };

  // ✅ FUNCIÓN MEJORADA: Mostrar selector de clientes con coordinación
  const handleClienteClick = () => {
    if (isEditable) {
      if (isMobile) {
        setShowMobileClienteSelector(true);
      } else {
        setShowClienteSelector(true);
        
        // ✅ Disparar evento para cerrar el chat (coordinación mejorada)
        if (typeof document !== 'undefined') {
          try {
            const event = new CustomEvent('closeRightPanels');
            document.dispatchEvent(event);
          } catch (error) {
            console.error('Error al disparar evento:', error);
          }
        }
      }
    }
  };
  
  // Pantallas móviles especiales
  if (isMobile && showMobileProductSelector) {
    return (
      <MobileProductSelector
        onBackToFactura={() => setShowMobileProductSelector(false)}
        onProductsAdded={agregarProductos}
        facturaId={facturaId}
      />
    );
  }

  if (isMobile && showMobileClienteSelector) {
    return (
      <MobileClienteSelector
        onBackToFactura={() => setShowMobileClienteSelector(false)}
        onClienteSelected={handleClienteSelected}
        clienteActual={factura.cliente}
        facturaId={facturaId}
      />
    );
  }

  // Estados de carga y error
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-primary">Cargando factura...</p>
        </div>
      </div>
    );
  }

  if (error && !factura.id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={loadFacturaData}
            className="bg-blue-600 hover:bg-blue-700 text-primary px-4 py-2 rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SuccessMessage 
        isVisible={showSuccessMessage} 
        message={isCreatingInternal ? "Factura creada exitosamente" : "Factura actualizada exitosamente"}
      />
      
      {/* ✅ Contenedor principal con desplazamiento dinámico MEJORADO */}
      <div 
        className={`h-full flex flex-col transition-all duration-300 ease-in-out overflow-auto ${
          isFacturaSelectorOpen && !isMobile ? 'mr-96' : ''
        }`}
      >
        <FacturaHeader
          factura={factura}
          isCreatingInternal={isCreatingInternal}
          isEditable={isEditable}
          isMobile={isMobile}
          onBackClick={handleBackClick}
          onSaveFactura={handleSaveFactura}
          onLockToggle={handleLockToggle}
          onAnularFactura={() => console.log('Anular factura')}
        />
        
        <FacturaInfo
          factura={factura}
          isEditable={isEditable}
          isCreatingInternal={isCreatingInternal}
          isMobile={isMobile}
          onTipoDocumentoClick={(tipo: string) => {
            setFactura({...factura, tipoDocumento: tipo});
          }}
          onFormaPagoClick={(forma: string) => {
            setFactura({...factura, formaPago: forma});
          }}
          onVendedorClick={(vendedor: string) => {
            setFactura({...factura, vendedor: vendedor});
          }}
          onDescuentoClick={(descuento: string) => {
            setFactura({...factura, descuento: descuento});
          }}
          onClienteClick={handleClienteClick}
        />
        
        {(!isCreatingInternal || (isCreatingInternal && factura.cliente)) && (
          <FacturaFinanciera
            factura={factura}
            isMobile={isMobile}
          />
        )}
        
        <ProductosList
          productos={factura.productos}
          isEditable={isEditable}
          isCreatingInternal={isCreatingInternal}
          isMobile={isMobile}
          onAddProducto={handleShowProductSelector}
          onRemoveProducto={(id: number) => {
            if (isEditable) {
              const productoEliminado = factura.productos.find(p => p.id === id);
              const nuevosProductos = factura.productos.filter(producto => producto.id !== id);
              setFactura({...factura, productos: nuevosProductos});
              
              if (productoEliminado) {
                showToastNotification(`Producto "${productoEliminado.nombre}" eliminado`, 'info');
              }
            }
          }}
          onUpdateProducto={handleUpdateProducto}
        />

        {/* Modales comunes */}
        <AlertModal
          isOpen={showEditModeAlert}
          onClose={() => setShowEditModeAlert(false)}
          onConfirm={enableEditMode}
          title="Confirmar Edición"
          message={`¿Está seguro de que desea editar la factura ${factura.id}? Esto habilitará funciones como agregar productos, seleccionar vendedor, aplicar descuentos y más.`}
        />
        
        <AlertModal
          isOpen={showSaveConfirmation}
          onClose={() => setShowSaveConfirmation(false)}
          onConfirm={confirmSaveFactura}
          title="Confirmar Guardado"
          message={`¿Está seguro de que desea guardar esta factura?`}
        />
        
        {/* ✅ Componentes Selectores con clases CSS actualizadas */}
        {showProductSelector && !isMobile && (
          <div className="fixed right-[50px] top-14 bottom-0 w-96 z-10 border-l border-primary transform transition-transform duration-300 ease-in-out product-selector-panel factura-selector-panel">
            <ProductSelector 
              onClose={() => setShowProductSelector(false)}
              onProductsAdded={agregarProductos}
              isMobile={false}
            />
          </div>
        )}

        {showClienteSelector && !isMobile && (
          <div className="fixed right-[50px] top-14 bottom-0 w-96 z-10 border-l border-primary transform transition-transform duration-300 ease-in-out client-selector-panel factura-selector-panel">
            <ClienteSelector 
              onClose={() => setShowClienteSelector(false)}
              onClienteSelected={handleClienteSelected}
              clienteActual={factura.cliente} 
              isEdition={true}
            />
          </div>
        )}
      </div>

      {/* Toast centralizado */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={3500}
        />
      )}
    </div>
  );
}