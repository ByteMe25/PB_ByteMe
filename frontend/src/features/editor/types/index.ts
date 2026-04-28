/* Formati di esportazione supportati dal sistema - usati in SaveDocumentModal */

export type ExportFormat = 'md' | 'txt' | 'html';

/**
 * Configurazione UI per il dropdown dei formati
 * Permette di generare le <option> dinamicamente senza duplicare codice
 */
export const EXPORT_FORMAT_OPTIONS: { 
  value: ExportFormat; 
  label: string; 
  mimeType?: string; //utile per Blob/fetch
}[] = [
  //supportati nativamente dai browser
  { value: 'md', label: 'Markdown (.md)', mimeType: 'text/markdown' },
  { value: 'txt', label: 'Testo semplice (.txt)', mimeType: 'text/plain' },
  { value: 'html', label: 'HTML (.html)', mimeType: 'text/html' },
];

/**
 * Helper type-safe per validare una stringa come ExportFormat
 * @param format - Stringa da validare
 * @returns true se il formato è supportato
 */
export const isValidExportFormat = (format: string): format is ExportFormat => {
  return EXPORT_FORMAT_OPTIONS.some(opt => opt.value === format);
};