const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka_ip = process.env.KAFKA_IP;
if (!kafka_ip) {
    console.error('KAFKA_IP is not defined in the .env file!');
    process.exit(1);
}
// console.log('Kafka IP:', kafka_ip);
const kafka = new Kafka({
    clientId: 'weather-app-producer',
    brokers: [kafka_ip+':9092']
});

const producer = kafka.producer();

const produceMessage = async (city) => {
    // console.log("Connecting to kafka broker ......");
    await producer.connect();
    // console.log("Connected to kafka broker ......");
    await producer.send({
        topic: 'weather-requests',
        messages: [{ key: city, value: city }]
    });
    // console.log("Message sent ......");
    await producer.disconnect();
};

module.exports = produceMessage;
