export const FACTURA_CONFIG = {
  PAGE_SIZE: 50,
  SEARCH_DEBOUNCE: 300,
  TOAST_DURATION: 5000,
  
  COLORS: {
    status: {
      open: {
        text: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      },
      closed: {
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      },
      void: {
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      }
    }
  },

  BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  }
} as const;