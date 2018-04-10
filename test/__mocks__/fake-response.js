const EventEmitter = require("events");
module.exports = class FakeResponse extends EventEmitter {
    constructor(responseInfo) {
        super();
        this.statusCode = responseInfo.statusCode;
        this.headers = {};
        if (responseInfo.location) {
            this.headers.location = responseInfo.location;
        }
    }

    get(header) {
        return this.headers[header];
    }
};
