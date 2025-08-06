document.addEventListener('DOMContentLoaded', () => {
  // Carrega os dados do restaurante (nome, nota, etc.)
  loadDashboardData();
  // Atribui as funções de clique aos botões
  initializeDashboardButtons();
});

/**
 * Adiciona os eventos de clique a cada botão do dashboard de forma segura.
 */
function initializeDashboardButtons() {
  const logoutBtn = document.getElementById('logoutBtn');
  const generateBtn = document.getElementById('generateAnalysisBtn');
  const historyBtn = document.getElementById('historyBtn');
  const editTagsBtn = document.getElementById('editTagsBtn');

  // A função logout() vem do seu arquivo auth.js, que já está incluído no HTML
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generateBusinessAnalysis);
  }

  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      window.location.href = '/Restaurante/history.html'; // Exemplo de ação
    });
  }

  if (editTagsBtn) {
    editTagsBtn.addEventListener('click', () => {
      window.location.href = '/Restaurante/edit_restaurant_tags.html';
    });
  }
}

/**
 * Carrega os dados do restaurante logado e preenche a página.
 */
async function loadDashboardData() {
  try {
    // Você precisa de uma rota no backend que retorne os dados do restaurante logado
    // Ex: '/api/restaurant/me'
    const response = await fetch('/api/restaurant/me', { credentials: 'include' });

    if (!response.ok) {
      // Se não estiver autenticado, o middleware já deve ter enviado um erro.
      // Podemos redirecionar para o login como segurança extra.
      console.error("Sessão inválida ou expirada. Redirecionando para login.");
      window.location.href = '/index.html'; // Ou para a página de login
      return;
    }

    const data = await response.json();
    
    // Preenche os campos do dashboard
    document.getElementById('restaurantName').textContent = data.restaurantName || '';
    document.getElementById('averageRating').textContent = data.averageRating || 'N/A';
    document.getElementById('reviewCount').textContent = data.reviewCount || '0';
    document.getElementById('telefone').textContent = data.restaurantPhone || 'Não informado';
    document.getElementById('email').textContent = data.restaurantEmail || 'Não informado';

    // Preenche as tags
    const tagsContainer = document.getElementById('restaurantTags');
    tagsContainer.innerHTML = ''; 
    if (data.tags && data.tags.length > 0) {
      data.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
    } else {
      tagsContainer.textContent = 'Nenhuma tag definida.';
    }

  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
  }
}

/**
 * Função para mostrar feedback visual ao gerar análise.
 */
function generateBusinessAnalysis() {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = 'Gerando análise...';
  messageDiv.style.display = 'block';
  // Aqui viria a lógica de chamada da API para gerar a análise
}