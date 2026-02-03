import React, { useState, useMemo } from 'react';
import './CustomerService.scss';
// import logo from '../../../assets/imgs/logo.png'; 

// --- COMPONENTS CƠ BẢN (KHÔNG ĐỔI) ---
const features = [
    { id: 1, title: 'Câu hỏi về dinh dưỡng', desc: 'Giải đáp thắc mắc thường gặp'},
    { id: 2, title: 'Tư vấn sản phẩm', desc: 'Tìm sản phẩm phù hợp cho bé'},
    { id: 3, title: 'Kiến thức chuyên gia', desc: 'Lời khuyên từ chuyên gia dinh dưỡng'},
    { id: 4, title: 'Liên hệ chuyên gia', desc: 'Trò chuyện với đội ngũ của chúng tôi'}
];

// --- CẬP NHẬT: THÊM CÂU HỎI MỚI VÀO MẢNG faqs ---
const faqs = [
    'Thành phần dinh dưỡng trong sản phẩm có gì nổi bật?',
    'Bé nhà tôi bị dị ứng đạm sữa bò, có sản phẩm nào phù hợp không?',
    'Tôi nên sử dụng sản phẩm cho bé như thế nào để đạt hiệu quả tốt nhất?',
    'Làm sao để được chuyên gia dinh dưỡng của BabeFoods tư vấn?',
    // --- CÂU HỎI MỚI ĐƯỢC THÊM ---
    'Sản phẩm của BabeFoods có giúp bé cải thiện tình trạng táo bón không?',
    'Bao lâu thì bé nhà tôi sẽ thấy hiệu quả khi sử dụng sản phẩm?',
    'Tôi có thể tìm thấy danh sách đầy đủ các sản phẩm ở đâu?',
];

// --- CẬP NHẬT: THÊM CÂU TRẢ LỜI TƯƠNG ỨNG VÀO MẢNG faqAnswers ---
const faqAnswers = [
    'Các sản phẩm của BabeFoods đều được nghiên cứu và phát triển bởi đội ngũ chuyên gia dinh dưỡng hàng đầu, tập trung vào các thành phần quan trọng như DHA/ARA, Probiotics, Nucleotides, và các vitamin/khoáng chất thiết yếu khác, giúp hỗ trợ tối ưu sự phát triển toàn diện của bé về cả trí não, thị giác và hệ miễn dịch.',
    'Chúng tôi có dòng sản phẩm **BabeHypo-Allergenic** được thiết kế đặc biệt cho trẻ bị dị ứng đạm sữa bò. Sản phẩm này chứa đạm thủy phân một phần hoặc đạm thực vật, giúp giảm thiểu tối đa nguy cơ gây dị ứng. Vui lòng liên hệ Hotline (1900-6868) để được chuyên gia tư vấn cụ thể về sản phẩm phù hợp nhất với tình trạng của bé.',
    'Để đạt hiệu quả tốt nhất, bạn nên tuân thủ nghiêm ngặt theo hướng dẫn pha chế và liều lượng in trên bao bì. Điều quan trọng là phải đảm bảo vệ sinh dụng cụ sạch sẽ và sử dụng nước ấm đúng nhiệt độ khuyến nghị. Không nên tự ý tăng hoặc giảm liều lượng mà không có ý kiến của chuyên gia y tế.',
    'Bạn có thể liên hệ với chúng tôi qua các kênh sau: 1) Gọi trực tiếp đến Hotline **1900-6868** (Thứ 2 - CN, 8h - 20h). 2) Gửi câu hỏi chi tiết qua mục **"Hộp thư chuyên gia"** (chúng tôi sẽ phản hồi qua email). 3) Bấm **"Bắt đầu trò chuyện"** để được hỗ trợ trực tuyến ngay lập tức.',
    // --- CÂU TRẢ LỜI MỚI TƯƠNG ỨNG ---
    'Nhiều sản phẩm của chúng tôi được bổ sung chất xơ hòa tan (FOS/GOS) và chủng lợi khuẩn Probiotics (như Bifidobacterium), giúp cân bằng hệ vi sinh đường ruột và làm mềm phân, từ đó hỗ trợ cải thiện rõ rệt tình trạng táo bón ở trẻ. Tuy nhiên, nếu tình trạng không thuyên giảm, bạn nên tham khảo ý kiến bác sĩ nhi khoa.',
    'Hiệu quả sản phẩm có thể khác nhau tùy thuộc vào cơ địa và tình trạng dinh dưỡng ban đầu của bé. Thông thường, bạn sẽ bắt đầu thấy sự thay đổi tích cực về tiêu hóa và giấc ngủ sau khoảng **2-4 tuần** sử dụng liên tục và đúng liều lượng.',
    'Bạn có thể xem toàn bộ danh mục sản phẩm, thông tin chi tiết về thành phần, và giá bán tại trang **Sản phẩm chính thức** trên website của chúng tôi (www.babefoods.com/products). Hoặc yêu cầu tư vấn sản phẩm cụ thể qua Hotline.',
];

const footerData = {
    sanPham: ['Sữa công thức', 'Bột ăn dặm', 'Vitamin & Khoáng chất'],
    veChungToi: ['Câu chuyện BabeFoods', 'Đội ngũ chuyên gia', 'Báo chí'],
    hoTro: ['Câu hỏi thường gặp', 'Liên hệ', 'Chính sách giao hàng', 'Chính sách đổi trả']
};

// --- COMPONENT MODAL MỚI (KHÔNG ĐỔI) ---
const ContactModal = ({ isOpen, type, onClose }) => {
    if (!isOpen) return null;

    let title = '';
    let content = null;

    if (type === 'mail') {
        title = 'Gửi Câu Hỏi Đến Chuyên Gia';
        content = (
            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); alert('Đã gửi câu hỏi!'); onClose(); }}>
                <p>Chúng tôi sẽ phản hồi qua email trong vòng 24 giờ làm việc.</p>
                <input type="text" placeholder="Họ và tên của bạn" required />
                <input type="email" placeholder="Địa chỉ Email" required />
                <textarea rows="4" placeholder="Nhập câu hỏi chi tiết về dinh dưỡng của bé..." required></textarea>
                <button type="submit" className="cs-primary">Gửi Ngay</button>
            </form>
        );
    } else if (type === 'chat') {
        title = 'Trò Chuyện Trực Tuyến';
        content = (
            <div className="modal-chat">
                <p>Chào mừng bạn đến với Chat Trực Tuyến BabeFoods. Vui lòng điền thông tin để bắt đầu trò chuyện với chuyên gia dinh dưỡng.</p>
                <input type="text" placeholder="Họ và tên (Ví dụ: Mẹ bé An)" required />
                <input type="tel" placeholder="Số điện thoại liên hệ" required />
                <button className="cs-primary chat-start" onClick={() => { alert('Bắt đầu trò chuyện...'); onClose(); }}>Bắt Đầu Chat</button>
                <small className="chat-note">Thời gian hỗ trợ: 8h - 20h mỗi ngày.</small>
            </div>
        );
    } 

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h3>{title}</h3>
                {content}
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ĐÃ CẬP NHẬT LOGIC TÌM KIẾM ---
function CustomerService() {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);

    const handleOpenModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType(null);
    };
    
    // --- LOGIC XỬ LÝ TÌM KIẾM MỚI ---
    const filteredFaqs = useMemo(() => {
        if (!query) {
            // Nếu query rỗng, trả về toàn bộ FAQs
            // Ta tạo một mảng đối tượng kết quả, bao gồm câu hỏi (q), câu trả lời (a), và index gốc (originalIndex)
            return faqs.map((q, i) => ({ q, a: faqAnswers[i], originalIndex: i }));
        }

        const normalizedQuery = query.toLowerCase().trim();

        // Lọc và ánh xạ kết quả
        return faqs
            .map((q, i) => ({ q, a: faqAnswers[i], originalIndex: i }))
            .filter(item => 
                item.q.toLowerCase().includes(normalizedQuery) || // Tìm kiếm trong câu hỏi
                item.a.toLowerCase().includes(normalizedQuery)   // HOẶC tìm kiếm trong câu trả lời
            );
    }, [query]); 
    // --- KẾT THÚC LOGIC TÌM KIẾM ---

    // Cần phải reset trạng thái `open` (câu hỏi đang mở) khi `query` thay đổi
    // Tuy nhiên, việc này không cần thiết vì ta sẽ dùng `filteredFaqs` để render.

    return (
        <div className="cs-wrapper">
            <div className="cs-container">
                {/* HERO SECTION */}
                <section className="cs-hero">
                    <div className="cs-hero-inner">
                        <h1 className="cs-title">Dinh dưỡng cho bé, an tâm cho mẹ</h1>
                        <p className="cs-sub">BabeFoods thấu hiểu những băn khoăn của bạn. Chúng tôi ở đây để hỗ trợ bạn trên hành trình chăm sóc dinh dưỡng toàn diện cho bé yêu.</p>
                        
                        {/* INPUT SEARCH */}
                        <div className="cs-search">
                            <span className="search-icon"></span>
                            <input
                                type="search"
                                placeholder="Tìm kiếm câu hỏi về dinh dưỡng cho bé..."
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setOpen(null); // Đóng mọi câu hỏi đang mở khi tìm kiếm
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section className="cs-features">
                    <div className="cs-features-inner">
                        {features.map(f => (
                            <div className="cs-feature" key={f.id}>
                                <div className="cs-feature-icon">{f.icon}</div>
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQs SECTION - ĐÃ CẬP NHẬT ĐỂ SỬ DỤNG filteredFaqs */}
                <section className="cs-faqs">
                    <div className="cs-faqs-inner">
                        <h2 className="cs-section-title">
                            {query ? `Kết quả tìm kiếm cho: "${query}"` : 'Các câu hỏi thường gặp'}
                        </h2>

                        <div className="cs-faq-list">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((item, i) => (
                                    <div 
                                        // Sử dụng index của filteredFaqs cho key và trạng thái open
                                        className={`cs-faq-item ${open === i ? 'open' : ''}`} 
                                        key={item.originalIndex} 
                                        onClick={() => setOpen(open === i ? null : i)}
                                    >
                                        <div className="cs-faq-q">
                                            <span>{item.q}</span>
                                        </div>
                                        {/* Hiển thị câu trả lời nếu được mở */}
                                        <div className="cs-faq-a">{open === i ? item.a : null}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="cs-no-results">
                                    Không tìm thấy câu hỏi nào phù hợp với từ khóa **"{query}"**. Vui lòng thử từ khóa khác hoặc liên hệ trực tiếp với chuyên gia.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* CONTACT SECTION */}
                <section className="cs-contact">
                    <div className="cs-contact-inner">
                        <h2 className="cs-section-title">Cần chuyên gia tư vấn riêng cho bé?</h2>
                        <p className="cs-contact-sub">Đừng ngần ngại! Đội ngũ chuyên gia dinh dưỡng tận tâm của BabeFoods luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.</p>

                        <div className="cs-contact-cards">
                            <div className="cs-card phone">
                                <div className="cs-card-desc">Hotline Dinh dưỡng</div>
                                <div className="cs-card-big">1900-6868</div>
                                <p className="cs-card-time">Thứ 2 - CN, 8h - 20h</p>
                            </div>

                            <div className="cs-card mail">
                                <div className="cs-card-desc">Hộp thư chuyên gia</div>
                                <button className="cs-link" onClick={() => handleOpenModal('mail')}>Gửi câu hỏi của bạn</button>
                            </div>

                            <div className="cs-card chat">
                                <div className="cs-card-desc">Trò chuyện trực tuyến</div>
                                <button className="cs-primary" onClick={() => handleOpenModal('chat')}>Bắt đầu trò chuyện</button>
                                <p className="cs-card-time chat-status">Chat đang trực tuyến</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            
            {/* MODAL CỦA BẠN */}
            <ContactModal 
                isOpen={isModalOpen} 
                type={modalType} 
                onClose={handleCloseModal} 
            />
        </div>
    );
}

export default CustomerService;