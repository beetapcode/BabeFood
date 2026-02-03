const jwt = require('jsonwebtoken');

const middlewareController = {
    // verifyToken
    verifyToken: async (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    return res.status(403).json('Phiên đăng nhập hết hạn!');
                }
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json('Tài khoản của ban chưa chứng thực!');
        }
    },

    //admin delete
    verifyTokenAndAdminAuth: async (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.id == req.params.id || req.user.admin) {
                next();
            } else {
                return res.status(200).json('Bạn không có quyền xóa tài khoản này!');
            }
        });
    },
};

module.exports = middlewareController;
