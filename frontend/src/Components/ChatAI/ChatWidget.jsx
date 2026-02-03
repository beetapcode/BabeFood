import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendCurrentProduct } from '../../redux/apiRequest';
import chatbotIcon from '../../assets/imgs/chatbot.png';
import brushIcon from '../../assets/imgs/brush.png';
import './ChatWidget.scss';

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [preloading, setPreloading] = useState(false);

    // Khóa lưu trữ cuộc trò chuyện
    const STORAGE_KEY_PREFIX = 'ai_chat_';
    const getStorage = (k) => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + k));
        } catch (e) {
            return null;
        }
    };
    const setStorage = (k, v) => {
        try {
            localStorage.setItem(STORAGE_KEY_PREFIX + k, JSON.stringify(v));
        } catch (e) {
            // bỏ qua
        }
    };

    // conversationId được lưu trữ để chỉ gửi danh mục một lần cho mỗi cuộc trò chuyện
    const [conversationId, setConversationId] = useState(() => {
        const existing = localStorage.getItem(STORAGE_KEY_PREFIX + 'conversation_id');
        if (existing) return existing;
        const id = `conv-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        try { localStorage.setItem(STORAGE_KEY_PREFIX + 'conversation_id', id); } catch (e) {}
        return id;
    });

    const apiBase = process.env.REACT_APP_URL_API_KIDSNUTTIONS_DEVELOP || 'http://localhost:8000/v1';
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Tải trạng thái mở đã lưu khi gắn kết
    useEffect(() => {
        const savedOpen = getStorage('open');
        const savedMessages = getStorage('messages'); // Đồng thời tải tin nhắn để kiểm tra xem cuộc trò chuyện có trống không
        if (typeof savedOpen === 'boolean') {
            setOpen(savedOpen);
        }
        if (Array.isArray(savedMessages)) {
            setMessages(savedMessages);
        }
    }, []);

    // Tải trước danh mục khi cuộc trò chuyện mở (nếu chưa được gửi cho cuộc trò chuyện này)
    const preloadCatalog = async () => {
        if (!conversationId) return;
        const catalogSentKey = `${STORAGE_KEY_PREFIX}catalog_sent_${conversationId}`;
        if (localStorage.getItem(catalogSentKey) === 'true') return;
        if (preloading) return;
        setPreloading(true);
        try {
            await axios.post(`${apiBase}/ai/chat`, { suggestProducts: true, sendCatalog: true, conversationId, preloadOnly: true });
            localStorage.setItem(catalogSentKey, 'true');
        } catch (e) {
            // bỏ qua lỗi tải trước
        } finally {
            setPreloading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // lưu trữ tin nhắn
        setStorage('messages', messages);
    }, [messages]);

    useEffect(() => {
        // lưu trữ trạng thái mở
        setStorage('open', open);
    }, [open]);

    const sendMessage = async (suggestProducts = false) => {
        const text = input.trim();
        if (!text) return;
        const userMsg = { from: 'user', text };
        setMessages((m) => [...m, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // xác định có gửi toàn bộ danh mục cùng với yêu cầu này không
            const catalogSentKey = `${STORAGE_KEY_PREFIX}catalog_sent_${conversationId}`;
            const alreadySent = localStorage.getItem(catalogSentKey) === 'true';
            const sendCatalog = suggestProducts && !alreadySent; // chỉ gửi một lần cho mỗi cuộc trò chuyện

            const payload = {
                message: text,
                suggestProducts,
                sendCatalog,
                conversationId,
            };

            const res = await axios.post(`${apiBase}/ai/chat`, payload);
            if (res.data) {
                const botMsg = { from: 'bot', text: res.data.answer };
                // nối thêm tin nhắn của bot và sau đó là sản phẩm nếu có
                setMessages((m) => {
                    const next = [...m, botMsg];
                    if (res.data.products && Array.isArray(res.data.products) && res.data.products.length > 0) {
                        const productIntro = { from: 'bot', text: 'Gợi ý sản phẩm:' };
                        const productMsgs = res.data.products.map((p) => ({ from: 'product', product: p }));
                        return [...next, productIntro, ...productMsgs];
                    }
                    return next;
                });

                // đánh dấu danh mục đã được gửi cho cuộc trò chuyện này nếu máy chủ đã nhận được nó
                if (sendCatalog) {
                    localStorage.setItem(catalogSentKey, 'true');
                }
            }
        } catch (err) {
            setMessages((m) => [...m, { from: 'bot', text: 'Có lỗi khi gọi dịch vụ AI. Vui lòng thử lại sau.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(true);
        }
    };

    return (
        <div className={`chat-widget ${open ? 'open' : ''}`}>
            <div
                className="chat-toggle"
                onClick={async () => {
                    const willOpen = !open;
                    setOpen(willOpen);
                    if (willOpen) {
                        // Thêm tin nhắn chào mừng trong lần mở đầu tiên của một phiên
                        if (messages.length === 0) {
                            setMessages([
                                {
                                    from: 'bot',
                                    text: 'Xin chào! Tôi là trợ lý dinh dưỡng cho bé. Bạn cần tư vấn về vấn đề gì ạ?',
                                },
                            ]);
                        }
                        // tự động tải trước danh mục khi mở
                        try {
                            await preloadCatalog();
                        } catch (e) {
                            // bỏ qua
                        }
                    }
                }}
                role="button"
            >
                <img src={chatbotIcon} alt="Chat AI" />
            </div>

            {open && (
                <div className="chat-panel">
                    <div className="chat-header">
                        <span>Tư vấn dinh dưỡng (Trợ lý AI)</span>
                        <button
                            className="chat-close-x"
                            onClick={async () => {
                                // 1. Đóng bảng điều khiển
                                setOpen(false);
                                
                                // 2. Xóa trạng thái và bộ nhớ cục bộ
                                setMessages([]);
                                setStorage('messages', []);

                                // 3. Dọn dẹp các khóa và bộ đệm của cuộc trò chuyện
                                try {
                                    const oldConvId = conversationId;
                                    const catalogSentKey = `${STORAGE_KEY_PREFIX}catalog_sent_${oldConvId}`;
                                    localStorage.removeItem(catalogSentKey);
                                    localStorage.removeItem(STORAGE_KEY_PREFIX + 'conversation_id');

                                    // 4. Tạo ID mới cho phiên tiếp theo
                                    const newId = `conv-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
                                    localStorage.setItem(STORAGE_KEY_PREFIX + 'conversation_id', newId);
                                    setConversationId(newId);

                                    // 5. Yêu cầu backend xóa bộ đệm cho ID cũ
                                    if (oldConvId) {
                                      await axios.post(`${apiBase}/ai/clear-cache`, { conversationId: oldConvId });
                                    }
                                } catch (e) {
                                    console.error('Failed to clear chat session:', e);
                                }
                            }}
                            aria-label="Đóng và xóa chat"
                        >
                            <img src={brushIcon} alt="Clear" style={{ width: '32px', height: '32px' }} />
                        </button>
                    </div>
                    <div className="chat-body">
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-message ${m.from}`}>
                                {m.from === 'product' ? (
                                    <div
                                        className="product-suggestion"
                                        role="button"
                                        tabIndex={0}
                                        onClick={async () => {
                                            // Nếu tồn tại _id của sản phẩm, hãy sử dụng luồng sản phẩm của ứng dụng để thành phần Sản phẩm
                                            // nhận `currentProduct` trong redux và định tuyến `/san-pham/thong-tin-chi-tiet` hoạt động.
                                            try {
                                                if (m.product._id) {
                                                    // sendCurrentProduct mong đợi đối tượng `product` bên trong cộng với trường `id`
                                                    // (xem NavBar.handleShowproduct). Ánh xạ tài liệu sản phẩm AI sang hình dạng đó.
                                                    const prodForApp = {
                                                        ...(m.product.product || {}),
                                                        id: m.product._id,
                                                        name: m.product.product.description,
                                                    };
                                                    await sendCurrentProduct(dispatch, navigate, prodForApp);
                                                    return;
                                                }

                                                // dự phòng: ưu tiên detailUrl do máy chủ cung cấp, sau đó tìm kiếm theo tên
                                                const url = m.product.detailUrl || null;
                                                if (url) {
                                                    window.open(url, '_blank');
                                                } else if (m.product.name) {
                                                    const q = encodeURIComponent(m.product.name);
                                                    window.open(`/search?q=${q}`, '_blank');
                                                }
                                            } catch (e) {
                                                // nếu có bất kỳ lỗi nào, hãy dự phòng mở tìm kiếm theo tên
                                                if (m.product.name) {
                                                    const q = encodeURIComponent(m.product.name);
                                                    window.open(`/search?q=${q}`, '_blank');
                                                }
                                            }
                                        }}
                                    >
                                        <div className="product-image">
                                            {m.product.product?.avatar && (
                                                <img src={m.product.product.avatar} alt={m.product.product.description} />
                                            )}
                                        </div>
                                        <div className="product-details">
                                            <div className="product-name">{m.product.product.description}</div>
                                            {m.product.product?.price && <div className="price">Giá: {m.product.product.price.toLocaleString('vi-VN')}đ</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text">{m.text}</div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message bot">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-footer">
                        <textarea
                            placeholder="Gõ câu hỏi của bạn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <div className="chat-actions">
                            <button onClick={() => sendMessage(true)} disabled={loading} className="send">
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;
