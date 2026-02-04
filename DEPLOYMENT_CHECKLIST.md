# ✅ GOLDENPAYS - Quick Deployment Checklist

## 📦 Before Deployment

- [ ] Código todo commitado no GitHub
- [ ] Testes locais passam (frontend + backend)
- [ ] `.env.production` configurados (não commitar!)

---

## 🗄️ STEP 1: MongoDB Atlas (5 min)

- [ ] Criar conta em https://cloud.mongodb.com
- [ ] Criar cluster FREE (M0) em London/Frankfurt
- [ ] Criar database user `goldenpays` com password forte
- [ ] Whitelist IP: 0.0.0.0/0 (Allow Access from Anywhere)
- [ ] Copiar connection string
- [ ] Substituir `<password>` e adicionar `/goldenpays`
- [ ] Testar connection string localmente (opcional)

**Connection String:**
```
mongodb+srv://goldenpays:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/goldenpays?retryWrites=true&w=majority
```

---

## 📧 STEP 2: SendGrid (3 min)

- [ ] Criar conta FREE em https://sendgrid.com (100 emails/dia)
- [ ] Verificar email
- [ ] Criar API Key com Full Access
- [ ] Copiar API Key (começa com `SG.`)
- [ ] Verificar Single Sender: `admin@goldenpays.uk`

**API Key:** `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔐 STEP 3: JWT Secret (1 min)

Run no terminal:
```bash
openssl rand -base64 32
```

**JWT Secret:** (copiar output)

---

## 🖥️ STEP 4: Deploy Backend - Render (10 min)

- [ ] Login em https://render.com com GitHub
- [ ] New Web Service → Connect repository
- [ ] Configure:
  - Name: `goldenpays-api`
  - Region: Frankfurt/London
  - Root Directory: `server`
  - Build: `npm install`
  - Start: `npm start`
  - Plan: **FREE**

- [ ] Add Environment Variables:
  ```
  NODE_ENV=production
  PORT=5001
  FRONTEND_URL=https://goldenpays.vercel.app
  MONGODB_URI=<your_mongodb_connection_string>
  JWT_SECRET=<your_generated_secret>
  JWT_EXPIRES_IN=24h
  SENDGRID_API_KEY=<your_sendgrid_key>
  SENDGRID_FROM_EMAIL=admin@goldenpays.uk
  SENDGRID_FROM_NAME=GOLDENPAYS LTD
  ADMIN_EMAIL=admin@goldenpays.uk
  ```

- [ ] Deploy e esperar 3-5 min
- [ ] Testar: `https://goldenpays-api.onrender.com/api/health`
- [ ] Copiar URL do backend

**Backend URL:** `https://goldenpays-api.onrender.com`

---

## 🌐 STEP 5: Deploy Frontend - Vercel (5 min)

- [ ] Atualizar `.env.production` com backend URL:
  ```
  VITE_API_BASE_URL=https://goldenpays-api.onrender.com/api
  ```
- [ ] Commit e push para GitHub
- [ ] Login em https://vercel.com com GitHub
- [ ] Import Project → Selecionar repositório
- [ ] Configure:
  - Framework: Vite
  - Build: `npm run build`
  - Output: `dist`

- [ ] Add Environment Variables (copiar de `.env.production`):
  ```
  VITE_APP_ENV=production
  VITE_APP_URL=https://goldenpays.vercel.app
  VITE_API_BASE_URL=https://goldenpays-api.onrender.com/api
  (... resto das variáveis)
  ```

- [ ] Deploy e esperar 2-3 min

**Frontend URL:** `https://goldenpays.vercel.app`

---

## ✅ STEP 6: Testes Finais (5 min)

- [ ] Abrir site: https://goldenpays.vercel.app
- [ ] Testar navegação (Home, About, Services, Contact)
- [ ] Submeter formulário de contacto
- [ ] Verificar email recebido (admin + cliente)
- [ ] Login admin: https://goldenpays.vercel.app/#/admin/login
  - Email: admin@goldenpays.uk
  - Password: GoldenPays2026!
- [ ] Verificar inquiry no painel admin
- [ ] Testar todas as páginas do admin

---

## 🎯 Post-Deployment

- [ ] Atualizar CORS no backend se necessário
- [ ] Configurar domínio custom (opcional)
- [ ] Adicionar Google Analytics ID (opcional)
- [ ] Configurar alertas de uptime (optional)
- [ ] **MUDAR PASSWORD DO ADMIN!**

---

## 🆘 Troubleshooting

**Backend 500 Error:**
- Ver logs no Render Dashboard
- Verificar MONGODB_URI está correto
- Verificar todas env vars estão definidas

**CORS Error:**
- Verificar FRONTEND_URL no Render = URL exato do Vercel
- Verificar sem trailing slash

**Emails não chegam:**
- Ver SendGrid Activity Feed
- Verificar sender verificado
- Verificar spam folder

**Backend lento:**
- Normal! Free tier dorme após 15min
- Primeira request demora ~30s

---

## 📊 Custos Mensais

| Serviço | Custo |
|---------|-------|
| Vercel | £0 |
| Render | £0 |
| MongoDB | £0 |
| SendGrid | £0 |
| **TOTAL** | **£0** |

---

**Total Time:** ~30 minutos
**Cost:** £0/mês

✅ **PRODUCTION READY!**
