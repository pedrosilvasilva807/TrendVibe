# TrendVibe - Setup & Deployment Guide

## 🚀 Quick Start (Local Development)

```bash
# 1. Instalar dependências
npm run install:all

# 2. Configurar variáveis de ambiente
# Crie backend/.env.local com suas credenciais Supabase
# Crie frontend/.env.local com suas credenciais Supabase

# 3. Executar em desenvolvimento
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## 📦 Build para Production (Vercel - 1 Deploy)

```bash
# 1. Build ambos
npm run build

# 2. Testar localmente
npm run start
# Acesse em http://localhost:3001 (frontend e backend juntos)
```

## 🌐 Deploy no Vercel (Um Deploy Único)

### Passo 1: Preparar repositório
```bash
git add .
git commit -m "Ready for Vercel"
git push
```

### Passo 2: Criar projeto Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório
4. **Root Directory**: deixe em branco (raiz do projeto)
5. Clique em "Environment Variables"

### Passo 3: Adicionar variáveis de ambiente
No Vercel dashboard, adicione:
- `SUPABASE_URL` → Sua URL Supabase
- `SUPABASE_SERVICE_ROLE_KEY` → Sua service role key
- `FRONTEND_URL` → Deixe em branco (Vercel fornece automaticamente)
- `PORT` → Deixe em branco (Vercel fornece)

### Passo 4: Configurar build settings
- **Build Command**: `npm run build`
- **Output Directory**: `backend/dist`
- **Install Command**: `npm run install:all`

### Passo 5: Deploy!
Vercel automaticamente:
1. Executa `npm run install:all`
2. Executa `npm run build` (compila frontend em `/frontend/dist` e backend em `/backend/dist`)
3. Executa `npm start` (inicia backend que serve frontend)

**Resultado**: 1 URL única para todo o app! 🎉

---

## 📝 Estrutura de Arquivos

```
trendvibe/
├── frontend/
│   ├── dist/              ← Frontend compilado (servido pelo backend)
│   ├── src/
│   ├── .env.local         ← Variáveis locais
│   └── package.json
├── backend/
│   ├── dist/              ← Backend compilado
│   ├── src/
│   │   └── index.ts       ← Servidor que serve frontend + API
│   ├── .env.local         ← Variáveis locais
│   └── package.json
├── .env.example
├── package.json           ← Scripts de build
└── README.md
```

---

## 🔒 Banco de Dados (Supabase)

Antes de rodar pela primeira vez, execute os scripts SQL:

1. `SQL_1_TABELAS.sql` - Cria todas as tabelas
2. `SQL_2_BUCKETS.sql` - Cria storage buckets
3. `SQL_3_POLITICAS_RLS.sql` - Configura segurança

No Supabase dashboard → SQL Editor → Copie e execute cada script.

---

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Dev local (frontend + backend)
npm run dev:frontend     # Apenas frontend
npm run dev:backend      # Apenas backend
npm run build            # Build para production
npm run start            # Rodar production local
npm run install:all      # Instalar dependências tudo
```

---

## 📚 Tecnologias

- **Frontend**: React 18 + Vite + React Router + Zustand
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

---

## ❓ FAQ

**P: Por que um único deploy?**
R: O backend serve o frontend compilado como arquivos estáticos. Mais simples, mais barato, sem problemas de CORS.

**P: E se quiser separar depois?**
R: Fácil! Basta fazer 2 deployments separados no Vercel e ajustar `VITE_API_URL` no frontend.

**P: Como atualizar após mudanças?**
R: Simples push para o git → Vercel redeploy automaticamente!

---

Feito! 🚀
