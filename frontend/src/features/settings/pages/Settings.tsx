import React from "react";
import DashboardLayout from "@/shared/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Settings as SettingsIcon, Database, FileText, Palette } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Configurações do Sistema</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema de catálogos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notion Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-ja-500" />
                Integração Notion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notion-token">Token de Acesso</Label>
                <Input
                  id="notion-token"
                  type="password"
                  placeholder="secret_..."
                  defaultValue="secret_..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="database-id">ID do Banco de Dados</Label>
                <Input
                  id="database-id"
                  placeholder="21e786d5-7b59-8157-94a7-e08db160c237"
                  defaultValue="21e786d5-7b59-8157-94a7-e08db160c237"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Status da Conexão</Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Conectado</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Testar Conexão
              </Button>
            </CardContent>
          </Card>

          {/* PDF Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-ja-500" />
                Geração de PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="output-dir">Diretório de Saída</Label>
                <Input
                  id="output-dir"
                  placeholder="./output"
                  defaultValue="./output"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-dir">Diretório de Templates</Label>
                <Input
                  id="template-dir"
                  placeholder="./templates"
                  defaultValue="./templates"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-timestamp">Timestamp Automático</Label>
                <Switch id="auto-timestamp" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-logo">Incluir Logo</Label>
                <Switch id="include-logo" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-ja-500" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <Switch id="dark-mode" />
              </div>

              <div className="space-y-2">
                <Label>Cor Principal</Label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-ja-500 rounded border"></div>
                  <span className="text-sm font-mono">#FF5722</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="compact-sidebar">Sidebar Compacta</Label>
                <Switch id="compact-sidebar" />
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-ja-500" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versão</span>
                  <span className="font-mono">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última Sincronização</span>
                  <span>Agora mesmo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Produtos Ativos</span>
                  <span>29</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Catálogos Gerados</span>
                  <span>12</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full">
                  Exportar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">
            Cancelar
          </Button>
          <Button className="bg-ja-500 hover:bg-ja-600">
            Salvar Configurações
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;