import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Loader2, ChevronDown, Tag, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  reference: string;
  description: string;
  price: number;
  image_url?: string;
  image_url_2?: string;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { cartCount, setIsCartOpen } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProducts();
    checkAdminStatus();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Unique tags sorted alphabetically
  const uniqueTags = Array.from(new Set(products.map((p) => p.name))).sort();

  const filteredProducts = activeTag
    ? products.filter((p) => p.name === activeTag)
    : products;

  const selectedLabel = activeTag ?? "Todos";

  const handleSelectTag = (tag: string | null) => {
    setActiveTag(tag);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar isAdmin={isAdmin} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container bg-cover bg-center bg-no-repeat rounded-3xl mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <img
              src="/invct.jpeg"
              alt=""
              className="mx-auto w-[240px] h-[240px] object-contain animate-in fade-in duration-700 drop-shadow-2xl"
            />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-gold-dark to-gold bg-clip-text text-transparent tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
              Fragancias originales
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto tracking-wide" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 800 }}>
              Encuentra tu fragancia ideal con la mejor calidad y precio
            </p>
          </div>
        </div>
      </section>

      {/* Tag Dropdown Section */}
      <section className="relative z-40 py-6 px-4 bar-gradient border-y border-border/40">
        <div className="container mx-auto flex justify-center">
          <div ref={menuRef} className="relative w-full max-w-sm">

            {/* Trigger button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-card/80 border border-border hover:border-primary transition-all duration-200 shadow-sm backdrop-blur-sm"
            >
              <span className="flex items-center gap-2 font-medium text-foreground">
                <Tag className="w-4 h-4 text-primary" />
                {selectedLabel}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown panel */}
            {menuOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[9999] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/40">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Filtrar por categoría
                  </p>
                </div>

                {/* Scrollable list */}
                <ul className="max-h-72 overflow-y-auto divide-y divide-border/50">
                  {/* "Todos" option */}
                  <li>
                    <button
                      onClick={() => handleSelectTag(null)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium transition-colors duration-150 ${activeTag === null
                        ? "bg-primary/15 text-primary"
                        : "text-foreground hover:bg-muted/60"
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${activeTag === null ? "bg-primary" : "bg-transparent"
                          }`}
                      />
                      Todos
                      <span className="ml-auto text-xs text-muted-foreground font-normal">
                        {products.length}
                      </span>
                    </button>
                  </li>

                  {/* Tag options */}
                  {uniqueTags.map((tag) => {
                    const count = products.filter((p) => p.name === tag).length;
                    return (
                      <li key={tag}>
                        <button
                          onClick={() => handleSelectTag(tag)}
                          className={`w-full flex items-center gap-3 px-5 py-3.5 text-left text-sm font-medium transition-colors duration-150 ${activeTag === tag
                            ? "bg-primary/15 text-primary"
                            : "text-foreground hover:bg-muted/60"
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${activeTag === tag ? "bg-primary" : "bg-border"
                              }`}
                          />
                          {tag}
                          <span className="ml-auto text-xs text-muted-foreground font-normal">
                            {count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {activeTag ? activeTag : "Catálogo de Productos"}
              </h2>
              <p className="text-muted-foreground">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "producto" : "productos"}
                {activeTag && " encontrados"}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  reference={product.reference}
                  description={product.description}
                  price={product.price}
                  imageUrl={product.image_url}
                  imageUrl2={product.image_url_2}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  {activeTag
                    ? "No se encontraron productos en esta categoría"
                    : "Aún no hay productos en el catálogo"}
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bar-gradient-footer py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2026 Accesorios El Duende. Powered by Adsvanced.
          </p>
        </div>
      </footer>
      {/* Floating Cart Button */}
      {!isAdmin && cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center animate-in fade-in slide-in-from-bottom-5"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        </button>
      )}
    </div>
  );
};

export default Index;
