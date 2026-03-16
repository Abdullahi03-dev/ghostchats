import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (err) {
            res.status(401).json({ message: "Not authorized, invalid or expired token" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token found" });
    }
}

export default protect;