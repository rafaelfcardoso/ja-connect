import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-ja-500">404</h1>
          <h2 className="text-2xl font-semibold">Página não encontrada</h2>
          <p className="text-muted-foreground max-w-md">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-ja-500 text-white rounded-md hover:bg-ja-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-ja-500 text-ja-500 rounded-md hover:bg-ja-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Página Anterior
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;