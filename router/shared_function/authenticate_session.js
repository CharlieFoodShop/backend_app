module.exports = (req, res, next) => {
    if (req.session.cookie) {
        next();
    } else {
        return res.status(401).json({ success: false, message: 'Please Login!' });
    }
}