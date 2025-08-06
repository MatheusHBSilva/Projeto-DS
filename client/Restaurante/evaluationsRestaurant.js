document.addEventListener('DOMContentLoaded', () => {
  loadRestaurantDetails();
  document.querySelector('.back-button').addEventListener('click', () => {
    window.history.back();
  });
});

async function loadRestaurantDetails() {

  try {
    const meResponse = await fetch('/api/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const meData = await meResponse.json();

    const restaurantId = meData.restaurantId;

    if (!meResponse.ok) {
      message.textContent = meData.error || 'Erro ao buscar dados do restaurante.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    const response = await fetch(`/api/restaurants?id=${restaurantId}`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    const restaurant = data.restaurants[0];
    document.getElementById('restaurant-name').textContent = restaurant.restaurant_name;
    document.getElementById('restaurant-rating').textContent = `⭐ ${restaurant.average_rating} (${restaurant.review_count} avaliações)`;

    //Comentários sobre o restaurante
    const commentsResponse = await fetch(`/api/reviews?restaurantId=${restaurantId}&limit=20`, { credentials: 'include'});
    const commentsData = await commentsResponse.json();
    const container = document.getElementById('comments');
    console.log(commentsData.reviews);
    if (commentsData.reviews.length > 0) {
      commentsData.reviews.forEach(review => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'rating-evaluation-header';

        const nomeSpan = document.createElement('span');
        nomeSpan.className = 'name';
        nomeSpan.textContent = `${review.reviewer_name}`;

        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'rating';
        ratingDiv.textContent = `⭐ ${review.rating}`;

        headerDiv.appendChild(nomeSpan);
        headerDiv.appendChild(ratingDiv);

        const textDiv = document.createElement('div');
        textDiv.className = 'text';

        const textPar = document.createElement('p');
        textPar.className = 'comment-text';
        textPar.textContent = `${review.review_text}`;

        textDiv.appendChild(textPar);

        commentDiv.appendChild(headerDiv);
        commentDiv.appendChild(textDiv);
 
        container.appendChild(commentDiv);
      });
    } else {
      container.innerHTML = '<p class="no-results">Este restaurante ainda não recebeu avaliações.</p>';
    }
    
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error);
    alert('Erro ao carregar detalhes do restaurante.');
  }
}