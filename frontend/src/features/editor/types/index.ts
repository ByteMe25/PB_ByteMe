/* Formati di esportazione supportati dal sistema - usati in SaveDocumentModal */

export type ExportFormat = 'md' | 'html' | 'pdf' | 'docx' | 'odt';

/**
 * Configurazione UI per il dropdown dei formati
 * Permette di generare le <option> dinamicamente senza duplicare codice
 */
export const EXPORT_FORMAT_OPTIONS: { 
  value: ExportFormat; 
  label: string; 
  mimeType?: string; //utile per Blob/fetch
}[] = [
  { value: 'md', label: 'Markdown (.md)', mimeType: 'text/markdown' },
  { value: 'html', label: 'HTML (.html)', mimeType: 'text/html' },
  { value: 'pdf', label: 'PDF (.pdf)', mimeType: 'application/pdf' },
  { value: 'docx', label: 'Word (.docx)', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { value: 'odt', label: 'OpenDocument (.odt)', mimeType: 'application/vnd.oasis.opendocument.text' },
];

/**
 * Helper type-safe per validare una stringa come ExportFormat
 * @param format - Stringa da validare
 * @returns true se il formato è supportato
 */
export const isValidExportFormat = (format: string): format is ExportFormat => {
  return EXPORT_FORMAT_OPTIONS.some(opt => opt.value === format);
};