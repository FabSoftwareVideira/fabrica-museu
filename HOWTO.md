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
http://localhost:3000
```

---

## Scripts disponíveis

| Comando                      | Descrição                                               |
| ---------------------------- | ------------------------------------------------------- |
| `npm run dev`                | Inicia com nodemon e hot-reload (desenvolvimento local) |
| `npm start`                  | Inicia em modo normal (produção)                        |
| `npm test`                   | Executa testes unitários com `node:test`                |
| `npm run dev:ssl`            | Gera certificado local com mkcert e sobe ambiente dev   |
| `npm run ssl:bootstrap:prod` | Gera certificado autoassinado para testes em prod       |

---

## Variáveis de ambiente

Configure em `.env` (use `.env.example` como base):

```env
NODE_ENV=development         # development ou production
HOST=0.0.0.0                 # Bind address
PORT=3000                    # Porta de escuta
TRUST_PROXY=false            # true se atrás de proxy reverso
PHOTOS_HOST_PATH=/srv/fabrica-museu/photos  # Caminho das fotos na VPS (prod)
# PHOTOS_HOST_PATH=/app/src/public/photos   # Caminho local (dev)

# Rate limit (true/false)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PAGES_ENABLED=true
RATE_LIMIT_API_ENABLED=true
```

---

## 🐳 Executar com Docker

### Desenvolvimento (local)

```bash
# Sobe o app + Nginx com hot-reload ativo
docker compose --profile dev up --build -d
```

| Endpoint                 | Descrição                                              |
| ------------------------ | ------------------------------------------------------ |
| `http://localhost:3000`  | App Node.js direto                                     |
| `http://localhost:8080`  | Nginx HTTP                                             |
| `https://localhost:8443` | Nginx HTTPS (requer certificado em `infra/certs/dev/`) |

Alterações em `src/` são refletidas automaticamente (hot-reload via nodemon).

**Outros comandos úteis (dev):**

```bash
# Ver logs em tempo real
docker compose --profile dev logs -f

# Parar tudo
docker compose --profile dev down
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

### Produção (VPS / servidor)

1. **Crie a rede externa** (apenas na primeira vez):

```bash
docker network create fabrica-network
```

2. **Configure o `.env`** com os valores de produção:

```env
NODE_ENV=production
PHOTOS_HOST_PATH=/srv/fabrica-museu/photos
```

3. **Coloque os certificados TLS** em:

```text
infra/certs/prod/tls.crt
infra/certs/prod/tls.key
```

4. **Suba os serviços:**

```bash
docker compose --profile prod up --build -d
```

5. **Verifique o status:**

```bash
docker compose --profile prod ps
docker compose --profile prod logs -f
```

| Endpoint | Descrição                        |
| -------- | -------------------------------- |
| `:80`    | Redireciona para HTTPS           |
| `:443`   | Nginx HTTPS com proxy para o app |

> Em produção o app Node não é exposto diretamente no host; todo tráfego passa pelo Nginx.

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
docker compose --profile dev exec fabrica-museu-dev npm test
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
