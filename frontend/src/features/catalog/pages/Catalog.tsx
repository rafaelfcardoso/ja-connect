import { useState, useEffect } from "react";
import DashboardLayout from "@/shared/components/Layout/DashboardLayout";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { 
  Search, 
  Download, 
  Package, 
  Image as ImageIcon,
  FileText,
  Loader2,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { apiService, type Product } from "@/shared/services/api";
import { toast } from "sonner";
import PriceEditDialog from "../components/PriceEditDialog";
import { getMobileInfo } from "@/shared/utils/mobile-utils";


const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const mobileInfo = getMobileInfo();

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getProducts();
        setProducts(response.products);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
        setError(errorMessage);
        toast.error(`Erro ao carregar produtos: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Helper function to generate unique product key
  const getProductKey = (product: Product): string => {
    // Use product ID if available, otherwise fall back to nome_sku combination
    return product.id || `${product.nome}_${product.sku}`;
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelection = (productKey: string, checked: boolean) => {
    const newSelection = new Set(selectedProducts);
    if (checked) {
      newSelection.add(productKey);
    } else {
      newSelection.delete(productKey);
    }
    setSelectedProducts(newSelection);
  };

  // Check how many of the currently visible (filtered) products are selected
  const getVisibleSelectedCount = (): number => {
    return filteredProducts.filter(product => 
      selectedProducts.has(getProductKey(product))
    ).length;
  };

  const areAllVisibleSelected = (): boolean => {
    return filteredProducts.length > 0 && getVisibleSelectedCount() === filteredProducts.length;
  };

  const handleSelectAll = () => {
    const visibleProductKeys = filteredProducts.map(getProductKey);
    
    if (areAllVisibleSelected()) {
      // Deselect all visible products
      const newSelection = new Set(selectedProducts);
      visibleProductKeys.forEach(key => newSelection.delete(key));
      setSelectedProducts(newSelection);
    } else {
      // Select all visible products (keep previously selected ones from other filters)
      const newSelection = new Set(selectedProducts);
      visibleProductKeys.forEach(key => newSelection.add(key));
      setSelectedProducts(newSelection);
    }
  };

  const getSelectedProductsData = (): Product[] => {
    return products.filter(product => 
      selectedProducts.has(getProductKey(product))
    );
  };

  const handlePriceUpdate = (productId: string, newPrice: number) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId ? { ...product, preco: newPrice } : product
      )
    );
  };

  const handleGenerateCatalog = async () => {
    const selectedProductsData = getSelectedProductsData();
    const mobileInfo = getMobileInfo();
    
    if (selectedProductsData.length === 0) {
      toast.error('Selecione pelo menos um produto para gerar o catálogo');
      return;
    }

    try {
      setIsGenerating(true);
      
      // Show mobile-specific initial toast
      if (mobileInfo.isMobile) {
        toast.info(`Gerando catálogo com ${selectedProductsData.length} produtos...\n${mobileInfo.isIOS ? 'Aguarde o download iniciar automaticamente.' : 'O download iniciará em breve.'}`);
      } else {
        toast.info(`Gerando catálogo com ${selectedProductsData.length} produtos...`);
      }
      
      const response = await apiService.generateCatalog({
        selected_products: selectedProductsData,
        title: 'Catálogo JA Distribuidora'
      });

      if (response.success && response.file_name) {
        // Show success message based on platform
        if (mobileInfo.isMobile) {
          toast.success(`Catálogo gerado! ${mobileInfo.isIOS ? 'Verifique se o download iniciou. Se não, toque no link que aparecerá.' : 'O arquivo está sendo baixado.'}`);
        } else {
          toast.success(response.message);
        }
        
        // Trigger download
        await apiService.downloadAndSave(response.file_name);
        
        // Additional mobile feedback
        if (mobileInfo.isMobile) {
          setTimeout(() => {
            toast.info('💡 Dica: Para compartilhar no WhatsApp, encontre o arquivo baixado e use o botão de compartilhamento.', {
              duration: 5000,
            });
          }, 2000);
        }
      } else {
        throw new Error(response.message || 'Falha na geração do catálogo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro ao gerar catálogo: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout title="Catálogo de Produtos">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading || filteredProducts.length === 0}
            >
              <Checkbox 
                checked={areAllVisibleSelected()}
                className="mr-2" 
              />
              {areAllVisibleSelected() ? 'Desmarcar Visíveis' : 'Selecionar Visíveis'}
              {filteredProducts.length > 0 && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({filteredProducts.length})
                </span>
              )}
            </Button>
            <Button 
              onClick={handleGenerateCatalog}
              disabled={isGenerating || selectedProducts.size === 0}
              className="bg-ja-500 hover:bg-ja-600"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : mobileInfo.isMobile ? (
                <Smartphone className="h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? "Gerando..." : mobileInfo.isMobile ? `Baixar (${selectedProducts.size})` : `Gerar Catálogo (${selectedProducts.size})`}
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Produtos</p>
                  <p className="text-2xl font-bold">{isLoading ? '-' : products.length}</p>
                </div>
                <Package className="h-8 w-8 text-ja-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produtos Filtrados</p>
                  <p className="text-2xl font-bold">{isLoading ? '-' : filteredProducts.length}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Com Imagens</p>
                  <p className="text-2xl font-bold">{isLoading ? '-' : products.filter(p => p.imagem_url).length}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selecionados</p>
                  <p className="text-2xl font-bold text-ja-600">{selectedProducts.size}</p>
                </div>
                <Download className="h-8 w-8 text-ja-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-ja-500" />
            <span className="ml-2 text-muted-foreground">Carregando produtos...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-2">Erro ao carregar produtos</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const productKey = getProductKey(product);
              const isSelected = selectedProducts.has(productKey);
              
              return (
                <Card 
                  key={productKey} 
                  className={`overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md group ${
                    isSelected ? 'ring-2 ring-ja-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleProductSelection(productKey, !isSelected)}
                >
                  <div className="relative">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {product.imagem_url ? (
                        <img 
                          src={product.imagem_url} 
                          alt={product.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground">
                          <ImageIcon className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-2 right-2">
                      <Checkbox 
                        checked={isSelected}
                        className="bg-white border-2 shadow-sm"
                      />
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm line-clamp-2">{product.nome}</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-ja-600">
                            {product.preco !== null 
                              ? `R$ ${product.preco.toFixed(2).replace('.', ',')}` 
                              : 'Preço não informado'
                            }
                          </span>
                          {product.id && (
                            <PriceEditDialog 
                              product={product} 
                              onPriceUpdate={handlePriceUpdate}
                            />
                          )}
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>SKU: {product.sku || 'N/A'}</div>
                        <div>Código: {product.barcode || 'N/A'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum produto encontrado para esta busca' : 'Nenhum produto encontrado'}
            </p>
            {searchTerm && (
              <Button 
                variant="ghost" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Catalog;