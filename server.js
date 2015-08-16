var Hapi = require('hapi');
var Joi = require('joi');

var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8080
});

var githubPushHandler = function(request, reply) {
    console.log('github push received');
    var repoUrl = request.payload.repository.html_url;
    processPush(repoUrl);
    reply();
};

var bitbucketPushHandler = function(request, reply) {
    console.log('bitbucket push received');
    var repoUrl = request.payload.repository.links.html.href;
    processPush(repoUrl);
    reply();
};

var processPush = function(repoUrl) {
    console.log(repoUrl);
}

var bitbucketPostConfig = {
    //TODO validate payload has proper secret
    validate: {
        options: {
            allowUnknown: true,
        },
        headers: {
            'x-event-key': Joi.string().required().valid('repo:push')
        }
    },
    handler: bitbucketPushHandler
};
var githubPostConfig = {
    //TODO validate payload has proper secret
    validate: {
        options: {
            allowUnknown: true,
        },
        headers: {
            'x-github-event': Joi.string().required().valid('push')
        }
    },
    handler: githubPushHandler
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
