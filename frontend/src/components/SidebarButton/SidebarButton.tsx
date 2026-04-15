/* Gestione bottoni della Sidebar: stato attivo o disabilitato */
import React from 'react';
import styles from './SidebarButton.module.css';

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string; //per tooltip e accessibilità
  isActive?: boolean; // se true, il bottone si accende
  disabled?: boolean; // se true, il bottone diventa grigio e non cliccabile
  onClick: () => void;
}


export const SidebarButton = ({icon, label, isActive = false, disabled = false, onClick}: SidebarButtonProps) => {
  return (
    <button
      // combina le classi CSS in base allo stato
      className={`
        ${styles.button} 
        ${isActive ? styles.active : ''} 
        ${disabled ? styles.disabled : ''}
      `}
      // se disabilitato, il click non fa nulla
      onClick={!disabled ? onClick : undefined}
      title={label}  //tooltip che appare al passaggio del mouse
      aria-label={label}
      disabled={disabled}
      aria-pressed={isActive} //attributo di accessibilità per indicare se è attivo o no
    >
      {icon}
    </button>
  );
};