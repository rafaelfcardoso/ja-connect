import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Toaster } from "@/shared/components/ui/toaster";
import { Menu, Moon, Sun, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Bell } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import QRCode from 'react-qr-code';
import { useWhatsAppStatus } from "@/shared/hooks/useWhatsAppStatus";
import { whatsappService } from "@/shared/services/whatsapp.service";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title = "Dashboard"
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  
  // Use the WhatsApp status hook
  const { status, health, isLoading: statusLoading, error: statusError } = useWhatsAppStatus();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get WhatsApp connection status
  const isWhatsappConnected = status?.status === 'open';
  const isWhatsappConnecting = status?.status === 'connecting';

  // Handle QR code modal opening
  const handleQrCodeModalOpen = async () => {
    setIsQrCodeModalOpen(true);
    if (!isWhatsappConnected && !isWhatsappConnecting) {
      setQrCodeLoading(true);
      try {
        const qrCode = await whatsappService.getQRCode();
        setQrCodeData(qrCode.qrCode);
      } catch (error) {
        console.error('Failed to get QR code:', error);
        setQrCodeData(null);
      } finally {
        setQrCodeLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background relative">
      {/* Sidebar Drawer for mobile */}
      <>
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
        <div
          className={`
            fixed top-0 left-0 z-50 h-full max-w-full bg-[#5E17EB] border-r border-white/10 flex flex-col transition-transform duration-300 
            md:static md:z-auto md:h-screen md:translate-x-0
            ${isSidebarCollapsed ? 'w-[70px]' : 'w-64'}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar
            onCollapsedChange={handleSidebarCollapsedChange}
          />
        </div>
      </>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="flex justify-between items-center p-2 xs:p-3 sm:p-4 md:p-6">
          <div className="flex items-center gap-1.5">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Painel</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center ml-2 gap-2">
            <Button variant="ghost" className="relative" onClick={handleQrCodeModalOpen}>
              {statusLoading ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isWhatsappConnected ? 'bg-green-500' : 
                  isWhatsappConnecting ? 'bg-yellow-500' : 
                  'bg-red-500'
                }`}></div>
              )}
              <span className="ml-1.5 text-xs">
                {statusLoading ? 'Verificando...' :
                 isWhatsappConnected ? `Conectado${status?.phoneNumber ? ` - ${status.phoneNumber}` : ''}` :
                 isWhatsappConnecting ? 'Conectando...' :
                 'WhatsApp Desconectado'}
              </span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="relative">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">3</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 overflow-hidden">
                <div className="bg-muted/50 p-3 font-medium border-b">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm">Notificações</h4>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <ul className="divide-y">
                    <li className="hover:bg-muted/30 transition-colors">
                      <a href="#" className="block p-3">
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0"></div>
                          <div>
                            <p className="text-sm">Novo lead cadastrado: Carlos Silva</p>
                            <span className="block text-xs text-muted-foreground mt-1">há 2 minutos</span>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="hover:bg-muted/30 transition-colors">
                      <a href="#" className="block p-3">
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0"></div>
                          <div>
                            <p className="text-sm">Contrato assinado por Ana Costa</p>
                            <span className="block text-xs text-muted-foreground mt-1">há 15 minutos</span>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li className="hover:bg-muted/30 transition-colors">
                      <a href="#" className="block p-3">
                        <div className="flex items-start gap-2">
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0"></div>
                          <div>
                            <p className="text-sm">Nova mensagem de Maria Oliveira</p>
                            <span className="block text-xs text-muted-foreground mt-1">há 30 minutos</span>
                          </div>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="p-3 border-t">
                  <Button variant="ghost" size="sm" className="w-full justify-center text-xs text-primary hover:text-primary">
                    Ver todas as notificações
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="p-2 xs:p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </main>
      <Dialog open={isQrCodeModalOpen} onOpenChange={setIsQrCodeModalOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-primary/20">
          <DialogHeader className="justify-center items-center">
            <DialogTitle className="text-primary">
              {isWhatsappConnected ? 'WhatsApp Conectado' : 'Conectar WhatsApp'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isWhatsappConnected 
                ? `Conectado como: ${status?.phoneNumber || 'Número não disponível'}`
                : isWhatsappConnecting
                ? 'Conectando ao WhatsApp...'
                : 'Escaneie o QR Code abaixo com seu WhatsApp do Agente de I.A'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-6">
            {isWhatsappConnected ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  WhatsApp conectado com sucesso!
                </p>
              </div>
            ) : isWhatsappConnecting ? (
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-yellow-500" />
                <p className="text-sm text-muted-foreground">
                  Conectando ao WhatsApp...
                </p>
              </div>
            ) : (
              <div className="w-64 h-64 bg-white rounded-md shadow-md flex items-center justify-center">
                {qrCodeLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : qrCodeData ? (
                  <QRCode 
                    value={qrCodeData} 
                    size={220} 
                    fgColor="#5E17EB"
                    bgColor="#FFFFFF"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Erro ao carregar QR Code
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-primary/30 hover:bg-primary/10 text-primary"
              onClick={() => setIsQrCodeModalOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
