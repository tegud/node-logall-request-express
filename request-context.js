const { getNamespace, createNamespace } = require("continuation-local-storage");

module.exports = {
    context: () => getNamespace("request") || createNamespace("request"),
    get: () => {
        const requestLoggerContext = getNamespace("request");

        const loggingContext = requestLoggerContext.get("logging-context") || {
            data: {}
        };

        if (!loggingContext.data) {
            loggingContext.data = {};
        }

        return loggingContext;
    },
    set: (key, value) => {
        const requestLoggerContext = getNamespace("request");

        const loggingContext = requestLoggerContext.get("logging-context") || {
            data: {}
        };

        loggingContext.data[key] = value;

        requestLoggerContext.set("logging-context", loggingContext);
    }
};
