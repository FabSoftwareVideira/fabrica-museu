# Usa uma imagem leve do Python
FROM python:3.11-slim

# O codigo do projeto sera montado em /workspace no docker run
WORKDIR /workspace

# Instala dependências
RUN pip install --no-cache-dir Pillow python-dotenv

# Copia o script para dentro do container em um caminho fixo
COPY scripts/gerar_thumbs.py /opt/thumbs/gerar_thumbs.py

# .env é opcional — monte via -v ou --env-file no docker run

# Comando padrão ao rodar o container
CMD ["python", "/opt/thumbs/gerar_thumbs.py"]

# Instruções para construir e rodar o container:

# 1. Na raiz do projeto, execute:
# docker build -f scripts/Dockerfile -t gerador-thumbs .
# 2. Execute com .env do diretório atual (Windows Git Bash):
# MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd)":/workspace --env-file scripts/.env gerador-thumbs
# 3. Na VPS (Linux), com paths absolutos:
# docker run --rm -v /srv/fabrica-museu:/workspace --env-file /srv/fabrica-museu/scripts/.env gerador-thumbs