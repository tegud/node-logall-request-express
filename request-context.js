const { getNamespace, createNamespace } = require("cls-hooked");

function newNamespace() {
    return createNamespace("request");
}

function namespace() {
    return getNamespace("request");
}

function getLoggingContext() {
    const context = namespace().get("logging-context");

    if (context) {
        return context;
    }

    return { data: {} };
}

module.exports = {
    context: () => namespace() || newNamespace(),
    get: () => getLoggingContext(),
    getValue: key => getLoggingContext()[key],
    setValue: (key, value) => {
        const requestLoggerContext = namespace();

        const loggingContext = getLoggingContext();

        loggingContext[key] = value;

        requestLoggerContext.set("logging-context", loggingContext);
    },
    set: (key, value) => {
        const requestLoggerContext = namespace();

        const loggingContext = getLoggingContext();

        loggingContext.data[key] = value;

        requestLoggerContext.set("logging-context", loggingContext);
    }
};
