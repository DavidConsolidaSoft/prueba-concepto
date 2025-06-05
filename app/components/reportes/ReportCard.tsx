'use client';
import { useState } from 'react';
import ReportViewer from './ReportViewer';

interface ReportCardProps {
  reportId: string;
  title: string;
  onClose: () => void;
  isMobile: boolean;
}

export default function ReportCard({ reportId, title, onClose, isMobile }: ReportCardProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Cabecera */}
      <div className="flex items-center justify-between p-3 border-b border-secondary">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button 
          onClick={onClose}
          className="text-secondary hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Contenido del reporte */}
      <div className="flex-1 overflow-auto">
        <ReportViewer 
          reportType={reportId} 
          isMobile={isMobile} 
        />
      </div>
    </div>
  );
}