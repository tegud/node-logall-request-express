const originalMoment = require("moment");

const fakeMoment = (...args) => {
    if (args.length) {
        return originalMoment(...args);
    }

    return originalMoment(fakeDate);
};
let fakeDate;

fakeMoment.__setDate = newDate => (fakeDate = newDate);
fakeMoment.__reset = () => (fakeDate = undefined);

module.exports = fakeMoment;
