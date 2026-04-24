import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ProductForm } from "@/components/ProductForm";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Download, Package, LayoutDashboard, History, BarChart as BarChartIcon } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

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

interface AuditLog {
  id: string;
  product_name: string;
  action: string;
  created_at: string;
  user_id: string;
  user_email?: string | null;
  profiles?: { email: string };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#d0ed57', '#a4de6c'];

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [selectedCategoryStats, setSelectedCategoryStats] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true); 
    try {
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (prodError) throw prodError;
      setProducts(prodData || []);
      
      const { data: auditData } = await supabase
        .from("product_audits")
        .select(`*`)
        .order("created_at", { ascending: false });
        
      setAudits(auditData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos administrativos",
        variant: "destructive",
      });
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const handleAuth = (currentSession: Session | null) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        setIsAdmin(true); 
        loadProducts(); 
      } else {
        setIsAdmin(false); 
        navigate("/login");
        setLoading(false); 
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleAuth(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuth(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate, loadProducts]);

  const handleEdit = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (product) {
      setEditingProduct({
        ...product,
      });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      const productToDelete = products.find(p => p.id === deleteProductId);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteProductId);

      if (error) throw error;
      
      // Store deletion in Audit Log
      if (productToDelete) {
        const { data: userData } = await supabase.auth.getUser();
        await supabase.from("product_audits").insert({
          product_id: productToDelete.id,
          product_name: productToDelete.name,
          action: "DELETE",
          user_id: userData.user?.id,
          user_email: userData.user?.email
        });
      }

      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado exitosamente",
      });

      loadProducts(); 
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    } finally {
      setDeleteProductId(null);
    }
  };
  
  const exportToCSV = () => {
    const headers = ["ID", "Nombre", "Referencia", "Cantidad", "Precio"];
    const rows = products.map(p => [
      p.id, 
      `"${p.name.replace(/"/g, '""')}"`, 
      `"${p.reference.replace(/"/g, '""')}"`, 
      (p.stock || 0).toString(),
      p.price.toString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "catalogo_productos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueCategories = Array.from(new Set(products.map(p => p.name)));
  
  const selectedCategoryProducts = selectedCategoryStats 
    ? products.filter(p => p.name === selectedCategoryStats) 
    : [];

  const referenceStats = Object.entries(
    selectedCategoryProducts.reduce((acc, p) => {
      acc[p.reference] = (acc[p.reference] || 0) + (p.stock || 0);
      return acc;
    }, {} as Record<string, number>)
  ).map(([reference, stock]) => ({ reference, stock }));

  const totalStockInCategory = referenceStats.reduce((sum, item) => sum + item.stock, 0);

  const categoryData = Object.entries(
    products.reduce((acc, p) => {
      acc[p.name] = (acc[p.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, count]) => ({ name, count }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }
  
  return (
    <div className="min-h-screen">
      <Navbar isAdmin={isAdmin} /> 

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Panel de Administración</h2>
          <p className="text-muted-foreground">Gestiona tu catálogo y visualiza tus métricas</p>
        </div>

        <Tabs defaultValue="catalogo" className="w-full">
          <TabsList className="mb-6 h-auto p-2 bg-muted/50 rounded-xl flex flex-col sm:flex-row w-full overflow-hidden justify-start sm:justify-center gap-2">
            <TabsTrigger value="catalogo" className="w-full sm:w-auto flex flex-1 gap-2 text-md px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all text-center justify-center">
              <Package className="w-5 h-5" />
              Catálogo
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="w-full sm:w-auto flex flex-1 gap-2 text-md px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all text-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard y Tabla
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="w-full sm:w-auto flex flex-1 gap-2 text-md px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all text-center justify-center">
              <History className="w-5 h-5" />
              Auditoría
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="catalogo" className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="w-full sm:w-auto h-12 px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Producto
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
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
                  isAdmin={true} 
                  onEdit={handleEdit}
                  onDelete={setDeleteProductId}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
                <p className="text-muted-foreground text-lg">
                  {searchQuery ? "No se encontraron productos para tu búsqueda" : "Aún no hay productos registrados en el catálogo"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">Métricas del Inventario</h3>
              <Button onClick={exportToCSV} className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-black font-semibold shadow-lg shadow-amber-600/20">
                <Download className="w-4 h-4 mr-2" />
                Descargar a Excel (CSV)
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <Card className="p-6 border-border shadow-md">
                <h4 className="text-lg font-semibold mb-6 flex items-center gap-2"><BarChartIcon className="w-5 h-5 text-primary"/> Productos por Categoría (Barras)</h4>
                
                <div className="w-full overflow-x-auto pb-4">
                  <div className="h-72 lg:w-full" style={{ minWidth: `${Math.max(600, categoryData.length * 80)}px` }}>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 50 }} barCategoryGap={30}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                          <XAxis dataKey="name" tick={{fill: '#888', fontSize: 11}} interval={0} angle={-45} textAnchor="end" height={60} />
                          <YAxis tick={{fill: '#888', fontSize: 12}} />
                          <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1E1E1E', border: 'none', borderRadius: '8px'}} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">Sin datos suficientes</div>
                    )}
                  </div>
                </div>
              </Card>

              {/* NEW SECTION FOR DETAILED STOCK */}
              <Card className="p-6 border-border shadow-md">
                <h4 className="text-lg font-semibold mb-6 flex items-center gap-2"><Package className="w-5 h-5 text-primary"/> Inventario Detallado (Por Categoría)</h4>
                
                <div className="mb-6">
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCategoryStats}
                    onChange={(e) => setSelectedCategoryStats(e.target.value)}
                  >
                    <option value="">-- Elige una categoría --</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {selectedCategoryStats ? (
                  <div className="space-y-4">
                    <div className="bg-primary/10 p-4 rounded-lg flex justify-between items-center text-primary font-bold">
                      <span>Total en stock físico en '{selectedCategoryStats}':</span>
                      <span className="text-xl">{totalStockInCategory} Unidades</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {referenceStats.map(ref => (
                        <div key={ref.reference} className="p-4 border border-border rounded-lg bg-card/50 flex flex-col justify-between">
                          <span className="text-sm text-muted-foreground font-mono mb-1">{ref.reference}</span>
                          <span className="font-bold text-lg">{ref.stock} unds</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                    Selecciona una categoría arriba para ver su desglose por referencias.
                  </div>
                )}
              </Card>

            </div>

            <Card className="p-0 border-border shadow-md overflow-hidden mt-8">
              <div className="p-6 border-b border-border bg-muted/10">
                <h4 className="text-lg font-semibold">Tabla General de Productos</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">ID</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Nombre</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Referencia</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Stock</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{p.id.slice(0, 8)}...</td>
                        <td className="px-6 py-4 font-medium">{p.name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{p.reference}</td>
                        <td className="px-6 py-4 text-muted-foreground font-semibold">{p.stock || 0}</td>
                        <td className="px-6 py-4">${p.price.toLocaleString("es-CO")}</td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground">No hay inventario</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="auditoria" className="animate-in fade-in duration-500">
            <Card className="p-0 border-border shadow-md overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/10">
                <h3 className="text-xl font-bold">Historial de Cambios</h3>
                <p className="text-sm text-muted-foreground mt-1">Revisa quién y cuándo modificó elementos del catálogo.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Acción</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Producto / Nombre</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Usuario</th>
                      <th className="px-6 py-4 font-semibold text-muted-foreground">Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {audits.map(log => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            log.action === 'INSERT' ? 'bg-green-500/20 text-green-500' : 
                            log.action === 'UPDATE' ? 'bg-blue-500/20 text-blue-500' : 
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{log.product_name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{log.user_email || log.profiles?.email || "-"}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(log.created_at).toLocaleString("es-CO")}
                        </td>
                      </tr>
                    ))}
                    {audits.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-muted-foreground">
                          No hay registros de auditoría recientes o no has corrido las migraciones de Base de Datos requeridas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct || undefined}
            onSuccess={() => {
              setShowForm(false);
              setEditingProduct(null);
              loadProducts(); 
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
