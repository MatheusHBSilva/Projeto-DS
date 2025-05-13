async function register() {
    const restaurantName = document.getElementById('restaurantName').value;
    const ownerName = document.getElementById('ownerName').value;
    const location = document.getElementById('location').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
  
    // Validação de campos vazios
    if (!restaurantName || !ownerName || !location || !email || !password) {
      message.textContent = 'Por favor, preencha todos os campos.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }
  
    // Log para depuração
    console.log('Enviando dados:', { restaurantName, ownerName, location, email, password });
  
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName, ownerName, location, email, password })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        message.textContent = data.error || 'Erro ao registrar.';
        message.classList.add('error');
        message.style.display = 'block';
        console.error('Erro na resposta do servidor:', data);
        return;
      }
  
      message.textContent = data.message;
      message.classList.remove('error');
      message.style.display = 'block';
  
      // Limpar formulário
      document.getElementById('restaurantName').value = '';
      document.getElementById('ownerName').value = '';
      document.getElementById('location').value = '';
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
    } catch (error) {
      message.textContent = 'Erro ao conectar ao servidor. Verifique se o servidor está ativo.';
      message.classList.add('error');
      message.style.display = 'block';
      console.error('Erro no registro:', error);
    }
  }