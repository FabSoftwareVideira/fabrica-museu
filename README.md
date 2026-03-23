# Museu do Vinho Mário Pellegrin — Videira, SC

O site do museu hoje é apenas uma página estática dentro do site da prefeitura. Veja: [https://turismo.videira.sc.gov.br/post-13419/](https://turismo.videira.sc.gov.br/post-13419/). Neste site, temos a logotipo, algumas imagens que podemos usar, um texto sobre o museu e detalhes de contato que vamos usar no nosso projeto.

## Tarefas

- [ ] Criar um projeto com nodejs, express e javascript
- [ ] Usar EJS para renderizar as páginas do site
- [ ] Criar uma página inicial com informações sobre o museu (veja uma ideia no arquivo `index.html`). Na seção `hero`, o foco é direcionar para Explorar o Acervo (ainda vamos pensar nessa página de acervo depois)
- [ ] Criar um botão flutuante para contato via WhatsApp (49 9 9156-1089). Através do WhatsApp os visitantes fazem o agendamento para visitar o museu.
- [ ] Na seção "O museu", incluir um texto sobre o museu (pode ser um resumo do texto do site da prefeitura) e algumas imagens do museu (podemos usar as imagens do site da prefeitura ou outras imagens que encontrarmos)
- [ ] Na seção "O que você encontra aqui", pode deixar como está. Apenas incluir imagens ilustrativas por enquanto.
- [ ] Na seção "Uma linha do tempo da vitivinicultura", pode deixar como está. A equipe do museu vai criar a linha do tempo.
- [ ] Na seção de contato, incluir o endereço do museu e um mapa interativo usando a biblioteca LeafLet (adicionar uma forma de abrir o Google Maps), telefone fixo, email, horário de atendimento, redes sociais (instagram: turismoeculturavideira), etc. Não precisa de formulário de contato, apenas as informações de contato.

## Requisitos Técnicos

- O projeto deve ser criado usando Node.js, Express e JavaScript.
- O EJS deve ser usado para renderizar as páginas do site.
- O site deve ser responsivo e funcionar bem em dispositivos móveis. Deve ser parcialmente um PWA (Progressive Web App) para que os visitantes possam pelo menos instalar o site no celular.
- Adicionar alguns critérios de acessibilidade, como contraste de cores, modo dark/light (ícone na barra de navegação), texto alternativo para imagens, etc.
- Deve rodar com Docker, pelo menos em produção. Para desenvolvimento, pode ser rodado localmente sem Docker, mas o ideal é que seja possível rodar com Docker também.
- Usar boas práticas de desenvolvimento, como organização de código, uso de variáveis de ambiente para configurações, etc.
