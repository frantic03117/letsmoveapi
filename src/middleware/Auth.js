const jwt = require('jsonwebtoken');
const User = require('../Models/User');
require('dotenv').config();


const SECRET_KEY = process.env.SECRET_KEY ?? 'frantic@letsmove#6200';

async function Auth(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization) {
        return res.status(401).json({ message: 'No Authorization Header' });
    }

    try {
        // Expect "Bearer <token>"
        const token = authorization.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid Token Format' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const ruser = decoded.user;

        const user = await User.findById(ruser._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.is_deleted) {
            return res.status(403).json({ message: 'User account deleted' });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Session Expired', error: error.message });
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid Token', error: error.message });
        }

        // All other unexpected errors
        return res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}

module.exports = { Auth };
