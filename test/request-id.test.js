const requestId = require("../lib/request-id");
const requestContext = require("../request-context");

const FakeLogger = require("./__mocks__/fake-logger");
const FakeRequest = require("./__mocks__/fake-request");
const FakeResponse = require("./__mocks__/fake-response");

describe("Request ID", () => {
    test.skip("request-id is set in request log data is set to the header value", done => {
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
                    expect(requestContext.get("data").requestId).toEqual(
                        "12345"
                    );

                    done();
                }
            );
        });
    });
});
