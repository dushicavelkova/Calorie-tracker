const API_URL = '/api/meals';
const FOODS_API_URL = '/api/foods';

async function loadFoods() {
    const response = await fetch(FOODS_API_URL);
    const foods = await response.json();

    const foodSelect = document.getElementById('food');

    foods.forEach(food => {
        const option = document.createElement('option');

        option.value = food.name;
        option.textContent = food.name;

        foodSelect.appendChild(option);
    });
}

document.getElementById('meal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('food').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const unit = document.getElementById('unit').value;
    const foodResponse = await fetch(FOODS_API_URL);
    const foods = await foodResponse.json();
    const selectedFood = foods.find(food => food.name === name);

    if (!selectedFood) {
    alert('Избери намирница.');
    return;
}

    let calories;
    let protein;
    let carbs;
    let fat;

    if (unit === 'grams') {
        calories = Math.round((selectedFood.calories_per_100g * quantity) / 100);
        protein = Math.round((selectedFood.protein_per_100g * quantity) / 100);
        carbs = Math.round((selectedFood.carbs_per_100g * quantity) / 100);
        fat = Math.round((selectedFood.fat_per_100g * quantity) / 100);
    } else {
        if (selectedFood.calories_per_piece === null) {
            alert('За оваа намирница користи грамажи.');
            return;
        }
        calories = selectedFood.calories_per_piece * quantity;
        protein = selectedFood.protein_per_piece * quantity;
        carbs = selectedFood.carbs_per_piece * quantity;
        fat = selectedFood.fat_per_piece * quantity;
}
    const mealType = document.getElementById('meal-type').value;

    const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: name,
        quantity: quantity,
        unit: unit,
        calories: calories, 
        protein: protein,
        carbs: carbs,
        fat: fat,
        meal_type: mealType
    })
});

if (!response.ok) {
    const error = await response.json();
    alert(error.error);
    return;
}

document.getElementById('meal-form').reset();
loadMeals();
});

async function loadMeals() {
    const response = await fetch(API_URL);
    const meals = await response.json();
    const list = document.getElementById('meal-list');
    list.innerHTML = '';

    let total = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meals.forEach(meal => {
        const li = document.createElement('li');

        li.innerHTML = `
            <span class="meal-name">${meal.name}</span>
            <span class="meal-type">${meal.meal_type}</span>
            <span class="meal-quantity">${meal.quantity} ${meal.unit}</span>
            <span class="meal-calories">${meal.calories} kcal</span>
            <span class="meal-macros">
                P: ${meal.protein}g | C: ${meal.carbs}g | F: ${meal.fat}g
            </span>

            <div class="actions">
                <button class="edit-button" onclick="editMeal(${meal.id})">Edit</button>
                <button class="delete-button" onclick="deleteMeal(${meal.id})">Delete</button>
            </div>
        `;

        list.appendChild(li);
        total += meal.calories;
        totalProtein += meal.protein;
        totalCarbs += meal.carbs;
        totalFat += meal.fat;
    });

    document.getElementById('total-calories').innerText =
        `Total Calories: ${total} kcal`;

    document.getElementById('today-calories').innerText = total;

    document.getElementById('total-macros').innerText =
    `Protein: ${totalProtein}g | Carbs: ${totalCarbs}g | Fat: ${totalFat}g`;

    updateProgress();
}

function updateProgress() {
    const goal = parseInt(document.getElementById('calorie-goal').value);

    if (goal > 0) {
        const total = parseInt(document.getElementById('today-calories').innerText);

        const percentage = Math.min((total / goal) * 100, 100);

        document.getElementById('progress').style.width = percentage + '%';
        document.getElementById('percentage').innerText =
            Math.round(percentage) + '%';
    } else {
        document.getElementById('progress').style.width = '0%';
        document.getElementById('percentage').innerText = '0%';
    }
}

document.getElementById('calorie-goal').addEventListener('input', updateProgress);


async function editMeal(id) {
    const li = document.querySelector(`button[onclick="editMeal(${id})"]`).closest('li');

    const name = li.querySelector('.meal-name').innerText;
    const calories = li.querySelector('.meal-calories').innerText.replace(' kcal', '');

    li.innerHTML = `
        <input class="edit-name" type="text" value="${name}">
        <input class="edit-calories" type="number" value="${calories}">

        <div class="actions">
            <button type="button" class="save-button" onclick="saveMeal(${id})">Save</button>
            <button type="button" class="cancel-button" onclick="loadMeals()">Cancel</button>
        </div>
    `;
}

async function saveMeal(id) {

    const li = document.querySelector(`button[onclick="saveMeal(${id})"]`).closest('li');

    const name = li.querySelector('.edit-name').value;
    const calories = parseInt(li.querySelector('.edit-calories').value);

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            calories: calories
        })
    });

    if (!response.ok) {
        const error = await response.json();
        alert(error.error);
        return;
    }

    loadMeals();
}

async function deleteMeal(id) {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    loadMeals();
}

loadMeals();
loadFoods();

function filterMeals(type) {
    const meals = document.querySelectorAll('#meal-list li');
    let total = 0;

    meals.forEach(meal => {
        const mealType = meal.querySelector('.meal-type').innerText;
        const calories = parseInt(
            meal.querySelector('.meal-calories').innerText
        );

        if (type === 'All' || mealType === type) {
            meal.style.display = 'flex';
            total += calories;
        } else {
            meal.style.display = 'none';
        }
    });

    document.getElementById('total-calories').innerText =
        `Total Calories: ${total} kcal`;
}

