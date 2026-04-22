import os
import json
from pathlib import Path
from PIL import Image

try:
    from dotenv import load_dotenv
    # Procura .env no mesmo diretório do script e no diretório de trabalho
    load_dotenv(Path(__file__).parent / ".env")
    load_dotenv()
except ImportError:
    pass  # python-dotenv opcional; variáveis de ambiente do sistema ainda funcionam

EXTENSOES_IMAGEM = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}


def exibir_progresso(atual, total, prefixo="Progresso"):
    if total <= 0:
        return

    largura_barra = 30
    proporcao = atual / total
    preenchido = int(largura_barra * proporcao)
    barra = "#" * preenchido + "-" * (largura_barra - preenchido)
    percentual = proporcao * 100
    print(f"\r{prefixo}: [{barra}] {atual}/{total} ({percentual:6.2f}%)", end="", flush=True)

    if atual >= total:
        print()


def thumb_ja_gerada(caminho_thumb):
    return os.path.exists(caminho_thumb)


def criar_thumb(caminho_original, caminho_thumb, largura_max):
    os.makedirs(os.path.dirname(caminho_thumb), exist_ok=True)

    with Image.open(caminho_original) as img:
        img = img.convert("RGB")

        w_percent = largura_max / float(img.size[0])
        h_size = int(float(img.size[1]) * w_percent)
        img_thumb = img.resize((largura_max, h_size), Image.Resampling.LANCZOS)
        img_thumb.save(caminho_thumb, "WEBP", quality=75)


def processar_por_json(arquivo_json, pasta_base_origem, pasta_destino, largura_max=200):
    with open(arquivo_json, 'r', encoding='utf-8') as f:
        dados = json.load(f)

    total = len(dados)
    ok = 0
    puladas = 0
    erros = 0
    processadas = 0

    print(f"Iniciando processamento via JSON ({total} imagens)...")

    for item in dados:
        caminho_relativo = item.get("path")
        if not caminho_relativo:
            erros += 1
            processadas += 1
            print("Erro: item sem campo 'path' no JSON")
            exibir_progresso(processadas, total, "JSON")
            continue

        caminho_original = os.path.join(pasta_base_origem, caminho_relativo)
        caminho_rel_sem_ext = os.path.splitext(caminho_relativo)[0]
        caminho_thumb = os.path.join(pasta_destino, f"{caminho_rel_sem_ext}.webp")

        try:
            if thumb_ja_gerada(caminho_thumb):
                puladas += 1
            elif os.path.exists(caminho_original):
                criar_thumb(caminho_original, caminho_thumb, largura_max)
                ok += 1
                print(f"Sucesso: {caminho_relativo} -> {caminho_thumb}")
            else:
                erros += 1
                print(f"Erro: Arquivo não encontrado em {caminho_original}")

        except Exception as e:
            erros += 1
            print(f"Erro ao processar {caminho_relativo}: {e}")

        processadas += 1
        exibir_progresso(processadas, total, "JSON")

    print(f"Concluido via JSON. Sucesso: {ok} | Puladas: {puladas} | Erros: {erros}")


def processar_por_pasta(pasta_base_origem, pasta_destino, largura_max=200):
    pasta_fotos = os.path.join(pasta_base_origem, "photos")
    arquivos_imagem = []
    ok = 0
    puladas = 0
    erros = 0
    processadas = 0

    if not os.path.isdir(pasta_fotos):
        raise FileNotFoundError(f"Pasta de fotos nao encontrada: {pasta_fotos}")

    for raiz, _, arquivos in os.walk(pasta_fotos):
        for nome_arquivo in arquivos:
            ext = os.path.splitext(nome_arquivo)[1].lower()
            if ext in EXTENSOES_IMAGEM:
                arquivos_imagem.append(os.path.join(raiz, nome_arquivo))

    total = len(arquivos_imagem)

    print(f"Iniciando processamento por pasta em: {pasta_fotos}")
    print(f"Total de imagens encontradas: {total}")

    for caminho_original in arquivos_imagem:
        rel = os.path.relpath(caminho_original, pasta_base_origem)
        rel_sem_ext = os.path.splitext(rel)[0]
        caminho_thumb = os.path.join(pasta_destino, f"{rel_sem_ext}.webp")

        try:
            if thumb_ja_gerada(caminho_thumb):
                puladas += 1
            else:
                criar_thumb(caminho_original, caminho_thumb, largura_max)
                ok += 1
                print(f"Sucesso: {rel} -> {caminho_thumb}")
        except Exception as e:
            erros += 1
            print(f"Erro ao processar {rel}: {e}")

        processadas += 1
        exibir_progresso(processadas, total, "PASTA")

    print(f"Concluido por pasta. Total: {total} | Sucesso: {ok} | Puladas: {puladas} | Erros: {erros}")

# --- CONFIGURAÇÕES ---
ARQUIVO_JSON = os.environ.get("ARQUIVO_JSON", "src/data/acervo-index.json")
PASTA_RAIZ = os.environ.get("PASTA_RAIZ", "src/public")
PASTA_THUMBS = os.environ.get("PASTA_THUMBS", "src/public/photos/thumbs")
LARGURA_THUMB = int(os.environ.get("LARGURA_THUMB", "250"))
USAR_JSON = os.environ.get("USAR_JSON", "1") != "0"

if __name__ == "__main__":
    print(f"Diretório atual: {os.getcwd()}")
    print(f"Tentando abrir JSON em: {os.path.abspath(ARQUIVO_JSON)}")

    os.makedirs(PASTA_THUMBS, exist_ok=True)
    print(f"Pasta de destino: {os.path.abspath(PASTA_THUMBS)}")

    if USAR_JSON and os.path.exists(ARQUIVO_JSON):
        processar_por_json(ARQUIVO_JSON, PASTA_RAIZ, PASTA_THUMBS, LARGURA_THUMB)
    else:
        if USAR_JSON:
            print("JSON nao encontrado. Fazendo fallback para varredura da pasta photos.")
        processar_por_pasta(PASTA_RAIZ, PASTA_THUMBS, LARGURA_THUMB)