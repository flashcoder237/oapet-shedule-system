'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Upload, Download, FileJson, FileSpreadsheet, FileText, Loader2, CheckCircle, AlertCircle, FileDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api/client';

interface ImportExportProps {
  /**
   * Endpoint de l'API pour l'export (ex: '/courses/courses/export/')
   */
  exportEndpoint: string;

  /**
   * Endpoint de l'API pour l'import (ex: '/courses/courses/import/')
   */
  importEndpoint: string;

  /**
   * Nom de la ressource (pour les messages utilisateur)
   */
  resourceName: string;

  /**
   * Callback après import réussi
   */
  onImportSuccess?: () => void;

  /**
   * Formats d'export disponibles
   */
  exportFormats?: ('csv' | 'json' | 'excel')[];

  /**
   * Formats d'import acceptés
   */
  importFormats?: ('csv' | 'json' | 'excel')[];

  /**
   * Paramètres additionnels pour l'export
   */
  exportParams?: Record<string, any>;

  /**
   * Taille du bouton
   */
  size?: 'sm' | 'default' | 'lg';

  /**
   * Variante visuelle
   */
  variant?: 'default' | 'outline' | 'ghost';
}

export function ImportExport({
  exportEndpoint,
  importEndpoint,
  resourceName,
  onImportSuccess,
  exportFormats = ['csv', 'json', 'excel'],
  importFormats = ['csv', 'json', 'excel'],
  exportParams = {},
  size = 'default',
  variant = 'outline'
}: ImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleExport = async (format: string) => {
    setIsExporting(true);

    try {
      const params = {
        format,
        ...exportParams
      };

      // Utiliser fetch pour télécharger le fichier
      const token = localStorage.getItem('auth_token');
      const queryString = new URLSearchParams(params).toString();
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${exportEndpoint}?${queryString}`;

      const response = await fetch(url, {
        headers: {
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const fileExtension = format === 'excel' ? 'xlsx' : format;
      link.download = `${resourceName}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      addToast({
        title: "Export reussi",
        description: `Les donnees ont ete exportees en format ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les donnees",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = async (format: string) => {
    setIsDownloadingTemplate(true);

    try {
      const token = localStorage.getItem('auth_token');
      const templateEndpoint = importEndpoint.replace('/import_data/', '/download_template/');
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${templateEndpoint}?format=${format}`;

      const response = await fetch(url, {
        headers: {
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error('Template download failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const fileExtension = format === 'excel' ? 'xlsx' : format;
      link.download = `template_${resourceName}.${fileExtension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      addToast({
        title: "Template téléchargé",
        description: `Le fichier template a été téléchargé en format ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Template download error:', error);
      addToast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le template",
        variant: "destructive"
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Détecter le format du fichier
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension) {
        formData.append('format', extension === 'xlsx' ? 'excel' : extension);
      }

      const token = localStorage.getItem('auth_token');
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${importEndpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Token ${token}` } : {})
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      addToast({
        title: "Import reussi",
        description: data.message || `${data.imported_count || 0} element(s) importe(s)`,
      });

      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error: any) {
      console.error('Import error:', error);
      addToast({
        title: "Erreur d'import",
        description: error.message || "Impossible d'importer les donnees",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <FileJson className="w-4 h-4 mr-2" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 mr-2" />;
      case 'csv':
        return <FileText className="w-4 h-4 mr-2" />;
      default:
        return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  const acceptedFormats = importFormats.map(f => {
    if (f === 'excel') return '.xlsx,.xls';
    return `.${f}`;
  }).join(',');

  return (
    <div className="flex gap-2">
      {/* Bouton Import */}
      <Button
        variant={variant}
        size={size}
        onClick={handleImportClick}
        disabled={isImporting}
      >
        {isImporting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Importation...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </>
        )}
      </Button>

      {/* Input fichier caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Menu Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Export...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
            Exporter les données
          </div>
          {exportFormats.includes('csv') && (
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              {getFormatIcon('csv')}
              CSV
            </DropdownMenuItem>
          )}
          {exportFormats.includes('json') && (
            <DropdownMenuItem onClick={() => handleExport('json')}>
              {getFormatIcon('json')}
              JSON
            </DropdownMenuItem>
          )}
          {exportFormats.includes('excel') && (
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              {getFormatIcon('excel')}
              Excel
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
            Télécharger un template
          </div>
          {importFormats.includes('csv') && (
            <DropdownMenuItem
              onClick={() => handleDownloadTemplate('csv')}
              disabled={isDownloadingTemplate}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Template CSV
            </DropdownMenuItem>
          )}
          {importFormats.includes('json') && (
            <DropdownMenuItem
              onClick={() => handleDownloadTemplate('json')}
              disabled={isDownloadingTemplate}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Template JSON
            </DropdownMenuItem>
          )}
          {importFormats.includes('excel') && (
            <DropdownMenuItem
              onClick={() => handleDownloadTemplate('excel')}
              disabled={isDownloadingTemplate}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Template Excel
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
