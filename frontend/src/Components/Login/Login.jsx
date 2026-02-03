import './login.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { loginUser } from '../../redux/apiRequest';
import { useDispatch } from 'react-redux';
import logo from '../../assets/imgs/logo-blue.png';

const Login = () => {
    const [errorUsername, setErrorUsername] = useState('');
    const [errorPassword, setErrorPassword] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const newUser = {
            username: username,
            password: password,
        };
        if (username === '') {
            setErrorUsername('(*) không được để trống tài khoản');
        } else if (password === '') {
            setErrorUsername('');
            setErrorPassword('(*) không được để trống mật khẩu');
        } else {
            setErrorPassword('');
            loginUser(newUser, dispatch, navigate);
        }
    };

    return (
        <section className="login-container">
            <div className="login-logo">
                <Link to="/">
                    <img src={logo} alt="logo" />
                </Link>
            </div>
            <div className="login-wrapper">
                <div className="login-title"> Đăng nhập</div>
                <form onSubmit={handleLogin}>
                    <div className="login-form login-username">
                        <label>Tài khoản</label>
                        <input type="text" placeholder="Tên đăng nhập" onChange={(e) => setUsername(e.target.value)} />
                        <span>{errorUsername}</span>
                    </div>
                    <div className="login-form login-password">
                        <label>Mât khẩu</label>
                        <input type="password" placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} />
                        <span>{errorPassword}</span>
                    </div>
                    <button className="btn btn-submit" type="submit">
                        ĐĂNG NHẬP
                    </button>
                </form>
                <div className="login-register">
                    Bạn chưa có tài khoản?
                    <Link className="login-register-link" to="/dang-ky">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Login;
