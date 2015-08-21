var Hapi = require('hapi');
var Joi = require('joi');
var child_process = require('child_process');

var server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8080
});

var githubPushHandler = function(request, reply) {
    console.log('github push received');
    var gitHost = 'github.com';
    var repoName = request.payload.repository.name;
    var ownerName = request.payload.repository.owner.name;
    onPush(gitHost, repoName, ownerName);
    reply();
};

var bitbucketPushHandler = function(request, reply) {
    console.log('bitbucket push received');
    var gitHost = 'bitbucket.org';
    var repoName = request.payload.repository.name;
    var ownerName = request.payload.repository.owner.username;
    onPush(gitHost, repoName, ownerName);
    reply();
};

var onPush = function(gitHost, repoName, ownerName) {
    var buildScript = './scripts/build.sh'; //TODO: make this a config option
    var publishScript = './scripts/publish-s3.sh'; //TODO: make this a config option
    var bucket = 'thoughts.blrog.com'; //TODO: make this a config option
    var workdir = '/tmp'; //TODO: make this a config option
    var branch = 'master'; //TODO: make this a config option
    var publicRepo = false; //TODO: make this a config option

    var repoUrl = gitHost + '/' + ownerName + '/' + repoName;
    var repoKey = '';
    if(publicRepo) {
        repoUrl = 'https://' + gitHost + '/' + ownerName + '/' + repoName;
    } else {
        repoUrl = 'git@' + gitHost + ':' + ownerName + '/' + repoName;
        repoKey = '~/.ssh/blog_deploy_key.pem'; // TODO: make this a config option
    }

    run(buildScript, [repoName, repoUrl, repoKey, branch, workdir], function(err) {
        if(err) {
            console.warn('Failed to build ' + repoUrl);
            // TODO: notify me somehow (email?)
            return;
        }
        run(publishScript, [repoName, workdir, bucket], function(err) {
            if(err) {
                console.warn('Failed to publish ' + repoUrl);
                // TODO: notify me somehow (email?)
                return;
            }
            console.log('Successfully published ' + repoUrl);
        });
    });
}

var run = function(file, params, callback) {
    child_process.execFile(file, params, function(error, stdout, stderr) {
        console.log(stdout);
        console.warn(stderr);
        callback(error !== null);
    });
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
