import React from 'react';
import { Cliente } from './types';

interface ClienteFiscalAttributesProps {
  cliente: Cliente;
  editMode: boolean;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ClienteFiscalAttributes = ({ cliente, editMode, onCheckboxChange }: ClienteFiscalAttributesProps) => {
  return (
    <div className="bg-secondary rounded-lg p-4 mb-4">
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
          <label htmlFor="verificadoDICOM" className="text-sm">Verificado DICOM</label>
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
          <label htmlFor="gobierno" className="text-sm">Gobierno</label>
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
          <label htmlFor="retencion" className="text-sm">Retención</label>
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
          <label htmlFor="noSujeto" className="text-sm">No Sujeto</label>
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
          <label htmlFor="aplicaIVAPropia" className="text-sm">Aplica IVA Propina</label>
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
          <label htmlFor="propioTalSol" className="text-sm">Propio(Tal-Sol)</label>
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
          <label htmlFor="noRestringirCredito" className="text-sm">No Restringir Crédito</label>
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
          <label htmlFor="autoConsumo" className="text-sm">Auto Consumo</label>
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
          <label htmlFor="tasaCero" className="text-sm">Tasa Cero</label>
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
          <label htmlFor="clienteExportacion" className="text-sm">Cliente Exportación</label>
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
          <label htmlFor="percepcion" className="text-sm">Percepción</label>
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
          <label htmlFor="excentoImpuestos" className="text-sm">Excento Impuestos</label>
        </div>
      </div>
    </div>
  );
};