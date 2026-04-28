/**
 * Funzioni per sanitizzare un nome file rimuovendo caratteri illegali per filesystem comuni
 * (Windows: <>:"/\|?*, macOS/Linux: solo /)
 * 
 * @param name - Il nome file da sanitizzare
 * @returns Il nome file pulito, pronto per l'uso
 * 
 * NON applica trim() qui per permettere all'utente di digitare spazi tra le parole
 * trim() va applicato solo al momento dell'export finale
 */
export const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')  //sostituisce caratteri illegali con underscore
    .replace(/\s+/g, ' ')           //normalizza spazi multipli in uno singolo
};

/**
 * Compone il nome file finale con estensione, applicando trim() solo alla fine
 * @param baseName - Il nome base (già sanitizzato o meno)
 * @param extension - L'estensione senza punto (es. 'md', non '.md')
 * @returns Il filename completo e valido (es. 'mio-file.md')
 */
export const composeFilename = (baseName: string, extension: string): string => {
  let clean = sanitizeFilename(baseName).trim(); // trim finale
  const ext = extension.startsWith('.') ? extension.slice(1) : extension;

  //rimuove l'estensione se l'utente l'ha digitata, ignora le maiuscole/minuscole ('i').
  const extRegex = new RegExp(`\\.${ext}$`, 'i');
  clean = clean.replace(extRegex, '');

  clean = clean.replace(/\.(md|txt|html)$/i, '');

  return clean ? `${clean}.${ext}` : `documento.${ext}`;
};