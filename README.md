# Museu do Vinho Mario Pellegrin

![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/-Fastify-000000?logo=fastify&logoColor=white)
![Handlebars](https://img.shields.io/badge/-Handlebars-f0772b?logo=handlebarsdotjs&logoColor=white)
![Bulma](https://img.shields.io/badge/-Bulma-00d1b2?logo=bulma&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white)

## Sobre o projeto

O **Museu do Vinho Mário Pellegrin** possui atualmente sua presença digital limitada a uma página estática dentro do portal oficial de turismo da prefeitura de Videira.

Este projeto tem como objetivo desenvolver uma **plataforma web responsiva**, que substitua essa página estática por uma aplicação completa, permitindo não apenas a apresentação institucional do museu, mas também a exploração digital do seu acervo histórico.

Além de centralizar informações institucionais (história, visitação e contato), o sistema será preparado para:

- Exibir e organizar o acervo digital do museu (≈3000 imagens)
- Permitir navegação por categorias e filtros
- Descrever o contexto histórico e cultural de cada item do acervo, usando inteligência artificial para enriquecer as descrições
- Funcionar como um **PWA (Progressive Web App)** instalável

A iniciativa contribui diretamente para a **preservação da memória cultural regional**, ampliando o acesso público ao patrimônio histórico da vitivinicultura catarinense.

## 🚧 Roadmap

### 🟢 1. Estrutura e Setup

- [x] Criar projeto com Node.js + Express + Handlebars + Bulma
- [x] Organizar estrutura (rotas, views, public)
- [x] Configurar variáveis de ambiente
- [x] Configurar Docker (dev e produção)

---

### 🎨 2. Interface e Página Inicial

- [x] Implementar layout responsivo (mobile-first)
- [x] Criar página inicial com seções:
  - Hero (CTA para acervo)
  - O Museu (texto + imagens)
  - Destaques e linha do tempo
  - Contato com mapa (Leaflet)
- [x] Adicionar botão flutuante de WhatsApp
- [x] Implementar modo dark/light

### 🖼️ 3. Página de Acervo (MVP)

- [x] Criar página `/acervo`
- [x] Exibir imagens em grid
- [x] Implementar categorias e filtros
- [x] Criar endpoint JSON para acervo

### ☁️ 4. Imagens e Infraestrutura

- [x] Armazenar imagens localmente (dev) e em VPS (prod)
- [x] Gerar thumbnails menores para otimização em formato WebP
- [x] Configurar Nginx para servir imagens otimizadas

### 📱 5. PWA, Acessibilidade e Performance

- [x] Configurar manifest e service worker
- [x] Permitir instalação (PWA)
- [x] Garantir acessibilidade básica (alt, contraste)
- [ ] Melhorar performance (Lighthouse)

### 🚀 6. Evolução do Sistema

- [x] Integrar acervo real (~3000 imagens)
- [x] Implementar busca e paginação
- [x] Criar página de detalhe
- [x] Preparar integração com IA (classificação)
- [x] Configurar CI/CD para deploy automático
- [ ] Implementar painel de administração (upload e gestão do acervo)
- [ ] Adicionar suporte a múltiplos idiomas (i18n)
- [ ] Implementar testes automatizados (unitários e E2E)
- [ ] Configurar monitoramento e logging em produção
- [ ] Otimizar SEO e performance para produção
- [ ] Explorar integração com redes sociais (compartilhamento)
- [ ] Criar versão mobile nativa (React Native ou Flutter)
- [ ] Implementar funcionalidades de realidade aumentada (AR) para acervo
- [ ] Explorar parcerias para digitalização e enriquecimento do acervo com IA
- [ ] Criar campanhas de divulgação e engajamento online

## Executar localmente (sem Docker)

1. Instale as dependencias:

```bash
npm install
```

2. Inicie em modo dev:

```bash
npm run dev
```

3. Acesse:

```text
http://localhost:3000
```

## Executar com Docker

### Desenvolvimento

```bash
docker compose --profile dev up --build -d
```

Acesse em:

- `http://localhost:3000` (app Node direto)
- `http://localhost:8080` (Nginx HTTP)
- `https://localhost:8443` (Nginx HTTPS, quando houver certificado em `infra/certs/dev`)

O hot-reload está ativo: alterações em `src/` são refletidas sem rebuild (exceto CSS que requer refresh do navegador).

#### HTTPS no dev com mkcert

Se voce nao consegue instalar o mkcert no Windows, use o bootstrap via Docker (recomendado):

```bash
npm run dev:ssl
```

Esse comando:

- constroi uma imagem Docker local com mkcert
- gera `infra/certs/dev/tls.crt` e `infra/certs/dev/tls.key`
- inclui localhost e IPs locais da maquina no certificado
- sobe o profile `dev` com Nginx + app

Para gerar para prod (autoassinado para testes):

```bash
npm run ssl:bootstrap:prod
```

Voce tambem pode informar dominios/IPs extras:

```bash
node infra/scripts/bootstrap-ssl.js --profile dev --domains 192.168.1.6,meu-host.local
```

1. Instale o mkcert e a CA local:

```bash
mkcert -install
```

2. Gere certificados para localhost:

```bash
mkcert -cert-file infra/certs/dev/tls.crt -key-file infra/certs/dev/tls.key localhost 127.0.0.1 ::1
```

3. Para testar no celular (mesma rede), inclua também o IP local da máquina:

```bash
mkcert -cert-file infra/certs/dev/tls.crt -key-file infra/certs/dev/tls.key localhost 127.0.0.1 ::1
```

4. Reinicie os serviços dev:

```bash
docker compose --profile dev up -d
```

Sem `infra/certs/dev/tls.crt` e `infra/certs/dev/tls.key`, o Nginx de desenvolvimento sobe em modo HTTP automaticamente.

### Production

1. Crie a rede externa (uma vez):

```bash
docker network create fabrica-network
```

2. Configure variáveis em `.env` (especialmente `PHOTOS_HOST_PATH` para o caminho da VPS).

3. Suba o serviço:

```bash
docker compose --profile prod up --build -d
```

4. Verifique status:

```bash
docker compose ps
```

#### Observações

- **Dev**:
  - App Node em `127.0.0.1:3000` (acesso local direto opcional)
  - Nginx em `8080` (HTTP) e `8443` (HTTPS)
  - Com `infra/certs/dev/tls.crt` + `infra/certs/dev/tls.key`: redireciona HTTP -> HTTPS
  - Sem certificado: serve HTTP
- **Prod**:
  - App Node não é exposto no host
  - Nginx em `80` e `443`
  - Com `infra/certs/prod/tls.crt` + `infra/certs/prod/tls.key`: redireciona HTTP -> HTTPS
  - Sem certificado: serve HTTP

- **Certificados de produção**: coloque os arquivos em:

```text
infra/certs/prod/tls.crt
infra/certs/prod/tls.key
```

- **Em produção com Nginx**, configure headers mínimos:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

- **TRUST_PROXY**: já ativo em prod para leitura correta de IPs por trás do proxy.

## Scripts

- `npm run dev`: inicia com nodemon e hot reload para desenvolvimento local
- `npm start`: inicia em modo normal (production)
- `npm test`: executa testes unitários com `node:test`

## Conveniencias adicionadas

- Endpoint de healthcheck: `/health`
- Variaveis de ambiente em `.env` e `.env.example`
- Botao flutuante de WhatsApp na home
- Layout inicial responsivo com Bulma e CSS customizado
- Rota de acervo com filtros por categoria: `/acervo?categoria=fotografia|documento|evento|sport|architecture`
- Mapa interativo no contato com Leaflet + OpenStreetMap
- Base PWA: `manifest.webmanifest`, `service-worker.js` e icones

## Testes

Execute a suíte de testes unitários:

```bash
npm test
```

Ou um arquivo específico:

```bash
node --test tests/utils/slug.test.js
```

Dentro do container dev:

```bash
docker compose --profile dev exec fabrica-museu-dev npm test
```

## Variáveis de ambiente

Configure em `.env`:

```
NODE_ENV=production         # development ou production
HOST=0.0.0.0              # Bind address
PORT=3000                 # Porta de escuta
TRUST_PROXY=false         # true se atrás de proxy reverso
PHOTOS_HOST_PATH=/srv/fabrica-museu/photos  # Caminho das fotos na VPS (prod)
```

## Rotas disponíveis

- `GET /` — página inicial com mapa e informações
- `GET /acervo` — galeria de fotos com filtros por categoria
- `GET /api/acervo` — endpoint JSON para acervo (paginável)
- `GET /health` — healthcheck (usado em Docker healthcheck)
