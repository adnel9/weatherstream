const produceMessage = require('../kafka/weather-producer.js');
const { getWeatherResponse, weatherResponses } = require('../kafka/weather-consumer.js');


const getCityWeather = async (req, res) => {
    const city = req.body.city;
    // console.log("Received city: ", city);

    // Send request to Kafka to get weather data for the specified city
    await produceMessage(city);

    // Poll for response (simple polling for demo purposes)
    const checkResponse = () => {
        const weatherData = getWeatherResponse(city);
        if (weatherData) {
            delete weatherResponses[city];  // Clean up after sending the response
            res.json({ success: true, data: weatherData });
        } else {
            setTimeout(checkResponse, 1000);  // Retry after 1 second if no data is available yet
        }
    };

    checkResponse();
};

const getdefaultWeather = (req, res) => {
    res.json({
        success: true,
        message: "Provide city parameter to get weather data"
    });
    // console.log("Here is your form");
};

module.exports = { getCityWeather, getdefaultWeather };
