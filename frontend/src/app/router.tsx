import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';

// Creiamo due componenti fittizi per ora, li sposteremo in file separati poi
const EditorPage = () => <div style={{ padding: '2em' }}><h2>Pagina Editor Markdown</h2></div>;
const HistoryPage = () => <div style={{ padding: '2em' }}><h2>Pagina dello Storico Generazioni</h2></div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, //l'App fa da cornice fissa (layout)
    children: [
      {
        index: true, //se l'URL è esattamente "/", mostra l'Editor
        element: <EditorPage />,
      },
      {
        path: "storico", //se l'URL è "/storico", mostra lo Storico
        element: <HistoryPage />,
      },
    ],
  },
]);