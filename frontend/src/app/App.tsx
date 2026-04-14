import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from '../components/Topbar/Topbar';

export const App: React.FC = () => {
  //stato finto temporaneo per non far arrabbiare la Topbar
  const [docName, setDocName] = useState("Nuovo Documento.md");

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* la Topbar rimane fissa in alto in tutte le pagine */}
      <Topbar 
        documentName={docName} 
        onDocumentNameChange={setDocName} 
        onCloseDocument={() => setDocName("")} 
      />

      {/* l'Outlet è il "buco" dove React Router inietterà EditorPage o HistoryPage */}
      <main style={{ flex: 1, backgroundColor: 'var(--bg-body)' }}>
        <Outlet />
      </main>
      
    </div>
  );
};