const requestLogger = require("../../lib/request-logger");

const FakeLogger = require("../__mocks__/fake-logger");
const FakeRequest = require("../__mocks__/fake-request");
const FakeResponse = require("../__mocks__/fake-response");

describe("logall request logger", () => {
    describe("field name configuration", () => {
        test("basic request information field names can be modified", done => {
            const fakeLogger = new FakeLogger();
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger(
                fakeLogger,
                {
                    fieldNames: {
                        url: "path",
                        method: "verb",
                        status: "response_status"
                    }
                },
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST"
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        path: "/example?test=true#fragment",
                        verb: "POST",
                        response_status: 200
                    });

                    done();
                }
            );
        });

        test("basic request information field can be disabled", done => {
            const fakeLogger = new FakeLogger();
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger(
                fakeLogger,
                {
                    fieldNames: {
                        method: false
                    }
                },
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST"
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        url: "/example?test=true#fragment",
                        status: 200
                    });

                    done();
                }
            );
        });

        test("optional field names can be modified", done => {
            const fakeLogger = new FakeLogger();
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger(
                fakeLogger,
                {
                    fieldNames: {
                        url: "path",
                        method: "verb",
                        status: "response_status",
                        client_ip: "client"
                    }
                },

                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST",
                    headers: {
                        "x-forwarded-for": "192.168.0.1"
                    }
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        path: "/example?test=true#fragment",
                        verb: "POST",
                        response_status: 200,
                        client: "192.168.0.1"
                    });

                    done();
                }
            );
        });

        test("optional fields can be disabled", done => {
            const fakeLogger = new FakeLogger();
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger(
                fakeLogger,
                {
                    fieldNames: {
                        url: "path",
                        method: "verb",
                        status: "response_status",
                        client_ip: false
                    }
                },
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST",
                    headers: {
                        "x-forwarded-for": "192.168.0.1"
                    }
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        path: "/example?test=true#fragment",
                        verb: "POST",
                        response_status: 200
                    });

                    done();
                }
            );
        });

        test("field names can be set to nested setters", done => {
            const fakeLogger = new FakeLogger();
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger(
                fakeLogger,
                {
                    fieldNames: {
                        url: "path",
                        method: "verb",
                        status: "response_status",
                        client_ip: "client.ip",
                        user_agent: "client.agent"
                    }
                },
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST",
                    headers: {
                        "x-forwarded-for": "192.168.0.1",
                        agent: "FAKE USER AGENT 1.0"
                    }
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        path: "/example?test=true#fragment",
                        verb: "POST",
                        response_status: 200,
                        client: {
                            ip: "192.168.0.1",
                            agent: "FAKE USER AGENT 1.0"
                        }
                    });

                    done();
                }
            );
        });

        test("field name standard can be switched to camel-case", done => {
            const fakeLogger = new FakeLogger();
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger(
                fakeLogger,
                {
                    fieldNameStandard: "camelCase"
                },
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST",
                    headers: {
                        agent: "TEST AGENT 1.0",
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
                        userAgent: "TEST AGENT 1.0",
                        clientIp: "192.168.0.1"
                    });

                    done();
                }
            );
        });
    });
});
