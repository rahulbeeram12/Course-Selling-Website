const jwt = require('jsonwebtoken');

const Auth = (req, res, next) => {
    const token = req.body.Authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_CREATOR_SECRET);

    if (decoded) {
        req.body._id = decoded._id;
        next();
    } else {
        res.status(401).send({
            message: "Invalid JWT"
        });
    }
}

module.exports = Auth;