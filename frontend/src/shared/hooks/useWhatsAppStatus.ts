import { useState, useEffect, useCallback } from 'react';
import { whatsappService, WhatsAppStatus, WhatsAppHealth } from '../services/whatsapp.service';

interface UseWhatsAppStatusReturn {
  status: WhatsAppStatus | null;
  health: WhatsAppHealth | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useWhatsAppStatus(pollingInterval: number = 7000): UseWhatsAppStatusReturn {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [health, setHealth] = useState<WhatsAppHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentInterval, setCurrentInterval] = useState(pollingInterval);

  const fetchStatus = useCallback(async () => {
    try {
      const [statusData, healthData] = await Promise.all([
        whatsappService.getStatus(),
        whatsappService.getHealth()
      ]);
      
      setStatus(statusData);
      setHealth(healthData);
      setError(null);

      // Adjust polling interval based on connection status
      if (statusData.status === 'connecting') {
        // More frequent polling during connection attempts
        setCurrentInterval(3000); // 3 seconds
      } else if (statusData.status === 'close') {
        // Less frequent polling when disconnected
        setCurrentInterval(10000); // 10 seconds
      } else {
        // Normal polling when connected
        setCurrentInterval(pollingInterval); // Default 7 seconds
      }
    } catch (err) {
      let errorMessage = 'Failed to fetch WhatsApp status';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle network errors
        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          errorMessage = 'Erro de conexão: Verifique sua internet e tente novamente';
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Erro de rede: Servidor indisponível';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Timeout: Servidor demorou para responder';
        }
      }
      
      setError(errorMessage);
      console.error('WhatsApp status fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Set up dynamic polling
    const interval = setInterval(fetchStatus, currentInterval);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [fetchStatus, currentInterval]);

  return {
    status,
    health,
    isLoading,
    error,
    refetch
  };
}