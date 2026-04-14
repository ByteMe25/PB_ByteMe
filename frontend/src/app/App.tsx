import React from 'react';
import { Outlet } from 'react-router-dom';

export const App: React.FC = () => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* l'Outlet inietta qui dentro la EditorPage o la HistoryPage */}
      <Outlet />
    </div>
  );
};