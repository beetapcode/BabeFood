const axios = require('axios');
const Product = require('../models/Product');

// Hàm hỗ trợ để tạo độ trễ
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const conversationCatalogCache = new Map();

exports.chat = async (req, res) => {
  try {
    const { message, suggestProducts, sendCatalog, conversationId, preloadOnly } = req.body || {};

    if (preloadOnly && sendCatalog && conversationId) {
      const products = await Product.find({}).limit(50).lean();
      conversationCatalogCache.set(conversationId, products);
      return res.json({ ok: true, cached: true, count: products.length });
    }

    let answer = 'Mình có thể giúp tư vấn dinh dưỡng cho bé. Bạn cho biết tuổi và tình trạng (ví dụ: cần tăng cân, đang biếng ăn) để mình gợi ý nhé.';

    const MAX_RETRIES = 5; 
    const RETRY_DELAY_MS = 3000; 
    let lastErrorDetail = null; 
    
    // thử gọi API gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && message && message.length > 0) {

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const systemPrompt = 'Bạn là trợ lý tư vấn dinh dưỡng cho trẻ em. Trả lời ngắn gọn bằng tiếng Việt.Không trả lời những câu hỏi không liên quan đến dinh dưỡng trẻ em';

                // Nếu có catalog được cache, tạo chuỗi văn bản danh sách sản phẩm
                const cached = conversationCatalogCache.get(conversationId) || [];
                let productListText = '';
                if (cached && cached.length > 0) {
                    const slice = cached.slice(0, 50);
                    productListText = 'Danh sách sản phẩm (index bắt đầu từ 0):\n' +
                        slice.map((p, i) => `${i}: ${p.product.description} - ${p.name || ''}`).join('\n');
                }
            
                // Gộp System Prompt và Catalog thành một Prompt "ngữ cảnh"
                const contextPrompt = systemPrompt;
                
                // Tạo mảng parts: Gồm context (system/catalog) và user message
                const parts = [
                    { text: contextPrompt },
                    { text: message }
                ];

                // Xây dựng payload với cấu trúc generationConfig đúng
                const payload = {
                    contents: [
                        {
                          role: 'user', 
                          parts: parts
                        }
                    ],
                    generationConfig: { 
                        temperature: 0.2
                    }
                };

                console.log(`Attempt ${attempt}: Sending request to Gemini...`);
                const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

                const r = await axios.post(url, payload, { timeout: 20000 });

                if (r.data) {
                    let text = null;
                    if (r.data?.candidates && r.data.candidates.length > 0) {
                        const cand = r.data.candidates[0];
                        if (cand?.content && Array.isArray(cand.content.parts)) {
                            text = cand.content.parts.map((p) => p.text).join('\n');
                        } else if (cand?.content?.text) {
                            text = cand.content.text;
                        }
                    }
                    if (!text && r.data?.output) text = typeof r.data.output === 'string' ? r.data.output : JSON.stringify(r.data.output);
                    
                    // Nếu thành công, cập nhật answer và thoát khỏi vòng lặp
                    if (text) answer = text;
                    break; 
                }
            } catch (err) {
                const errorDetail = err.response?.data?.error?.message || err.message;
                lastErrorDetail = errorDetail; // Lưu lỗi cuối cùng
                
                console.warn(`Attempt ${attempt} failed:`, errorDetail);
                
                if (attempt < MAX_RETRIES) {
                    console.log(`Waiting ${RETRY_DELAY_MS / 1000}s before retry...`);
                    await delay(RETRY_DELAY_MS);
                } else {
                    // Báo cáo lỗi cuối cùng 
                    console.error(`Gemini AI call failed after ${MAX_RETRIES} attempts. Final error: ${lastErrorDetail}. Falling back to default answer.`);
                }
            }
        }
 }
//đề xuất sản phẩm
        let products = [];
        if (suggestProducts && answer) {
            try {
                const allProducts = conversationCatalogCache.get(conversationId) || await Product.find({}).lean();
                if (conversationCatalogCache.get(conversationId) === undefined) {
                    conversationCatalogCache.set(conversationId, allProducts);
                }

                const suggestedProducts = new Map();

                // tìm kiếm chính từ ai
                for (const product of allProducts) {
                    if (answer.toLowerCase().includes(product.name.toLowerCase())) {
                        if (!suggestedProducts.has(product._id.toString())) {
                            suggestedProducts.set(product._id.toString(), product);
                        }
                    }
                }

                //tìm kiểm dự phòng
                if (suggestedProducts.size < 5) {
                    const searchTerms = message.toLowerCase().split(/\s+/).filter(term => term.length > 2); 

                    for (const product of allProducts) {
                        if (suggestedProducts.size >= 5) break;

                        const productName = product.name.toLowerCase();
                        const productDesc = product.product.description.toLowerCase();

                        for (const term of searchTerms) {
                            if (productName.includes(term) || productDesc.includes(term)) {
                                if (!suggestedProducts.has(product._id.toString())) {
                                    suggestedProducts.set(product._id.toString(), product);
                                    break; 
                                }
                            }
                        }
                    }
                }
                
                products = Array.from(suggestedProducts.values()).slice(0, 5); // get top 5

            } catch (searchError) {
                console.error('Product suggestion logic failed:', searchError);
                products = [];
            }
        }
        
            if (products && products.length > 0) {
                products = products.map((p) => ({ ...p, _id: p._id ? String(p._id) : p._id, detailUrl: `/san-pham/thong-tin-chi-tiet` }));
            }    return res.json({ answer, products });
  } catch (error) {
    console.error('AI chat error', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.clearCache = async (req, res) => {
  try {
    const { conversationId } = req.body || {};
    if (!conversationId) return res.status(400).json({ error: 'Missing conversationId' });
    conversationCatalogCache.delete(conversationId);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};