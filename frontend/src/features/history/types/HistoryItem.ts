export interface HistoryItem {
  id: string;
  timestamp: string;
  operation: string; 
  model: string;
  inputText: string; 
  generatedText: string; 
}