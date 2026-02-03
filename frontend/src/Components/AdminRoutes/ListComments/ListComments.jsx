import './ListComments.scss';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAxios } from '../../../createInstance';
import { deleteComment, getAllComment, updateComment } from '../../../redux/apiRequest';
import { loginSuccess } from '../../../redux/authSlice';
import moment from 'moment';
import Admin from '../../Admin/Admin'; // GIỮ NGUYÊN IMPORT ADMIN CŨ CỦA BẠN

// Import Heroicons
import { 
    PencilSquareIcon, 
    TrashIcon, 
    XMarkIcon 
} from '@heroicons/react/24/outline';

function ListComments() {
    const user = useSelector((state) => state.auth.login?.currentUser);
    const listComments = useSelector((state) => state.users.users?.allComments);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let axiosJWT = createAxios(user, dispatch, loginSuccess);

    const [showModal, setShowModal] = useState(false);
    const [idComment, setIdComment] = useState();
    const [currentUser, setCurrentUser] = useState();
    const [currentProduct, setCurrentProduct] = useState();
    const [rating, setRating] = useState();
    const [comment, setComment] = useState('');
    const [reComment, setReComment] = useState('');
    const [dateComment, setDateComment] = useState(Date);

    useEffect(() => {
        if (!user?.admin) {
            navigate('/');
        }
        if (user?.accessToken) {
            getAllComment(dispatch);
        }
    }, []);

    const handleDelete = (id) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")){
            deleteComment(id, dispatch, axiosJWT);
        }
    };

    const handleShowEdit = (item) => {
        setIdComment(item._id);
        setCurrentUser(item.user);
        setCurrentProduct(item.currentProduct);
        setRating(item.rating);
        setComment(item.comment);
        setReComment(item.reComment || '');
        setDateComment(item.dateComment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setReComment('');
    };

    const handleEdit = () => {
        if (reComment === '') {
            alert('Lỗi: Không được để trống nội dung phản hồi');
            return;
        }
        const dateReComment = new Date();
        const commentAdmin = {
            user: currentUser,
            rating: rating,
            comment: comment,
            reComment: reComment,
            dateComment: dateComment,
            dateReComment: dateReComment,
            currentProduct: currentProduct,
        };
        updateComment(idComment, commentAdmin, axiosJWT, dispatch);
        setShowModal(false);
    };

    function reFormatDate(date) {
        return moment(date).format('DD/MM/YYYY HH:mm');
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="list-comment-wrapper">
            {/* --- 1. NHÚNG SIDEBAR VÀO ĐÂY ĐỂ KHÔNG BỊ MẤT MENU --- */}
            <Admin /> 

            {/* --- 2. NỘI DUNG CHÍNH (Sẽ đẩy sang phải bằng CSS) --- */}
            <div className="page-content">
                <div className="page-header">
                    <h2 className="page-title">Quản lý đánh giá & Bình luận</h2>
                </div>

                <div className="table-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ngày gửi</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm</th>
                                <th>Nội dung</th>
                                <th>Phản hồi</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listComments?.map((item) => {
                                if (item.admin) return null;
                                return (
                                    <tr key={item._id}>
                                        <td className="text-grey">#{item._id.slice(-6)}</td>
                                        <td>{reFormatDate(item.dateComment)}</td>
                                        <td>
                                            <div className="user-cell">
                                                <span className="name">{item.user?.fullname || 'Ẩn danh'}</span>
                                                <span className="sub-text">{item.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="product-name">{item.currentProduct?.title || 'Sản phẩm...'}</td>
                                        <td>
                                            <div className="comment-content">
                                                <span className="star">★ {item.rating}</span>
                                                <span>{item.comment}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {item.reComment ? 
                                                <span className="badge-replied">Đã trả lời</span> : 
                                                <span className="badge-pending">Chưa trả lời</span>
                                            }
                                        </td>
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

                {/* --- MODAL --- */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <div className="modal-header">
                                <h3>Phản hồi đánh giá</h3>
                                <button onClick={handleCloseModal}><XMarkIcon className="icon-close"/></button>
                            </div>
                            <div className="modal-body">
                                <div className="info-grid">
                                    <div className="info-group">
                                        <label>Khách hàng</label>
                                        <input type="text" value={currentUser?.fullname} readOnly />
                                    </div>
                                    <div className="info-group">
                                        <label>Sản phẩm</label>
                                        <input type="text" value={currentProduct?.description || currentProduct?.title} readOnly />
                                    </div>
                                    <div className="info-group">
                                        <label>Giá</label>
                                        <input type="text" value={formatPrice(currentProduct?.price)} readOnly />
                                    </div>
                                    <div className="info-group">
                                        <label>Đánh giá của khách</label>
                                        <div className="user-review">
                                            <span className="rating">★ {rating}</span>
                                            <p>{comment}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="reply-section">
                                    <label>Nội dung phản hồi</label>
                                    <textarea 
                                        rows="4"
                                        value={reComment}
                                        onChange={(e) => setReComment(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={handleCloseModal}>Hủy bỏ</button>
                                <button className="btn-save" onClick={handleEdit}>Gửi phản hồi</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListComments;