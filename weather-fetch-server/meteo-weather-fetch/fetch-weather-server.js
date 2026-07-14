const { Kafka } = require('kafkajs');
const axios = require('axios');
require('dotenv').config();

const kafka_ip = process.env.KAFKA_IP;
if (!kafka_ip) {
    console.error('KAFKA_IP is not defined in the .env file!');
    process.exit(1);
}

const kafka = new Kafka({
    clientId: 'weather-fetch-service',
    brokers: [kafka_ip+':9092']
});

const consumer = kafka.consumer({ groupId: 'weather-fetch-group' });
const producer = kafka.producer();
const apiKey = process.env.OPENWEATHER_API_KEY;
if (!apiKey) {
    console.error('OPENWEATHER_API_KEY is not defined in the .env file!');
    process.exit(1);
}

const fetchWeatherData = async (city) => {
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await axios.get(apiUrl);
    return {
        city: city,
        temperature: response.data.main.temp + ' °C',
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity + '%',
        pressure: response.data.main.pressure + ' hPa',
        wind_speed: response.data.wind.speed + ' m/s',
        icon: response.data.weather[0].icon

    };
};

const run = async () => {
    // console.log("This the fetch server .... Connecting to kafak");
    
    await consumer.connect();
    await producer.connect();
    
    
    // console.log("This the fetch server .... Connected to kafak");
    await consumer.subscribe({ topic: 'weather-requests', fromBeginning: true });
    // console.log("This the fetch server .... Subscribed to weather requests");

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const city = message.value.toString();
            // console.log(`Fetching weather data for ${city}`);

            try {
                const weatherData = await fetchWeatherData(city);
                await producer.send({
                    topic: 'weather-responses',
                    messages: [{ key: city, value: JSON.stringify(weatherData) }]
                });
                // console.log(`Sent weather data for ${city} to weather-responses`);
            } catch (error) {
                console.error(`Failed to fetch weather data for ${city}:`, error);
            }
        },
    });
};

const runWithRetry = async (retries = 10, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await run();
            return;
        } catch (err) {
            if (i < retries - 1) {
                console.error(`Kafka connection failed, retrying in ${delay / 1000}s... (${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw err;
            }
        }
    }
};

runWithRetry().catch(console.error);
