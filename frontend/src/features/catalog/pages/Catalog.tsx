import React, { useState } from "react";
import DashboardLayout from "@/shared/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  Package, 
  Image as ImageIcon,
  FileText 
} from "lucide-react";

// Mock data for products
const mockProducts = [
  {
    id: 1,
    nome: "Afiador Amolador De Facas E Tesouras 4 Em 1 Bomvink",
    preco: 45.90,
    sku: "BOM-1548",
    barcode: "7891234567890",
    imagem_url: null,
    catalogoAtivo: true
  },
  {
    id: 2,
    nome: "Aparador de pelos Portátil LUATEK",
    preco: 89.90,
    sku: "LMF-1105",
    barcode: "7891234567891",
    imagem_url: null,
    catalogoAtivo: true
  },
  // Add more mock products...
];

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredProducts = mockProducts.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateCatalog = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      // Show success message
    }, 3000);
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
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button 
              onClick={handleGenerateCatalog}
              disabled={isGenerating}
              className="bg-ja-500 hover:bg-ja-600"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Gerando..." : "Gerar Catálogo"}
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Produtos</p>
                  <p className="text-2xl font-bold">{mockProducts.length}</p>
                </div>
                <Package className="h-8 w-8 text-ja-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                  <p className="text-2xl font-bold">{mockProducts.filter(p => p.catalogoAtivo).length}</p>
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
                  <p className="text-2xl font-bold">{mockProducts.filter(p => p.imagem_url).length}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
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
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm line-clamp-2">{product.nome}</h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-ja-600">
                      R$ {product.preco.toFixed(2).replace('.', ',')}
                    </span>
                    <Badge variant={product.catalogoAtivo ? "default" : "secondary"}>
                      {product.catalogoAtivo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>SKU: {product.sku}</div>
                    <div>Código: {product.barcode}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Catalog;