const requestContext = require("../request-context");
const { v4 } = require("uuid");

function getHeaderName(config) {
    if (!config.requestId || !config.requestId.header) {
        return "x-request-id";
    }

    return config.requestId.header;
}

module.exports = (config, req, res, next) => {
    const header = getHeaderName(config);

    requestContext.set("requestId", req.headers[header] || v4());

    next();
};
