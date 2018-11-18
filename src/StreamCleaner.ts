import * as Stream from 'stream';
import * as Traverse from 'traverse';


export class StreamCleaner extends Stream.Transform {

    _rules;
    _blacklist;

    constructor(rules = {}) {
        super({ objectMode: true, decodeStrings: false });
        this._rules = rules;
        this._blacklist = Object.keys(this._rules);
    }

    _transform(data, enc, next) {

        if (data.event === 'error') {
            return next(null, data);
        }

        const blacklist = this._blacklist;
        const rules = this._rules;

        const cleaned = Traverse(data).map(function(value) {

            if (value instanceof Stream) {
                this.update('[Stream]');
                return;
            }

            if (value instanceof Buffer) {
                this.update('[Buffer]');
                return;
            }

            const path = this.path.join('.');
            const match = blacklist.find((k) => path.includes(k));

            if (typeof match === 'undefined') {
                return;
            }

            if (rules[match] === 'redact') {
                this.update(('' + value).replace(/./g, '*'));
            }

            if (rules[match] === 'remove') {
                this.remove();
            }
        });

        next(null, cleaned);
    }

}