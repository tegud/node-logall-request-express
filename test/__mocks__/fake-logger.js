module.exports = function FakeLogger() {
    let lastLogged;

    return {
        getLastLogged: () => lastLogged,
        logInfo: (message, data) => (lastLogged = { message, data })
    };
};
