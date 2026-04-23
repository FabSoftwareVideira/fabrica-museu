FROM python:3.11-slim
WORKDIR /workspace
RUN pip install --no-cache-dir Pillow python-dotenv pymupdf
COPY scripts/gerar_thumbs.py /opt/thumbs/gerar_thumbs.py
CMD ["python", "/opt/thumbs/gerar_thumbs.py"]

# Instruções para construir e rodar o container:

# 1. Na raiz do projeto, execute:
# docker build -f scripts/Dockerfile -t gerador-thumbs .
# 2. Execute com .env do diretório atual (Windows Git Bash):
# MSYS_NO_PATHCONV=1 docker run --rm -v "$(pwd)":/workspace --env-file scripts/.env gerador-thumbs
# 3. Copiar as imagens geradas para a pasta de destino na VPS (ajustar caminho e porta conforme necessário):
# rsync -avz -e "ssh -p 22" --ignore-existing photos usuario@ip-da-vps:/srv/fabrica-museu