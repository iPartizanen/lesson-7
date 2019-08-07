const net = require('net');
const fs = require('fs');
const path = require('path');

const { validateFilter, filterUsers } = require('./helpers/filter');

const fileName = path.join(__dirname, '..', 'data', 'users.json');

const server = net.createServer();
const PORT = process.env.PORT || 8080;

server.on('connection', socket => {
    console.log('New client connected!');

    socket.on('data', async msg => {
        try {
            const filter = JSON.parse(msg);
            validateFilter(filter);

            await (() => {
                fs.readFile(fileName, (err, data) => {
                    if (err) {
                        throw Error(err);
                    } else {
                        let filteredUsers = filterUsers(
                            JSON.parse(data),
                            filter
                        );
                        socket.end(JSON.stringify(filteredUsers, null, 4));
                    }
                });
            })();
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
