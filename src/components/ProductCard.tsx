import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  reference: string;
  description: string;
  price: number;
  imageUrl?: string;
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
  isAdmin = false,
  onEdit,
  onDelete,
}: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 bg-card border-border">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Sin imagen
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
          ${price.toFixed(2)}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground line-clamp-1">{name}</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Ref:</span> {reference}
          </p>
          <p className="text-sm text-card-foreground line-clamp-2">{description}</p>
        </div>
      </CardContent>

      {isAdmin && (
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
      )}
    </Card>
  );
};
