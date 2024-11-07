const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const updateWeatherInfoSection = document.querySelector('.weather-info');
const apiKey = 'd54f73f43e3dcd5b554d54557cc96ad8';
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryimg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const ForecastsItemsContainer = document.querySelector('.forecast-items-container');

// Check if elements are correctly selected
if (!cityInput || !searchBtn || !updateWeatherInfoSection || !notFoundSection || !searchCitySection) {
    console.error("One or more elements not found. Check your HTML classes.");
}

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = '';
        cityInput.blur();
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = '';
        cityInput.blur();
    }
});

async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return { cod: "error" }; 
    }
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id === 800) return 'clear.svg';
    return 'clouds.svg';
}

function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentDate.toLocaleDateString('en-GB', options);
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);
    console.log("Fetched data:", weatherData); 

    if (weatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: cityName,
        sys: { country },
        main: { temp, humidity },
        weather: [{ main, id }],
        wind: { speed }
    } = weatherData;

    countryTxt.textContent = `${cityName}, ${country}`;
    tempTxt.textContent = Math.round(temp) + '°C';
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + '%';
    windValueTxt.textContent = speed + ' M/s';
    currentDateTxt.textContent = getCurrentDate();

    weatherSummaryimg.src = getWeatherIcon(id);

    await updateForecastsInfo(city);
    showDisplaySection(updateWeatherInfoSection);
}

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city);
    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];
    ForecastsItemsContainer.innerHTML = '';

    forecastsData.list.forEach(forecastsWeather => {
        if (forecastsWeather.dt_txt.includes(timeTaken) && !forecastsWeather.dt_txt.includes(todayDate)) {
            updateForecastsItems(forecastsWeather);
        }
    });
}

function updateForecastsItems(weatherData) {
    console.log(weatherData);
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOptions = {
        day: '2-digit',
        month: 'short'
    };
    const dateResult = dateTaken.toLocaleDateString('en-GB', dateOptions);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="${getWeatherIcon(id)}" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>`;
        
    ForecastsItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

function showDisplaySection(section) {
    [updateWeatherInfoSection, searchCitySection, notFoundSection].forEach(sec => {
        if (sec) sec.style.display = 'none';
    });

    section.style.display = 'flex';
    console.log(`Displaying section: ${section.className}`);
}
