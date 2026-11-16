#!/usr/bin/env bash
# Gera um .jxl ao lado de cada .jpg/.jpeg da pasta (recursivo), sem apagar nada.
#
# A conversão é a recompressão sem perda do próprio JPEG (cjxl --lossless_jpeg=1):
# o .jxl fica ~20% menor e devolve o JPEG original byte a byte. Cada arquivo é
# conferido assim (djxl + cmp) antes de ser mantido; se não bater, ou se o .jxl não
# ficar menor, ele é descartado e o site continua servindo só o JPEG.
#
# Uso: converter.sh [pasta]            (padrão /fotos)
# Variáveis:
#   JOBS=N               conversões em paralelo (padrão: número de CPUs)
#   REGERAR_EXISTENTES=1 refaz os .jxl que já existem (padrão 0: pula)
#   ESFORCO=1..9         esforço do cjxl (padrão 7; mais alto = um pouco menor e mais lento)
set -euo pipefail

PASTA="${1:-/fotos}"
JOBS="${JOBS:-$(nproc)}"
export REGERAR_EXISTENTES="${REGERAR_EXISTENTES:-0}"
export ESFORCO="${ESFORCO:-7}"

if [[ ! -d "$PASTA" ]]; then
    echo "Pasta não encontrada: $PASTA" >&2
    exit 1
fi

converter_um() {
    local jpg="$1"
    local jxl="${jpg%.*}.jxl"
    local parcial="${jxl}.parcial"
    local volta
    volta="$(mktemp --suffix=.jpg)"

    if [[ -f "$jxl" && "$REGERAR_EXISTENTES" != "1" ]]; then
        echo "PULOU	$jpg"
        rm -f "$volta"
        return 0
    fi

    if ! cjxl --quiet --lossless_jpeg=1 -e "$ESFORCO" "$jpg" "$parcial" 2>/dev/null; then
        echo "ERRO	$jpg	cjxl falhou"
        rm -f "$parcial" "$volta"
        return 0
    fi

    # Confere: o .jxl tem que devolver exatamente o mesmo JPEG
    if ! djxl --quiet "$parcial" "$volta" 2>/dev/null || ! cmp -s "$jpg" "$volta"; then
        echo "ERRO	$jpg	não devolve o JPEG idêntico"
        rm -f "$parcial" "$volta"
        return 0
    fi
    rm -f "$volta"

    local tam_jpg tam_jxl
    tam_jpg="$(stat -c %s "$jpg")"
    tam_jxl="$(stat -c %s "$parcial")"
    if (( tam_jxl >= tam_jpg )); then
        echo "MAIOR	$jpg"
        rm -f "$parcial"
        return 0
    fi

    mv -f "$parcial" "$jxl"
    echo "OK	$jpg	$tam_jpg	$tam_jxl"
}
export -f converter_um

echo "Convertendo JPEG da pasta $PASTA para JPEG XL ($JOBS em paralelo, esforço $ESFORCO)..."
resultado="$(mktemp)"

# Restos de uma execução interrompida
find "$PASTA" -type f -name '*.jxl.parcial' -delete

find "$PASTA" -type f \( -iname '*.jpg' -o -iname '*.jpeg' \) -print0 \
    | xargs -0 -r -n 1 -P "$JOBS" bash -c 'converter_um "$1"' _ \
    | tee "$resultado" \
    | awk -F '\t' '$1 == "ERRO" { print "  erro: " $2 " (" $3 ")" } $1 == "OK" && ++n % 200 == 0 { print "  " n " convertidas..." }'

ok="$(grep -c '^OK' "$resultado" || true)"
pulou="$(grep -c '^PULOU' "$resultado" || true)"
maior="$(grep -c '^MAIOR' "$resultado" || true)"
erro="$(grep -c '^ERRO' "$resultado" || true)"
economia="$(awk -F '\t' '$1 == "OK" { a += $3; b += $4 } END { if (a > 0) printf "%.1f MB -> %.1f MB (%.0f%% menor)", a/1048576, b/1048576, 100*(a-b)/a; else print "-" }' "$resultado")"
rm -f "$resultado"

echo
echo "Convertidas: $ok | já existiam: $pulou | sem ganho (mantido só o JPEG): $maior | erros: $erro"
echo "Tamanho das convertidas: $economia"
echo "Reinicie o app no Dokploy para ele passar a servir os .jxl."

[[ "$erro" -eq 0 ]]
