const API_URL = 'http://localhost:5000/api/meals';

document.getElementById('meal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('food').value;
    const calories = parseInt(document.getElementById('calories').value);

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, calories })
    });

    document.getElementById('meal-form').reset();
    loadMeals();
});

async function loadMeals() {
    const response = await fetch(API_URL);
    const meals = await response.json();
    const list = document.getElementById('meal-list');
    list.innerHTML = '';
    
    let total = 0;
    meals.forEach(meal => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${meal.name}</span> <span>${meal.calories} kcal</span>`;
        list.appendChild(li);
        total += meal.calories;
    });
    
    document.getElementById('total-calories').innerText = `Total Calories: ${total} kcal`;
}

loadMeals();