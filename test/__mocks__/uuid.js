const uuid = jest.genMockFromModule("uuid");

let fakeUuid = "";

uuid.v4 = () => fakeUuid;
uuid.__setResponseUuid = newFakeUuid => (fakeUuid = newFakeUuid);
uuid.__resetUuid = () => (fakeUuid = "");

module.exports = uuid;
