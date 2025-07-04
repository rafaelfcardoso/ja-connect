/**
 * API service for communicating with the backend server
 */

import { authService } from './authService';
import { getDownloadMethod, getMobileInfo } from '../utils/mobile-utils';

// Types
export interface Product {
  id?: string;
  nome: string;
  preco: number | null;
  sku: string;
  barcode: string;
  imagem_url: string | null;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  count: number;
}

export interface CatalogRequest {
  selected_products: Product[];
  title?: string;
}

export interface CatalogResponse {
  success: boolean;
  message: string;
  file_path?: string;
  file_name?: string;
}

export interface HealthResponse {
  status: string;
  notion_status: string;
  active_products: number;
  timestamp: string;
}

export interface PriceUpdateRequest {
  product_id: string;
  new_price: number;
}

export interface PriceUpdateResponse {
  success: boolean;
  message: string;
  product_id: string;
  new_price: number;
}

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          // Clear auth state and redirect to login
          await authService.logout();
          window.location.href = '/login';
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/health');
  }

  // Get all active products
  async getProducts(): Promise<ProductsResponse> {
    return this.request<ProductsResponse>('/api/products');
  }

  // Update product price
  async updateProductPrice(productId: string, newPrice: number): Promise<PriceUpdateResponse> {
    const request: PriceUpdateRequest = {
      product_id: productId,
      new_price: newPrice,
    };
    
    return this.request<PriceUpdateResponse>(`/api/products/${productId}/price`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  // Generate catalog from selected products
  async generateCatalog(request: CatalogRequest): Promise<CatalogResponse> {
    return this.request<CatalogResponse>('/api/generate-catalog', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Download catalog file
  async downloadCatalog(filename: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/download/${filename}`, {
      headers: {
        ...authService.getAuthHeaders(),
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        await authService.logout();
        window.location.href = '/login';
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Helper method to trigger file download in browser
  async downloadAndSave(filename: string, saveAs?: string): Promise<void> {
    try {
      const downloadMethod = getDownloadMethod();
      const mobileInfo = getMobileInfo();
      
      if (downloadMethod === 'window-open') {
        // For mobile browsers, use blob approach but with window.open
        const blob = await this.downloadCatalog(filename);
        const url = window.URL.createObjectURL(blob);
        
        // Try to open in new tab first
        const newWindow = window.open(url, '_blank');
        
        // If popup blocked or doesn't work, try alternative methods
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Fallback: change current window location
          window.location.href = url;
        }
        
        // Clean up after a delay
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 5000);
        
        // Show mobile-specific feedback for iOS
        if (mobileInfo.isIOS) {
          setTimeout(() => {
            // Don't show prompt if user already navigated away
            if (document.hidden) return;
            
            const userAgent = navigator.userAgent;
            const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as unknown as { standalone: boolean }).standalone;
            
            if (!isInStandaloneMode && /Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
              alert('Para compartilhar no WhatsApp: toque no ícone de compartilhamento no Safari e selecione "Salvar em Arquivos" ou "Compartilhar".');
            }
          }, 1000);
        }
      } else {
        // Desktop browsers - use programmatic download
        const blob = await this.downloadCatalog(filename);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = saveAs || filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;