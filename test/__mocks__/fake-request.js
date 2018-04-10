const EventEmitter = require("events");
module.exports = class FakeRequest extends EventEmitter {
    constructor(requestInfo) {
        super();
        this.headers = requestInfo.headers || {};
        this.body = {};
        this.url = requestInfo.url;
        this.method = requestInfo.method;

        if (requestInfo.remoteAddress) {
            this.connection = { remoteAddress: requestInfo.remoteAddress };
        }
    }
};
