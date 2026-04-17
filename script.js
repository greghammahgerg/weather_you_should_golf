const params = new URLSearchParams({
  latitude: "32.0835",
  longitude: "-81.0998",
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "precipitation",
    "weather_code",
    "wind_speed_10m"
  ].join(","),
  hourly: [
    "temperature_2m",
    "apparent_temperature",
    "precipitation_probability",
    "wind_speed_10m"
  ].join(","),
  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_probability_max"
  ].join(","),
  temperature_unit: "fahrenheit",
  wind_speed_unit: "mph",
  precipitation_unit: "inch",
  timezone: "America/New_York",
  forecast_days: "7"
});

const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
const degreeF = `°F`;

const weatherCodes = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm"
};

function weatherLabel(code) {
  return weatherCodes[code] ?? "Unknown";
}

function formatHour(isoString) {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatDay(isoString) {
  return new Date(`${isoString}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function getTemperatureMessage(temperature) {
  if (temperature >= 100) {
    return {
      answer: "This is really HOT for some people.",
      reason: "What a bunch of losers!"
    };
  }

  if (temperature >= 80) {
    return {
      answer: "It's a little warm....",
      reason: "The Pros on the PGA tour don't take their shirts off on the back 9, neither should you!"
    };
  }

  if (temperature >= 50) {
    return {
      answer: "The weather is perfect.",
      reason: "I can't believe you even had to ask."
    };
  }

  if (temperature >= 43) {
    return {
      answer: "I hope you don't think this is cold.",
      reason: "Grab your clubs and go."
    };
  }

  if (temperature >= 36) {
    return {
      answer: "You're going to need some longer underwear.",
      reason: "Go for it, but don't expect to take your shirt off."
    };
  }

  return {
    answer: "Don't think twice, go golfing!",
    reason: "You might want to think about getting another weather app though."
  };
}

function getRainMessage(precipitation) {
  if (precipitation > 1) {
    return {
      answer: "Perfect day for testing out your grip strength on your clubs.",
      reason: "This will really help explode your handicap."
    };
  }

  if (precipitation > 0.8) {
    return {
      answer: "It's kind of like playing golf in your shower.",
      reason: "Hey, that's not a bad idea!"
    };
  }

  if (precipitation > 0.3) {
    return {
      answer: "Bring your $1 disposable poncho.",
      reason: "It's better than scuba diving!"
    };
  }

  if (precipitation > 0.1) {
    return {
      answer: "Not the best day for golf, but you could use the victory.",
      reason: "If your opponent bails first it means you win!"
    };
  }

  if (precipitation > 0.05) {
    return {
      answer: "There is a little rain out there.",
      reason: "Might as well prove you're committed."
    };
  }

  return null;
}

function getWindMessage(windSpeed) {
  if (windSpeed > 30) {
    return {
      answer: "Hurricane, tornado, or just a really bad day for golf?",
      reason: "Nah, you'll be fine. Tiger Woods has played in worse."
    };
  }

  if (windSpeed > 20 && windSpeed <= 30) {
    return {
      answer: "Add some glue to your toupee before you leave.",
      reason: "Don't forget to blame that nasty slice on the wind!"
    };
  }

  return null;
}

function joinMessages(messages) {
  return messages.filter(Boolean).join(" ");
}

function getActiveWeatherIcons(current) {
  const icons = [];

  if (current.temperature_2m >= 80) {
    icons.push({
      src: "assets/hot.jpg",
      alt: "Hot weather"
    });
  }

  if (current.temperature_2m >= 50 && current.temperature_2m < 80) {
    icons.push({
      src: "assets/sun.jpg",
      alt: "Nice weather"
    });
  }

  if (current.temperature_2m < 50) {
    icons.push({
      src: "assets/cold.jpg",
      alt: "Cold weather"
    });
  }

  if (current.temperature_2m < 40) {
    icons.push({
      src: "assets/snow.jpg",
      alt: "Very cold weather"
    });
  }

  if (current.precipitation > 0.05) {
    icons.push({
      src: "assets/rain.jpg",
      alt: "Rainy weather"
    });
  }

  if (current.wind_speed_10m > 20) {
    icons.push({
      src: "assets/wind.jpg",
      alt: "Windy weather"
    });
  }

  return icons;
}

function renderWeatherIcons(current) {
  const container = document.getElementById("weather-icons");
  const icons = getActiveWeatherIcons(current);

  if (icons.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = icons
    .map(
      (icon) =>
        `<img src="${icon.src}" alt="${icon.alt}" class="weather-icon" title="${icon.alt}">`
    )
    .join("");
}

function getGolfRecommendation(current) {
  const answerParts = [];
  const reasonParts = [];

  const temperatureMessage = getTemperatureMessage(current.temperature_2m);
  answerParts.push(temperatureMessage.answer);
  reasonParts.push(temperatureMessage.reason);

  const rainMessage = getRainMessage(current.precipitation);
  if (rainMessage) {
    answerParts.push(rainMessage.answer);
    reasonParts.push(rainMessage.reason);
  }

  const windMessage = getWindMessage(current.wind_speed_10m);
  if (windMessage) {
    answerParts.push(windMessage.answer);
    reasonParts.push(windMessage.reason);
  }

  if (!rainMessage && !windMessage && current.temperature_2m >= 50 && current.temperature_2m < 80) {
    answerParts.unshift("Yup, you should be golfing right now.");
    reasonParts.unshift("'Conditions are favorable.' - Scotty Macaroon, Stanley Cup Champion.");
  }

  return {
    answer: joinMessages(answerParts),
    reason: joinMessages(reasonParts)
  };
}

function renderHourly(hourly) {
  const container = document.getElementById("hourly-forecast");
  const rows = hourly.time.slice(7, 22).map((time, index) => {
    const temp = Math.round(hourly.temperature_2m[index +7]);
    const feelsLike = Math.round(hourly.apparent_temperature[index+7]);
    const precip = hourly.precipitation_probability[index+7];
    const wind = Math.round(hourly.wind_speed_10m[index+7]);

    return `<p><b>${formatHour(time)}:</b> ${temp}${degreeF} | Rain ${precip}% | Feels like ${feelsLike}${degreeF} | Wind ${wind} mph</p>`;
  });

  container.innerHTML = rows.join("");
}

function renderWeekly(daily) {
  const container = document.getElementById("weekly-forecast");
  const rows = daily.time.map((date, index) => {
    const high = Math.round(daily.temperature_2m_max[index]);
    const low = Math.round(daily.temperature_2m_min[index]);
    const rainChance = daily.precipitation_probability_max[index];
    const condition = weatherLabel(daily.weather_code[index]);

    return `<p><b>${formatDay(date)}:</b> High ${high}${degreeF} | Low ${low}${degreeF} | ${condition} | Rain ${rainChance}%</p>`;
  });

  container.innerHTML = rows.join("");
}

async function getWeatherData() {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    document.getElementById("current-time").textContent = `Updated: ${formatHour(current.time)}`;
    document.getElementById("temperature_2m").textContent = `${Math.round(current.temperature_2m)}${degreeF}`;
    document.getElementById("apparent_temperature").textContent = `Feels like ${Math.round(current.apparent_temperature)}${degreeF}`;
    document.getElementById("precipitation").textContent = `Precipitation: ${current.precipitation.toFixed(2)} in`;
    document.getElementById("wind_speed").textContent = `Wind: ${Math.round(current.wind_speed_10m)} mph`;
    document.getElementById("humidity").textContent = `Humidity: ${current.relative_humidity_2m}%`;
    document.getElementById("condition").textContent = `Condition: ${weatherLabel(current.weather_code)}`;

    renderHourly(data.hourly);
    renderWeekly(data.daily);

    const recommendation = getGolfRecommendation(current);
    document.getElementById("golf-answer").textContent = recommendation.answer;
    document.getElementById("golf-reason").textContent = recommendation.reason;
    renderWeatherIcons(current);
  } catch (error) {
    console.error("Fetch error:", error);
    document.getElementById("golf-answer").textContent = "Weather data could not be loaded.";
    document.getElementById("golf-reason").textContent = "Check the API URL or your internet connection and try again.";
    document.getElementById("weather-icons").innerHTML = "";
  }
}

getWeatherData();

