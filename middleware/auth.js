const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    // console.log('token is :'+ token);
    try {

        if (!token) {
            console.log('not found');
            return res.status(401).json({ data: 'no authentication token, authorization denied' });
        }
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!verified) {
            console.log('not verified');
            return res.status(401)
                .json({ data: 'Token authentication failed, authorization denied' });
        }
        console.log('is verified');
        req.user = verified.id;
        console.log('verified id :' + JSON.stringify(req.user));
        next();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }

}

module.exports = auth