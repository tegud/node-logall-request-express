const { createNamespace } = require("continuation-local-storage");

const requestLogger = require("./lib/request-logger");
const dynamicLogLevel = require("./lib/dynamic-log-level");

module.exports = function(logger, config = {}) {
    // return {
    //     getRequestLoggingContext: () =>
    //         requestLoggerContext.get("logging-context"),
    //     dynamicLogLevel: dynamicLogLevel,
    //     requestLogger: requestLogger.bind(undefined, logger, config)
    // };

    const middlewares = [];

    const api = {
        dynamicLogLevel: () => {
            middlewares.push(dynamicLogLevel);

            return api;
        },
        setMiddleware: app => {
            const requestLoggerContext = createNamespace("logging-context");

            try {
                [
                    ...middlewares,
                    requestLogger.bind(undefined, logger, config)
                ].forEach(middleware =>
                    app.use(requestLoggerContext.bind(middleware))
                );
            } catch (e) {
                console.log(e.message);
            }
        }
    };

    return api;
};
