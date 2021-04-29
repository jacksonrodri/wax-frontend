import jwt from 'jsonwebtoken';

export default (req, res, next) => {
	const token = req.headers['x-access-token'] || req.headers.authorization;
	if (!token) {
		res.status(401).json({ message: 'Unauthorized: No token supplied!' });
	} else {
		jwt.verify(token, "secret", (err) => {
			if (err) {
				res.status(401).json({ message: 'Unauthorized: Invalid token!' });
			} else {
				next();
			}
		});
	}
};