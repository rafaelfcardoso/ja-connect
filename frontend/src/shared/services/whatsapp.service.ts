// Base API URL - update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-dev.lexgoia.com.br';

// Get tenant ID from environment or auth context
// TODO: This should come from authentication context
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'lexgo-main-tenant';

export interface WhatsAppStatus {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
  phoneNumber?: string;
  tenantId?: string;
  businessInfo?: {
    firmName?: string;
    connectedSince?: string;
    lastActivity?: string;
  };
}

export interface WhatsAppQRCode {
  qrCode: string;
  instanceName?: string;
  expiresAt?: string;
  instructions?: {
    step1: string;
    step2: string;
    step3: string;
  };
}

export interface WhatsAppHealth {
  status: 'healthy' | 'unhealthy';
  evolutionApi: boolean;
  timestamp: string;
  instancesCount?: number;
  activeConnections?: number;
}

export interface ConnectionSummary {
  connectionStatus: {
    status: 'connected' | 'disconnected' | 'connecting';
    displayText: string;
    color: string;
    icon: string;
  };
  phoneInfo: {
    number: string;
    displayName: string;
  };
  quickStats: {
    todayMessages: number;
    onlineTime: string;
    lastActivity: string;
  };
  firmInfo: {
    name: string;
    connectedSince: string;
  };
}

class WhatsAppService {
  private baseUrl = `${API_BASE_URL}/whatsapp`;

  // Get headers with proper tenant context
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': TENANT_ID,
      // TODO: Add Authorization header when auth is implemented
      // 'Authorization': `Bearer ${getAuthToken()}`
    };
  }

  // Get current instance status following the proper lifecycle
  async getStatus(): Promise<WhatsAppStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/status`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // No instance exists for this tenant yet
          return {
            instanceName: '',
            status: 'close',
            phoneNumber: undefined,
            tenantId: TENANT_ID
          };
        }
        throw new Error(`Failed to get WhatsApp status: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting WhatsApp status:', error);
      throw error;
    }
  }

  // Get QR code for connection (supports lazy instance creation)
  async getQRCode(): Promise<WhatsAppQRCode> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/qrcode`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.message?.includes('already connected')) {
            throw new Error('WhatsApp já está conectado neste escritório');
          }
          throw new Error('Erro de configuração: ' + (errorData.message || 'Verifique suas configurações'));
        }
        
        if (response.status === 401) {
          throw new Error('Erro de autenticação: Token inválido ou expirado');
        }
        
        if (response.status === 403) {
          throw new Error('Sem permissão para acessar WhatsApp');
        }
        
        if (response.status === 404) {
          throw new Error('Serviço WhatsApp não encontrado');
        }
        
        if (response.status === 500) {
          throw new Error('Erro interno do servidor WhatsApp');
        }
        
        if (response.status === 503) {
          throw new Error('Serviço WhatsApp temporariamente indisponível');
        }
        
        throw new Error(`Erro ao gerar QR Code: ${errorData.message || response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting QR code:', error);
      throw error;
    }
  }

  // Get system health status
  async getHealth(): Promise<WhatsAppHealth> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Failed to get health status: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting health status:', error);
      throw error;
    }
  }

  // Initialize WhatsApp connection for current tenant
  async initializeConnection(firmName: string = 'LexGo Advocacia'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/initialize`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          firmName,
          contactPerson: 'Sistema LexGo'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initialize connection: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error initializing connection:', error);
      throw error;
    }
  }

  // Get user-friendly connection summary
  async getConnectionSummary(): Promise<ConnectionSummary> {
    try {
      const response = await fetch(`${this.baseUrl}/connection/summary`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get connection summary: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting connection summary:', error);
      throw error;
    }
  }

  // Restart instance
  async restart(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/restart`, {
        method: 'POST',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error('Nenhuma instância WhatsApp encontrada para reiniciar');
        }
        
        if (response.status === 400) {
          throw new Error('Não é possível reiniciar: instância em estado inválido');
        }
        
        if (response.status === 500) {
          throw new Error('Erro interno ao reiniciar a instância WhatsApp');
        }
        
        if (response.status === 503) {
          throw new Error('Serviço WhatsApp temporariamente indisponível');
        }
        
        throw new Error(`Erro ao reiniciar: ${errorData.message || response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error restarting instance:', error);
      throw error;
    }
  }

  // Delete instance (permanent disconnect)
  async deleteInstance(): Promise<any> {
    try {
      const headers = {
        ...this.getHeaders(),
        'x-admin-action': 'true' // Required for delete operation
      };

      const response = await fetch(`${this.baseUrl}/instance`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error('Nenhuma instância WhatsApp encontrada para remover');
        }
        
        if (response.status === 403) {
          throw new Error('Sem permissão para remover a instância WhatsApp');
        }
        
        if (response.status === 400) {
          throw new Error('Não é possível remover: instância em estado inválido');
        }
        
        if (response.status === 500) {
          throw new Error('Erro interno ao remover a instância WhatsApp');
        }
        
        throw new Error(`Erro ao remover instância: ${errorData.message || response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error deleting instance:', error);
      throw error;
    }
  }

  // Disconnect instance (now calls deleteInstance for clean state)
  async disconnect(): Promise<any> {
    return this.deleteInstance();
  }

  // Debug method to check backend connectivity and tenant setup
  async debugConnection(): Promise<any> {
    const results: any = {
      tenantId: TENANT_ID,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Backend health
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      results.tests.backendHealth = {
        status: healthResponse.ok ? 'ok' : 'error',
        statusCode: healthResponse.status
      };
    } catch (error) {
      results.tests.backendHealth = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 2: WhatsApp health
    try {
      const whatsappHealth = await this.getHealth();
      results.tests.whatsappHealth = {
        status: 'ok',
        data: whatsappHealth
      };
    } catch (error) {
      results.tests.whatsappHealth = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 3: Instance status
    try {
      const instanceStatus = await this.getStatus();
      results.tests.instanceStatus = {
        status: 'ok',
        data: instanceStatus
      };
    } catch (error) {
      results.tests.instanceStatus = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 4: Tenant context
    results.tests.tenantContext = {
      tenantId: TENANT_ID,
      headers: this.getHeaders(),
      apiBaseUrl: API_BASE_URL
    };

    return results;
  }


  // Method to help associate existing instance with current tenant
  async associateExistingInstance(instanceId: string = 'e160f852-786f-449b-bdfd-95bb486bb084'): Promise<any> {
    try {
      // This endpoint might not exist yet, so we'll try different approaches
      const approaches = [
        // Approach 1: Direct association endpoint
        {
          url: `${this.baseUrl}/instance/associate`,
          method: 'POST',
          body: JSON.stringify({
            instanceId,
            firmName: 'LexGo Advocacia'
          })
        },
        // Approach 2: Initialize with existing instance
        {
          url: `${this.baseUrl}/instance/initialize`,
          method: 'POST', 
          body: JSON.stringify({
            existingInstanceId: instanceId,
            firmName: 'LexGo Advocacia',
            contactPerson: 'Sistema LexGo'
          })
        }
      ];

      for (const approach of approaches) {
        try {
          const response = await fetch(approach.url, {
            method: approach.method,
            headers: this.getHeaders(),
            body: approach.body
          });

          if (response.ok) {
            return {
              success: true,
              method: approach.url,
              data: await response.json()
            };
          }
        } catch (error) {
          console.log(`Approach ${approach.url} failed:`, error);
        }
      }

      throw new Error('All association approaches failed');
    } catch (error) {
      console.error('Error associating existing instance:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsAppService();