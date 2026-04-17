export interface HistoryEntry {
  id: string;
  timestamp: string;
  operation: string; 
  model: string;
  inputText: string; 
  generatedText: string; 
}