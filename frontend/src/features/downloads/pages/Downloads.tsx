import React from "react";
import DashboardLayout from "@/shared/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { FileDown, Calendar, Download, Trash2 } from "lucide-react";

// Mock data for generated catalogs
const mockCatalogs = [
  {
    id: 1,
    filename: "catalogo_ja_distribuidora_20250630_170721.pdf",
    size: "13.57 MB",
    createdAt: "2025-06-30T17:07:21Z",
    products: 29
  },
  {
    id: 2,
    filename: "catalogo_ja_distribuidora_20250630_160940.pdf",
    size: "12.45 MB",
    createdAt: "2025-06-30T16:09:40Z",
    products: 28
  },
  {
    id: 3,
    filename: "catalogo_ja_distribuidora_20250630_152644.pdf",
    size: "14.21 MB",
    createdAt: "2025-06-30T15:26:44Z",
    products: 30
  }
];

const Downloads = () => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleDownload = (filename: string) => {
    // Simulate download
    console.log(`Downloading: ${filename}`);
  };

  const handleDelete = (id: number) => {
    // Simulate delete
    console.log(`Deleting catalog with ID: ${id}`);
  };

  return (
    <DashboardLayout title="Downloads">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Catálogos Gerados</h2>
            <p className="text-muted-foreground">
              Histórico de catálogos PDF gerados
            </p>
          </div>
          <Button className="bg-ja-500 hover:bg-ja-600">
            <FileDown className="h-4 w-4 mr-2" />
            Gerar Novo Catálogo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Catálogos</CardTitle>
              <FileDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockCatalogs.length}</div>
              <p className="text-xs text-muted-foreground">
                arquivos disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">40.23 MB</div>
              <p className="text-xs text-muted-foreground">
                espaço utilizado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Último Gerado</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Hoje</div>
              <p className="text-xs text-muted-foreground">
                às 17:07
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Catalogs List */}
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockCatalogs.map((catalog) => (
                <div 
                  key={catalog.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-ja-100 p-2 rounded-lg">
                      <FileDown className="h-6 w-6 text-ja-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{catalog.filename}</h3>
                      <div className="text-sm text-muted-foreground space-x-4">
                        <span>{catalog.size}</span>
                        <span>•</span>
                        <span>{catalog.products} produtos</span>
                        <span>•</span>
                        <span>{formatDate(catalog.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(catalog.filename)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(catalog.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {mockCatalogs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum catálogo gerado</h3>
              <p className="text-muted-foreground mb-4">
                Gere seu primeiro catálogo para começar
              </p>
              <Button className="bg-ja-500 hover:bg-ja-600">
                Gerar Primeiro Catálogo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Downloads;