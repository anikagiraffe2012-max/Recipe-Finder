const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const recipeGrid = document.getElementById('recipeGrid');
const loadingDiv = document.getElementById('loading');
const errorMessageDiv = document.getElementById('errorMessage');

const modal = document.getElementById('recipeModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalIngredients = document.getElementById('modalIngredients');
const modalInstructions = document.getElementById('modalInstructions');
const closeModal = document.getElementById('closeModal');

const API_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

function showLoading() {
    loadingDiv.classList.remove('hidden');
    errorMessageDiv.classList.add('hidden');
    recipeGrid.innerHTML = '';
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('hidden');
    hideLoading();
}

function clearError() {
    errorMessageDiv.classList.add('hidden');
}

async function fetchRecipes(query) {
    try {
        showLoading();
        clearError();

        const url = API_URL + encodeURIComponent(query);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        hideLoading();

        if (!data.meals) {
            showError(`No recipes found for "${query}". Try another search!`);
            return;
        }

        displayRecipes(data.meals);
    } catch (error) {
        hideLoading();
        showError('Something went wrong, sorry!');
        console.error('Fetch error:', error);
    }
}

function displayRecipes(meals) {
    recipeGrid.innerHTML = '';

    meals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = meal.idMeal;

        card.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="recipe-info">
                <h3>${meal.strMeal}</h3>
                <button class="view-btn" data-id="${meal.idMeal}">View Recipe</button>
            </div>
        `;

        recipeGrid.appendChild(card);
    });
}

recipeGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-btn')) {
        const recipeId = e.target.dataset.id;
        fetchRecipeDetails(recipeId);
    }
});

async function fetchRecipeDetails(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch details');
        const data = await response.json();
        const meal = data.meals[0];
        showModal(meal);
    } catch (error) {
        alert('Could not load recipe details.');
        console.error(error);
    }
}

function showModal(meal) {
    modalTitle.textContent = meal.strMeal;
    modalImage.src = meal.strMealThumb;
    modalImage.alt = meal.strMeal;

    modalIngredients.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (!ingredient || ingredient.trim() === '') break;

        const li = document.createElement('li');
        li.textContent = `${measure} ${ingredient}`;
        modalIngredients.appendChild(li);
    }

    modalInstructions.textContent = meal.strInstructions;
    modal.classList.remove('hidden');
}

closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
    }
});

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query === '') {
        showError('Please enter a search term.');
        return;
    }
    fetchRecipes(query);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});
