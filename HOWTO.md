# HOWTO — Como rodar, configurar e testar

Este documento cobre tudo que você precisa para rodar o projeto localmente ou em produção.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 20
- [Docker](https://docs.docker.com/get-docker/) e Docker Compose (para os ambientes containerizados)
- Arquivo `.env` configurado (copie de `.env.example` e ajuste as variáveis)

---

## Executar localmente (sem Docker)

1. Instale as dependências:

```bash
npm install
```

2. Inicie em modo dev:

```bash
npm run dev
```

3. Acesse:

```text
http://localhost:3003
```

---

## Scripts disponíveis

| Comando                      | Descrição                                               |
| ---------------------------- | ------------------------------------------------------- |
| `npm run dev`                | Inicia com nodemon e hot-reload (desenvolvimento local) |
| `npm start`                  | Inicia em modo normal (produção)                        |
| `npm test`                   | Executa testes unitários com `node:test`                |
| `npm run dev:ssl`            | Gera certificado local com mkcert e sobe ambiente dev   |

---

## Variáveis de ambiente

Configure em `.env` (use `.env.example` como base):

```env
NODE_ENV=development         # development ou production
HOST=0.0.0.0                 # Bind address
PORT=3003                    # Porta de escuta (dev; em produção o compose fixa 3000)
TRUST_PROXY=false            # true se atrás de proxy reverso
# PHOTOS_HOST_PATH=/srv/fabrica-museu/photos  # Pasta das fotos na VPS (prod, Dokploy)

# Rate limit (true/false)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PAGES_ENABLED=true
RATE_LIMIT_API_ENABLED=true
```

---

## 🐳 Executar com Docker

| Arquivo                  | Uso                                             |
| ------------------------ | ----------------------------------------------- |
| `docker-compose.dev.yml` | Desenvolvimento local (hot reload + Nginx HTTPS) |
| `docker-compose.yml`     | Produção, executado pelo Dokploy na VPS         |

### Desenvolvimento (local)

```bash
docker compose -f docker-compose.dev.yml up --build -d
```

| Endpoint                 | Descrição                                              |
| ------------------------ | ------------------------------------------------------ |
| `http://localhost:3003`  | App Node.js direto                                     |
| `http://localhost:8080`  | Nginx HTTP                                             |
| `https://localhost:8443` | Nginx HTTPS (requer certificado em `infra/certs/dev/`) |

Alterações em `src/` são refletidas automaticamente (hot-reload via nodemon).

**Outros comandos úteis (dev):**

```bash
# Ver logs em tempo real
docker compose -f docker-compose.dev.yml logs -f

# Parar tudo
docker compose -f docker-compose.dev.yml down
```

#### HTTPS local com mkcert (via Docker — recomendado no Windows)

```bash
npm run dev:ssl
```

Isso gera `infra/certs/dev/tls.crt` e `infra/certs/dev/tls.key` e sobe o ambiente completo com Nginx em HTTPS. Sem certificado, o Nginx sobe apenas em HTTP.

Para incluir domínios ou IPs extras (ex: testar no celular):

```bash
node infra/scripts/bootstrap-ssl.js --profile dev --domains 192.168.1.6,meu-host.local
```

---

### Produção (VPS com Dokploy)

A produção roda na VPS com [Dokploy](https://dokploy.com), a partir do `docker-compose.yml`. O serviço `fabrica-museu-web` não publica porta no host nem usa Nginx: o domínio e o HTTPS ficam com o Traefik do Dokploy, que alcança a porta 3000 pela `dokploy-network`. O cache do navegador para fotos e assets é definido pelo próprio app.

O workflow `.github/workflows/deploy-dokploy.yml` roda os testes, valida o compose e pede o deploy pela API do Dokploy a cada push na `main` ou tag `v*` (também dá para disparar manualmente em *Actions*).

Configuração (uma vez):

1. **Fotos na VPS.** Copie as fotos e thumbnails do acervo para `/srv/fabrica-museu/photos` (ou outra pasta, informada em `PHOTOS_HOST_PATH`). Essa pasta fica fora do código porque o Dokploy clona o repositório de novo a cada deploy:

   ```bash
   rsync -avz --ignore-existing photos usuario@ip-da-vps:/srv/fabrica-museu
   ```

2. **Recurso no Dokploy.** Crie um recurso **Docker Compose** apontando para este repositório, com **Compose Path** `./docker-compose.yml`. Deixe o *Autodeploy* desligado: quem dispara o deploy é o GitHub Actions.
3. **Environment.** Na aba **Environment**, cole as variáveis do `.env.example` com os valores de produção (`PHOTOS_HOST_PATH`, `TZ`, rate limit e, se quiser, `IMAGE_TAG` com a versão exibida no rodapé). `NODE_ENV`, `HOST`, `PORT` e `TRUST_PROXY` são fixados pelo compose.
4. **Domains.** Na aba **Domains**, adicione o domínio (ex.: `museudovinho.fsw-ifc.brdrive.cloud`) para o serviço `fabrica-museu-web`, porta `3000`, com HTTPS.
5. **Secrets do GitHub.** Crie `DOKPLOY_URL`, `DOKPLOY_API_KEY` (token em Settings → Profile → API/CLI do Dokploy) e `DOKPLOY_COMPOSE_ID` (o id do recurso, na URL dele no painel). Sem eles, o workflow só roda os testes e valida o compose.
6. Faça o primeiro deploy e confira `https://SEU-DOMINIO/health`.

Para acompanhar: abas **Deployments** e **Logs** do recurso no Dokploy.

---

## Testes

Execute a suíte completa:

```bash
npm test
```

Ou um arquivo específico:

```bash
node --test tests/utils/slug.test.js
```

Dentro do container dev:

```bash
docker compose -f docker-compose.dev.yml exec fabrica-museu-dev npm test
```

---

## Thumbnails

Para gerar thumbnails das imagens do acervo:

```bash
# Gerar a Imagem do container de geração de thumbnails
docker build -t gerador-thumbs -f infra/Dockerfile.thumbs .
# Rodar via Docker (recomendado)
MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd)":/workspace --env-file scripts/.env gerador-thumbs
```
