const sidebar = document.getElementById('sidebar');
const toggleButtonIcon = document.getElementById('toggle-icon').querySelector('i');
const mealRow = document.getElementById('mealRow');
const mainContent = document.getElementById('main-content');

const searchLink = document.getElementById('searchLink');
const searchSection = document.getElementById('search-section');
const searchNameInput = document.getElementById('searchName');
const searchLetterInput = document.getElementById('searchLetter');

const categoriesLink = document.getElementById('categoriesLink');
const areaLink = document.getElementById('areaLink');
const ingredientsLink = document.getElementById('ingredientsLink');
const contactLink = document.getElementById('contactLink');

const API_BASE = "https://www.themealdb.com/api/json/v1/1/";

let lastMealListLoader = fetchInitialMeals;

function toggleSidebar() {
    sidebar.classList.toggle('active');
    toggleButtonIcon.classList.toggle('fa-bars');
    toggleButtonIcon.classList.toggle('fa-xmark');
}

function displayLoading() {
    mealRow.innerHTML = '<div class="col-12 text-center text-white fs-3 py-5">Loading...</div>';
}

function prepareUI(showSearch = false) {
    mealRow.innerHTML = '';
    document.getElementById('mealDetailViewContainer')?.remove();
    searchSection.style.display = showSearch ? 'block' : 'none';
    if (!showSearch) {
        searchNameInput.value = '';
        searchLetterInput.value = '';
    }
    if (sidebar.classList.contains('active')) toggleSidebar();
}

async function fetchAndDisplay(endpoint, displayFunction, listLoaderForNext = null, errorMsg = "Error loading data") {
    displayLoading();
    try {
        const response = await fetch(API_BASE + endpoint);
        if (!response.ok) throw new Error("API Error: " + response.status);
        const data = await response.json();
        displayFunction(data);
        if (listLoaderForNext) {
            lastMealListLoader = listLoaderForNext;
        }
    } catch (error) {
        console.error(errorMsg, error);
        mealRow.innerHTML = `<div class="col-12 text-center text-danger fs-4 py-5">${errorMsg}.</div>`;
    }
}

function renderMealCards(data, itemType = 'meal') {
    let items = data.meals;
    if (itemType === 'category-list') items = data.categories;

    let html = '';
    if (items && items.length > 0) {
        items.forEach(item => {
            let id, name, thumb, description = '';
            if (itemType === 'meal') {
                id = item.idMeal; name = item.strMeal; thumb = item.strMealThumb;
                html += `
                    <div class="col-md-3">
                        <div class="meal-card" data-type="meal" data-id="${id}">
                            <img src="${thumb}" class="img-fluid" alt="${name}"><div class="meal-overlay"><h3>${name}</h3></div>
                        </div>
                    </div>`;
            } else if (itemType === 'category-list') {
                id = item.strCategory; name = item.strCategory; thumb = item.strCategoryThumb;
                description = item.strCategoryDescription ? item.strCategoryDescription.substring(0, 70) + '...' : '';
                html += `
                    <div class="col-md-3">
                        <div class="item-card category-card text-center" data-type="category" data-id="${id}">
                            <img src="${thumb}" class="img-fluid" alt="${name}"><div class="item-overlay"><h3>${name}</h3><p class="d-none d-md-block">${description}</p></div>
                        </div>
                    </div>`;
            } else if (itemType === 'area-list') {
                id = item.strArea; name = item.strArea;
                html += `
                    <div class="col-md-3">
                        <div class="item-card area-card text-center" data-type="area" data-id="${id}">
                            <i class="fa-solid fa-house-laptop fa-3x mb-2"></i><h3>${name}</h3>
                        </div>
                    </div>`;
            } else if (itemType === 'ingredient-list') {
                id = item.strIngredient; name = item.strIngredient;
                description = item.strDescription ? item.strDescription.substring(0, 50) + '...' : 'Click to see meals';
                html += `
                    <div class="col-md-3">
                        <div class="item-card ingredient-card text-center" data-type="ingredient" data-id="${id}">
                            <i class="fa-solid fa-utensils fa-3x mb-2"></i><h4>${name}</h4><p class="small d-none d-md-block">${description}</p>
                        </div>
                    </div>`;
            }
        });
    } else {
        html = `<div class="col-12 text-center text-white fs-4 py-5">No items found.</div>`;
    }
    mealRow.innerHTML = html;
}


function displayMealDetails(data) {
    const meal = data.meals[0];
    if (!meal) { mealRow.innerHTML = `<div class="col-12 text-danger fs-4 py-5">Details not found.</div>`; return; }
    prepareUI(false);
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients += `<li class="p-1 m-1 bg-info-subtle text-dark rounded small alert alert-info">${meal[`strMeasure${i}`]} ${meal[`strIngredient${i}`]}</li>`;
        }
    }
    const tags = meal.strTags ? meal.strTags.split(',').map(tag => `<span class="badge bg-danger-subtle text-dark me-1 p-2">${tag.trim()}</span>`).join('') : 'No tags';
    const detailHtml = `
        <div id="mealDetailViewContainer" class="container">
            <div class="row gy-3">
                <div class="col-md-4"><img src="${meal.strMealThumb}" class="img-fluid rounded" alt="${meal.strMeal}"><h2 class="mt-2 fw-bold">${meal.strMeal}</h2></div>
                <div class="col-md-8">
                    <h3>Instructions</h3><p>${meal.strInstructions.replace(/\n/g, '<br>')}</p>
                    <p><strong class="fw-semibold">Area:</strong> ${meal.strArea}</p><p><strong class="fw-semibold">Category:</strong> ${meal.strCategory}</p>
                    <h3 class="mt-2">Ingredients:</h3><ul class="list-unstyled d-flex flex-wrap">${ingredients}</ul>
                    <h3 class="mt-2">Tags:</h3><div class="mb-2">${tags}</div>
                    ${meal.strSource ? `<a href="${meal.strSource}" target="_blank" class="btn btn-success btn-sm me-1">Source</a>` : ''}
                    ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" class="btn btn-danger btn-sm">YouTube</a>` : ''}
                    <button id="backBtn" class="btn btn-warning btn-sm ms-md-2 mt-2 mt-md-0">Back</button>
                </div>
            </div>
        </div>`;
    mainContent.insertAdjacentHTML('beforeend', detailHtml);
    document.getElementById('backBtn').addEventListener('click', () => lastMealListLoader());
}


function fetchInitialMeals() {
    prepareUI(false);
    fetchAndDisplay('search.php?s=', (data) => renderMealCards(data, 'meal'), fetchInitialMeals, "Error loading meals");
}

searchLink.addEventListener('click', (e) => { e.preventDefault(); prepareUI(true); searchNameInput.focus(); });
categoriesLink.addEventListener('click', (e) => { e.preventDefault(); prepareUI(); fetchAndDisplay('categories.php', (data) => renderMealCards(data, 'category-list'), () => categoriesLink.click(), "Error categories"); });
areaLink.addEventListener('click', (e) => { e.preventDefault(); prepareUI(); fetchAndDisplay('list.php?a=list', (data) => renderMealCards(data, 'area-list'), () => areaLink.click(), "Error areas"); });
ingredientsLink.addEventListener('click', (e) => { e.preventDefault(); prepareUI(); fetchAndDisplay('list.php?i=list', (data) => { const limitedData = { meals: data.meals ? data.meals.slice(0,20) : [] }; renderMealCards(limitedData, 'ingredient-list');}, () => ingredientsLink.click(), "Error ingredients"); });

contactLink.addEventListener('click', (e) => {
    e.preventDefault(); prepareUI();
    mealRow.innerHTML = `
        <div class="container text-white py-5">
            <h2 class="text-center mb-4">Contact Us</h2>
            <form id="contactForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <input type="text" id="contactName" class="form-control" placeholder="Enter Your Name" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <input type="email" id="contactEmail" class="form-control" placeholder="Enter Your Email" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <input type="tel" id="contactPhone" class="form-control" placeholder="Enter Your Phone">
                    </div>
                    <div class="col-md-6 mb-3">
                        <input type="number" id="contactAge" class="form-control" placeholder="Enter Your Age">
                    </div>
                </div>
                 <div class="row">
                    <div class="col-md-6 mb-3">
                        <input type="password" id="contactPassword" class="form-control" placeholder="Enter Password" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <input type="password" id="contactRePassword" class="form-control" placeholder="Re-enter Password" required>
                    </div>
                </div>
                <div class="text-center">
                    <button type="submit" class="btn btn-outline-danger">Submit</button>
                </div>
            </form>
        </div>`;
    lastMealListLoader = () => contactLink.click();
});

searchNameInput.addEventListener('input', () => {
    const term = searchNameInput.value.trim();
    if (term) {
        const loader = () => fetchAndDisplay(`search.php?s=${encodeURIComponent(term)}`, (data) => renderMealCards(data, 'meal'), loader, `Error: ${term}`);
        loader();
    } else { mealRow.innerHTML = ''; }
});

searchLetterInput.addEventListener('input', () => {
    let letter = searchLetterInput.value.trim();
    if (letter) {
        letter = letter[0].toLowerCase(); searchLetterInput.value = letter;
        const loader = () => fetchAndDisplay(`search.php?f=${letter}`, (data) => renderMealCards(data, 'meal'), loader, `Error: ${letter}`);
        loader();
    } else { mealRow.innerHTML = ''; }
});

mealRow.addEventListener('click', (event) => {
    const card = event.target.closest('.meal-card, .item-card');
    if (!card) return;
    const type = card.dataset.type;
    const id = card.dataset.id;

    if (type === 'meal') {
        fetchAndDisplay(`lookup.php?i=${id}`, displayMealDetails, null, "Error meal details");
    } else if (type === 'category') {
        const loader = () => fetchAndDisplay(`filter.php?c=${encodeURIComponent(id)}`, (data) => renderMealCards(data, 'meal'), loader, `Error: ${id}`);
        loader();
    } else if (type === 'area') {
        const loader = () => fetchAndDisplay(`filter.php?a=${encodeURIComponent(id)}`, (data) => renderMealCards(data, 'meal'), loader, `Error: ${id}`);
        loader();
    } else if (type === 'ingredient') {
         const loader = () => fetchAndDisplay(`filter.php?i=${encodeURIComponent(id)}`, (data) => renderMealCards(data, 'meal'), loader, `Error: ${id}`);
        loader();
    }
});

document.addEventListener('DOMContentLoaded', fetchInitialMeals);