## **Padrão para Criação de Branches**

A nomeclatura das branches devem seguir o padrão:

**`<type>/<description>`**

Onde:

- **Type**: Define o propósito da branch.
    - **`feat`**: Para novas funcionalidades.
    - **`fix`**: Para correções de bugs.
    - **`refactor`**: Para refatoração de código.
    - **`docs`**: Para documentação.
    - **`test`**: Para adição ou modificação de testes.
- **Description**: Uma breve descrição do que será desenvolvido ou alterado.

**Exemplo:**

- **`feat/login-page`**

- **`fix/email-bug`**

- **`refactor/api-rout`**

- **`docs/api-description`**

## How to Install

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

## How to Run
0. Inicie o servidor usando o comando.
```jsx
npm start
```
1. Acesse o localhost no seu navegador.
