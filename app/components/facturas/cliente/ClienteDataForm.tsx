import React from 'react';
import { Cliente } from './types';

interface ClienteDataFormProps {
  cliente: Cliente;
  editMode: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ClienteDataForm = ({ cliente, editMode, onChange }: ClienteDataFormProps) => {
  return (
    <div className="bg-secondary rounded-lg p-4 mb-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <label className="block text-sm text-secondary">Código:</label>
          <input
            type="text"
            name="codigo"
            value={cliente.codigo || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode || (cliente.id > 0)} // No permitir editar código si es un cliente existente
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Nombres:</label>
          <input
            type="text"
            name="nombre"
            value={cliente.nombre || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Tipo Documento:</label>
          <select
            name="tipoDocumento"
            value={cliente.tipoDocumento || 'NIT'}
            onChange={onChange as any}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          >
            <option value="NIT">NIT</option>
            <option value="DUI">DUI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-secondary">Número Registro:</label>
          <input
            type="text"
            name="numeroRegistro"
            value={cliente.numeroRegistro || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Tipo Cliente:</label>
          <select
            name="tipoCliente"
            value={cliente.tipoCliente || '1'}
            onChange={onChange as any}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          >
            <option value="1">Individual</option>
            <option value="2">Corporativo</option>
            <option value="3">Contado</option>
            <option value="4">Crédito</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-secondary">Giro:</label>
          <input
            type="text"
            name="giro"
            value={cliente.giro || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Razón Social:</label>
          <input
            type="text"
            name="razonSocial"
            value={cliente.razonSocial || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Conglomerado:</label>
          <input
            type="text"
            name="conglomerado"
            value={cliente.conglomerado || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Límite de Crédito:</label>
          <input
            type="text"
            name="limiteCredito"
            value={cliente.limiteCredito || '$0.00'}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Email:</label>
          <input
            type="email"
            name="email"
            value={cliente.email || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Email Alterno:</label>
          <input
            type="email"
            name="emailAlterno"
            value={cliente.emailAlterno || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={cliente.telefono || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Teléfono Alterno:</label>
          <input
            type="text"
            name="telefonoAlterno"
            value={cliente.telefonoAlterno || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
      </div>
    </div>
  );
};