import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  reference: string;
  description: string;
  price: number;
  stock?: number;
  image_url?: string;
  image_url_2?: string;
}

interface ProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Product;
}

export const ProductForm = ({ onSuccess, onCancel, initialData }: ProductFormProps) => {
  const [name, setName] = useState(initialData?.name || "");
  const [reference, setReference] = useState(initialData?.reference || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [stock, setStock] = useState(initialData?.stock?.toString() || "0");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile2(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = initialData?.image_url;
      let imageUrl2 = initialData?.image_url_2;

      // Upload new image 1 if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error("Error al subir la imagen principal");
        }
      }

      // Upload new image 2 if selected
      if (imageFile2) {
        imageUrl2 = await uploadImage(imageFile2);
        if (!imageUrl2) {
          throw new Error("Error al subir la segunda imagen");
        }
      }

      const productData = {
        name,
        reference,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        image_url: imageUrl,
        image_url_2: imageUrl2,
      };

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      const userEmail = userData.user?.email;

      if (initialData) {
        // Update existing product
        const { data: updatedProduct, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", initialData.id)
          .select()
          .single();

        if (error) throw error;
        
        if (updatedProduct) {
          await supabase.from("product_audits").insert({
            product_id: updatedProduct.id,
            product_name: updatedProduct.name,
            action: "UPDATE",
            user_id: userId,
            user_email: userEmail
          });
        }

        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado exitosamente",
        });
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        
        if (newProduct) {
          await supabase.from("product_audits").insert({
            product_id: newProduct.id,
            product_name: newProduct.name,
            action: "INSERT",
            user_id: userId,
            user_email: userEmail
          });
        }

        toast({
          title: "Producto creado",
          description: "El producto se ha creado exitosamente",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el producto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Producto</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Teclado Mecánico RGB"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Referencia</Label>
        <Input
          id="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Ej: TEC-001"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción / Características</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Características y descripción del producto..."
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            step=""
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="000"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Cantidad (Stock)</Label>
          <Input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      {/* Imagen 1 */}
      <div className="space-y-2">
        <Label htmlFor="image">Imagen Principal</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" asChild>
            <label htmlFor="image" className="cursor-pointer">
              <Upload className="w-4 h-4" />
            </label>
          </Button>
        </div>
        {initialData?.image_url && !imageFile && (
          <p className="text-sm text-muted-foreground">
            Ya hay una imagen cargada. Sube una nueva para reemplazarla.
          </p>
        )}
      </div>

      {/* Imagen 2 */}
      <div className="space-y-2">
        <Label htmlFor="image2">Segunda Imagen <span className="text-muted-foreground text-xs">(opcional)</span></Label>
        <div className="flex items-center gap-4">
          <Input
            id="image2"
            type="file"
            accept="image/*"
            onChange={handleImageChange2}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" asChild>
            <label htmlFor="image2" className="cursor-pointer">
              <Upload className="w-4 h-4" />
            </label>
          </Button>
        </div>
        {initialData?.image_url_2 && !imageFile2 && (
          <p className="text-sm text-muted-foreground">
            Ya hay una segunda imagen cargada. Sube una nueva para reemplazarla.
          </p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>{initialData ? "Actualizar" : "Crear"} Producto</>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
