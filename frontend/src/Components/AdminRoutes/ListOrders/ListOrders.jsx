import './ListOrders.scss';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Admin from '../../Admin/Admin';
import { deleteOrder, getAllOrders, updateOrder } from '../../../redux/apiRequest';
import { createAxios } from '../../../createInstance';
import { loginSuccess } from '../../../redux/authSlice';
import moment from 'moment';

// Import Icons
import { 
    PencilSquareIcon, 
    TrashIcon, 
    XMarkIcon,
    EyeIcon 
} from '@heroicons/react/24/outline';

function ListOrders() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.login?.currentUser);
    const listOrder = useSelector((state) => state.users.users?.allListOrders);
    let axiosJWT = createAxios(user, dispatch, loginSuccess);

    // State quản lý Modal
    const [showModal, setShowModal] = useState(false);

    // State dữ liệu form
    const [orderId, setOrderId] = useState(null);
    const [total, setTotal] = useState('');
    const [currentUser, setCurrentUser] = useState({ fullname: '', address: '', phone: '', email: '' });
    const [currentProduct, setCurrentProduct] = useState([]);
    const [tradingCode, setTradingCode] = useState('');
    const [dateCreate, setDateCreate] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [paymentMethods, setPaymentMethods] = useState('');
    const [orderStatus, setOrderStatus] = useState('');

    useEffect(() => {
        if (!user?.admin) navigate('/');
        if (user?.accessToken) getAllOrders(dispatch, axiosJWT, user.accessToken);
    }, []);

    // Format Date helper
    const formatDate = (date) => moment(date).format('YYYY-MM-DD');
    const formatDisplayDate = (date) => moment(date).format('DD/MM/YYYY');
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Logic hiển thị trạng thái
    const getStatusBadge = (item) => {
        if (!item.isPayment) return <span className="badge-pending">Chờ Xác Nhận</span>;
        if (!item.istransported) return <span className="badge-shipping">Đang Giao</span>;
        if (item.isSuccess) return <span className="badge-success">Đã Giao</span>;
        return <span className="badge-cancel">Đã Hủy</span>;
    };

    // Mở Modal Edit
    const handleShowEdit = (order) => {
        setOrderId(order._id);
        setTotal(order.total);
        setCurrentUser(order.user);
        setCurrentProduct(order.listproduct || []);
        setTradingCode(order.tradingCode);
        setDateCreate(formatDate(order.dateCreate));
        setDateEnd(formatDate(order.dateEnd));
        setPaymentMethods(order.paymentMethods);

        // Logic xác định trạng thái ban đầu cho Select box
        if (!order.isPayment) setOrderStatus('1');
        else if (!order.istransported) setOrderStatus('2');
        else if (order.isSuccess) setOrderStatus('3');
        else setOrderStatus('4');

        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleEditOrder = () => {
        // Validation logic cũ của bạn
        const subscription = currentUser.phone[0] + currentUser.phone[1];
        if (!currentUser.fullname) return alert('Không được để trống tên khách hàng');
        if (!currentUser.address) return alert('Không được để trống địa chỉ giao hàng');
        if (currentUser.phone.length < 10 || currentUser.phone.length > 11) return alert('Số điện thoại không hợp lệ');
        if (!['03', '05', '07', '08', '09'].includes(subscription)) return alert('Đầu số không hợp lệ'); 
        
        const orders = {
            total: total,
            user: currentUser,
            tradingCode: tradingCode,
            dateCreate: dateCreate,
            dateEnd: dateEnd,
            paymentMethods: paymentMethods === '1' ? 'offline' : 'online',
            isPayment: orderStatus !== '1',
            istransported: orderStatus !== '1' && orderStatus !== '2',
            isSuccess: orderStatus === '3',
        };
        updateOrder(orderId, orders, axiosJWT, dispatch);
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
            deleteOrder(dispatch, id, axiosJWT);
        }
    };

    return (
        <div className="list-order-wrapper">
            <Admin />
            <div className="page-content">
                <div className="page-header">
                    <h3 className="page-title">Danh sách đơn hàng</h3>
                </div>
                <div className="table-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Tổng tiền</th>
                                <th>Ngày đặt</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listOrder?.map((item) => (
                                <tr key={item._id}>
                                    <td className="text-grey" title={item._id}>#{item._id.slice(-6)}</td>
                                    <td>
                                        <div className="user-cell">
                                            <span className="name">{item.user?.fullname}</span>
                                            <span className="sub-text">{item.user?.phone}</span>
                                        </div>
                                    </td>
                                    <td style={{fontWeight: 'bold', color: '#EC4899'}}>{formatCurrency(item.total)}</td>
                                    <td>{formatDisplayDate(item.dateCreate)}</td>
                                    <td>
                                        {item.paymentMethods === 'offline' 
                                            ? <span className="badge-cod">COD</span> 
                                            : <span className="badge-online">Online</span>}
                                    </td>
                                    <td>{getStatusBadge(item)}</td>
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- MODAL EDIT --- */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <div className="modal-header">
                                <h3>Chỉnh sửa đơn hàng</h3>
                                <button onClick={handleCloseModal}><XMarkIcon className="icon-close"/></button>
                            </div>
                            
                            <div className="modal-body">
                                <div className="info-grid">
                                    {/* Cột 1: Thông tin khách */}
                                    <div className="section-title">Thông tin khách hàng</div>
                                    <div className="info-group">
                                        <label>Tên khách hàng</label>
                                        <input type="text" value={currentUser.fullname} 
                                            onChange={(e) => setCurrentUser({ ...currentUser, fullname: e.target.value })} />
                                    </div>
                                    <div className="info-group">
                                        <label>Số điện thoại</label>
                                        <input type="number" value={currentUser.phone} 
                                            onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })} />
                                    </div>
                                    <div className="info-group span-2">
                                        <label>Địa chỉ</label>
                                        <input type="text" value={currentUser.address} 
                                            onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })} />
                                    </div>

                                    {/* Cột 2: Thông tin đơn */}
                                    <div className="section-title">Thông tin đơn hàng</div>
                                    <div className="info-group">
                                        <label>Ngày đặt</label>
                                        <input type="date" value={dateCreate} 
                                            onChange={(e) => setDateCreate(e.target.value)} />
                                    </div>
                                    <div className="info-group">
                                        <label>Ngày giao dự kiến</label>
                                        <input type="date" value={dateEnd} 
                                            onChange={(e) => setDateEnd(e.target.value)} />
                                    </div>
                                    <div className="info-group">
                                        <label>Thanh toán</label>
                                        <select value={paymentMethods === 'offline' ? '1' : '2'} onChange={(e) => setPaymentMethods(e.target.value)}>
                                            <option value="1">Thanh toán khi nhận hàng (COD)</option>
                                            <option value="2">Thanh toán Online</option>
                                        </select>
                                    </div>
                                    <div className="info-group">
                                        <label>Trạng thái</label>
                                        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                                            <option value="1">Chờ Xác Nhận</option>
                                            <option value="2">Đang Giao</option>
                                            <option value="3">Đã Giao Thành Công</option>
                                            <option value="4">Đã Hủy</option>
                                        </select>
                                    </div>

                                    {/* Danh sách sản phẩm trong Modal */}
                                    <div className="product-list-container span-2">
                                        <label>Sản phẩm đã đặt</label>
                                        <table className="modal-table">
                                            <thead>
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>SL</th>
                                                    <th>Đơn giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentProduct.map((prod, index) => (
                                                    <tr key={index}>
                                                        <td>{prod.description || prod.title}</td>
                                                        <td>x{prod.count}</td>
                                                        <td>{formatCurrency(prod.price)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="total-row">
                                                    <td colSpan="2">Tổng cộng</td>
                                                    <td>{formatCurrency(total)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={handleCloseModal}>Hủy bỏ</button>
                                <button className="btn-save" onClick={handleEditOrder}>Lưu thay đổi</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListOrders;