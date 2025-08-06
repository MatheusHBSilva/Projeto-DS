document.addEventListener('DOMContentLoaded', loadRestaurantTags);

async function loadRestaurantTags() {
    const currentTagsInput = document.getElementById('current-tags');
    const message = document.getElementById('message');
    message.style.display = 'none';

    try {
        const response = await fetch('/api/restaurant/me', { credentials: 'include' });
        const restaurantData = await response.json();

        if (!response.ok) {
            message.textContent = restaurantData.error || 'Erro ao carregar informações do restaurante.';
            message.classList.add('error');
            message.style.display = 'block';
            return;
        }
        
        currentTagsInput.value = restaurantData.tags ? restaurantData.tags.join(', ') : '';

    } catch (error) {
        console.error('Erro ao carregar tags do restaurante:', error);
        message.textContent = 'Erro ao conectar ao servidor para carregar tags.';
        message.classList.add('error');
        message.style.display = 'block';
    }
}

async function saveTags() {
    const newTagsInput = document.getElementById('new-tags');
    const message = document.getElementById('message');
    const tags = newTagsInput.value.trim();

    message.style.display = 'none';
    message.classList.remove('error', 'success');

    if (!tags) {
        message.textContent = 'Por favor, insira pelo menos uma tag.';
        message.classList.add('error');
        message.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/api/update-restaurant-tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.error || 'Erro ao salvar as tags.';
            message.classList.add('error');
            message.style.display = 'block';
            return;
        }

        message.textContent = data.message || 'Tags salvas com sucesso!';
        message.classList.remove('error');
        message.classList.add('success');
        message.style.display = 'block';
        
        document.getElementById('current-tags').value = tags;
        newTagsInput.value = '';
    } catch (error) {
        console.error('Erro ao salvar tags:', error);
        message.textContent = 'Erro ao conectar ao servidor para salvar tags.';
        message.classList.add('error');
        message.style.display = 'block';
    }
}