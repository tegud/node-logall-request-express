const RequestLogger = require("../../");

const FakeLogger = require("../__mocks__/fake-logger");
const FakeRequest = require("../__mocks__/fake-request");
const FakeResponse = require("../__mocks__/fake-response");

describe("logall request logger", () => {
    describe("client ip", () => {
        it("sets ip to last IP in x-forwarded-for request header if present", done => {
            const fakeLogger = new FakeLogger();
            const requestLogger = new RequestLogger(fakeLogger);
            const fakeResponse = new FakeResponse({
                statusCode: 200
            });

            requestLogger.requestLogger(
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST",
                    headers: {
                        "x-forwarded-for": "192.168.0.1, 192.168.0.2"
                    }
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        url: "/example?test=true#fragment",
                        method: "POST",
                        status: 200,
                        client_ip: "192.168.0.2"
                    });

                    done();
                }
            );
        });

        it("sets ip to value in requestion connection remote address if no x-forwarded-for header is present", done => {
            const fakeLogger = new FakeLogger();
            const requestLogger = new RequestLogger(fakeLogger);
            const fakeResponse = new FakeResponse({
                statusCode: 200
            });

            requestLogger.requestLogger(
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST",
                    remoteAddress: "192.168.0.1"
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        url: "/example?test=true#fragment",
                        method: "POST",
                        status: 200,
                        client_ip: "192.168.0.1"
                    });

                    done();
                }
            );
        });

        it("sets ip to value in configured request header", done => {
            const fakeLogger = new FakeLogger();
            const requestLogger = new RequestLogger(fakeLogger, {
                clientIpHeaders: ["x-actual-ip"]
            });
            const fakeResponse = new FakeResponse({
                statusCode: 200
            });

            requestLogger.requestLogger(
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST",
                    headers: {
                        "x-actual-ip": "192.168.0.2",
                        "x-forwarded-for": "192.168.0.1"
                    }
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        url: "/example?test=true#fragment",
                        method: "POST",
                        status: 200,
                        client_ip: "192.168.0.2"
                    });

                    done();
                }
            );
        });

        it("sets ip to first provided value in configured request headers", done => {
            const fakeLogger = new FakeLogger();
            const requestLogger = new RequestLogger(fakeLogger, {
                clientIpHeaders: ["x-actual-ip", "x-backup-ip"]
            });
            const fakeResponse = new FakeResponse({
                statusCode: 200
            });

            requestLogger.requestLogger(
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST",
                    headers: {
                        "x-backup-ip": "192.168.0.3"
                    }
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        url: "/example?test=true#fragment",
                        method: "POST",
                        status: 200,
                        client_ip: "192.168.0.3"
                    });

                    done();
                }
            );
        });
    });
});
