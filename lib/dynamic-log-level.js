const requestContext = require("../request-context");

function getHeaderName(config) {
    if (!config.dynamicLogLevel || !config.dynamicLogLevel.header) {
        return "x-log-level";
    }

    return config.dynamicLogLevel.header;
}

module.exports = (config, req, res, next) => {
    const header = getHeaderName(config);

    if (!req.headers[header]) {
        return next();
    }

    requestContext.setValue("logLevel", req.headers[header]);

    next();
};
