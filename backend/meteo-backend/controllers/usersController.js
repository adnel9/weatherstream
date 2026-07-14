const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka_ip = process.env.KAFKA_IP;

const kafka = new Kafka({
  clientId: 'web-backend',
  brokers: [kafka_ip+':9092'],
});
// Register a new user
const addUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log('username and password: ' + username + password);

    if (!username || !password) {
      return res.status(400).send('Username and password are required.');
    }

    const user = new User({ username, password });
    // console.log('user object is instantiated' + user);
    await user.save();
    // console.log('user object is added');
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Error registering user' });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await user.comparePassword(password)) {
      const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      // console.log('Token:', token);
      res.send({ message: 'Login successful', token }); // Include token in the response
    } else {
      res.status(400).send({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Error logging in' });
  }
};

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ error: 'Invalid token' });
    }
    req.user = user; // Attach user to request object
    next();
  });
};

const getCities = async (req, res) => {
  try {
    const { username } = req.user; // Extracted from token
    if (!username) {
      return res.status(401).send({ error: 'User not authenticated' });
    }

    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Send the list of favorite cities
    res.send({ favorites: user.favorites });
  } catch (error) {
    res.status(500).send({ error: 'Error fetching favorite cities' });
  }
};


const fetchWeatherForecastHourly = async (cityName) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  const tryFetch = async (baseUrl) => {
    try {
      const response = await axios.get(`${baseUrl}?q=${cityName}&appid=${apiKey}&units=metric`);
      if (response.status !== 200) return null;

      const forecastData = response.data;
      let rainStart = null;
      for (const forecast of forecastData.list) {
        if (forecast.weather[0].main === 'Rain') {
          rainStart = {
            start_time: forecast.dt_txt,
            rain_volume: forecast.rain?.['1h'] ?? forecast.rain?.['3h'] ?? 0,
          };
          break;
        }
      }

      return {
        city_id: forecastData.city.id,
        city_name: forecastData.city.name,
        country: forecastData.city.country,
        coordinates: {
          lat: forecastData.city.coord.lat,
          lon: forecastData.city.coord.lon,
        },
        rain_start: rainStart,
      };
    } catch (error) {
      return null;
    }
  };

  // Try Pro endpoint first, fall back to free
  const result = await tryFetch('https://pro.openweathermap.org/data/2.5/forecast/hourly')
               ?? await tryFetch('https://api.openweathermap.org/data/2.5/forecast');

  if (!result) {
    console.error(`Erreur API OpenWeather: could not fetch forecast for ${cityName}`);
  }
  return result;
};

// Add favorite city
const addFavoriteCity = async (req, res) => {
  try {
    const { username } = req.user; // Extracted from token
    const { city_name } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Récupérer les données météo pour la ville
    const weatherForecast = await fetchWeatherForecastHourly(city_name);

    if (!weatherForecast) {
      return res.status(400).send({ error: 'Invalid city name or weather data unavailable' });
    }

    const normalizedCityName = weatherForecast.city_name; // Utiliser le nom exact de la ville

    // Vérifier si la ville existe déjà dans les favoris
    const cityExists = user.favorites.some(
      (fav) => fav.city_name.toLowerCase() === normalizedCityName.toLowerCase()
    );
    if (cityExists) {
      return res.status(400).send({ error: `${normalizedCityName} is already in favorites` });
    }

    // Ajouter la ville à la liste des favoris avec rain_alert initialisé à null
    user.favorites.push({
      city_name: normalizedCityName,
      rain_alert: null, // Initialisé à null, mis à jour après une alerte
    });
    await user.save();

    // Produire les données météo dans le topic Kafka
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'weather_data',
      messages: [{ value: JSON.stringify(weatherForecast) }],
    });
    // console.log(`Données météo produites pour ${normalizedCityName}`);

    res.send({ message: 'City added to favorites and weather data fetched' });
  } catch (error) {
    console.error(`Erreur dans addFavoriteCity: ${error.message}`);
    res.status(500).send({ error: 'Error adding favorite city' });
  }
};
// Remove favorite city
const deleteFavoriteCity = async (req, res) => {
  try {
    const { username } = req.user; // Extracted from token
    const { city_name } = req.body;



    const user = await User.findOne({ username });
    if (user) {
      user.favorites = user.favorites.filter(fav => fav.city_name !== city_name);
      await user.save();
      res.send({ message: 'City removed from favorites' });
    } else {
      res.status(404).send({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).send({ error: 'Error removing favorite' });
  }
};

module.exports = {addUser, loginUser, getCities,addFavoriteCity, deleteFavoriteCity, authenticate };
