import React from "react";
import DashboardLayout from "@/shared/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Package, FileDown, Zap, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-ja-500 to-ja-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Bem-vindo ao JA Distribuidora</h1>
          <p className="text-ja-100">Sistema de geração de catálogos de produtos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">29</div>
              <p className="text-xs text-muted-foreground">
                produtos disponíveis no catálogo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catálogos Gerados</CardTitle>
              <FileDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Hoje</div>
              <p className="text-xs text-muted-foreground">
                dados sincronizados com Notion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+15%</div>
              <p className="text-xs text-muted-foreground">
                downloads vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-ja-500" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button className="w-full bg-ja-500 text-white px-4 py-2 rounded-md hover:bg-ja-600 transition-colors">
                Gerar Novo Catálogo
              </button>
              <button className="w-full border border-ja-500 text-ja-500 px-4 py-2 rounded-md hover:bg-ja-50 transition-colors">
                Ver Produtos Ativos
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-ja-500" />
                Últimos Catálogos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>catalogo_30_06_2025.pdf</span>
                  <span className="text-muted-foreground">13.5 MB</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>catalogo_29_06_2025.pdf</span>
                  <span className="text-muted-foreground">12.8 MB</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>catalogo_28_06_2025.pdf</span>
                  <span className="text-muted-foreground">14.2 MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;