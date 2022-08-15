module.exports = (theFucn) => (req, res, next) => {
    Promise.resolve(theFucn(req, res, next)).catch(next);
};
