import './ListUsers.scss';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAxios } from '../../../createInstance';
import { deleteUser, getAllUsers, updateListUser } from '../../../redux/apiRequest';
import { loginSuccess } from '../../../redux/authSlice';
import Admin from '../../Admin/Admin';

// Import Icons
import { 
    PencilSquareIcon, 
    TrashIcon, 
    XMarkIcon,
    UserIcon
} from '@heroicons/react/24/outline';

function ListUsers() {
    const user = useSelector((state) => state.auth.login?.currentUser);
    const listUser = useSelector((state) => state.users.users?.allUsers);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let axiosJWT = createAxios(user, dispatch, loginSuccess);

    // State Modal
    const [showModal, setShowModal] = useState(false);

    // State Form Data
    const [newfullname, setNewFullname] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [currentId, setCurrentId] = useState('');

    useEffect(() => {
        if (!user?.admin) navigate('/');
        if (user?.accessToken) getAllUsers(user?.accessToken, dispatch);
        // eslint-disable-next-line
    }, []);

    const handleDelete = (id) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            deleteUser(user?.accessToken, dispatch, id, axiosJWT);
        }
    };

    // Mở Modal
    const handleShowEdit = (item) => {
        setNewFullname(item.fullname);
        setNewEmail(item.email);
        setNewPhone(item.phone);
        setNewAddress(item.address);
        setNewUsername(item.username);
        setCurrentId(item._id);
        setShowModal(true);
    };

    // Đóng Modal
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Xử lý Lưu
    const handleEdit = () => {
        const isValidEmail = /\S+@\S+\.\S+/;

        if (!newfullname || !newEmail || !newPhone || !newAddress || !newUsername) {
            return alert('Lỗi: Không được để trống thông tin');
        } else if (newfullname.length < 5) {
            return alert('Lỗi: Độ dài tên phải từ 5 - 30 ký tự');
        } else if (!isValidEmail.test(newEmail)) {
            return alert('Lỗi: Email không đúng định dạng');
        } else if (newEmail.length < 10) {
            return alert('Lỗi: Độ dài email từ 10 - 40 ký tự');
        } else if (newPhone.length < 10 || newPhone.length > 12) {
            return alert('Lỗi: Số điện thoại không hợp lệ');
        } else if (newUsername.length < 5) { 
            return alert('Lỗi: Độ dài tài khoản từ 5 ký tự trở lên');
        }

        const newUser = {
            fullname: newfullname,
            email: newEmail,
            phone: newPhone,
            address: newAddress,
            username: newUsername,
        };

        updateListUser(user.accessToken, dispatch, currentId, axiosJWT, newUser);
        setShowModal(false);
    };

    return (
        <div className="list-user-wrapper">
            <Admin />
            
            <div className="page-content">
                <div className="page-header">
                    <h3 className="page-title">Danh sách người dùng</h3>
                </div>

                <div className="table-card">
                    <table className="custom-table">
                        <thead>
                            {/* Đảm bảo có 6 cột tiêu đề */}
                            <tr>
                                <th style={{width: '20%'}}>Họ tên</th>
                                <th style={{width: '15%'}}>Tài khoản</th>
                                <th style={{width: '15%'}}>Số điện thoại</th>
                                <th style={{width: '20%'}}>Email</th>
                                <th style={{width: '20%'}}>Địa chỉ</th>
                                <th style={{width: '10%'}}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listUser?.map((item) => {
                                if (item.admin) return null;
                                return (
                                    <tr key={item._id}>
                                        {/* Cột 1: Họ tên */}
                                        <td className="name-cell">
                                            <UserIcon className="user-icon-sm" />
                                            <span>{item.fullname}</span>
                                        </td>

                                        {/* Cột 2: Tài khoản (Đã tách riêng ra đây) */}
                                        <td>
                                            <span className="username-badge">
                                                {item.username}
                                            </span>
                                        </td>

                                        {/* Cột 3: SĐT */}
                                        <td>{item.phone}</td>

                                        {/* Cột 4: Email */}
                                        <td>{item.email}</td>

                                        {/* Cột 5: Địa chỉ */}
                                        <td className="address-cell" title={item.address}>
                                            {item.address}
                                        </td>

                                        {/* Cột 6: Hành động */}
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon edit" onClick={() => handleShowEdit(item)}>
                                                    <PencilSquareIcon />
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(item._id)}>
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* --- MODAL EDIT --- */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <div className="modal-header">
                                <h3>Chỉnh sửa thông tin</h3>
                                <button onClick={handleCloseModal}><XMarkIcon className="icon-close"/></button>
                            </div>
                            <div className="modal-body">
                                <div className="info-grid">
                                    <div className="info-group">
                                        <label>Họ và tên</label>
                                        <input type="text" value={newfullname} onChange={(e) => setNewFullname(e.target.value)} />
                                    </div>
                                    <div className="info-group">
                                        <label>Tài khoản</label>
                                        <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                                    </div>
                                    <div className="info-group">
                                        <label>Email</label>
                                        <input type="text" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                                    </div>
                                    <div className="info-group">
                                        <label>Số điện thoại</label>
                                        <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                                    </div>
                                    <div className="info-group span-2">
                                        <label>Địa chỉ</label>
                                        <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={handleCloseModal}>Hủy bỏ</button>
                                <button className="btn-save" onClick={handleEdit}>Lưu thay đổi</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListUsers;