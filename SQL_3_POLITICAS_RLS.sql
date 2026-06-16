-- TrendVibe: Script de Políticas de Segurança (RLS - Row Level Security)
-- Execute este script terceiro no Supabase SQL Editor

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLÍTICAS PARA TABELA: profiles
-- ============================================

-- Qualquer um pode ver perfis públicos
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Perfis são criados via trigger do auth.users
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. POLÍTICAS PARA TABELA: follows
-- ============================================

-- Qualquer um autenticado pode ver follows
CREATE POLICY "Follows are viewable by authenticated users" ON public.follows
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuários podem criar seguimentos para si mesmos
CREATE POLICY "Users can create follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Usuários podem deletar seus próprios seguimentos
CREATE POLICY "Users can delete own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ============================================
-- 4. POLÍTICAS PARA TABELA: communities
-- ============================================

-- Qualquer um pode ver comunidades ativas
CREATE POLICY "Active communities are viewable by everyone" ON public.communities
  FOR SELECT USING (status = 'active' OR auth.uid() = created_by);

-- Usuários autenticados podem criar comunidades
CREATE POLICY "Authenticated users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Criadores podem atualizar suas comunidades
CREATE POLICY "Community creators can update own community" ON public.communities
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- Criadores podem deletar suas comunidades
CREATE POLICY "Community creators can delete own community" ON public.communities
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================
-- 5. POLÍTICAS PARA TABELA: community_members
-- ============================================

-- Membros podem ver outros membros da comunidade
CREATE POLICY "Members can view community members" ON public.community_members
  FOR SELECT USING (true);

-- Usuários podem entrar em comunidades
CREATE POLICY "Users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem deixar comunidades
CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. POLÍTICAS PARA TABELA: posts
-- ============================================

-- Qualquer um pode ver posts públicos (de comunidades ativas ou de perfis públicos)
CREATE POLICY "Posts are viewable if community is active" ON public.posts
  FOR SELECT USING (
    community_id IS NULL OR 
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND status = 'active')
  );

-- Usuários autenticados podem criar posts
CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Autores podem atualizar seus próprios posts
CREATE POLICY "Users can update own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Autores podem deletar seus próprios posts
CREATE POLICY "Users can delete own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. POLÍTICAS PARA TABELA: likes
-- ============================================

-- Qualquer um pode ver likes
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

-- Usuários autenticados podem criar likes
CREATE POLICY "Authenticated users can create likes" ON public.likes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Usuários podem deletar seus próprios likes
CREATE POLICY "Users can delete own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 8. POLÍTICAS PARA TABELA: comments
-- ============================================

-- Qualquer um pode ver comentários
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

-- Usuários autenticados podem criar comentários
CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Autores podem atualizar seus próprios comentários
CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Autores podem deletar seus próprios comentários
CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 9. POLÍTICAS PARA TABELA: conversations
-- ============================================

-- Usuários podem ver apenas suas próprias conversas
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_a OR auth.uid() = participant_b);

-- Usuários podem criar conversas
CREATE POLICY "Authenticated users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    (auth.uid() = participant_a OR auth.uid() = participant_b)
  );

-- Usuários podem atualizar suas próprias conversas
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = participant_a OR auth.uid() = participant_b)
  WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

-- ============================================
-- 10. POLÍTICAS PARA TABELA: messages
-- ============================================

-- Usuários podem ver mensagens de suas próprias conversas
CREATE POLICY "Users can view messages in own conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_a = auth.uid() OR participant_b = auth.uid())
    )
  );

-- Usuários podem enviar mensagens
CREATE POLICY "Authenticated users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_a = auth.uid() OR participant_b = auth.uid())
    )
  );

-- Usuários podem atualizar status de leitura de mensagens recebidas
CREATE POLICY "Users can update own message read status" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND participant_b = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND participant_b = auth.uid()
    )
  );

-- ============================================
-- 11. POLÍTICAS PARA TABELA: notifications
-- ============================================

-- Usuários podem ver apenas suas próprias notificações
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Sistema pode criar notificações (permitir usando service_role se necessário)
CREATE POLICY "Notifications can be created" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Usuários podem atualizar suas próprias notificações
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar suas próprias notificações
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 12. POLÍTICAS PARA STORAGE (Buckets)
-- ============================================

-- AVATARS bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- COMMUNITY-IMAGES bucket
CREATE POLICY "Community images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users can upload community images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-images' AND 
    auth.role() = 'authenticated'
  );

-- POST-MEDIA bucket
CREATE POLICY "Post media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Authenticated users can upload post media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-media' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own post media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-media' AND 
    auth.role() = 'authenticated'
  );
