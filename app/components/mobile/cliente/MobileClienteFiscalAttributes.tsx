import React from 'react';
import { MobileClienteFiscalAttributesProps } from './types';

export const MobileClienteFiscalAttributes = ({ cliente, editMode, onCheckboxChange }: MobileClienteFiscalAttributesProps) => {
  return (
    <div className="bg-secondary rounded-lg p-3 mb-3">
      <h4 className="text-md font-semibold mb-3">Atributos Fiscales</h4>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="verificadoDICOM"
            name="verificadoDICOM"
            checked={cliente.verificadoDICOM || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="verificadoDICOM" className="text-xs">Verificado DICOM</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="gobierno"
            name="gobierno"
            checked={cliente.gobierno || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="gobierno" className="text-xs">Gobierno</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="retencion"
            name="retencion"
            checked={cliente.retencion || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="retencion" className="text-xs">Retención</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="noSujeto"
            name="noSujeto"
            checked={cliente.noSujeto || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="noSujeto" className="text-xs">No Sujeto</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="aplicaIVAPropia"
            name="aplicaIVAPropia"
            checked={cliente.aplicaIVAPropia || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="aplicaIVAPropia" className="text-xs">Aplica IVA Propina</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="propioTalSol"
            name="propioTalSol"
            checked={cliente.propioTalSol || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="propioTalSol" className="text-xs">Propio(Tal-Sol)</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="noRestringirCredito"
            name="noRestringirCredito"
            checked={cliente.noRestringirCredito || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="noRestringirCredito" className="text-xs">No Restringir Crédito</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoConsumo"
            name="autoConsumo"
            checked={cliente.autoConsumo || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="autoConsumo" className="text-xs">Auto Consumo</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="tasaCero"
            name="tasaCero"
            checked={cliente.tasaCero || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="tasaCero" className="text-xs">Tasa Cero</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="clienteExportacion"
            name="clienteExportacion"
            checked={cliente.clienteExportacion || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="clienteExportacion" className="text-xs">Cliente Exportación</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="percepcion"
            name="percepcion"
            checked={cliente.percepcion || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="percepcion" className="text-xs">Percepción</label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="excentoImpuestos"
            name="excentoImpuestos"
            checked={cliente.excentoImpuestos || false}
            onChange={onCheckboxChange}
            className="mr-2"
            disabled={!editMode}
          />
          <label htmlFor="excentoImpuestos" className="text-xs">Excento Impuestos</label>
        </div>
      </div>
    </div>
  );
};