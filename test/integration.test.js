const dgram = require("dgram");
const express = require("express");
const request = require("request");
const moment = require("moment");
const logger = require("logall");
const RequestLogger = require("../");

function UdpServer(port) {
    const server = dgram.createSocket("udp4");

    const messageHandler = () => {};

    server.on("error", err => {
        console.log(`udp server error:\n${err.stack}`);
        server.close();
    });

    return {
        start: () => {
            server.bind(port);
            return Promise.resolve();
        },
        on: (...args) => server.on(...args),
        stop: () => {
            server.close();
            return Promise.resolve();
        }
    };
}

function makeRequest(options) {
    return new Promise(resolve =>
        request(options, (err, response, data) => {
            resolve({
                response,
                data
            });
        })
    );
}

describe("logall request middleware", () => {
    let server;
    let udpListener;

    function startServer(app, port) {
        return new Promise(resolve => {
            server = app.listen(port, error => {
                if (error) {
                    console.error("error starting http server", {
                        listening_port: port,
                        error
                    });
                }
                resolve();
            });
        });
    }

    function startUdpListener(port) {
        udpListener = new UdpServer(port);

        return udpListener.start();
    }

    afterEach(() => {
        server.close();
        logger.removeAll();
        moment.__reset();
        return udpListener.stop();
    });

    test("Logs to UDP when request is complete", done => {
        const app = express();
        const requestLogger = new RequestLogger(logger);
        const httpPort = 3000;
        const udpPort = 3001;

        moment.__setDate("2018-04-08T21:21:39+01:00");

        logger.removeAll();
        logger.registerLogger({
            level: "INFO",
            type: "logstash",
            eventType: "my-api",
            output: {
                transport: "udp",
                host: "127.0.0.1",
                port: 3001
            }
        });

        requestLogger.dynamicLogLevel().setMiddleware(app);
        app.get("/example", (req, res) => res.send("OK"));

        Promise.all([
            startServer(app, httpPort),
            startUdpListener(udpPort)
        ]).then(() =>
            makeRequest({ url: `http://localhost:${httpPort}/example` })
        );

        udpListener.on("message", message => {
            expect(JSON.parse(message.toString("utf-8"))).toEqual({
                "@timestamp": "2018-04-08T21:21:39+01:00",
                client_ip: "::ffff:127.0.0.1",
                level: "INFO",
                message: "Request Handled",
                method: "GET",
                status: 200,
                type: "my-api",
                url: "/example"
            });
            done();
        });
    });

    test("Dynamic log level logs DEBUG when level function indicates to", done => {
        const app = express();
        const requestLogger = new RequestLogger(logger);
        const httpPort = 3000;
        const udpPort = 3001;

        moment.__setDate("2018-04-08T21:21:39+01:00");

        logger.removeAll();
        logger.registerLogger({
            level: () => {
                const context = requestLogger.getRequestLoggingContext();

                if (!context || !context.logLevel) {
                    return "INFO";
                }

                return context.logLevel;
            },
            type: "logstash",
            eventType: "my-api",
            output: {
                transport: "udp",
                host: "127.0.0.1",
                port: 3001
            }
        });

        requestLogger.dynamicLogLevel().setMiddleware(app);

        app.get("/example", (req, res) => {
            logger.logDebug("DEBUG MESSAGE");
            res.send("OK");
        });

        Promise.all([
            startServer(app, httpPort),
            startUdpListener(udpPort)
        ]).then(() =>
            makeRequest({
                url: `http://localhost:${httpPort}/example`,
                headers: {
                    "X-Log-Level": "DEBUG"
                }
            })
        );

        udpListener.on("message", message => {
            const parsedMessage = JSON.parse(message.toString("utf-8"));
            if (parsedMessage.level !== "DEBUG") {
                return;
            }

            expect(parsedMessage).toEqual({
                "@timestamp": "2018-04-08T21:21:39+01:00",
                type: "my-api",
                level: "DEBUG",
                message: "DEBUG MESSAGE"
            });
            done();
        });
    });
});
