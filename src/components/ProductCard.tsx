import { useState } from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Edit, Trash2, X, ChevronLeft, ChevronRight, ZoomIn, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const getWhatsAppUrl = (name: string, reference: string): string => {
  const message = encodeURIComponent(`Hola, estoy interesado en: ${name} (Ref: ${reference})`);
  return `https://wa.me/573006092452?text=${message}`;
};

interface ProductCardProps {
  id: string;
  name: string;
  reference: string;
  description: string;
  price: number;
  imageUrl?: string;
  imageUrl2?: string;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ProductCard = ({
  id,
  name,
  reference,
  description,
  price,
  imageUrl,
  imageUrl2,
  isAdmin = false,
  onEdit,
  onDelete,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const images = [imageUrl, imageUrl2].filter(Boolean) as string[];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((i) => (i + 1) % images.length);
  };

  return (
    <>
      <Card className="w-full min-w-0 group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 bg-card border-border">

        {/* ── Área de imágenes ── */}
        {images.length === 0 ? (
          <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        ) : images.length === 1 ? (
          // Una sola imagen
          <div
            className="relative aspect-square overflow-hidden bg-muted cursor-zoom-in"
            onClick={() => openLightbox(0)}
          >
            <img
              src={images[0]}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-80 w-8 h-8 transition-opacity duration-200 drop-shadow-lg" />
            </div>
            <div className="absolute top-2 right-2 bg-primary backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-md">
              ${price.toLocaleString("es-CO")}
            </div>
          </div>
        ) : (
          // Dos imágenes lado a lado
          <div className="relative flex gap-0.5 bg-muted overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative flex-1 cursor-zoom-in overflow-hidden"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={img}
                  alt={`${name} ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                  <ZoomIn className="text-white opacity-0 hover:opacity-80 w-6 h-6 transition-opacity duration-200 drop-shadow-lg" />
                </div>
              </div>
            ))}
            <div className="absolute top-2 right-2 bg-primary backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-md">
              ${price.toLocaleString("es-CO")}
            </div>
          </div>
        )}

        {/* ── Contenido ── */}
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Ref:</span> {reference}
            </p>
            <p className="text-sm font-medium text-primary/80 line-clamp-2">{description}</p>
          </div>
        </CardContent>

        {/* ── Footer ── */}
        {isAdmin ? (
          <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col xl:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full xl:flex-1 text-[11px] sm:text-sm h-8 sm:h-9"
              onClick={() => onEdit?.(id)}
            >
              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full xl:flex-1 text-[11px] sm:text-sm h-8 sm:h-9"
              onClick={() => onDelete?.(id)}
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
              Eliminar
            </Button>
          </CardFooter>
        ) : (
          <CardFooter className="p-4 pt-0">
            <Button
              size="sm"
              style={{ backgroundColor: '#a08d77', color: '#0a0a0a' }}
              className="w-full hover:opacity-90 font-semibold gap-2 transition-opacity"
              onClick={() => {
                addToCart({ id, name, reference, price, imageUrl, imageUrl2 });
                toast({
                  title: "Añadido al carrito",
                  description: `${name} ha sido agregado.`,
                });
              }}
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Añadir al carrito</span>
              <span className="sm:hidden text-[11px] font-bold">Al carrito</span>
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* ── Lightbox ── */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={`${name} ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Cierre */}
            <button
              onClick={closeLightbox}
              className="absolute -top-4 -right-4 bg-white text-black rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navegación entre imágenes (solo si hay 2) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 bg-white/80 text-black rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 bg-white/80 text-black rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${i === lightboxIndex ? "bg-white" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
