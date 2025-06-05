import type { NextConfig } from "next";

// Forzar carga de variables de entorno según el entorno
const loadEnvConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    // En producción, asegurar que las variables estén disponibles
    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      process.env.NEXT_PUBLIC_BACKEND_URL = 'https://siscal-agent-ai.siscal.one';
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      process.env.NEXT_PUBLIC_APP_URL = 'https://green-ocean-06fb1390f.6.azurestaticapps.net';
    }
  }
};

// Ejecutar carga de variables
loadEnvConfig();

const nextConfig: NextConfig = {
  // reactStrictMode: true, // Comentado para evitar doble ejecución en desarrollo
  
  // Configuración para Azure Static Web Apps
  output: 'export',
  trailingSlash: true,
  
  // Configuración de imágenes
  images: {
    unoptimized: true,
    domains: ['siscal-agent-ai.siscal.one'],
  },
  
  // Ignorar errores durante el build (ya los tienes)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuraciones específicas para Azure Static Web Apps
  distDir: 'out', // Directorio de salida para Azure
  
  // Configuración de rewrites para desarrollo (solo aplica en dev)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:path*`,
      },
    ];
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;