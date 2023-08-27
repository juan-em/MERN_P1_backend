const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeder = req.headers.authorization || req.headers.Authorization

    if(!authHeder?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    //Beacuse the authHeader starts with Bearer and then has a space and finally the token, we need to obtain just the token
    const token = authHeder.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(403).json({message: 'Unauthorized'})
            }
            req.user = decoded.UserInfo.username
            req.roles = decoded.UserInfo.roles
            next()
        }
    )
}

module.exports = verifyJWT