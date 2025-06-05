// lib/hooks/useProductosFacura.ts
import { useState, useEffect } from 'react';
import ProductoService from '../api/productoService';
import { ProductoFactura } from '../types/facturaTypes';

interface UseProductosFacturaParams {
  cajaId: number;
  listaPrecioId: number;
  bodegaId: string;
}

interface UseProductosFacturaResult {
  // Listas de productos
  productosDisponibles: any[];
  productosSeleccionados: ProductoFactura[];
  productosEnFactura: ProductoFactura[];
  
  // Estado de búsqueda y paginación
  busqueda: string;
  pagina: number;
  totalPaginas: number;
  cargando: boolean;
  error: string | null;
  
  // Funciones para manejar productos
  setBusqueda: (busqueda: string) => void;
  setPagina: (pagina: number) => void;
  agregarProducto: (producto: any, cantidad: number, descuento: number) => void;
  actualizarProducto: (index: number, cantidad: number, descuento: number) => void;
  eliminarProducto: (index: number) => void;
  confirmarProductosSeleccionados: () => void;
  limpiarSeleccion: () => void;
  limpiarFactura: () => void;
}

export function useProductosFactura({
  cajaId,
  listaPrecioId,
  bodegaId
}: UseProductosFacturaParams): UseProductosFacturaResult {
  // Estados para productos
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoFactura[]>([]);
  const [productosEnFactura, setProductosEnFactura] = useState<ProductoFactura[]>([]);
  
  // Estados para búsqueda y paginación
  const [busqueda, setBusqueda] = useState<string>('');
  const [pagina, setPagina] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  
  // Estados para manejo de carga y errores
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar productos del kardex cuando cambia la búsqueda o página
  useEffect(() => {
    const cargarProductos = async () => {
      setCargando(true);
      setError(null);
      
      try {
        const resultado = await ProductoService.getProductosKardex(
          cajaId,
          listaPrecioId,
          busqueda === '' ? '%' : `%${busqueda}%`,
          bodegaId,
          true, // solo_existencias
          true, // con_estante
          false, // precio_promo
          false, // es_control_mesa
          pagina,
          20 // items_por_pagina
        );
        
        // Mapear productos de API a formato para UI
        const productosMapeados = resultado.productos.map(p => 
          ProductoService.mapApiProductoToUiProducto(p)
        );
        
        setProductosDisponibles(productosMapeados);
        setTotalPaginas(resultado.total_paginas);
      } catch (err) {
        setError('Error al cargar productos: ' + (err instanceof Error ? err.message : String(err)));
        console.error('Error al cargar productos:', err);
      } finally {
        setCargando(false);
      }
    };
    
    // Esperar 300ms después de la última escritura para buscar
    const timeoutId = setTimeout(() => {
      cargarProductos();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [busqueda, pagina, cajaId, listaPrecioId, bodegaId]);
  
  // Función para agregar un producto a la selección
  const agregarProducto = (producto: any, cantidad: number, descuento: number = 0) => {
    if (cantidad <= 0) return;
    
    const subtotal = producto.precioNumerico * cantidad;
    const descuentoValor = subtotal * (descuento / 100);
    const total = subtotal - descuentoValor;
    
    const nuevoProducto: ProductoFactura = {
      id: producto.id,
      kardexId: producto.kardexId,
      loteId: producto.loteId,
      nombre: producto.nombre,
      codigo: producto.codigo,
      precio: producto.precioNumerico,
      cantidad: cantidad,
      descuento: descuento,
      subtotal: subtotal,
      total: total,
      esServicio: producto.esServicio || false,
      nolote: producto.nolote,
      fechaVencimiento: producto.fechaVencimiento
    };
    
    setProductosSeleccionados(prevProductos => [...prevProductos, nuevoProducto]);
  };
  
  // Función para actualizar un producto en la selección
  const actualizarProducto = (index: number, cantidad: number, descuento: number = 0) => {
    if (index < 0 || index >= productosSeleccionados.length) return;
    
    setProductosSeleccionados(prevProductos => {
      const nuevosProductos = [...prevProductos];
      const producto = nuevosProductos[index];
      
      const subtotal = producto.precio * cantidad;
      const descuentoValor = subtotal * (descuento / 100);
      const total = subtotal - descuentoValor;
      
      nuevosProductos[index] = {
        ...producto,
        cantidad: cantidad,
        descuento: descuento,
        subtotal: subtotal,
        total: total
      };
      
      return nuevosProductos;
    });
  };
  
  // Función para eliminar un producto de la selección
  const eliminarProducto = (index: number) => {
    if (index < 0 || index >= productosSeleccionados.length) return;
    
    setProductosSeleccionados(prevProductos => 
      prevProductos.filter((_, i) => i !== index)
    );
  };
  
  // Función para confirmar los productos seleccionados y agregarlos a la factura
  const confirmarProductosSeleccionados = () => {
    // Agregar productos seleccionados a la factura
    setProductosEnFactura(prevProductos => [...prevProductos, ...productosSeleccionados]);
    
    // Limpiar selección actual
    setProductosSeleccionados([]);
  };
  
  // Función para limpiar la selección actual
  const limpiarSeleccion = () => {
    setProductosSeleccionados([]);
  };
  
  // Función para limpiar todos los productos de la factura
  const limpiarFactura = () => {
    setProductosEnFactura([]);
    setProductosSeleccionados([]);
  };
  
  return {
    productosDisponibles,
    productosSeleccionados,
    productosEnFactura,
    busqueda,
    pagina,
    totalPaginas,
    cargando,
    error,
    setBusqueda,
    setPagina,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    confirmarProductosSeleccionados,
    limpiarSeleccion,
    limpiarFactura
  };
}