import { useState } from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Edit, Trash2, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

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
  const whatsappUrl = getWhatsAppUrl(name, reference);
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
            <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
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
            <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
              ${price.toLocaleString("es-CO")}
            </div>
          </div>
        )}

        {/* ── Contenido ── */}
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Ref:</span> {reference}
            </p>
            <p className="font-semibold text-yellow-400 text-balance text-card-foreground line-clamp-2">{description}</p>
          </div>
        </CardContent>

        {/* ── Footer ── */}
        {isAdmin ? (
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit?.(id)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onDelete?.(id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </CardFooter>
        ) : (
          <CardFooter className="p-4 pt-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
              >
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Consultar
              </Button>
            </a>
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
