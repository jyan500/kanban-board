const { SECRET_KEY } = require("../config")

function authenticateToken(req, res, next){
	// const token = req.header("Authorization")?.split(" ")[1]
	// if (!token){
	// 	return res.status(401).json({error: "Unauthorized"})
	// }
	// jwt.verify(token, SECRET_KEY, (err, user) => {
	// 	if (err) {
	// 		return res.status(403).json({ error: "Invalid Token"})
	// 	}
	// 	req.user = user
	// 	next()
	// })
	next()
}

module.exports = {
	authenticateToken
}