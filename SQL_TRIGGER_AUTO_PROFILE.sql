-- TrendVibe: Trigger automático para criar perfil ao registrar
-- Execute este script no Supabase SQL Editor APÓS os outros scripts

-- Criar função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir um novo registro na tabela profiles para cada novo usuário
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

-- Opcional: Sincronizar usuários existentes sem perfil
-- Descomente a linha abaixo se precisar sincronizar usuários antigos
-- INSERT INTO public.profiles (id, email)
-- SELECT id, email FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.profiles)
-- ON CONFLICT (id) DO NOTHING;
