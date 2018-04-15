module.exports = function getIp(config, req) {
    const headersToTry = config.clientIpHeaders || ["x-forwarded-for"];

    let current;
    while ((current = headersToTry.shift())) {
        if (!req.headers[current]) {
            continue;
        }
        const ips = req.headers[current].split(",").map(ip => ip.trim());

        return ips[ips.length - 1];
    }

    if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    }
};
