const net = require('net');
const fs = require('fs');
const path = require('path');
var zlib = require('zlib');

const { validateRequest, filterUsers } = require('./helpers/filter');
const { json2csv } = require('./helpers/json2csv');

const fileName = path.join(__dirname, '..', 'data', 'users.json');

const server = net.createServer();
const PORT = process.env.PORT || 8080;

const processingRequest = ({ request, fileName, socket }) => {
    const { filter, meta } = request;
    fs.readFile(fileName, (err, data) => {
        if (err) {
            throw Error(err);
        } else {
            let filteredUsers = filterUsers(JSON.parse(data), filter);
            console.log(
                `Filtered ${filteredUsers.length} users of ${data.length} `
            );
            let formattedData = '';
            if (meta.format === 'csv') {
                formattedData = json2csv(filteredUsers);
                console.log('Formatted to csv');
            } else {
                formattedData = JSON.stringify(filteredUsers, null, 4);
            }

            if (meta.archive) {
                zlib.gzip(formattedData, function(err, res) {
                    if (!err) {
                        console.log('Zipped by gzip');
                        socket.end(res);
                    } else {
                        throw Error(err);
                    }
                });
            } else {
                socket.end(formattedData);
            }
            console.log('Sent to socket');
        }
    });
};

server.on('connection', socket => {
    console.log('New client connected!');

    socket.on('data', async msg => {
        try {
            const request = JSON.parse(msg);
            validateRequest(request);
            await processingRequest({ request, fileName, socket });
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('end', () => {
        console.log('Client disconnected!');
        socket.unref();
    });
});

server.on('listening', () => {
    const { port } = server.address();
    console.log(`TCP Server started on port ${port}!`);
});

server.listen(PORT);
