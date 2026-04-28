// file di test per filenameUtils.ts: funzione di sanitizzazione e composizione nome file per export
import { describe, it, expect } from 'vitest';
import { sanitizeFilename, composeFilename } from './filenameUtils';

describe('filenameUtils', () => {
  describe('sanitizeFilename', () => {
    it('sostituisce caratteri illegali con underscore', () => {
      expect(sanitizeFilename('file<name>.txt')).toBe('file_name_.txt');
      expect(sanitizeFilename('test|file')).toBe('test_file');
    });
    

    it('normalizza spazi multipli', () => {
      expect(sanitizeFilename('mio   file')).toBe('mio file');
    });
    

    it('NON chiama trim() per spazi interni (permettere digitazione utente)', () => {
      //passiamo doppi spazi. Non fa trim (quindi gli spazi ai lati rimangono), ma li unisce in uno solo se sono multipli
      expect(sanitizeFilename('  test  ')).toBe(' test '); 
    });
  });

  describe('composeFilename', () => {
    it('aggiunge estensione al nome sanitizzato e trimmato', () => {
      expect(composeFilename('mio file', 'pdf')).toBe('mio file.pdf');
    });
    

    it('gestisce estensione con o senza punto', () => {
      expect(composeFilename('test', '.md')).toBe('test.md');
      expect(composeFilename('test', 'md')).toBe('test.md');
    });
    

    it('fallback su nome vuoto', () => {
      expect(composeFilename('', 'md')).toBe('documento.md');
      expect(composeFilename('   ', 'pdf')).toBe('documento.pdf');
    });
  });
});