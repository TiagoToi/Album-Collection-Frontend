# Figurinhas Copa 2026 — Frontend

Álbum digital de figurinhas da Copa do Mundo FIFA 2026. Aplicação web progressiva (PWA) para gerenciar coleções, acompanhar progresso e compartilhar álbuns com amigos via código de convite.

## Funcionalidades

- **Autenticação** — cadastro e login com JWT, sessão persistente
- **Coleções compartilháveis** — crie ou entre em coleções via código de 6 caracteres
- **Álbum completo** — 994 figurinhas organizadas por grupos da Copa (A–L) e seções especiais (FWC, Coca-Cola)
- **Gerenciamento de figurinhas** — adicione, remova e acompanhe duplicatas
- **Figurinhas especiais** — indicador visual para figurinhas foil (douradas)
- **Busca em tempo real** — filtre países e seções instantaneamente
- **PWA instalável** — funciona como app nativo no celular, com service worker para atualizações automáticas

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| UI | React 18 |
| Roteamento | React Router DOM 6 |
| Build | Vite 5 |
| PWA | vite-plugin-pwa |
| Estilização | CSS customizado (mobile-first, inspirado no iOS) |
| Auth | JWT via API REST |

## Estrutura do projeto

```
src/
├── pages/
│   ├── LoginPage.jsx       # Login e cadastro
│   ├── CollectionsPage.jsx # Lista e gerenciamento de coleções
│   └── AlbumPage.jsx       # Visualização do álbum de figurinhas
├── components/
│   ├── StickerGroup.jsx    # Grupo/país com grid de figurinhas
│   ├── StickerCell.jsx     # Célula individual de figurinha
│   └── SearchBar.jsx       # Barra de busca
├── context/
│   └── AuthContext.jsx     # Estado global de autenticação
└── services/
    └── api.js              # Cliente HTTP para a API
```

## Como rodar localmente

**Pré-requisitos:** Node.js 18+

```bash
# Clone o repositório
git clone https://github.com/tiagoToi/figurinhas-frontend.git
cd figurinhas-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env e defina VITE_API_URL com a URL do backend

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173) no navegador.

## Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Pré-visualização do build
```

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API backend |

## Backend

Este repositório contém apenas o frontend. O backend (API REST) está disponível em: [figurinhas-backend](https://github.com/tiagoToi/figurinhas-backend)

## Deploy

O projeto está configurado para deploy em plataformas como Vercel, Netlify ou qualquer CDN estático. O backend roda na Railway.

---

Desenvolvido por [Tiago Toi](https://github.com/tiagoToi)
