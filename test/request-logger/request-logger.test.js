const RequestLogger = require("../../");

const FakeLogger = require("../__mocks__/fake-logger");
const FakeRequest = require("../__mocks__/fake-request");
const FakeResponse = require("../__mocks__/fake-response");

describe("logall request logger", () => {
    describe("Request Handled", () => {
        test("is logged", done => {
            const fakeLogger = new FakeLogger();
            const requestLogger = new RequestLogger(fakeLogger);
            const fakeResponse = new FakeResponse({});

            requestLogger.requestLogger(
                new FakeRequest({}),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().message).toBe(
                        "Request Handled"
                    );

                    done();
                }
            );
        });

        test("logs basic request information", done => {
            const fakeLogger = new FakeLogger();
            const requestLogger = new RequestLogger(fakeLogger);
            const fakeResponse = new FakeResponse({ statusCode: 200 });

            requestLogger.requestLogger(
                new FakeRequest({
                    url: "/example?test=true#fragment",
                    method: "POST"
                }),
                fakeResponse,
                () => {
                    fakeResponse.emit("finish");

                    expect(fakeLogger.getLastLogged().data).toEqual({
                        url: "/example?test=true#fragment",
                        method: "POST",
                        status: 200
                    });

                    done();
                }
            );
        });

        describe("optional fields from headers", () => {
            [
                {
                    field: "agent",
                    target: "user_agent",
                    value: "FAKE USER AGENT 1.0"
                },
                {
                    field: "referer",
                    value: "http://example.com/"
                }
            ].forEach(optionalField =>
                test(`logs ${optionalField.field} if provided`, done => {
                    const fakeLogger = new FakeLogger();
                    const requestLogger = new RequestLogger(fakeLogger);
                    const fakeResponse = new FakeResponse({ statusCode: 200 });
                    const headers = {};

                    headers[optionalField.field] = optionalField.value;

                    requestLogger.requestLogger(
                        new FakeRequest({
                            url: "/example?test=true#fragment",
                            method: "POST",
                            headers: headers
                        }),
                        fakeResponse,
                        () => {
                            fakeResponse.emit("finish");

                            const expectedObject = {
                                url: "/example?test=true#fragment",
                                method: "POST",
                                status: 200
                            };

                            const targetField =
                                optionalField.target || optionalField.field;

                            expectedObject[targetField] = optionalField.value;

                            expect(fakeLogger.getLastLogged().data).toEqual(
                                expectedObject
                            );

                            done();
                        }
                    );
                })
            );

            test("logs location if present on response", done => {
                const fakeLogger = new FakeLogger();
                const requestLogger = new RequestLogger(fakeLogger);
                const fakeResponse = new FakeResponse({
                    statusCode: 200,
                    location: "http://example.com/redirect"
                });

                requestLogger.requestLogger(
                    new FakeRequest({
                        url: "/example?test=true#fragment",
                        method: "POST"
                    }),
                    fakeResponse,
                    () => {
                        fakeResponse.emit("finish");

                        expect(fakeLogger.getLastLogged().data).toEqual({
                            url: "/example?test=true#fragment",
                            method: "POST",
                            status: 200,
                            location: "http://example.com/redirect"
                        });

                        done();
                    }
                );
            });
        });
    });
});
