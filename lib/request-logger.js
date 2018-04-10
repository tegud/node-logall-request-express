const { getNamespace } = require("continuation-local-storage");
const objectPath = require("object-path");
const getIp = require("./get-ip");

const loggingFields = [
    { from: "req.url", field: "url" },
    { from: "req.method", field: "method" },
    { from: "res.statusCode", field: "status" },
    { from: "req.headers.agent", field: "user_agent", optional: true },
    { from: "req.headers.referer", field: "referer", optional: true },
    { from: "res.headers.location", field: "location", optional: true },
    { from: getIp, field: "client_ip", optional: true }
];

const fieldNameStandards = {
    camelCase: fieldName => fieldName.replace(/_\w/g, m => m[1].toUpperCase()),
    snake_case: fieldName => fieldName
};

function getFieldValue(config, field, req, res) {
    if (typeof field.from === "function") {
        return field.from(config, req, res);
    }

    const from = field.from.split(".");

    if (from[0] === "res" && from[1] === "headers") {
        return res.get(from[2]);
    }

    return objectPath.get(
        from[0] === "req" ? req : res,
        from.slice(1).join(".")
    );
}

function getFieldName(config, field) {
    if (
        config.fieldNames &&
        typeof config.fieldNames[field.field] !== "undefined"
    ) {
        return config.fieldNames[field.field];
    }

    const fieldNameStandard = config.fieldNameStandard || "snake_case";

    return fieldNameStandards[fieldNameStandard](field.field);
}

module.exports = (logger, config, req, res, next) => {
    const requestLoggerContext = getNamespace("request");

    requestLoggerContext.bindEmitter(req);
    requestLoggerContext.bindEmitter(res);

    requestLoggerContext.run(() => {
        res.on("finish", () => {
            logger.logInfo(
                "Request Handled",
                loggingFields.reduce((logObject, field) => {
                    const value = getFieldValue(config, field, req, res);
                    const name = getFieldName(config, field);

                    if (name && (value || !field.optional)) {
                        logObject[name] = value;
                    }

                    return logObject;
                }, {})
            );
        });
        next();
    });
};
