const dynamicLogLevel = require("../lib/dynamic-log-level");
const requestContext = require("../request-context");

const FakeLogger = require("./__mocks__/fake-logger");
const FakeRequest = require("./__mocks__/fake-request");
const FakeResponse = require("./__mocks__/fake-response");

describe("Dynamic Log Level", () => {
    test("logLevel in request context is set to the header value", done => {
        const fakeLogger = new FakeLogger();
        const fakeResponse = new FakeResponse({
            statusCode: 200
        });

        const context = requestContext.context();

        context.run(() => {
            dynamicLogLevel(
                {},
                new FakeRequest({
                    headers: {
                        "x-log-level": "DEBUG"
                    }
                }),
                fakeResponse,
                () => {
                    expect(requestContext.getValue("logLevel")).toEqual(
                        "DEBUG"
                    );

                    done();
                }
            );
        });
    });

    test("logLevel in request context is set to the specified header value", done => {
        const fakeLogger = new FakeLogger();
        const fakeResponse = new FakeResponse({
            statusCode: 200
        });

        const context = requestContext.context();

        context.run(() => {
            dynamicLogLevel(
                {
                    dynamicLogLevel: {
                        header: "x-log"
                    }
                },
                new FakeRequest({
                    headers: {
                        "x-log": "DEBUG"
                    }
                }),
                fakeResponse,
                () => {
                    expect(requestContext.getValue("logLevel")).toEqual(
                        "DEBUG"
                    );

                    done();
                }
            );
        });
    });

    test("logLevel not in request context is not set", done => {
        const fakeLogger = new FakeLogger();
        const fakeResponse = new FakeResponse({
            statusCode: 200
        });

        const context = requestContext.context();

        context.run(() => {
            dynamicLogLevel(
                {},
                new FakeRequest({
                    headers: {}
                }),
                fakeResponse,
                () => {
                    expect(requestContext.getValue("logLevel")).toEqual(
                        undefined
                    );

                    done();
                }
            );
        });
    });
});
