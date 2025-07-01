async function login(userType) {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.getElementById('message');

  // Verificar os campos vazios
  if (!email || !password) {
    message.textContent = 'Por favor, preencha todos os campos.';
    message.style.display = 'block';
    return;
  }

  try {
    //Conexão com o back (server.js)
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || 'Erro ao fazer login.';
      message.style.display = 'block';
      return;
    }

    if (data.userType === 'restaurant') {
      window.location.href = '/Restaurante/dashboard.html';
    } else if (data.userType === 'client') {
      window.location.href = '/Cliente/Client_dashboard.html';
    }
  } catch (error) {
    message.textContent = 'Erro ao conectar ao servidor.';
    message.style.display = 'block';
    console.error('Erro no login:', error);
  }
}