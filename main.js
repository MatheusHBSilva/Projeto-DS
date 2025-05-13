async function fetchRestaurants() {
    const restaurantsDiv = document.getElementById('restaurants');
    const message = document.getElementById('message');
    const location = document.getElementById('location').value;
  
    // Limpar conteúdos anteriores
    restaurantsDiv.innerHTML = '';
    message.style.display = 'none';
  
    // Verificar se a localização é válida
    if (!location) {
      message.textContent = 'Por favor, selecione uma localização.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }
  
    try {
      const url = `/api/restaurants?location=${encodeURIComponent(location)}`;
      console.log('Enviando requisição para:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
  
      const data = await response.json();
      console.log('Resposta recebida:', data);
  
      if (!response.ok) {
        message.textContent = data.error || 'Erro ao buscar restaurantes.';
        message.classList.add('error');
        message.style.display = 'block';
        return;
      }
  
      if (data.restaurants.length === 0) {
        message.textContent = 'Nenhum restaurante encontrado nesta localização.';
        message.classList.add('error');
        message.style.display = 'block';
        return;
      }
  
      data.restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        const roundedRating = Math.round(restaurant.average_rating);
        const stars = '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
        const reviewCountText = restaurant.review_count === 1 ? '1 avaliação' : `${restaurant.review_count} avaliações`;
        card.innerHTML = `
          <h3>
            <a href="review.html?restaurantId=${restaurant.id}" class="restaurant-link">${restaurant.restaurant_name}</a>
            <span class="stars">${stars}</span>
            <span class="rating-info">(${restaurant.average_rating.toFixed(1)}, ${reviewCountText})</span>
          </h3>
          <p>Localização: ${restaurant.location}</p>
        `;
        restaurantsDiv.appendChild(card);
      });
    } catch (error) {
      message.textContent = 'Erro ao conectar ao servidor.';
      message.classList.add('error');
      message.style.display = 'block';
      console.error('Erro ao buscar restaurantes:', error);
    }
  }