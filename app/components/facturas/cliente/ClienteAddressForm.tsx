import React from 'react';
import { Cliente } from './types';

interface ClienteAddressFormProps {
  cliente: Cliente;
  editMode: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ClienteAddressForm = ({ cliente, editMode, onChange }: ClienteAddressFormProps) => {
  // Lista de departamentos de El Salvador
  const departamentos = [
    "Ahuachapán",
    "Cabañas",
    "Chalatenango",
    "Cuscatlán",
    "La Libertad",
    "La Paz",
    "La Unión",
    "Morazán",
    "San Miguel",
    "San Salvador",
    "San Vicente",
    "Santa Ana",
    "Sonsonate",
    "Usulután"
  ];

  return (
    <div className="bg-secondary rounded-lg p-4 mb-4">
      <h4 className="text-md font-semibold mb-3">Dirección</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <label className="block text-sm text-secondary">País:</label>
          <input
            type="text"
            name="pais"
            value={cliente.pais || 'El Salvador'}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Departamento:</label>
          <select
            name="departamento"
            value={cliente.departamento || ''}
            onChange={onChange as any}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          >
            <option value="">Seleccione un departamento</option>
            {departamentos.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-secondary">Municipio:</label>
          <input
            type="text"
            name="municipio"
            value={cliente.municipio || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-sm text-secondary">Dirección:</label>
          <input
            type="text"
            name="direccion"
            value={cliente.direccion || ''}
            onChange={onChange}
            className={`w-full p-2 rounded-md text-primary focus:outline-none focus:ring-1 focus:ring-blue-500 ${editMode ? 'bg-tertiary' : 'bg-primary'}`}
            disabled={!editMode}
          />
        </div>
      </div>
    </div>
  );
};