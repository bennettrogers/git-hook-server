var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({
    host: '0.0.0.0',
    port: 8080
});

server.route({
    method: 'POST',
    path: '/',
    handler: function(request, reply) {
        console.log('Hello World!');
        reply('Reply World!');
    }
});

server.start(function() {
    console.log('Server running at: ' + server.info.uri);
});
