/* BOZZA DA SISTEMARE */

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { ExportFormat } from '../types';
import { isValidExportFormat } from '../types';
import { composeFilename } from '../utils/filenameUtils';

export const useSaveDocument = (currentFileName: string) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleExport = async (format: ExportFormat, filename: string) => {
    // ✅ Validazione type-safe a runtime
    if (!isValidExportFormat(format)) {
      toast.error('Formato di esportazione non valido');
      return;
    }

    setIsExporting(true);
    try {
      // 🔹 Qui andrà la logica client-side (Blob, conversione, download)
      // 🔹 Per ora simuliamo
      await new Promise(res => setTimeout(res, 600));
      toast.success(`Documento esportato come ${filename}`);
      closeModal();
    } catch {
      toast.error('Errore durante l\'esportazione. Riprova.');
    } finally {
      setIsExporting(false);
    }
  };

  return { isModalOpen, isExporting, openModal, closeModal, handleExport };
};