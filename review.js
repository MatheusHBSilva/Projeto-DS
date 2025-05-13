let selectedRating = 0;

document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-value'));
      document.getElementById('rating').value = selectedRating;
      updateStarDisplay();
    });
  });

  fetchRestaurantDetails();
  fetchReviews();
});

function updateStarDisplay() {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    const value = parseInt(star.getAttribute('data-value'));
    star.classList.toggle('selected', value <= selectedRating);
  });
}

async function fetchRestaurantDetails() {
  const params = new URLSearchParams(window.location.search);
  const restaurantId = params.get('restaurantId');
  const restaurantNameSpan = document.getElementById('restaurantName');
  const message = document.getElementById('message');

  if (!restaurantId) {
    message.textContent = 'Restaurante não especificado.';
    message.classList.add('error');
    message.style.display = 'block';
    return;
  }

  try {
    const response = await fetch(`/api/restaurants?location=&id=${restaurantId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (!response.ok || !data.restaurants || data.restaurants.length === 0) {
      message.textContent = 'Restaurante não encontrado.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    restaurantNameSpan.textContent = data.restaurants[0].restaurant_name;
  } catch (error) {
    message.textContent = 'Erro ao conectar ao servidor.';
    message.classList.add('error');
    message.style.display = 'block';
    console.error('Erro ao buscar detalhes do restaurante:', error);
  }
}

async function fetchReviews() {
  const params = new URLSearchParams(window.location.search);
  const restaurantId = params.get('restaurantId');
  const reviewsDiv = document.getElementById('reviews');

  if (!restaurantId) return;

  try {
    const response = await fetch(`/api/reviews?restaurantId=${restaurantId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao buscar avaliações:', data.error);
      return;
    }

    reviewsDiv.innerHTML = '';
    if (data.reviews.length === 0) {
      reviewsDiv.innerHTML = '<p>Nenhuma avaliação disponível.</p>';
      return;
    }

    data.reviews.forEach(review => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <h4>${review.reviewer_name}</h4>
        <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        <p>${review.review_text || 'Sem comentários.'}</p>
        <p><small>${new Date(review.created_at).toLocaleDateString('pt-BR')}</small></p>
      `;
      reviewsDiv.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
  }
}

async function submitReview() {
  const params = new URLSearchParams(window.location.search);
  const restaurantId = params.get('restaurantId');
  const reviewerName = document.getElementById('reviewerName').value.trim();
  const rating = document.getElementById('rating').value;
  const reviewText = document.getElementById('reviewText').value.trim();
  const message = document.getElementById('message');

  message.style.display = 'none';

  if (!restaurantId) {
    message.textContent = 'Restaurante não especificado.';
    message.classList.add('error');
    message.style.display = 'block';
    return;
  }

  if (!reviewerName || !rating) {
    message.textContent = 'Por favor, preencha seu nome e selecione uma nota.';
    message.classList.add('error');
    message.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, reviewerName, rating: parseInt(rating), reviewText })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || 'Erro ao enviar avaliação.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    message.textContent = data.message;
    message.classList.remove('error');
    message.classList.add('success');
    message.style.display = 'block';

    // Limpar formulário
    document.getElementById('reviewerName').value = '';
    document.getElementById('reviewText').value = '';
    document.getElementById('rating').value = '0';
    selectedRating = 0;
    updateStarDisplay();

    // Atualizar avaliações
    fetchReviews();
  } catch (error) {
    message.textContent = 'Erro ao conectar ao servidor.';
    message.classList.add('error');
    message.style.display = 'block';
    console.error('Erro ao enviar avaliação:', error);
  }
}