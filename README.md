# node-good-sentry
node-good-sentry is a module for streaming [hapi](https://github.com/hapijs/hapi) server events to a Sentry
[Sentry](https://sentry.io) server via [good](https://github.com/hapijs/good).

[![Current Version](https://img.shields.io/npm/v/node-good-sentry.svg)](https://www.npmjs.com/package/node-good-sentry)

### Example Usage of GoodSentry and StreamCleaner
```javascript
import * as Hapi from "hapi";
import * as good from "good";
const server = new Hapi.Server({host: "0.0.0.0",port: 3000});

const StreamCleanerArgs = {
    'password': 'redact',
    'responsePayload.manager': 'remove'
};

const GoodSentryConfig = {
    sentryDsn: process.env.SENTRY_DSN,
    configOptions: {
        environment: process.env.NODE_ENV,
        release: process.env.HEROKU_RELEASE_VERSION,
        autoBreadcrumbs: true
    }
};

const LoggingConfiguration = {
    reporters: {
        sentry: [
            {
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{ log: '*' }],
            },
            {
                module: 'node-good-sentry',
                name: 'StreamCleaner',
                args: [StreamCleanerArgs]
            },
            {
                module: 'node-good-sentry',
                name: 'GoodSentry',
                args: [GoodSentryConfig]
            }
        ]
    }
};

const start = async () => {
    try {
        await server.register([
            {
                plugin: good,
                options: LoggingConfiguration
            }
        ]);
        await server.start();
        return `Application started at: ${server.info.uri}`;
    } catch (error) {
        console.log(error);
        throw Error(error.message);
    }
};

start()
    .then(resp => console.log(resp))
    .catch(error => {
        process.exit(1);
    });
```

This above example sets up the reporter named sentry to listen for server events and send them to a Sentry project with additional settings.

## License
MIT License. See the [LICENSE](https://github.com/HotelEngine/node-good-sentry/blob/master/LICENSE) file.
