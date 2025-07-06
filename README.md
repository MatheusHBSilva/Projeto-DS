# AVALIA ✅:

## 📌 Descrição Geral:
O ***AVALIA*** é uma solução digital que integra a coleta e análise dos feedbacks dos clientes para oferecer sugestões de melhorias a restaurantes e estabelecimentos semelhantes. Utilizando o gemini, a ferramenta processa os comentários realizados pelos consumidores para gerar relatórios detalhados e insights que auxiliam os proprietários na tomada de decisões estratégicas para otimizar seus serviços. Paralelamente, o sistema também beneficia os clientes ao oferecer recomendações personalizadas e resumos inteligentes dos estabelecimentos, levando em conta preferências individuais e localização, e facilitando a escolha do ambiente ideal para uma experiência gastronômica.

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

## 📂 Descrição das dependências

`express`: Framework minimalista para criação de servidores web em Node.js.

`sqlite3`: Biblioteca para utilizar o banco de dados SQLite em Node.js.

`bcrypt`: Utilizado para hashing seguro de senhas.

`cors`: Middleware para habilitar CORS (Cross-Origin Resource Sharing) nas requisições HTTP.

`cookie-parser`: Middleware para fazer o parsing de cookies enviados nas requisições.

`@google/generative-ai`: SDK da Google para integrar funcionalidades de inteligência artificial generativa.

`pdfkit`: Biblioteca para criação de arquivos PDF diretamente no servidor.

`dotenv`: Carrega variáveis de ambiente a partir de um arquivo .env para configuração do projeto.

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
