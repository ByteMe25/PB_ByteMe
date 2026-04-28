import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';

//importiamo usando i barrel files (index.ts)
import { EditorPage } from '../features/editor';
import { HistoryPage } from '../features/history';


export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App funge da Layout (contiene Sidebar e l'Outlet per le pagine)
    children: [
      {
        index: true, // Percorso predefinito: "/"
        element: <EditorPage />,
      },
      {
        path: "storico", // Percorso: "/storico"
        element: <HistoryPage />,
      },
    ],
  },
]);