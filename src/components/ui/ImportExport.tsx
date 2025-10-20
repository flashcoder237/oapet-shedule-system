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
import { exportToExcel, exportToCSV, exportToJSON, generateExcelTemplate, importFromExcel } from '@/lib/utils/excelExport';

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

  /**
   * Configuration des champs pour le template
   */
  templateFields?: Array<{ key: string; label: string; example?: string }>;

  /**
   * Utiliser l'export côté frontend au lieu du backend
   */
  useFrontendExport?: boolean;
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
  variant = 'outline',
  templateFields = [],
  useFrontendExport = true
}: ImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleExport = async (format: string) => {
    setIsExporting(true);

    try {
      if (useFrontendExport) {
        // Export côté frontend
        // Récupérer les données depuis l'API
        const token = localStorage.getItem('auth_token');
        const queryString = new URLSearchParams(exportParams).toString();
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${exportEndpoint}${queryString ? '?' + queryString : ''}`;

        const response = await fetch(url, {
          headers: {
            ...(token ? { 'Authorization': `Token ${token}` } : {})
          }
        });

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        const exportData = Array.isArray(data) ? data : data.results || [];
        const filename = `${resourceName}_${new Date().toISOString().split('T')[0]}`;

        // Exporter selon le format
        if (format === 'excel') {
          exportToExcel(exportData, filename, resourceName);
        } else if (format === 'csv') {
          exportToCSV(exportData, filename);
        } else if (format === 'json') {
          exportToJSON(exportData, filename);
        }

        addToast({
          title: "Export réussi",
          description: `${exportData.length} élément(s) exporté(s) en ${format.toUpperCase()}`,
        });
      } else {
        // Export côté backend (ancienne méthode)
        const params = {
          format,
          ...exportParams
        };

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
          title: "Export réussi",
          description: `Les données ont été exportées en format ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = async (format: string) => {
    setIsDownloadingTemplate(true);

    try {
      if (useFrontendExport && templateFields.length > 0) {
        // Génération du template côté frontend
        if (format === 'excel') {
          generateExcelTemplate(templateFields, resourceName);
        } else if (format === 'csv') {
          // Créer un CSV simple avec les en-têtes
          const headers = templateFields.map(f => f.label).join(',');
          const examples = templateFields.map(f => f.example || `Exemple ${f.label}`).join(',');
          const csvContent = `${headers}\n${examples}`;

          const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `template_${resourceName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (format === 'json') {
          // Créer un JSON avec un exemple
          const example = templateFields.reduce((acc, field) => ({
            ...acc,
            [field.key]: field.example || `Exemple ${field.label}`
          }), {});
          exportToJSON([example], `template_${resourceName}`);
        }

        addToast({
          title: "Template téléchargé",
          description: `Le fichier template a été téléchargé en format ${format.toUpperCase()}`,
        });
      } else {
        // Téléchargement du template depuis le backend (ancienne méthode)
        const token = localStorage.getItem('auth_token');

        // Construire l'endpoint du template de manière plus robuste
        let templateEndpoint = importEndpoint;

        // Remplacer 'import_data' par 'download_template'
        if (templateEndpoint.includes('import_data')) {
          templateEndpoint = templateEndpoint.replace('import_data', 'download_template');
        } else if (templateEndpoint.includes('import')) {
          templateEndpoint = templateEndpoint.replace('import', 'download_template');
        } else {
          // Si aucun pattern n'est trouvé, ajouter download_template à la fin
          templateEndpoint = templateEndpoint.replace(/\/$/, '') + '/download_template/';
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}${templateEndpoint}?format=${format}`;

        const response = await fetch(url, {
          headers: {
            ...(token ? { 'Authorization': `Token ${token}` } : {})
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Template download failed: ${response.status} ${errorText}`);
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error('Le fichier téléchargé est vide');
        }

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
      }
    } catch (error: any) {
      console.error('Erreur téléchargement template:', error);

      addToast({
        title: "Erreur de téléchargement",
        description: error.message || "Impossible de télécharger le template",
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
