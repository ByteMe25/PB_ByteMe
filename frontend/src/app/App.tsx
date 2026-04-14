import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';


export const App: React.FC = () => {
    return (
        <>
        {/* impostazione React Toast per notifiche */}
        <Toaster 
            position="bottom-right" 
            toastOptions={{
            duration: 3000,
            style: {
                background: 'var(--bg-toast)',
                color: 'var(--text-main)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '0.75em',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: {
                iconTheme: {
                primary: 'var(--col-success)',
                secondary: 'white',
                },
            },
            error: {
                iconTheme: {
                primary: 'var(--col-error)',
                secondary: 'white',
                },
            },
            }} 
        />
        
        {/* Outlet è il segnaposto dove il Router inietta la pagina attuale (Editor o Storico) */}
        <Outlet />
        </>
    );
};