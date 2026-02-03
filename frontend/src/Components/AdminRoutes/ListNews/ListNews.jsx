import './ListNews.scss';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Admin from '../../Admin/Admin';
import { createNew, deleteNew, getAllNews, updateNew } from '../../../redux/apiRequest';
import moment from 'moment';

// Thay thế FontAwesome bằng Heroicons cho đồng bộ
import { 
    PencilSquareIcon, 
    TrashIcon, 
    PlusIcon, 
    XMarkIcon,
    NewspaperIcon 
} from '@heroicons/react/24/outline';

function ListNews() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.login?.currentUser);
    const listNew = useSelector((state) => state.users.users?.allNews);

    // State Modal
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [actionType, setActionType] = useState(''); // 'ADD' hoặc 'EDIT'

    // State Form Data
    const [currentId, setCurrentId] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [titlePhoto, setTitlePhotor] = useState('');
    const [eyes, setEyes] = useState(0);
    const [subTitle, setSubTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (!user?.admin) navigate('/');
        if (user?.accessToken) getAllNews(dispatch);
        // eslint-disable-next-line
    }, []);

    // --- HANDLERS ---
    const handleShowProduct = () => {
        // Reset form
        setCurrentId('');
        setAuthor(user?.fullname || 'Admin'); // Tự động điền tên admin
        setCategory('');
        setTitle('');
        setTitlePhotor('');
        setEyes(0);
        setSubTitle('');
        setContent('');
        
        setModalTitle('Thêm bài viết mới');
        setActionType('ADD');
        setShowModal(true);
    };

    const handleShowEdit = (item) => {
        setCurrentId(item._id);
        setAuthor(item.author);
        setCategory(item.category);
        setTitle(item.title);
        setTitlePhotor(item.titlePhoto);
        setEyes(item.eyes);
        setSubTitle(item.subTitle);
        setContent(item.content);

        setModalTitle('Chỉnh sửa bài viết');
        setActionType('EDIT');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")){
            deleteNew(id, dispatch);
        }
    };

    const handleSave = () => {
        // Validation
        if (!title.trim() || !content.trim() || !category.trim()) {
            return alert('Vui lòng nhập Tiêu đề, Danh mục và Nội dung!');
        }

        const date = new Date();
        const newNew = {
            author,
            category,
            title,
            titlePhoto,
            subTitle,
            eyes,
            content,
            dateUpdate: date,
        };

        if (actionType === 'ADD') {
            createNew({ ...newNew, dateCreate: date }, dispatch);
        } else {
            updateNew(currentId, newNew, dispatch);
        }
        setShowModal(false);
    };

    // Helper format date
    const reFormatDate = (date) => moment(date).format('DD/MM/YYYY');

    return (
        <div className="list-news-wrapper">
            <Admin />
            
            <div className="page-content">
                <div className="page-header">
                    <h3 className="page-title">Quản lý Tin tức</h3>
                </div>

                {/* Nút Thêm Mới nằm trên bảng */}
                <div className="actions-bar">
                    <button className="btn-add" onClick={handleShowProduct}>
                        <PlusIcon className="icon" /> Thêm bài viết
                    </button>
                </div>

                <div className="table-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Hình ảnh</th>
                                <th>Tiêu đề</th>
                                <th>Danh mục</th>
                                <th>Lượt xem</th>
                                <th>Tác giả</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listNew?.map((item) => (
                                <tr key={item._id}>
                                    <td>
                                        <div className="img-wrapper">
                                            <img src={item.titlePhoto || 'https://via.placeholder.com/150'} alt="thumbnail" />
                                        </div>
                                    </td>
                                    <td className="title-cell" title={item.title}>{item.title}</td>
                                    <td><span className="badge-category">{item.category}</span></td>
                                    <td>{item.eyes}</td>
                                    <td>{item.author}</td>
                                    <td>{reFormatDate(item.dateCreate)}</td>
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

                {/* --- MODAL --- */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <div className="modal-header">
                                <h3>{modalTitle}</h3>
                                <button onClick={handleCloseModal}><XMarkIcon className="icon-close"/></button>
                            </div>
                            
                            <div className="modal-body">
                                <div className="info-grid">
                                    <div className="info-group span-2">
                                        <label>Tiêu đề bài viết</label>
                                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề..." />
                                    </div>
                                    
                                    <div className="info-group">
                                        <label>Danh mục</label>
                                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ví dụ: Sức khỏe, Mẹo vặt..." />
                                    </div>
                                    
                                    <div className="info-group">
                                        <label>Tác giả</label>
                                        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
                                    </div>

                                    <div className="info-group span-2">
                                        <label>Link Ảnh mô tả (URL)</label>
                                        <input type="text" value={titlePhoto} onChange={(e) => setTitlePhotor(e.target.value)} placeholder="https://..." />
                                    </div>

                                    <div className="info-group span-2">
                                        <label>Tiêu đề phụ (Mô tả ngắn)</label>
                                        <textarea className="short-area" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="Mô tả ngắn gọn..." />
                                    </div>

                                    <div className="info-group span-2">
                                        <label>Nội dung bài viết</label>
                                        <textarea className="long-area" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nội dung chi tiết..." />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={handleCloseModal}>Hủy bỏ</button>
                                <button className="btn-save" onClick={handleSave}>
                                    {actionType === 'ADD' ? 'Thêm mới' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListNews;