const net = require('net');
const fs = require('fs');
const path = require('path');

const testFilter1 = {
    name: {
        first: 'J',
    },
    email: 'gmail.com',
};

const fileName = path.join(__dirname, '..', 'data', 'answer.json');

let serverAnswer = '';

const client = new net.Socket();

client.connect(8080, () => {
    console.log('Connected!');
    client.write(JSON.stringify(testFilter1));
});

client.on('data', data => {
    console.log(`Received ${data.length} bytes`);
    serverAnswer += data.toString();
});

client.on('end', async () => {
    console.log(`Saving ${serverAnswer.length} bytes to file ${fileName}`);
    await fs.writeFile(fileName, serverAnswer, err => {
        if (err) {
            console.error('Receiving data failed: ', err);
        }
    });
});

client.on('close', () => {
    console.log('Connection closed!');
});
