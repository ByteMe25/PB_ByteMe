import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile } from './fileHandler';


describe('fileHandler - downloadFile', () => {
  //spie per le API URL
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();
  const mockClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    //Mock SOLO URL: JSDOM ha già Blob nativo funzionante
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
  });

  afterEach(() => {
    //pulisce gli stub globali per non contaminare altri test
    vi.unstubAllGlobals();
  });

  it('crea un Blob, un link invisibile e simula il download', () => {
    const mockContent = '# Ciao Mondo';
    const mockFilename = 'documento.md';
    const mockMimeType = 'text/markdown';
    const mockUrl = 'blob:http://localhost/fake-uuid';

    // Configura il return value del mock
    mockCreateObjectURL.mockReturnValue(mockUrl);

    //mock dell'elemento <a>
    const mockAnchorElement = {
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement;

    //spy sul DOM
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchorElement);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchorElement);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchorElement);

    // ESECUZIONE
    downloadFile(mockContent, mockFilename, mockMimeType);

    // VERIFICHE
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchorElement.download).toBe(mockFilename);
    expect(mockAnchorElement.href).toBe(mockUrl);
    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchorElement);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(mockAnchorElement);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });
});