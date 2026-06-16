-- TrendVibe: Script de Criação de Storage Buckets
-- Execute este script segundo no Supabase SQL Editor (ou use a interface de Storage do Supabase)

-- Método 1: Usando SQL (via Supabase SQL Editor)
-- Nota: Para usar via SQL, você precisa usar a extensão storage do Supabase

-- Criar buckets para armazenar arquivos
-- Você pode também criar via Dashboard Supabase: Storage > New Bucket

-- Bucket 1: Avatares de usuários
-- Nome: avatars
-- Público: Sim (para exibição)

-- Bucket 2: Imagens de comunidades
-- Nome: community-images
-- Público: Sim (para exibição)

-- Bucket 3: Mídias de posts (imagens e vídeos)
-- Nome: post-media
-- Público: Sim (para exibição)

-- Se preferir criar via SQL, use os comandos abaixo:
-- Nota: Descomente se estiver usando Supabase CLI ou SQL Editor com permissões admin

/*
-- Criar bucket de avatares
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Criar bucket de imagens de comunidades
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Criar bucket de mídias de posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
);
*/

-- RECOMENDAÇÃO: Criar buckets via Dashboard Supabase (mais fácil)
-- 1. Abra https://app.supabase.com
-- 2. Vá para Storage (menu lateral)
-- 3. Clique em "New bucket"
-- 4. Crie com as configurações abaixo:

-- BUCKET 1: avatars
-- - Nome: avatars
-- - Tornar público: ✓ SIM
-- - Tamanho máximo: 5 MB
-- - Tipos MIME permitidos: image/*

-- BUCKET 2: community-images
-- - Nome: community-images
-- - Tornar público: ✓ SIM
-- - Tamanho máximo: 10 MB
-- - Tipos MIME permitidos: image/*

-- BUCKET 3: post-media
-- - Nome: post-media
-- - Tornar público: ✓ SIM
-- - Tamanho máximo: 50 MB
-- - Tipos MIME permitidos: image/*, video/*
