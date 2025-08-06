document.addEventListener('DOMContentLoaded', () => {
  // 1. Busca os dados do restaurante e preenche a página.
  loadDashboardData();
  // 2. Atribui as funções de clique a cada um dos botões.
  initializeDashboardButtons();
});

function initializeDashboardButtons() {
  const logoutBtn = document.getElementById('logoutBtn');
  const generateBtn = document.getElementById('generateAnalysisBtn');
  const historyBtn = document.getElementById('historyBtn');
  const editTagsBtn = document.getElementById('editTagsBtn');
  const evaluationsBtn = document.getElementById('evaluationsBtn'); // Novo botão

  // A função logout() vem do seu arquivo auth.js
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generateBusinessAnalysis);
  }

  if (historyBtn) {
    historyBtn.addEventListener('click', () => {
      window.location.href = '/Restaurante/history.html';
    });
  }

  if (editTagsBtn) {
    editTagsBtn.addEventListener('click', () => {
      window.location.href = '/Restaurante/edit_restaurant_tags.html';
    });
  }
  
  // Conectando o novo botão à nova função
  if (evaluationsBtn) {
    evaluationsBtn.addEventListener('click', evaluationsView);
  }
}

/**
 * Carrega os dados do restaurante logado a partir da API e preenche a página.
 * Também atua como uma verificação de segurança: se falhar, redireciona para a home.
 */
async function loadDashboardData() {
  try {
    const response = await fetch('/api/restaurant/me', { credentials: 'include' });

    if (!response.ok) {
      console.error("Sessão inválida ou expirada. Redirecionando para login.");
      alert('Sua sessão expirou ou é inválida. Por favor, faça o login novamente.');
      logout(); // Redireciona para a página inicial
      return;
    }

    const data = await response.json();
    
    // Preenche os campos do dashboard com os dados recebidos
    document.getElementById('restaurantName').textContent = data.restaurantName || 'Nome não disponível';
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
    console.error("Erro crítico ao carregar dados do dashboard:", error);
    alert('Não foi possível conectar ao servidor para carregar os dados.');
  }
}

/**
 * Busca o ID do restaurante logado e redireciona para a página de visualização de avaliações.
 */
async function evaluationsView() {
  try {
    const meResponse = await fetch('/api/restaurant/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!meResponse.ok) {
      console.error('Não foi possível obter os dados do restaurante.');
      alert('Sua sessão expirou. Por favor, faça o login novamente.');
      logout();
      return;
    }

    const meData = await meResponse.json();
    const restaurantId = meData.restaurantId;

    if (restaurantId) {
      window.location.href = `/Restaurante/evaluationsRestaurant.html?id=${restaurantId}`;
    } else {
      throw new Error("ID do restaurante não encontrado na resposta da API.");
    }

  } catch (error) {
    console.error('Erro ao tentar visualizar avaliações:', error);
    alert('Ocorreu um erro de conexão. Verifique sua internet e tente novamente.');
  }
}


/**
 * Função de exemplo para o botão de gerar análise.
 */
function generateBusinessAnalysis() {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = 'Gerando análise...';
  messageDiv.style.display = 'block';
  // Aqui viria a lógica real de chamada da API
}

// Nota: A função logout() é chamada aqui, mas está definida no seu arquivo /auth.js,
// que já está corretamente incluído no seu HTML.