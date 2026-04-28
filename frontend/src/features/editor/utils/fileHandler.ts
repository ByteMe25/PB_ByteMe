/**
 * Scarica fisicamente un file sul dispositivo dell'utente
 * Crea un Blob in memoria e simula il click su un link nascosto
 *
 * @param content - Il contenuto testuale del file (markdown, html, ecc.)
 * @param filename - Il nome completo del file (es. 'documento.md')
 * @param mimeType - Il tipo MIME del file (es. 'text/markdown')
 */
export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  //crea un "pacchetto" di dati (Blob) con il contenuto
  const blob = new Blob([content], { type: mimeType });

  //crea un URL temporaneo nel browser che punta a questo pacchetto
  const url = URL.createObjectURL(blob);

  //crea un elemento <a> (link) invisibile
  const link = document.createElement('a');
  link.href = url;
  link.download = filename; // Dice al browser di scaricare, non di navigare

  //aggiunge il link alla pagina, lo "clicca" virtualmente e lo rimuove subito dopo
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  //libera la memoria del browser distruggendo l'URL temporaneo
  URL.revokeObjectURL(url);
};