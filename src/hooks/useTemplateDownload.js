import { useState } from 'react';
import { api } from '../services/apiClient';

export const useTemplateDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const downloadTemplate = async (templateUrl, fileName = 'plantilla.xlsx') => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await api.downloadFile(templateUrl);

      if (!response.ok) {
        throw new Error(response.message || 'Error al descargar la plantilla');
      }

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(response.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error('Error descargando plantilla:', err);
      setError(err.message);
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadTemplate, isDownloading, error };
};