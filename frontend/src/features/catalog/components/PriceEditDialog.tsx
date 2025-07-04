import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService, type Product } from '@/shared/services/api';

interface PriceEditDialogProps {
  product: Product;
  onPriceUpdate: (productId: string, newPrice: number) => void;
}

const PriceEditDialog: React.FC<PriceEditDialogProps> = ({ product, onPriceUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(product.preco?.toString() || '0');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.id) {
      toast.error('ID do produto não encontrado');
      return;
    }

    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Por favor, insira um preço válido');
      return;
    }

    try {
      setIsUpdating(true);
      
      const response = await apiService.updateProductPrice(product.id, priceValue);
      
      if (response.success) {
        toast.success('Preço atualizado com sucesso!');
        onPriceUpdate(product.id, priceValue);
        setIsOpen(false);
      } else {
        toast.error(response.message || 'Erro ao atualizar preço');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao atualizar preço: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setNewPrice(product.preco?.toString() || '0');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Preço</DialogTitle>
          <DialogDescription>
            Atualize o preço do produto "{product.nome}" no banco de dados Notion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Preço
              </Label>
              <div className="col-span-3">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0,00"
                  disabled={isUpdating}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">
                Atual
              </Label>
              <div className="col-span-3 text-sm">
                {product.preco !== null 
                  ? `R$ ${product.preco.toFixed(2).replace('.', ',')}` 
                  : 'Preço não informado'
                }
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-ja-500 hover:bg-ja-600"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Preço'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PriceEditDialog;