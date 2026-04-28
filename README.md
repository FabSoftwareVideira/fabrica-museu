# Museu do Vinho Mario Pellegrin

Aplicacao web em Node.js com Fastify, Handlebars e Bulma.

## Stack atual

- Node.js 20+
- Fastify (framework HTTP)
- Handlebars (template engine)
- Bulma CSS (CDN)
- Docker Compose (dev e prod)
- Testes unitários com `node:test` (runner nativo)

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
