const net = require('net');
const fs = require('fs');
const path = require('path');

const testRequest = {
    filter: {
        name: {
            first: 'J',
        },
        email: 'gmail.com',
    },
    meta: {
        format: 'csv',
        archive: true,
    },
};

const fileExt = testRequest.meta.archive
    ? '.gz'
    : testRequest.meta.format === 'csv'
    ? '.csv'
    : '.json';
const fileName = path.join(__dirname, '..', 'data', 'answer' + fileExt);

let serverAnswerStr = '';
let serverAnswerBuff = [];

const client = new net.Socket();

client.connect(8080, () => {
    console.log('Connected!');
    client.write(JSON.stringify(testRequest));
});

client.on('data', data => {
    console.log(`Received ${data.length} bytes`);
    if (fileExt === '.gz') {
        serverAnswerBuff.push(data);
    } else {
        serverAnswerStr += data.toString();
    }
});

client.on('end', async () => {
    if (fileExt === '.gz') {
        const buff = Buffer.concat(serverAnswerBuff);
        await fs.writeFile(fileName, buff, err => {
            if (err) {
                console.error(`Error on saving file ${fileName}: `, err);
            }
        });
    } else {
        await fs.writeFile(fileName, serverAnswerStr, err => {
            if (err) {
                console.error(`Error on saving file ${fileName}: `, err);
            }
        });
    }
});

client.on('close', () => {
    console.log('Connection closed!');
});
