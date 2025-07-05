async function login(expectedType) {
  const email    = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message  = document.getElementById('message');

  if (!email || !password) {
    message.textContent = 'Por favor, preencha todos os campos.';
    message.style.display = 'block';
    return;
  }

  try {
    const res  = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();

    if (!res.ok) {
      message.textContent = data.error || 'Erro ao fazer login.';
      message.style.display = 'block';
      return;
    }

    // verificando se o userType é o esperado
    if (data.userType !== expectedType) {
      message.textContent = `Acesse a página de login correta.`;
      message.style.display = 'block';
      return;
    }

    // redireciona apenas se bater com o tipo esperado
    if (data.userType === 'restaurant') {
      window.location.href = '/Restaurante/dashboard.html';
    } else {
      window.location.href = '/Cliente/Client_dashboard.html';
    }

  } catch (err) {
    console.error('Erro no login:', err);
    message.textContent = 'Erro ao conectar ao servidor.';
    message.style.display = 'block';
  }
}
