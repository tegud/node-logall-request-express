const requestId = require("../lib/request-id");
const requestContext = require("../request-context");

const FakeLogger = require("./__mocks__/fake-logger");
const FakeRequest = require("./__mocks__/fake-request");
const FakeResponse = require("./__mocks__/fake-response");

const uuid = require("uuid");

describe("Request ID", () => {
    beforeEach(() => {
        uuid.__resetUuid();
    });

    test("request-id is set in request log data is set to the header value", done => {
        const fakeLogger = new FakeLogger();
        const fakeResponse = new FakeResponse({
            statusCode: 200
        });

        const context = requestContext.context();

        context.run(() => {
            requestId(
                {},
                new FakeRequest({
                    headers: {
                        "x-request-id": "12345"
                    }
                }),
                fakeResponse,
                () => {
                    expect(requestContext.get().data.requestId).toEqual(
                        "12345"
                    );

                    done();
                }
            );
        });
    });

    test("request-id is set in request log data is set to the specified header value", done => {
        const fakeLogger = new FakeLogger();
        const fakeResponse = new FakeResponse({
            statusCode: 200
        });

        const context = requestContext.context();

        context.run(() => {
            requestId(
                {
                    requestId: {
                        header: "x-correlation-id"
                    }
                },
                new FakeRequest({
                    headers: {
                        "x-correlation-id": "12345"
                    }
                }),
                fakeResponse,
                () => {
                    expect(requestContext.get().data.requestId).toEqual(
                        "12345"
                    );

                    done();
                }
            );
        });
    });

    test("request-id is set to random value when the header value is not set", done => {
        uuid.__setResponseUuid("678910");

        const fakeLogger = new FakeLogger();
        const fakeResponse = new FakeResponse({
            statusCode: 200
        });

        const context = requestContext.context();

        context.run(() => {
            requestId({}, new FakeRequest({}), fakeResponse, () => {
                expect(requestContext.get().data.requestId).toEqual("678910");

                done();
            });
        });
    });
});
