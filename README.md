# Museu do Vinho Mario Pellegrin

Aplicacao web em Node.js com Fastify, Handlebars e Bulma.

## Stack atual

- Node.js 20+
- Fastify
- Handlebars
- Bulma CSS (CDN)
- Docker Compose em modo desenvolvimento

## Estrutura

```text
src/
	public/
		css/
			app.css
		icons/
		js/
		manifest.webmanifest
		service-worker.js
	views/
		acervo.hbs
		index.hbs
	server.js
docker-compose.yml
Dockerfile
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

## Executar com Docker (dev e production)

1. Suba em modo desenvolvimento:

```bash
docker compose --profile dev up --build -d
```

2. Crie a rede externa (uma vez, apenas para production):

```bash
docker network create fabrica-network
```

3. Suba em modo production:

```bash
docker compose --profile prod up --build -d
```

4. Verifique os containers ativos:

```bash
docker compose ps
```

Observacoes:

- Nao ha mapeamento de portas externas (`ports`) no compose.
- Os servicos expõem internamente a porta `3000` via `expose`.
- O profile `prod` entra na rede externa `fabrica-network`.
- O profile `dev` usa a rede interna padrao do Compose.

```text
http://localhost:3000
```

## Scripts

- `npm run dev`: inicia com nodemon e hot reload
- `npm start`: inicia em modo normal

## Conveniencias adicionadas

- Endpoint de healthcheck: `/health`
- Variaveis de ambiente em `.env` e `.env.example`
- Botao flutuante de WhatsApp na home
- Layout inicial responsivo com Bulma e CSS customizado
- Rota de acervo com filtros por categoria: `/acervo?categoria=fotografias|documentos|objetos`
- Mapa interativo no contato com Leaflet + OpenStreetMap
- Base PWA: `manifest.webmanifest`, `service-worker.js` e icones

## Rotas disponiveis

- `/`
- `/acervo`
- `/health`
