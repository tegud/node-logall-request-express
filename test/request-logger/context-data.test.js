const requestLogger = require("../../lib/request-logger");

const FakeLogger = require("../__mocks__/fake-logger");
const FakeRequest = require("../__mocks__/fake-request");
const FakeResponse = require("../__mocks__/fake-response");

describe("logall request logger", () => {
    describe("request-log-context", () => {
        test("logs basic request information", done => {
            const fakeLogger = new FakeLogger();
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger(
                fakeLogger,
                {},
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST"
                }),
                fakeResponse,
                () => {
                    require("../../request-context").set("x", 12345);
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        url: "/example?test=true#fragment",
                        method: "POST",
                        status: 200,
                        x: 12345
                    });

                    done();
                }
            );
        });

        test("logs basic request information with overridden field name", done => {
            const fakeLogger = new FakeLogger();
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger(
                fakeLogger,
                {
                    fieldNames: {
                        x: "test"
                    }
                },
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST"
                }),
                fakeResponse,
                () => {
                    require("../../request-context").set("x", 12345);
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        url: "/example?test=true#fragment",
                        method: "POST",
                        status: 200,
                        test: 12345
                    });

                    done();
                }
            );
        });
    });
});
