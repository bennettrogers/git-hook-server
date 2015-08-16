var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8080
});

var postHandler = function(request, reply) {
    console.log('postHandler triggered');
    console.log(request.payload);
    reply('Webhook received');
};

var bitbucketPostConfig = {
    //TODO validate payload has proper secret
    handler: postHandler
};
var githubPostConfig = {
    //TODO validate payload has proper secret
    handler: postHandler
};

server.route([
    {
        method: 'POST',
        path: '/bitbucket',
        config: bitbucketPostConfig
    },
    {
        method: 'POST',
        path: '/github',
        config: githubPostConfig
    }
]);

server.start(function() {
    console.log('Server running at: ' + server.info.uri);
});
