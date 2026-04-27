# ------------------------------------------------------------
# BASE — dependências compartilhadas entre dev e prod
# ------------------------------------------------------------
FROM node:25.9-bookworm-slim AS base

# Recebe metadados de build passados pelo docker-compose
# (silenciosamente ignorados se não declarados aqui)
ARG IMAGE_TAG=dev
ARG IMAGE_NAME=
ARG BUILD_DATE=unknown
ARG GIT_COMMIT=unknown

# Expõe como variáveis de ambiente dentro da imagem
# (útil para endpoints de /health ou /version na app)
ENV IMAGE_TAG=$IMAGE_TAG \
  IMAGE_NAME=$IMAGE_NAME \
  BUILD_DATE=$BUILD_DATE \
    GIT_COMMIT=$GIT_COMMIT

WORKDIR /app

# Copia apenas os manifests primeiro — melhor aproveitamento do cache de layers:
# enquanto package*.json não mudar, o npm ci não roda de novo.
COPY --chown=node:node package*.json ./

# ------------------------------------------------------------
# DEV — hot-reload, devDependencies incluídas
# O volume bind-mount do compose sobrescreve /app em runtime,
# então o COPY do código-fonte aqui serve só para builds
# isolados (ex: CI de lint/test sem compose).
# ------------------------------------------------------------
FROM base AS dev

ENV NODE_ENV=development

RUN npm ci

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ------------------------------------------------------------
# PROD — imagem enxuta, sem devDependencies
# Compatível com:
#   - read_only: true  (escrita apenas em tmpfs)
#   - cap_drop: ALL
#   - no-new-privileges: true
# ------------------------------------------------------------
FROM base AS prod

ENV NODE_ENV=production \
    # Redireciona o cache do npm para /tmp (tmpfs no compose).
    # Necessário porque read_only: true impede escrita em /home/node/.npm
    # durante qualquer operação npm em runtime.
    npm_config_cache=/tmp/.npm

RUN npm ci --omit=dev && \
    # Remove arquivos desnecessários do node_modules para reduzir tamanho:
    # - testes, docs, exemplos embutidos em pacotes
    # Seguro para produção — não afeta código executado.
    find node_modules -type f \( \
      -name "*.md" \
      -o -name "*.ts" ! -name "*.d.ts" \
      -o -name "*.map" \
      -o -name "CHANGELOG*" \
      -o -name "LICENSE*" \
      -o -name "README*" \
      -o -name ".npmignore" \
    \) -delete && \
    # Remove diretórios de teste e exemplos
    find node_modules -type d \( \
      -name "test" \
      -o -name "tests" \
      -o -name "__tests__" \
      -o -name "example" \
      -o -name "examples" \
      -o -name ".github" \
    \) -exec rm -rf {} + 2>/dev/null || true

COPY --chown=node:node . .

# Cria diretórios temporários com as permissões corretas.
# O compose monta tmpfs sobre eles em runtime; sem o diretório
# existindo na imagem, o mount pode falhar em alguns runtimes.
RUN mkdir -p /tmp/.npm /app/tmp && \
    chown -R node:node /tmp/.npm /app/tmp

USER node

# Healthcheck nativo da imagem — funciona mesmo sem o compose.
# Usa apenas node (sempre disponível), sem depender de wget/curl
# que podem não estar na imagem slim.
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=4 \
  CMD node -e \
    "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

EXPOSE 3000

CMD ["npm", "start"]