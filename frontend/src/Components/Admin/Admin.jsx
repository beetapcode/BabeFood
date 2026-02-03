import './Admin.scss';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../../redux/apiRequest';
import { createAxios } from '../../createInstance';
import { loginSuccess } from '../../redux/authSlice';
import logo from '../../assets/imgs/userlogo.png';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Heroicons
import {
    CubeIcon,
    UserGroupIcon,
    ShoppingBagIcon,
    ChartBarIcon,
    ChatBubbleBottomCenterTextIcon,
    NewspaperIcon,
    ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Admin = () => {
    const user = useSelector((state) => state.auth.login?.currentUser);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    let axiosJWT = createAxios(user, dispatch, loginSuccess);

    const handleLogout = () => {
        logOut(dispatch, user?.id, user?.accessToken, axiosJWT);
    };

    useEffect(() => {
        if (!user?.admin) navigate('/admin');
    }, []);

    return (
        <main className="admin-container">
            <div className="admin-container-navbar">
                <div className="admin-container-item avatar-block">
                    <img src={logo} alt="" />
                    <p>{user?.fullname}</p>
                </div>

                <NavLink
                    to="/quan-li-san-pham"
                    className={({ isActive }) =>
                        isActive ? 'admin-container-item active' : 'admin-container-item'
                    }
                >
                    <CubeIcon className="admin-icon" />
                    Quản lý sản phẩm
                </NavLink>

                <NavLink
                    to="/quan-li-nguoi-dung"
                    className={({ isActive }) =>
                        isActive ? 'admin-container-item active' : 'admin-container-item'
                    }
                >
                    <UserGroupIcon className="admin-icon" />
                    Quản lý người dùng
                </NavLink>

                <NavLink
                    to="/quan-li-don-hang"
                    className={({ isActive }) =>
                        isActive ? 'admin-container-item active' : 'admin-container-item'
                    }
                >
                    <ShoppingBagIcon className="admin-icon" />
                    Quản lý đơn hàng
                </NavLink>

                <NavLink
                    to="/quan-li-thong-ke"
                    className={({ isActive }) =>
                        isActive ? 'admin-container-item active' : 'admin-container-item'
                    }
                >
                    <ChartBarIcon className="admin-icon" />
                    Quản lý thống kê
                </NavLink>

                <NavLink
                    to="/quan-li-danh-gia-binh-luan"
                    className={({ isActive }) =>
                        isActive ? 'admin-container-item active' : 'admin-container-item'
                    }
                >
                    <ChatBubbleBottomCenterTextIcon className="admin-icon" />
                    Quản lý đánh giá bình luận
                </NavLink>

                <NavLink
                    to="/quan-li-tin-tuc"
                    className={({ isActive }) =>
                        isActive ? 'admin-container-item active' : 'admin-container-item'
                    }
                >
                    <NewspaperIcon className="admin-icon" />
                    Quản lý tin tức
                </NavLink>

                <NavLink
                    to="/"
                    onClick={handleLogout}
                    className={({ isActive }) =>
                        isActive ? 'admin-container-item active' : 'admin-container-item'
                    }
                >
                    <ArrowRightStartOnRectangleIcon className="admin-icon" />
                    Đăng xuất
                </NavLink>
            </div>
        </main>
    );
};

export default Admin;
