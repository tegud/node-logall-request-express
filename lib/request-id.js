const requestContext = require("../request-context");

module.exports = (config, req, res, next) => {
    if (req.headers["x-request-id"]) {
        requestContext.set("requestId", req.headers["x-request-id"]);
    }

    next();
};
