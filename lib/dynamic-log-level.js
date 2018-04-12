const requestContext = require("../request-context");

module.exports = (req, res, next) => {
    if (!req.headers["x-log-level"]) {
        return next();
    }

    if (!requestContext) {
        console.log(`*********** ALERT!!!`);
    }
    requestContext.set("logging-context", req.headers["x-log-level"]);

    next();
};
