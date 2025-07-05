## 🔐 Autenticação (Login/Logout)

### Função: `login(userType)`

**Localização**  
`client/js/login.js`

---

### Descrição  
Realiza a autenticação do usuário (cliente ou restaurante) e, em caso de sucesso, redireciona para o dashboard apropriado.

---

### Assinatura  
```js
async function login(userType)
```

### Parâmetros

- **userType** (string)  
  'client' ou 'restaurant'. Define o caminho de redirecionamento após o login.  

---

### Fluxo de execução

1. **Coleta do form**  
   - Lê `email` e `password` pelos IDs no DOM.  
   - Seleciona o elemento `#message` para feedback.  

2. **Validação básica**  
   - Se algum campo estiver vazio, exibe mensagem de erro e interrompe.  

3. **Requisição à API**  
   - `POST /api/login` com payload `{ email, password }`.  
   - Aguarda resposta e parseia JSON.  

4. **Tratamento de falhas**  
   - Se `response.ok === false`, exibe `data.error` ou mensagem genérica.  

5. **Redirecionamento**  
   - Se `userType === 'restaurant'` ⇒ `/Restaurante/dashboard.html`  
   - Se `userType === 'client'` ⇒ `/Cliente/Client_dashboard.html`  

6. **Erros de conexão**  
   - Captura exceções e exibe “Erro ao conectar ao servidor.”  

### Função: `logout()`

**Localização**  
`client/js/auth.js` (ou onde estiver definida)

---

### Descrição  
Envia uma requisição ao backend para encerrar a sessão do usuário e, em seguida, redireciona para a página de login.

---

### Assinatura  
```js
async function logout()


### Fluxo de execução

1. **Requisição de logout**  
   - Chama `POST /api/logout` com `{ credentials: 'include' }` para incluir cookies de sessão.

2. **Redirecionamento em sucesso**  
   - Se a requisição completar sem erros, faz `window.location.href = '../index.html'`.

3. **Tratamento de falhas**  
   - Em caso de exceção, registra o erro no console (`console.error`) e redireciona mesmo assim para `../index.html`.  
