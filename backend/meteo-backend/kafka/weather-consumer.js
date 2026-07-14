const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka_ip = process.env.KAFKA_IP;
if (!kafka_ip) {
    console.error('KAFKA_IP is not defined in the .env file!');
    process.exit(1);
}
// console.log('Kafka IP:', kafka_ip);
const kafka = new Kafka({
    clientId: 'weather-app-consumer',
    brokers: [kafka_ip+':9092']
});

const consumer = kafka.consumer({ groupId: 'weather-group' });
let weatherResponses = {};

const consumeMessages = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'weather-responses', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const weatherData = JSON.parse(message.value.toString());
            const city = message.key.toString();
            weatherResponses[city] = weatherData;  // Store the response for retrieval
            // console.log(`Received weather data for ${city}:`, weatherData);
        },
    });
};

consumeMessages();

module.exports = {
    getWeatherResponse: (city) => weatherResponses[city],
    weatherResponses
};
