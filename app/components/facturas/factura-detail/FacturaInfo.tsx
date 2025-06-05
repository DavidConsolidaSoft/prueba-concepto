import React, { useState, useEffect } from 'react';
import { Factura, TIPOS_DOCUMENTO, FORMAS_PAGO, VENDEDORES } from './facturaTypes';
import { Modal } from '../../ui/Modal';
import TipoDocumentoService from '@/lib/api/tipoDocumentoService';
import FormaPagoService from '@/lib/api/formaPagoService';
import VendedorService from '@/lib/api/vendedorService';
import type { TipoDocumento } from '@/lib/api/tipoDocumentoService';
import type { FormaPago } from '@/lib/api/formaPagoService';
import type { Vendedor } from '@/lib/api/vendedorService';

interface FacturaInfoProps {
  factura: Factura;
  isEditable: boolean;
  isCreatingInternal: boolean;
  isMobile: boolean;
  onTipoDocumentoClick: (tipo: string) => void;
  onFormaPagoClick: (forma: string) => void;
  onVendedorClick: (vendedor: string) => void;
  onDescuentoClick: (descuento: string) => void;
  onClienteClick: () => void;
}

export const FacturaInfo: React.FC<FacturaInfoProps> = ({
  factura,
  isEditable,
  isCreatingInternal,
  isMobile,
  onTipoDocumentoClick,
  onFormaPagoClick,
  onVendedorClick,
  onDescuentoClick,
  onClienteClick
}) => {
  // Estados para controlar los modales
  const [showTipoDocModal, setShowTipoDocModal] = useState(false);
  const [showFormaPagoModal, setShowFormaPagoModal] = useState(false);
  const [showVendedorModal, setShowVendedorModal] = useState(false);
  const [showDescuentoModal, setShowDescuentoModal] = useState(false);
  
  // Estados para los datos de las APIs
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  
  // Estados para búsqueda y filtros
  const [searchVendedor, setSearchVendedor] = useState('');
  const [descuentoInput, setDescuentoInput] = useState('');
  
  // Estados para indicar carga
  const [loadingTiposDocumento, setLoadingTiposDocumento] = useState(false);
  const [loadingFormasPago, setLoadingFormasPago] = useState(false);
  const [loadingVendedores, setLoadingVendedores] = useState(false);

  // Cargar tipos de documento cuando se abre el modal
  useEffect(() => {
    if (showTipoDocModal && tiposDocumento.length === 0) {
      setLoadingTiposDocumento(true);
      
      TipoDocumentoService.getTiposDocumento(true, 'factura')
        .then(data => {
          setTiposDocumento(data);
        })
        .catch(error => {
          console.error('Error al cargar tipos de documento:', error);
          // En caso de error, utilizamos los tipos de documento de ejemplo
          setTiposDocumento(TIPOS_DOCUMENTO.map(tipo => ({
            tipomov: 0,
            ntipomov: tipo,
            activo: true,
            factura: true,
            notacred: false,
            compra: false,
            ANTICIPO: false,
            notadebito: false,
            pedido: false,
            inventario: false,
            cargo: '',
            correl: 0,
            empresa: 0
          })));
        })
        .finally(() => {
          setLoadingTiposDocumento(false);
        });
    }
  }, [showTipoDocModal, tiposDocumento.length]);

  // Cargar formas de pago cuando se abre el modal
  useEffect(() => {
    if (showFormaPagoModal && formasPago.length === 0) {
      setLoadingFormasPago(true);
      
      FormaPagoService.getFormasPago(true)
        .then(data => {
          setFormasPago(data);
        })
        .catch(error => {
          console.error('Error al cargar formas de pago:', error);
          // En caso de error, utilizamos las formas de pago de ejemplo
          setFormasPago(FORMAS_PAGO.map(forma => ({
            formpago: 0,
            nformpago: forma,
            activo: true,
            frecuente: true,
            empresa: 0
          })));
        })
        .finally(() => {
          setLoadingFormasPago(false);
        });
    }
  }, [showFormaPagoModal, formasPago.length]);

  // Cargar vendedores cuando se abre el modal
  useEffect(() => {
    if (showVendedorModal && vendedores.length === 0) {
      setLoadingVendedores(true);
      
      VendedorService.getVendedores(true)
        .then(data => {
          setVendedores(data);
        })
        .catch(error => {
          console.error('Error al cargar vendedores:', error);
          // En caso de error, utilizamos los vendedores de ejemplo
          setVendedores(VENDEDORES.map(vendedor => ({
            vendedor: 0,
            nvendedor: vendedor,
            activo: true,
            lcobrador: false,
            lvendedor: true,
            empresa: 0,
            vcorreo: '',
            tipovendedor: 0
          })));
        })
        .finally(() => {
          setLoadingVendedores(false);
        });
    }
  }, [showVendedorModal, vendedores.length]);

  // Filtrar vendedores según el término de búsqueda
  const vendedoresFiltrados = vendedores.filter(vendedor => 
    vendedor.nvendedor.toLowerCase().includes(searchVendedor.toLowerCase())
  );

  // Aplicar descuento
  const aplicarDescuento = () => {
    if (isEditable && descuentoInput.trim() !== '') {
      const descuentoLimpio = descuentoInput.replace(/[^\d.]/g, '');
      const descuentoNumerico = parseFloat(descuentoLimpio);
      if (!isNaN(descuentoNumerico) && descuentoNumerico >= 0 && descuentoNumerico <= 100) {
        onDescuentoClick(`${descuentoNumerico}%`);
        setShowDescuentoModal(false);
        setDescuentoInput('');
      }
    }
  };

  if (isMobile) {
    return (
      <>
        <div className="mb-1 px-1">
          {/* Fila 1: Tipo Documento */}
          <div className="flex mb-1.5">
            <div className="w-[150px] text-sm text-secondary">Tipo Documento:</div>
            <div 
              className={`font-bold text-sm text-primary flex items-center ${isEditable ? 'cursor-pointer' : ''}`}
              onClick={isEditable ? () => setShowTipoDocModal(true) : undefined}
            >
              {factura.tipoDocumento}
              {isEditable && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Fila 2: Estado */}
          <div className="flex mb-1.5">
            <div className="w-[150px] text-sm text-secondary">Estado:</div>
            <div className="font-bold text-sm text-primary">{factura.estado}</div>
          </div>
          
          {/* Fila 3: Cliente */}
          <div className="flex mb-1.5">
            <div className="w-[150px] text-sm text-secondary">Cliente:</div>
            <div className={`font-bold text-sm text-primary flex items-center ${isEditable ? 'cursor-pointer' : ''}`}
              onClick={isEditable ? onClienteClick : undefined}>
              {factura.cliente?.nombre || (isCreatingInternal ? 'Seleccionar cliente' : 'N/A')} 
              {isEditable && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Fila 4: Tipo Cliente */}
          <div className="flex mb-1.5">
            <div className="w-[150px] text-sm text-secondary">Tipo Cliente:</div>
            <div className="font-bold text-sm text-primary">{factura.tipoCliente || 'N/A'}</div>
          </div>
          
          {/* Fila 5: Forma de Pago */}
          <div className="flex mb-1.5">
            <div className="w-[150px] text-sm text-secondary">Forma de Pago:</div>
            <div 
              className={`font-bold text-sm text-primary flex items-center ${isEditable ? 'cursor-pointer' : ''}`}
              onClick={isEditable ? () => setShowFormaPagoModal(true) : undefined}
            >
              {factura.formaPago}
              {isEditable && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Fila 6: Descuento */}
          <div className="flex mb-1.5">
            <div className="w-[150px] text-sm text-secondary">Descuento Aplicado:</div>
            <div className={`font-bold text-sm text-primary flex items-center ${isEditable ? 'cursor-pointer' : ''}`} 
              onClick={isEditable ? () => setShowDescuentoModal(true) : undefined}>
              {factura.descuento}
              {isEditable && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13v3h3l9.06-9.06-3-3L4 13z"/>
                </svg>
              )}
            </div>
          </div>
          
          {/* Fila 7: Vendedor */}
          <div className="flex mb-1.5">
            <div className="w-[150px] text-sm text-secondary">Vendedor:</div>
            <div 
              className={`font-bold text-sm text-primary flex items-center ${isEditable ? 'cursor-pointer' : ''}`}
              onClick={isEditable ? () => setShowVendedorModal(true) : undefined}
            >
              {factura.vendedor || (isCreatingInternal ? 'Seleccionar vendedor' : 'N/A')}
              {isEditable && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Fila 8: Total a Pagar */}
          <div className="flex items-center mb-1.5">
            <div className="w-[150px] text-sm text-secondary">Total a Pagar:</div>
            <div className="font-bold text-sm text-primary">{factura.totalPagar}</div>
          </div>
        </div>

        {/* Modales - Versión Móvil */}
        {/* Modal de Tipo de Documento */}
        <Modal
          isOpen={showTipoDocModal}
          onClose={() => setShowTipoDocModal(false)}
          title="Seleccionar Tipo Documento"
        >
          {loadingTiposDocumento ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ul>
              {tiposDocumento.map(tipo => (
                <li 
                  key={tipo.tipomov} 
                  className="p-2 cursor-pointer hover:bg-primary text-primary rounded-md"
                  onClick={() => {
                    onTipoDocumentoClick(tipo.ntipomov);
                    setShowTipoDocModal(false);
                  }}
                >
                  {tipo.ntipomov}
                </li>
              ))}
            </ul>
          )}
        </Modal>

        {/* Modal de Forma de Pago */}
        <Modal
          isOpen={showFormaPagoModal}
          onClose={() => setShowFormaPagoModal(false)}
          title="Seleccionar Forma de Pago"
        >
          {loadingFormasPago ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ul>
              {formasPago.map(forma => (
                <li 
                  key={forma.formpago} 
                  className="p-2 cursor-pointer hover:bg-primary text-primary rounded-md"
                  onClick={() => {
                    onFormaPagoClick(forma.nformpago);
                    setShowFormaPagoModal(false);
                  }}
                >
                  {forma.nformpago}
                </li>
              ))}
            </ul>
          )}
        </Modal>

        {/* Modal de Vendedor */}
        <Modal
          isOpen={showVendedorModal}
          onClose={() => setShowVendedorModal(false)}
          title="Seleccionar Vendedor"
        >
          <input
            type="text"
            placeholder="Buscar vendedor..."
            className="w-full p-2 mb-4 bg-primary text-primary rounded-md border border-secondary focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchVendedor}
            onChange={(e) => setSearchVendedor(e.target.value)}
          />
          
          {loadingVendedores ? (
            <div className="flex justify-center items-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ul className="max-h-40 overflow-y-auto">
              {vendedoresFiltrados.map(vendedor => (
                <li 
                  key={vendedor.vendedor} 
                  className="p-2 cursor-pointer hover:bg-primary text-primary rounded-md"
                  onClick={() => {
                    onVendedorClick(vendedor.nvendedor);
                    setShowVendedorModal(false);
                  }}
                >
                  {vendedor.nvendedor}
                </li>
              ))}
              {vendedoresFiltrados.length === 0 && (
                <li className="p-2 text-tertiary">No se encontraron vendedores</li>
              )}
            </ul>
          )}
        </Modal>

        {/* Modal de Descuento */}
        <Modal
          isOpen={showDescuentoModal}
          onClose={() => setShowDescuentoModal(false)}
          title="Aplicar Descuento"
        >
          <div className="space-y-4">
            <p className="text-secondary">Ingrese el porcentaje de descuento a aplicar al total de la factura.</p>
            
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 bg-primary text-primary rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
                value={descuentoInput}
                onChange={(e) => setDescuentoInput(e.target.value)}
              />
              <span className="ml-2 text-primary">%</span>
            </div>
            
            <div className="pt-2">
              <button
                onClick={aplicarDescuento}
                className="w-full bg-blue-600 text-primary px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                disabled={!descuentoInput.trim()}
              >
                Aplicar Descuento
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Versión escritorio
  return (
    <>
      <div className="grid grid-cols-[180px_1fr] gap-y-2 mb-2">
        <p className="text-secondary">Tipo Documento:</p>
        <p 
          className={`font-bold text-primary text-right flex items-center justify-end ${isEditable ? 'cursor-pointer' : ''}`}
          onClick={isEditable ? () => setShowTipoDocModal(true) : undefined}
        >
          {factura.tipoDocumento}
          {isEditable && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </p>
        
        <p className="text-secondary">Estado:</p>
        <p className="font-bold text-primary text-right">{factura.estado}</p>
        
        <p className="text-secondary">Cliente:</p>
        <p className={`font-bold text-primary text-right flex items-center justify-end ${isEditable ? 'cursor-pointer' : ''}`}
          onClick={isEditable ? onClienteClick : undefined}>
          {factura.cliente?.nombre || (isCreatingInternal ? 'Seleccionar cliente' : 'N/A')}
          {isEditable && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13v3h3l9.06-9.06-3-3L4 13z"/>
            </svg>
          )}
        </p>
        
        <p className="text-secondary">Tipo Cliente:</p>
        <p className="font-bold text-primary text-right">{factura.tipoCliente || 'N/A'}</p>
        
        <p className="text-secondary">Forma de Pago:</p>
        <p 
          className={`font-bold text-primary text-right flex items-center justify-end ${isEditable ? 'cursor-pointer' : ''}`}
          onClick={isEditable ? () => setShowFormaPagoModal(true) : undefined}
        >
          {factura.formaPago}
          {isEditable && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </p>

        <p className="text-secondary">Fecha:</p>
        <p className="font-bold text-primary text-right">{factura.fecha}</p>
        
        <p className="text-secondary">Descuento Aplicado:</p>
        <p className={`font-bold text-primary text-right flex items-center justify-end ${isEditable ? 'cursor-pointer' : ''}`} 
          onClick={isEditable ? () => setShowDescuentoModal(true) : undefined}>
          {factura.descuento}
          {isEditable && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13v3h3l9.06-9.06-3-3L4 13z"/>
            </svg>
          )}
        </p>
        
        <p className="text-secondary">Vendedor:</p>
        <p 
          className={`font-bold text-primary text-right flex items-center justify-end ${isEditable ? 'cursor-pointer' : ''}`}
          onClick={isEditable ? () => setShowVendedorModal(true) : undefined}
        >
          {factura.vendedor || (isCreatingInternal ? 'Seleccionar vendedor' : 'N/A')}
          {isEditable && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </p>
        
        <p className="text-secondary">Total a Pagar:</p>
        <p className="font-bold text-primary text-right">{factura.totalPagar}</p>
      </div>

      {/* Modales - Versión escritorio */}
      {/* Modal de Tipo de Documento */}
      <Modal
        isOpen={showTipoDocModal}
        onClose={() => setShowTipoDocModal(false)}
        title="Seleccionar Tipo Documento"
      >
        {loadingTiposDocumento ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ul>
            {tiposDocumento.map(tipo => (
              <li 
                key={tipo.tipomov} 
                className="p-2 cursor-pointer hover:bg-primary text-primary rounded-md"
                onClick={() => {
                  onTipoDocumentoClick(tipo.ntipomov);
                  setShowTipoDocModal(false);
                }}
              >
                {tipo.ntipomov}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Modal de Forma de Pago */}
      <Modal
        isOpen={showFormaPagoModal}
        onClose={() => setShowFormaPagoModal(false)}
        title="Seleccionar Forma de Pago"
      >
        {loadingFormasPago ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ul>
            {formasPago.map(forma => (
              <li 
                key={forma.formpago} 
                className="p-2 cursor-pointer hover:bg-primary text-primary rounded-md"
                onClick={() => {
                  onFormaPagoClick(forma.nformpago);
                  setShowFormaPagoModal(false);
                }}
              >
                {forma.nformpago}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Modal de Vendedor */}
      <Modal
        isOpen={showVendedorModal}
        onClose={() => setShowVendedorModal(false)}
        title="Seleccionar Vendedor"
      >
        <input
          type="text"
          placeholder="Buscar vendedor..."
          className="w-full p-2 mb-4 bg-primary text-primary rounded-md border border-secondary focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchVendedor}
          onChange={(e) => setSearchVendedor(e.target.value)}
        />
        
        {loadingVendedores ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ul className="max-h-40 overflow-y-auto">
            {vendedoresFiltrados.map(vendedor => (
              <li 
                key={vendedor.vendedor} 
                className="p-2 cursor-pointer hover:bg-primary text-primary rounded-md"
                onClick={() => {
                  onVendedorClick(vendedor.nvendedor);
                  setShowVendedorModal(false);
                }}
              >
                {vendedor.nvendedor}
              </li>
            ))}
            {vendedoresFiltrados.length === 0 && (
              <li className="p-2 text-tertiary">No se encontraron vendedores</li>
            )}
          </ul>
        )}
      </Modal>

      {/* Modal de Descuento */}
      <Modal
        isOpen={showDescuentoModal}
        onClose={() => setShowDescuentoModal(false)}
        title="Aplicar Descuento"
      >
        <div className="space-y-4">
          <p className="text-secondary">Ingrese el porcentaje de descuento a aplicar al total de la factura.</p>
          
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 bg-primary text-primary rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0"
              value={descuentoInput}
              onChange={(e) => setDescuentoInput(e.target.value)}
            />
            <span className="ml-2 text-primary">%</span>
          </div>
          
          <div className="pt-2">
            <button
              onClick={aplicarDescuento}
              className="w-full bg-blue-600 text-primary px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              disabled={!descuentoInput.trim()}
            >
              Aplicar Descuento
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};