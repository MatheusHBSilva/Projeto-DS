# AVALIA ✅:

## 📌 Descrição Geral:
O ***AVALIA*** é uma solução digital que integra a coleta e análise dos feedbacks dos clientes para oferecer sugestões de melhorias a restaurantes e estabelecimentos semelhantes. Utilizando o gemini, a ferramenta processa os comentários realizados pelos consumidores para gerar relatórios detalhados e insights que auxiliam os proprietários na tomada de decisões estratégicas para otimizar seus serviços. Paralelamente, o sistema também beneficia os clientes ao oferecer recomendações personalizadas e resumos inteligentes dos estabelecimentos, levando em conta preferências individuais, facilitando a escolha do ambiente ideal para uma experiência gastronômica.

## **Funcionalidades do AvalIA**

### Modo Restaurante:

- Cadastrar e logar restaurante.
- Adicionar e remover tags relacionadas ao restaurante.
- Visualizar as avaliações dos clientes individualmente.
- Gerar relatório com base em todas as avaliações.
- Acessar relatórios antigos.
- Baixar os relatórios em formato PDF.

### Modo Cliente:

- Cadastrar e logar cliente.
- Adicionar e remover tags relacionadas ao perfil do cliente.
- Visualizar sugestões de restaurantes com base na combatibilidade das tags.
- Pesquisar restaurantes.
- Favoritar restaurantes e visualiza-los em aba especial.
- Avaliar restaurantes com base na sua experiência.
- Gerar resumo de combatibilidade com base nas tags e nas avaliações do restaurante.

## Desenvolvimento do produto

### Identificação do problema:

- Implementação de medidas de padronização em restaurantes, além da dificuldade para filtrar feedbacks e sugestões de valor recibidos dos clientes.
- Dificuldade para encontrar restaurantes que atendam suas necessidades e interesses de maneira confiável.

### Proposta de valor:

- Garantir que donos de restaurantes obtenham um meio fiel de adquirir relatórios e feedbacks valiosos sobre a administração de seus estabelecimentos.
- Criar uma plataforma segura para a busca de restaurantes a depender dos interesses do usuário e dos serviços ofertados pelo estabelecimento.

### Público alvo:

- Donos e funcionários de restaurantes, os quais buscam uma consultoria prática e personalizada baseados nos feedbacks dos clientes.
- Pessoas a procura de sugestões de restaurante e interessadas em dar feedbacks e sugestões sobre suas experiências.
 
## Como Instalar <>

0. Certifique-se que o node esteja devidamente instalado.
1. Clone o repositório.
```jsx
git clone URL_DO_REPOSITÓRIO
```
2. Vá em terminal e abra o novo terminal.
3. Com o terminal aberto, escreva essa sentença abaixo e dê enter:
```jsx
npm install express sqlite3 bcrypt cors cookie-parser @google/generative-ai pdfkit dotenv
```
4. Crie um arquivo `.env` na raiz do repositório com a seguinte linha:
```env
GEMINI_API_KEY = adicione_a_chave_da_api
```

## 📂 Descrição das dependências

`express`: Framework minimalista para criação de servidores web em Node.js.

`sqlite3`: Biblioteca para utilizar o banco de dados SQLite em Node.js.

`bcrypt`: Utilizado para hashing seguro de senhas.

`cors`: Middleware para habilitar CORS (Cross-Origin Resource Sharing) nas requisições HTTP.

`cookie-parser`: Middleware para fazer o parsing de cookies enviados nas requisições.

`@google/generative-ai`: SDK da Google para integrar funcionalidades de inteligência artificial generativa.

`pdfkit`: Biblioteca para criação de arquivos PDF diretamente no servidor.

`dotenv`: Carrega variáveis de ambiente a partir de um arquivo .env para configuração do projeto.

## Contribuição

O AvalIA é feito utilizando JavaScript, SQL, HTML e CSS.

**Estrutura de Pastas do Projeto**

```plaintext
project/
├─ client/
│  ├─ auth.js
│  ├─ index.html
│  ├─ CSS/
│  │  ├─ styles.css
│  │  ├─ main.css
│  │  ├─ client_dashboard.css
│  │  ├─ hub.css
│  │  ├─ login_client.css
│  │  ├─ login_restaurant.css
│  │  ├─ register.css
│  │  ├─ rate.css
│  │  └─ review.css
│  ├─ Cliente/
│  │  ├─ login_client.html
│  │  ├─ register_client.html
│  │  ├─ Client_dashboard.html
│  │  ├─ client_dashboard.js
│  │  ├─ main.js
│  │  ├─ rate.html
│  │  ├─ rate.js
│  │  ├─ register_client.js
│  │  ├─ review.html
│  │  └─ review.js
│  ├─ Restaurante/
│  │  ├─ history.html
│  │  ├─ history.js
│  │  ├─ login_restaurant.html
│  │  ├─ restaurant_dashboard.html
│  │  ├─ restaurant_dashboard.js
│  │  ├─ restaurant_register.html
│  │  └─ restaurant_register.js
│  └─ images/
│     ...
│
├─ server/
│  ├─ middlewares/
│  │  ├─ clientMiddlewares.js
│  │  ├─ restaurantMiddlewares.js
│  │  ├─ validateLogin.js
│  │  └─ validateReportId.js
│  ├─ routes/
│  │  ├─ analysisRoutes.js
│  │  ├─ authRoutes.js
│  │  ├─ clientRoutes.js
│  │  ├─ favoriteRoutes.js
│  │  ├─ recommendationRoutes.js
│  │  ├─ reportRoutes.js
│  │  ├─ restaurantRoutes.js
│  │  ├─ reviewRoutes.js
│  │  ├─ reportRoutes.js
│  │  └─ discoveryRoutes.js
│  ├─ controllers/
│  │  ├─ analysisController.js
│  │  ├─ authController.js
│  │  ├─ clientController.js
│  │  ├─ favoriteController.js
│  │  ├─ recommendationController.js
│  │  ├─ reportController.js
│  │  ├─ restaurantController.js
│  │  ├─ reviewController.js
│  │  ├─ reportController.js
│  │  └─ discoveryController.js
│  ├─ models/
│  │  └─ db.js
│  └─ server.js
│
├─ CONTRIBUTING.md
├─ database.db
├─ package-lock.json
├─ package.json
└─ README.md
```
[Arquitetura da Aplicação](https://github.com/MatheusHBSilva/Projeto-DS/blob/main/docs/arquitetura.md)

[Regras de contribuição](https://github.com/MatheusHBSilva/Projeto-DS/blob/main/CONTRIBUTING.md)

[Regras de revisão do código](https://github.com/MatheusHBSilva/Projeto-DS/blob/main/CODE_REVIEW.md)

[Manual do desenvolvedor](https://github.com/MatheusHBSilva/Projeto-DS/blob/main/docs/manual-desenvolvedor.md)

## Como Rodar <>
0. Inicie o servidor usando o comando.
```jsx
npm start
```
1. Acesse o localhost no seu navegador.

## Rodando os testes 

O projeto utiliza a ferramenta Jest para testes unitários de backend.

0. Se você clonou o repositório, rode o comando.
```jsx
npm install
```
1. Se quiser rodar todos os testes, digite no terminal.
```jsx
npm test
```
2. Se quiser rodar um teste específico, digite no terminal.
```jsx
npm test nome-do-arquivo
```
3. Para analisar a cobertura de código com testes, rode no terminal.
```jsx
npx jest --coverage
```
## Documentações importantes
[Link do Drive do projeto](https://drive.google.com/drive/folders/1dCIHfxpPBsO5VICLNAlN9THgfviDClxe)

[Link do Notion do projeto](https://www.notion.so/Projeto-DS-1fb9f1dffea8800a8eeed09cd4419f4f)

## Licença
AvalIA está sob a licença MIT

## Sobre o projeto
O AvalIA foi desenvolvidos por estudantes do Centro de Informática-UFPE para a diciplina Desenvolvimento de Software 2025.1

Responsáveis pelo projeto:  
- Ana sofia da Silva Moura (assm)
- Arthur Torres de Lucena (atl)
- Giovanna Maria de Carvalho Bardi (gmcb)
- Matheus Henrique Barros da Silva (mhbs4)
- Pedro Elias Gonçalves de Andrade (pega)
- Raissa Machado Figueiredo (rmf5)
- Thales Rafael da Costa Silva (trcs)
