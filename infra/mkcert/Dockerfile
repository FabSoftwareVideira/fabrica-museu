FROM golang:1.24-alpine AS build

RUN apk add --no-cache git
RUN go install filippo.io/mkcert@latest

FROM alpine:3.21

RUN apk add --no-cache ca-certificates nss-tools

COPY --from=build /go/bin/mkcert /usr/local/bin/mkcert

WORKDIR /work
ENTRYPOINT ["mkcert"]
