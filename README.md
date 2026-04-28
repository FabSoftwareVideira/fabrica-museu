# Museu do Vinho Mario Pellegrin

![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/-Fastify-000000?logo=fastify&logoColor=white)
![Handlebars](https://img.shields.io/badge/-Handlebars-f0772b?logo=handlebarsdotjs&logoColor=white)
![Bulma](https://img.shields.io/badge/-Bulma-00d1b2?logo=bulma&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?logo=docker&logoColor=white)

## Sobre o projeto

O **Museu do Vinho Mário Pellegrin** possui atualmente sua presença digital limitada a uma página estática dentro do portal oficial de turismo da prefeitura de Videira.

Este projeto tem como objetivo desenvolver uma **plataforma web responsiva**, que substitua essa página estática por uma aplicação completa, permitindo não apenas a apresentação institucional do museu, mas também a exploração digital do seu acervo histórico.

Além de centralizar informações institucionais (história, visitação e contato), o sistema será preparado para:

- Exibir e organizar o acervo digital do museu (≈3000 imagens)
- Permitir navegação por categorias e filtros
- Descrever o contexto histórico e cultural de cada item do acervo, usando inteligência artificial para enriquecer as descrições
- Funcionar como um **PWA (Progressive Web App)** instalável

A iniciativa contribui diretamente para a **preservação da memória cultural regional**, ampliando o acesso público ao patrimônio histórico da vitivinicultura catarinense.

## 🚧 Roadmap

### 🟢 1. Estrutura e Setup

- [x] Criar projeto com Node.js + Express + Handlebars + Bulma
- [x] Organizar estrutura (rotas, views, public)
- [x] Configurar variáveis de ambiente
- [x] Configurar Docker (dev e produção)

---

### 🎨 2. Interface e Página Inicial

- [x] Implementar layout responsivo (mobile-first)
- [x] Criar página inicial com seções:
  - Hero (CTA para acervo)
  - O Museu (texto + imagens)
  - Destaques e linha do tempo
  - Contato com mapa (Leaflet)
- [x] Adicionar botão flutuante de WhatsApp
- [x] Implementar modo dark/light

### 🖼️ 3. Página de Acervo (MVP)

- [x] Criar página `/acervo`
- [x] Exibir imagens em grid
- [x] Implementar categorias e filtros
- [x] Criar endpoint JSON para acervo

### ☁️ 4. Imagens e Infraestrutura

- [x] Armazenar imagens localmente (dev) e em VPS (prod)
- [x] Gerar thumbnails menores para otimização em formato WebP
- [x] Configurar Nginx para servir imagens otimizadas

### 📱 5. PWA, Acessibilidade e Performance

- [x] Configurar manifest e service worker
- [x] Permitir instalação (PWA)
- [x] Garantir acessibilidade básica (alt, contraste)
- [ ] Melhorar performance (Lighthouse)

### 🚀 6. Evolução do Sistema

- [x] Integrar acervo real (~3000 imagens)
- [x] Implementar busca e paginação
- [x] Criar página de detalhe
- [x] Preparar integração com IA (classificação)
- [x] Configurar CI/CD para deploy automático
- [ ] Implementar painel de administração (upload e gestão do acervo)
- [ ] Adicionar suporte a múltiplos idiomas (i18n)
- [ ] Implementar testes automatizados (unitários e E2E)
- [ ] Configurar monitoramento e logging em produção
- [ ] Otimizar SEO e performance para produção
- [ ] Explorar integração com redes sociais (compartilhamento)
- [ ] Criar versão mobile nativa (React Native ou Flutter)
- [ ] Implementar funcionalidades de realidade aumentada (AR) para acervo
- [ ] Explorar parcerias para digitalização e enriquecimento do acervo com IA
- [ ] Criar campanhas de divulgação e engajamento online

## Rotas disponíveis

- `GET /` — página inicial com mapa e informações
- `GET /acervo` — galeria de fotos com filtros por categoria
- `GET /api/acervo` — endpoint JSON para acervo (paginável)
- `GET /health` — healthcheck (usado em Docker healthcheck)

> Para instruções detalhadas de como rodar, configurar e testar o projeto, consulte o [HOWTO.md](HOWTO.md).

---

## 🤝 Como contribuir

Contribuições são bem-vindas! Para manter a qualidade do código, siga o fluxo abaixo:

1. **Fork** este repositório
2. Crie uma branch descritiva:
   ```bash
   git checkout -b feat/minha-funcionalidade
   ```
3. Faça suas alterações e adicione testes quando aplicável
4. Certifique-se que os testes passam:
   ```bash
   npm test
   ```
5. Commit com mensagem clara seguindo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: adiciona filtro por data no acervo"
   ```
6. Abra um **Pull Request** descrevendo o que foi alterado e por quê

> Dúvidas ou sugestões? Abra uma [issue](https://github.com/FabSoftwareVideira/fabrica-museu/issues).

## Membros do Projeto

<a href="https://github.com/FabSoftwareVideira">
  <img src="https://github.com/FabSoftwareVideira.png" width="80px;" style="border-radius:50%" />
</a>
<a href="https://github.com/fabricioifc">
  <img src="https://github.com/fabricioifc.png" width="80px;" style="border-radius:50%" />
</a>
<a href="https://github.com/ClaudioneiSerafini-IFC">
  <img src="https://github.com/ClaudioneiSerafini-IFC.png" width="80px;" style="border-radius:50%" />
</a>
<a href="https://github.com/fabiojrp">
  <img src="https://github.com/fabiojrp.png" width="80px;" style="border-radius:50%" />
</a>
<a href="https://github.com/tiagoheineck">
  <img src="https://github.com/tiagoheineck.png" width="80px;" style="border-radius:50%" />
</a>
<a href="https://github.com/wanderson-rigo">
  <img src="https://github.com/wanderson-rigo.png" width="80px;" style="border-radius:50%" />
</a>

## 🤖 Desenvolvido com GitHub Copilot

Este projeto foi desenvolvido com o auxílio do **GitHub Copilot**, ferramenta de IA da GitHub que sugere código em tempo real diretamente no editor. O Copilot contribuiu em diversas etapas do desenvolvimento — desde a geração de estruturas iniciais e lógica de negócio até revisão de configurações de infraestrutura (Docker, Nginx) e escrita de testes. Seu uso acelerou o ciclo de desenvolvimento e permitiu que a equipe dedicasse mais atenção à qualidade, arquitetura e às decisões de produto, mantendo o foco na missão do projeto: preservar e ampliar o acesso digital ao patrimônio histórico do Museu do Vinho Mário Pellegrin.
