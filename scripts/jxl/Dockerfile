# Conversor das fotos do acervo de JPEG para JPEG XL (ver converter.sh).
#
#   docker build -t museu-jxl scripts/jxl
#   docker run --rm --network none --user "$(id -u):$(id -g)" \
#     -v /srv/fabrica-museu/photos:/fotos museu-jxl
#
# Debian trixie traz o libjxl 0.11 (cjxl/djxl) nos pacotes oficiais.
FROM debian:trixie-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends libjxl-tools \
    && rm -rf /var/lib/apt/lists/*

COPY converter.sh /usr/local/bin/converter-jxl
RUN chmod 755 /usr/local/bin/converter-jxl

ENTRYPOINT ["converter-jxl"]
CMD ["/fotos"]
