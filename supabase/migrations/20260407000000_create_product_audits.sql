create table
  public.product_audits (
    id uuid not null default gen_random_uuid (),
    product_id uuid null,
    product_name text not null,
    action text not null,
    user_id uuid null references auth.users(id),
    user_email text null,
    created_at timestamp with time zone null default now(),
    constraint product_audits_pkey primary key (id)
  ) tablespace pg_default;

-- Opcional: habilitar RLS si es necesario, pero como solo lo accede el admin, 
-- se puede usar la misma poliítica o simplemente dejarlo por defecto si las Policies no restringen inserción
-- en caso de restringir, te sugerimos abrir permisos de insert/select a los administradores:
-- alter table public.product_audits enable row level security;
-- CREATE POLICY "Admins can do all on product_audits" ON public.product_audits FOR ALL TO authenticated USING (
--  (EXISTS ( SELECT 1 FROM user_roles WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))
-- );
