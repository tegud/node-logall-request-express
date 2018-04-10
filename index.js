const { createNamespace } = require("continuation-local-storage");

const requestLogger = require("./lib/request-logger");

module.exports = function(logger, config = {}) {
    const requestLoggerContext = createNamespace("request");

    return {
        getRequestLoggingContext: () =>
            requestLoggerContext.get("logging-context"),
        dynamicLogLevel: (req, res, next) => {
            if (!req.headers["x-log-level"]) {
                return next();
            }

            const loggingContext =
                requestLoggerContext.get("logging-context") || {};

            loggingContext.logLevel = req.headers["x-log-level"];

            requestLoggerContext.set("logging-context", loggingContext);

            next();
        },
        requestLogger: requestLogger.bind(undefined, logger, config)
    };
};
