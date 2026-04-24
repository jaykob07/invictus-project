-- Allow anyone (including unauthenticated visitors) to view products
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);
