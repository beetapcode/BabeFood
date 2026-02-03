import './ListProducts.scss';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Admin from '../../Admin/Admin';
import { createProduct, deleteProduct, getAllProducts, updateProduct } from '../../../redux/apiRequest';
import { createAxios } from '../../../createInstance';
import { loginSuccess } from '../../../redux/authSlice';

// Import Heroicons
import { 
    PencilSquareIcon, 
    TrashIcon, 
    PlusIcon, 
    XMarkIcon 
} from '@heroicons/react/24/outline';

function ListProducts() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.login?.currentUser);
    const listProduct = useSelector((state) => state.users.users?.allProducts);
    
    let axiosJWT = createAxios(user, dispatch, loginSuccess);

    // State Modal
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [actionType, setActionType] = useState(''); // 'ADD' or 'EDIT'

    // State Form Data
    const [newName, setNewName] = useState('');
    const [newAvatar, setNewAvatar] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newNumber, setNewNumber] = useState(0);
    const [newPrice, setNewPrice] = useState(0);
    const [newCost, setNewCost] = useState(0);
    const [newPercent, setNewPercent] = useState(0);
    const [newWeight, setNewWeight] = useState('');
    const [newBrandOrigin, setBrandOrigin] = useState('');
    const [newMadeIn, setNewMadeIn] = useState('');
    const [newProducer, setNewProducer] = useState('');
    const [newAppropriateAge, setNewAppropriateAge] = useState('');
    const [newUserManual, setNewUserManual] = useState('');
    const [newStorageInstructions, setNewStorageInstructions] = useState('');
    const [currentId, setCurrentId] = useState('');

    useEffect(() => {
        if (!user?.admin) navigate('/');
        if (user?.accessToken) getAllProducts(dispatch);
        // eslint-disable-next-line
    }, []);

    // --- HANDLERS ---
    const handleShowProduct = () => {
        // Reset Form
        setNewName('');
        setNewAvatar('');
        setNewDescription('');
        setNewNumber(0);
        setNewPrice(0);
        setNewCost(0);
        setNewPercent(0);
        setBrandOrigin('');
        setNewMadeIn('');
        setNewProducer('');
        setNewAppropriateAge('');
        setNewUserManual('');
        setNewStorageInstructions('');
        setNewWeight('');
        setCurrentId('');

        setModalTitle('Thêm sản phẩm mới');
        setActionType('ADD');
        setShowModal(true);
    };

    const handleShowEdit = (item) => {
        setNewName(item.name);
        setNewAvatar(item.product.avatar);
        setNewDescription(item.product.description);
        setNewNumber(item.product.number);
        setNewPrice(item.product.price);
        setNewCost(item.product.cost);
        setNewPercent(item.product.percent);
        setBrandOrigin(item.product.brandOrigin);
        setNewMadeIn(item.product.madeIn);
        setNewProducer(item.product.producer);
        setNewAppropriateAge(item.product.appropriateAge);
        setNewUserManual(item.product.userManual);
        setNewStorageInstructions(item.product.storageInstructions);
        setNewWeight(item.product.weight);
        setCurrentId(item._id);

        setModalTitle('Chỉnh sửa sản phẩm');
        setActionType('EDIT');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if(window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")){
            deleteProduct(user.accessToken, dispatch, id, axiosJWT);
        }
    };

    const handleSave = () => {
        // Validation
        if (!newName || !newDescription || !newAvatar || !newWeight) {
            return alert('Vui lòng điền đầy đủ thông tin cơ bản (Tên, Mô tả, Ảnh, Khối lượng)');
        }
        if (newPrice < 0 || newCost < 0 || newNumber < 0 || newPercent < 0) {
            return alert('Giá và Số lượng phải lớn hơn hoặc bằng 0');
        }

        const newProduct = {
            name: newName,
            product: {
                description: newDescription,
                avatar: newAvatar,
                number: newNumber,
                price: newPrice,
                cost: newCost,
                percent: newPercent,
                brandOrigin: newBrandOrigin,
                madeIn: newMadeIn,
                producer: newProducer,
                appropriateAge: newAppropriateAge,
                userManual: newUserManual,
                storageInstructions: newStorageInstructions,
                weight: newWeight,
            },
        };

        if (actionType === 'ADD') {
            createProduct(dispatch, newProduct);
        } else {
            updateProduct(user.accessToken, newProduct, currentId, axiosJWT, dispatch);
        }
        setShowModal(false);
    };

    // Helper format currency
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    return (
        <div className="list-product-wrapper">
            <Admin />
            
            <div className="page-content">
                <div className="page-header">
                    <h3 className="page-title">Danh sách sản phẩm</h3>
                </div>

                <div className="actions-bar">
                    <button className="btn-add" onClick={handleShowProduct}>
                        <PlusIcon className="icon" /> Thêm sản phẩm
                    </button>
                </div>

                <div className="table-card">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Hãng</th>
                                <th className='hinhanh'>Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Giá ưu đãi</th>
                                <th>Giá gốc</th>
                                <th>Khối lượng</th>
                                <th>Tồn kho</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listProduct?.map((item) => (
                                <tr key={item._id}>
                                    <td><span className="badge-brand">{item.name}</span></td>
                                    <td>
                                        <div className="img-wrapper">
                                            <img src={item.product.avatar} alt="product" />
                                        </div>
                                    </td>
                                    <td className="desc-cell" title={item.product.description}>{item.product.description}</td>
                                    <td style={{color: '#EC4899', fontWeight: 'bold'}}>{formatCurrency(item.product.price)}</td>
                                    <td style={{textDecoration: 'line-through', color: '#9CA3AF'}}>{formatCurrency(item.product.cost)}</td>
                                    <td>{item.product.weight}</td>
                                    <td>{item.product.number}</td>
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

                {/* --- MODAL FORM --- */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-box">
                            <div className="modal-header">
                                <h3>{modalTitle}</h3>
                                <button onClick={handleCloseModal}><XMarkIcon className="icon-close"/></button>
                            </div>
                            
                            <div className="modal-body">
                                <div className="info-grid">
                                    {/* Cột Trái */}
                                    <div className="col-left">
                                        <div className="info-group">
                                            <label>Hãng sản xuất</label>
                                            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ví dụ: Vinamilk" />
                                        </div>
                                        <div className="info-group">
                                            <label>Tên sản phẩm</label>
                                            <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Tên đầy đủ..." />
                                        </div>
                                        <div className="info-group">
                                            <label>Link Hình ảnh</label>
                                            <input type="text" value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)} placeholder="https://..." />
                                        </div>
                                        
                                        <div className="row-2">
                                            <div className="info-group">
                                                <label>Giá ưu đãi</label>
                                                <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} min={0} />
                                            </div>
                                            <div className="info-group">
                                                <label>Giá gốc</label>
                                                <input type="number" value={newCost} onChange={(e) => setNewCost(e.target.value)} min={0} />
                                            </div>
                                        </div>

                                        <div className="row-2">
                                            <div className="info-group">
                                                <label>Số lượng</label>
                                                <input type="number" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} min={0} />
                                            </div>
                                            <div className="info-group">
                                                <label>Giảm giá (%)</label>
                                                <input type="number" value={newPercent} onChange={(e) => setNewPercent(e.target.value)} min={0} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cột Phải (Thông tin chi tiết) */}
                                    <div className="col-right">
                                        <div className="info-group">
                                            <label>Xuất xứ thương hiệu</label>
                                            <input type="text" value={newBrandOrigin} onChange={(e) => setBrandOrigin(e.target.value)} />
                                        </div>
                                        <div className="info-group">
                                            <label>Sản xuất tại</label>
                                            <input type="text" value={newMadeIn} onChange={(e) => setNewMadeIn(e.target.value)} />
                                        </div>
                                        <div className="info-group">
                                            <label>Nhà sản xuất</label>
                                            <input type="text" value={newProducer} onChange={(e) => setNewProducer(e.target.value)} />
                                        </div>
                                        <div className="row-2">
                                            <div className="info-group">
                                                <label>Khối lượng</label>
                                                <input type="text" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
                                            </div>
                                            <div className="info-group">
                                                <label>Độ tuổi</label>
                                                <input type="text" value={newAppropriateAge} onChange={(e) => setNewAppropriateAge(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="info-group">
                                            <label>Hướng dẫn sử dụng</label>
                                            <input type="text" value={newUserManual} onChange={(e) => setNewUserManual(e.target.value)} />
                                        </div>
                                        <div className="info-group">
                                            <label>Hướng dẫn bảo quản</label>
                                            <input type="text" value={newStorageInstructions} onChange={(e) => setNewStorageInstructions(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn-cancel" onClick={handleCloseModal}>Hủy bỏ</button>
                                <button className="btn-save" onClick={handleSave}>
                                    {actionType === 'ADD' ? 'Thêm sản phẩm' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListProducts;