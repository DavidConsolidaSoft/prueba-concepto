import React, { useState, useEffect } from 'react';
import { Factura } from './facturaTypes';
import FacturaService from '@/lib/api/facturaService';

interface FacturaFinancieraProps {
  factura: Factura;
  isMobile: boolean;
}

export const FacturaFinanciera: React.FC<FacturaFinancieraProps> = ({
  factura,
  isMobile
}) => {
  // Estado para controlar el accordion
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Helper para parsear precios
  const parsePrice = (priceString: string | number): number => {
    if (typeof priceString === 'number') return priceString;
    const cleanPrice = priceString.replace(/[$,\s]/g, '');
    const numericPrice = parseFloat(cleanPrice);
    return isNaN(numericPrice) ? 0 : numericPrice;
  };

  // Formatear los valores numéricos a moneda si no vienen formateados
  const formatValue = (value: string | number): string => {
    if (typeof value === 'string' && value.includes('$')) {
      return value;
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return FacturaService.formatMoneda(numValue || 0);
  };

  // Calcular desglose de la factura
  const calcularDesglose = () => {
    // 1. Calcular subtotal de productos (con descuentos individuales aplicados)
    const subtotalProductos = factura.productos.reduce((sum, producto) => {
      const precioTotal = parsePrice(producto.total);
      return sum + precioTotal;
    }, 0);

    // 2. Obtener descuento general
    const descuentoGeneralPorcentaje = parseFloat(factura.descuento.replace('%', '')) || 0;
    const descuentoGeneralMonto = subtotalProductos * (descuentoGeneralPorcentaje / 100);
    
    // 3. Calcular total final
    const totalFinal = parsePrice(factura.totalPagar);
    
    // 4. Verificar si hay descuentos individuales en productos
    const tieneDescuentosIndividuales = factura.productos.some(producto => 
      parseFloat(producto.descuento.replace('%', '')) > 0
    );

    // 5. Determinar si hay productos
    const tieneProductos = factura.productos.length > 0;

    return {
      subtotalProductos,
      descuentoGeneralPorcentaje,
      descuentoGeneralMonto,
      totalFinal,
      tieneDescuentosIndividuales,
      tieneProductos
    };
  };

  const desglose = calcularDesglose();

  // Auto-abrir accordion cuando hay productos
  useEffect(() => {
    if (desglose.tieneProductos && !isAccordionOpen) {
      setIsAccordionOpen(true);
    } else if (!desglose.tieneProductos && isAccordionOpen) {
      setIsAccordionOpen(false);
    }
  }, [desglose.tieneProductos]);

  // Toggle del accordion
  const toggleAccordion = () => {
    // Solo permitir toggle si hay productos
    if (desglose.tieneProductos) {
      setIsAccordionOpen(!isAccordionOpen);
    }
  };

  return (
    <>
      {/* ACCORDION - DESGLOSE DE FACTURA */}
      <div className="bg-secondary rounded-md mb-3 overflow-hidden">
        {/* Header del Accordion - TOTAL A PAGAR */}
        <button
          onClick={toggleAccordion}
          className={`w-full p-3 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
            desglose.tieneProductos 
              ? 'hover:bg-[#4a4a4a] cursor-pointer' 
              : 'cursor-default'
          }`}
          disabled={!desglose.tieneProductos}
          aria-expanded={isAccordionOpen}
          aria-controls="factura-desglose"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-base font-bold text-primary">Total a Pagar:</span>
              {desglose.tieneProductos && (
                <span className="ml-2 text-xs text-gray-400">
                  ({factura.productos.length} producto{factura.productos.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold text-green-400 mr-2">
                {factura.totalPagar}
              </span>
              {/* Ícono de chevron - solo si hay productos */}
              {desglose.tieneProductos && (
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isAccordionOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Contenido del Accordion - DESGLOSE */}
        <div
          id="factura-desglose"
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isAccordionOpen && desglose.tieneProductos
              ? 'max-h-96 opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 pb-3 border-t border-[#555555]">
            <div className="pt-3">
              <h4 className="text-sm font-medium text-primary mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Desglose de Factura
              </h4>
              
              {isMobile ? (
                /* Versión móvil del desglose */
                <div className="space-y-2">
                  {/* Subtotal de productos */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-secondary">
                      Subtotal Productos
                      {desglose.tieneDescuentosIndividuales && (
                        <span className="text-orange-400 text-xs block">(con desc. individuales)</span>
                      )}
                    </div>
                    <div className="text-sm text-primary font-medium">{formatValue(desglose.subtotalProductos)}</div>
                  </div>

                  {/* Descuento general */}
                  {desglose.descuentoGeneralPorcentaje > 0 && (
                    <div className="flex justify-between items-center bg-orange-900/20 px-2 py-1 rounded">
                      <div className="text-sm text-orange-400">
                        Descuento General ({desglose.descuentoGeneralPorcentaje}%):
                      </div>
                      <div className="text-sm text-orange-400 font-medium">
                        -{formatValue(desglose.descuentoGeneralMonto)}
                      </div>
                    </div>
                  )}

                  {/* Información adicional sobre descuentos */}
                  {(desglose.tieneDescuentosIndividuales || desglose.descuentoGeneralPorcentaje > 0) && (
                    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-[#666666]">
                      {desglose.tieneDescuentosIndividuales && (
                        <div className="flex items-center mb-1">
                          <svg className="w-3 h-3 mr-1 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Algunos productos tienen descuentos individuales
                        </div>
                      )}
                      {desglose.descuentoGeneralPorcentaje > 0 && (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Descuento general del {desglose.descuentoGeneralPorcentaje}% aplicado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Versión escritorio del desglose */
                <div className="space-y-3">
                  {/* Subtotal de productos */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-secondary">
                      <span>Subtotal Productos:</span>
                      {desglose.tieneDescuentosIndividuales && (
                        <div className="text-orange-400 text-xs">
                          (con descuentos individuales aplicados)
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-primary font-medium">
                      {formatValue(desglose.subtotalProductos)}
                    </div>
                  </div>

                  {/* Descuento general si aplica */}
                  {desglose.descuentoGeneralPorcentaje > 0 && (
                    <div className="flex justify-between items-center bg-orange-900/20 px-3 py-2 rounded">
                      <div className="text-sm text-orange-400 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7.01C6.47 21 6 20.53 6 20V4c0-.53.47-1 1.01-1z" />
                        </svg>
                        Descuento General ({desglose.descuentoGeneralPorcentaje}%):
                      </div>
                      <div className="text-sm text-orange-400 font-medium">
                        -{formatValue(desglose.descuentoGeneralMonto)}
                      </div>
                    </div>
                  )}

                  {/* Mostrar advertencia si hay descuentos mixtos */}
                  {desglose.tieneDescuentosIndividuales && desglose.descuentoGeneralPorcentaje > 0 && (
                    <div className="bg-yellow-900/20 px-3 py-2 rounded border border-yellow-800">
                      <div className="text-yellow-400 text-xs flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.198 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="font-medium">Atención:</span>
                        <span className="ml-1">Se aplicaron descuentos individuales Y descuento general</span>
                      </div>
                    </div>
                  )}

                  {/* Información adicional sobre descuentos */}
                  {(desglose.tieneDescuentosIndividuales || desglose.descuentoGeneralPorcentaje > 0) && (
                    <div className="text-xs text-gray-400 space-y-1 pt-2 border-t border-[#555555]">
                      {desglose.tieneDescuentosIndividuales && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                          Algunos productos tienen descuentos individuales aplicados
                        </div>
                      )}
                      {desglose.descuentoGeneralPorcentaje > 0 && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                          El descuento general se aplicó sobre el subtotal de productos
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN FINANCIERA DEL CLIENTE - CARD SEPARADO ABAJO */}
      <div className="bg-secondary p-3 rounded-md mb-3">
        <h4 className="text-sm font-medium text-primary mb-3 border-b border-[#555555] pb-1 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Información Financiera del Cliente
        </h4>
        
        {isMobile ? (
          /* Versión móvil - información del cliente */
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm text-secondary">Saldo Disponible:</div>
              <div className="font-bold text-sm text-green-400">{factura.saldoDisponible}</div>
            </div>
           
            <div className="flex justify-between items-center">
              <div className="text-sm text-secondary">Vencidas: {factura.vencidas} por</div>
              <div className="font-bold text-sm text-orange-400">{formatValue(factura.montoAdeudado)}</div>
            </div>
           
            <div className="flex justify-between items-center">
              <div className="text-sm text-secondary">Monto Adeudado:</div>
              <div className="font-bold text-sm text-red-400">{formatValue(factura.montoAdeudado)}</div>
            </div>
          </div>
        ) : (
          /* Versión escritorio - información del cliente */
          <div className="grid grid-cols-[180px_1fr] gap-y-2 text-sm">
            <p className="text-secondary">Saldo Disponible:</p>
            <p className="font-bold text-green-400 text-right">{factura.saldoDisponible}</p>
           
            <p className="text-secondary">Vencidas: {factura.vencidas} por</p>
            <p className="font-bold text-orange-400 text-right">{formatValue(factura.montoAdeudado)}</p>
           
            <p className="text-secondary">Monto Adeudado:</p>
            <p className="font-bold text-red-400 text-right">{formatValue(factura.montoAdeudado)}</p>
          </div>
        )}
      </div>
    </>
  );
};