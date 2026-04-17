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
Dockerfile.dev
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

## Executar com Docker (modo dev)

1. Suba os containers:

```bash
docker compose up --build
```

2. Acesse:

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
