// src/lib/utils/excelExport.ts
import * as XLSX from 'xlsx';

/**
 * Exporte des données en fichier Excel
 */
export function exportToExcel<T>(
  data: T[],
  filename: string,
  sheetName: string = 'Export'
): void {
  if (!data || data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Créer un nouveau workbook
  const workbook = XLSX.utils.book_new();

  // Convertir les données en worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Ajuster la largeur des colonnes
  const cols = Object.keys(data[0] as any).map(() => ({ wch: 20 }));
  worksheet['!cols'] = cols;

  // Ajouter le worksheet au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Générer le fichier et déclencher le téléchargement
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Génère un template Excel avec des en-têtes et des exemples
 */
export function generateExcelTemplate(
  fields: Array<{ key: string; label: string; example?: string }>,
  filename: string,
  sheetName: string = 'Template'
): void {
  // Créer un nouveau workbook
  const workbook = XLSX.utils.book_new();

  // Créer les données du template avec en-têtes et exemples
  const templateData = [
    // Ligne d'instructions
    { ...fields.reduce((acc, field) => ({ ...acc, [field.label]: '' }), {}) },
    // Ligne d'en-têtes (sera la première ligne visible)
    fields.reduce((acc, field) => ({ ...acc, [field.label]: field.label }), {}),
    // Lignes d'exemples
    fields.reduce((acc, field) => ({
      ...acc,
      [field.label]: field.example || `Exemple ${field.label}`
    }), {}),
    fields.reduce((acc, field) => ({
      ...acc,
      [field.label]: field.example || `Valeur ${field.label}`
    }), {})
  ];

  // Convertir en worksheet
  const worksheet = XLSX.utils.json_to_sheet(templateData, { skipHeader: true });

  // Ajouter la ligne d'instructions en haut
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [['→ Remplissez vos données à partir de la ligne 4. Les lignes 2-3 sont des exemples.']],
    { origin: 'A1' }
  );

  // Fusionner les cellules pour l'instruction
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: fields.length - 1 } }
  ];

  // Ajuster la largeur des colonnes
  const cols = fields.map(() => ({ wch: 25 }));
  worksheet['!cols'] = cols;

  // Ajouter le worksheet au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Générer le fichier et déclencher le téléchargement
  XLSX.writeFile(workbook, `template_${filename}.xlsx`);
}

/**
 * Lit un fichier Excel et retourne les données sous forme d'objets
 */
export function importFromExcel<T>(
  file: File,
  callback: (data: T[], error?: string) => void
): void {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      // Prendre la première feuille
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convertir en JSON
      const jsonData = XLSX.utils.sheet_to_json<T>(worksheet, {
        raw: false, // Convertir les dates en string
        defval: '' // Valeur par défaut pour les cellules vides
      });

      // Filtrer les lignes vides
      const filteredData = jsonData.filter((row: any) => {
        return Object.values(row).some(val => val !== '' && val !== null && val !== undefined);
      });

      callback(filteredData);
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier Excel:', error);
      callback([], error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  reader.onerror = () => {
    callback([], 'Erreur lors de la lecture du fichier');
  };

  reader.readAsBinaryString(file);
}

/**
 * Exporte des données en CSV
 */
export function exportToCSV<T>(
  data: T[],
  filename: string
): void {
  if (!data || data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Créer un worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Convertir en CSV
  const csv = XLSX.utils.sheet_to_csv(worksheet);

  // Créer un Blob et déclencher le téléchargement
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporte des données en JSON
 */
export function exportToJSON<T>(
  data: T[],
  filename: string
): void {
  if (!data || data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
