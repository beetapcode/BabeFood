const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const middlewareController = require('./middlewareController.js');

var AccessTokensArr = [];
var refreshTokensArr = [];

const authControllers = {
    //register
    registerUser: async (req, res) => {
        try {
            //hash mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            //create new User
            const newUser = await new User({
                fullname: req.body.fullname,
                avatar: '',
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                username: req.body.username,
                password: hashed,
                facebookUserId: 'null',
                googleUserId: 'null',
            });

            //save to database
            const user = await newUser.save();
            res.status(200).json();
        } catch (error) {
            res.status(500).json(error);
        }
    },
    //token
    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                admin: user.admin,
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: '365d' },
        );
    },
    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                admin: user.admin,
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '365d' },
        );
    },

    //Login user
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });

            //kiểm tra password nhập vào có trừng với password ở database không (trong trường hợp hash)
            const validPassword = await bcrypt.compare(
                req.body.password, //pass nhập vào
                user.password, //pass ở database
            );

            if (!user) {
                return res.status(404).json('Tài khoản không tồn tại');
            } else if (!validPassword) {
                return res.status(404).json('Mật khẩu không chính xác');
            } else if (user && validPassword) {
                const accessToken = authControllers.generateAccessToken(user);
                const refreshToken = authControllers.generateRefreshToken(user);
                AccessTokensArr.push(accessToken);
                refreshTokensArr.push(refreshToken);

                //lưu cookie
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict',
                });

                //trả dữ liệu về
                const { password, ...others } = user._doc; // trả về tất cả thông tin trừ password (._docx là toàn bộ thông tin từ id,username,....)
                res.status(200).json({ ...others, accessToken });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    },

    //refresh token
    requestRefreshToken: async (req, res) => {
        const refreshToken = refreshTokensArr[0];

        if (!refreshToken) {
            return res.status(401).json('Bạn chưa chứng thực tài khoản');
        }
        if (!refreshTokensArr.includes(refreshToken)) {
            return res.status(403).json('Refresh token is not valid');
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
            if (err) {
                return res.status(403).json(err);
            }
            refreshTokensArr = refreshTokensArr.filter((token) => token !== refreshToken);

            const newAccessToken = authControllers.generateAccessToken(user);
            const newRefreshToken = authControllers.generateRefreshToken(user);

            refreshTokensArr.push(newRefreshToken);

            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: 'strict',
            });

            res.status(200).json({ accessToken: newAccessToken });
        });
    },

    //Login user with facebook
    loginWithFacebook: async (req, res) => {
        try {
            const user = await User.findOne({ facebookUserId: req.body.facebookUserId }).select(
                '-password -facebookUserId -googleUserId',
            );

            if (user) {
                //Tạo token để đăng nhập
                const accessToken = authControllers.generateAccessToken(user);
                const refreshToken = authControllers.generateRefreshToken(user);
                AccessTokensArr.push(accessToken);
                refreshTokensArr.push(refreshToken);

                //lưu cookie
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict',
                });

                res.status(200).json({
                    code: 200,
                    msg: 'Facebook đã được đăng ký, đăng nhập thành công',
                    data: { ...user._doc, accessToken },
                });
            } else {
                //create new User
                const newUser = await new User({
                    fullname: req.body.fullname,
                    avatar: req.body.avatar,
                    email: '',
                    address: '',
                    phone: '',
                    username: '',
                    password: '',
                    facebookUserId: req.body.facebookUserId,
                    googleUserId: 'null',
                });

                //save to database
                await newUser.save();

                //Lấy thông tin người dùng đó ra
                const currentUser = await User.findOne({ facebookUserId: req.body.facebookUserId }).select(
                    '-password -facebookUserId -googleUserId',
                );

                //Tạo token để đăng nhập
                const accessToken = authControllers.generateAccessToken(currentUser);
                const refreshToken = authControllers.generateRefreshToken(currentUser);
                AccessTokensArr.push(accessToken);
                refreshTokensArr.push(refreshToken);

                //lưu cookie
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict',
                });

                res.status(200).json({
                    code: 200,
                    msg: 'Tạo tài khoản mới, đăng nhập thành công',
                    data: { ...currentUser._doc, accessToken },
                });
            }
        } catch (error) {
            res.status(500).json({
                code: 500,
                msg: `Lỗi hệ thống: ${error}`,
                data: {},
            });
        }
    },

    //logout user
    userLogout: async (req, res) => {
        res.clearCookie('refreshToken');
        refreshTokensArr = refreshTokensArr.filter((token) => token != req.cookies.refreshToken);
        res.status(200).json('Logout successfully');
    },

    //update info User
    updateUser: async (req, res) => {
        try {
            if (!req.body.body.oldPassword) {
                await User.findByIdAndUpdate(req.params.id, req.body.body);
                const userUpdate = await User.findById(req.params.id);
                const accessToken = AccessTokensArr[0];
                const { password, ...others } = userUpdate._doc;
                res.status(200).json({
                    code: 200,
                    msg: 'Cập nhật thông tin thành công',
                    data: { ...others, accessToken },
                });
            } else {
                const user = await User.findById(req.params.id);

                //kiểm tra password nhập vào có trừng với password ở database không (trong trường hợp hash)
                const validPassword = await bcrypt.compare(
                    req.body.body.oldPassword, //pass nhập vào
                    user.password, //pass ở database
                );

                if (!user) {
                    res.status(404).json({
                        code: 404,
                        msg: 'Tài khoản không tồn tại',
                    });
                } else if (!validPassword) {
                    res.status(404).json({
                        code: 404,
                        msg: 'Mật khẩu cũ không chính xác',
                    });
                } else if (!req.body.body.newPassword) {
                    res.status(404).json({
                        code: 404,
                        msg: 'Không được để trống mật khẩu mới',
                    });
                } else if (user && validPassword) {
                    //hash mật khẩu
                    const salt = await bcrypt.genSalt(10);
                    const hashed = await bcrypt.hash(req.body.body.newPassword, salt);

                    //Cập nhật thông tin mới
                    const newUpdate = { ...req.body.body, password: hashed }; // ghi đè giá trị của password cũ thành hashed
                    await User.findByIdAndUpdate(req.params.id, newUpdate);

                    //Tạo token mới, lí do không lưu token vào db vì khi bị hack db, nó có thể đăng nhập và thao tác với token đó
                    const accessToken = authControllers.generateAccessToken(user);
                    const refreshToken = authControllers.generateRefreshToken(user);
                    AccessTokensArr.push(accessToken);
                    refreshTokensArr.push(refreshToken);

                    //Lấy user mới ra
                    const userUpdate = await User.findById(req.params.id);

                    const { password, ...others } = userUpdate._doc;
                    res.status(200).json({
                        code: 200,
                        msg: 'Cập nhật thông tin thành công',
                        data: { ...others, accessToken },
                    });
                }
            }
        } catch (error) {
            res.status(500).json({
                code: 500,
                msg: 'Cập nhật thông tin thất bại',
            });
        }
    },
};

module.exports = authControllers;
