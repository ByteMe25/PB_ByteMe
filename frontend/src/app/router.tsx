import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import EditorPage from '../pages/EditorPage';

// Creiamo un componente fittizio per lo storico per ora
const HistoryPage = () => <div style={{ padding: '2em' }}><h2>Storico Generazioni</h2></div>;

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