# Museu do Vinho Mario Pellegrin

Aplicacao web em Node.js com Fastify, Handlebars e Bulma.

## Stack atual

- Node.js 20+
- Fastify (framework HTTP)
- Handlebars (template engine)
- Bulma CSS (CDN)
- Docker Compose (dev e prod)
- Testes unitários com `node:test` (runner nativo)

## Arquitetura

Projeto organizado em camadas (MVC):

```text
src/
  config/          # Configuração (env, constantes)
  utils/           # Utilitários (slug, paths)
  repositories/    # Acesso a dados
  services/        # Regras de negócio
  controllers/     # Handlers de requisição
  routes/          # Registro de rotas
  plugins/         # Plugins Fastify (view engine, etc.)
  views/           # Templates Handlebars
    partials/      # Componentes reutilizáveis
  public/          # Assets (CSS, JS, imagens, ícones)
  data/            # Dados JSON (acervo-index)
  app.js           # Bootstrap da aplicação
  server.js        # Ponto de entrada

tests/             # Testes unitários
  utils/
  services/

docker-compose.yml
Dockerfile
.env
.env.example
```

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

Acesse em: `http://localhost:3000`

O hot-reload está ativo: alterações em `src/` são refletidas sem rebuild (exceto CSS que requer refresh do navegador).

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

- **Dev**: mapeia porta `3000:3000` no host; usa rede interna do Compose.
- **Prod**: não expõe porta externamente; entra na rede `fabrica-network` para uso com proxy reverso.
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
