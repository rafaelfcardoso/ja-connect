import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Toaster } from "@/shared/components/ui/toaster";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

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
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          <div className="flex items-center ml-2 gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="p-2 xs:p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
