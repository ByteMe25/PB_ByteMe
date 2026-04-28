import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorMetaStore } from './useEditorMetaStore';

// pulisce lo store prima di ogni test per evitare che i dati di un test 
// inquinino quello successivo (fondamentale quando si testa Zustand per test isolati e deterministici)
describe('useEditorMetaStore (Zustand Model)', () => {
  beforeEach(() => {
    //pulizia totale del localStorage prima di ogni test
    localStorage.clear();

    //ripristino manuale dello stato in memoria per isolamento
    useEditorMetaStore.setState({
      fileName: 'Documento senza titolo',
      isDirty: false,
      lastSaved: null,
    });
  });


  it('inizializza con lo stato di default corretto', () => {
    const state = useEditorMetaStore.getState();
    expect(state.fileName).toBe('Documento senza titolo');
    expect(state.isDirty).toBe(false);
    expect(state.lastSaved).toBeNull();
  });


  it('setFileName aggiorna il nome del file e imposta isDirty a true', () => {
    useEditorMetaStore.getState().setFileName('Appunti_Meeting.md');
    
    const state = useEditorMetaStore.getState();
    expect(state.fileName).toBe('Appunti_Meeting.md');
    //rinominare un file equivale a una modifica non salvata
    expect(state.isDirty).toBe(true); 
  });


  it('markDirty imposta isDirty a true senza cambiare altro', () => {
    useEditorMetaStore.getState().markDirty();
    
    const state = useEditorMetaStore.getState();
    expect(state.isDirty).toBe(true);
    expect(state.fileName).toBe('Documento senza titolo'); //non deve cambiare
  });


  it('markSaved imposta isDirty a false e registra il timestamp in lastSaved', () => {
    useEditorMetaStore.getState().markDirty(); //sporca lo stato
    
    const beforeMark = Date.now();
    useEditorMetaStore.getState().markSaved();
    
    const state = useEditorMetaStore.getState();
    expect(state.isDirty).toBe(false);
    expect(state.lastSaved).toBeGreaterThanOrEqual(beforeMark);
    expect(state.lastSaved).toBeLessThanOrEqual(Date.now());
  });


  it('persiste automaticamente lo stato in localStorage tramite middleware', () => {
    useEditorMetaStore.getState().setFileName('test-persistenza.txt');
    
    //controlla fisicamente dentro il localStorage
    const raw = localStorage.getItem('secondbrain-editor-meta');
    expect(raw).toBeTruthy();
    
    const parsed = JSON.parse(raw!);
    expect(parsed.state.fileName).toBe('test-persistenza.txt');
    expect(parsed.state.isDirty).toBe(true);
  });


  it('ripristina lo stato da localStorage all\'inizializzazione (rehydrate)', async () => {
    //simula un salvataggio di una sessione precedente
    localStorage.setItem(
      'secondbrain-editor-meta',
      JSON.stringify({
        state: { fileName: 'recupero.md', isDirty: true, lastSaved: 1234567890 },
        version: 0
      })
    );
    
    //forza Zustand a rileggere il localStorage (fondamentale nei test)
    await useEditorMetaStore.persist.rehydrate();
    
    //verifica
    const state = useEditorMetaStore.getState();
    expect(state.fileName).toBe('recupero.md');
    expect(state.isDirty).toBe(true);
    expect(state.lastSaved).toBe(1234567890);
  });
});