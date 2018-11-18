import * as Stream from 'stream';
import * as Raven from 'raven';
import Stringify from 'fast-safe-stringify';


export class GoodSentry extends Stream.Writable {

    _raven;

    constructor({sentryDsn=null, configOptions = {}}) {

        super({objectMode: true, decodeStrings: false });

        /*
            configure sentry only if sentryDsn is defined
         */
        if (sentryDsn) {
            this._raven = Raven;
            this._raven.config(sentryDsn, configOptions).install();
        }
    }

    _write(data, encoding, next) {

        /* Just drop messages if Raven isn't configured. */
        if (!this._raven) {
            return next();
        }

        const options = {
            tags: this._parseTags(data),
            level: this._parseLevel(data)
        };

        if (data.data instanceof Error) {
            this._raven.captureException(data.data, options);
        } else {
            this._raven.captureMessage(Stringify(data.data), options);
        }

        next();
    }

    _parseTags(data) {

        const tags = {
            requestId: data.id
        };

        /*
            Sentry's tags are key/value pairs instead of strings.To map to this
            format we just set the value of every Hapi event tag to true.
         */
        if (data.tags) {
            const hapiTags = Array.isArray(data.tags) ? data.tags : [data.tags];
            hapiTags.forEach((tag) => {

                tags[tag] = true;
            });
        } else {
            tags['error'] = true;
        }

        return tags;
    }

    _parseLevel(data) {

        /*
           The order of this array determines the log level
           used when multiple appear in the tag set. They are
           in order of descending severity.
         */
        const logLevels = ['fatal', 'error', 'warning', 'info', 'debug'];
        const defaultLevel = 'info';

        if (!data.tags || !data.tags.length) {
            return defaultLevel;
        }

        const level = logLevels.find((level) => data.tags.includes(level));

        return level || defaultLevel;
    }
}