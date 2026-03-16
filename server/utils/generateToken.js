import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15d' });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 15 * 24 * 60 * 60 * 1000,
    });
};

export default generateToken;