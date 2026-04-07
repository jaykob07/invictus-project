import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const CartModal = () => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    let message = "Hola Duende, me interesan los siguientes artículos:\n\n";
    items.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (Ref: ${item.reference}): $${(item.price * item.quantity).toLocaleString("es-CO")}\n`;
    });
    message += `\nTotal estimado: $${cartTotal.toLocaleString("es-CO")}`;
    
    const whatsappUrl = `https://wa.me/573006092452?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md border-l border-border bg-card">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">Mi Carrito</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 items-center bg-muted/50 p-3 rounded-lg border border-border">
                  <div className="w-16 h-16 rounded overflow-hidden bg-background shrink-0 border border-border">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs">Sin foto</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">Ref: {item.reference}</p>
                    <p className="text-sm font-medium text-primary">${item.price.toLocaleString("es-CO")}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-muted-foreground hover:text-primary transition-colors"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-medium w-4 text-center text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-muted-foreground hover:text-primary transition-colors"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors">
                      <Trash2 className="w-3 h-3" /> Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <SheetFooter className="mt-auto pt-4 flex-col gap-4 sm:flex-col border-t border-border">
          <div className="flex justify-between w-full items-center font-semibold text-lg text-foreground">
            <span>Total:</span>
            <span className="text-primary">${cartTotal.toLocaleString("es-CO")}</span>
          </div>
          <Button onClick={handleCheckout} disabled={items.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white flex gap-2 h-12 shadow-lg shadow-green-600/20">
            <Send className="w-4 h-4" />
            Enviar pedido por WhatsApp
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
