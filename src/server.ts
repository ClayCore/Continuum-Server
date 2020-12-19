import app from './app';
import http from 'http';

const server = http.createServer(app).listen(
    app.get('server_port', function () {
        console.log('Server succesfully created.');
    })
);

export default server;
