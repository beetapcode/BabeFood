import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import heroImg from '../../../assets/imgs/baby-banner.jpg';
import './Introduce.scss';

export default function Introduce() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0 = initial, 1 = features, 2 = why, 3 = cta
    const [visibleCards, setVisibleCards] = useState(0);
    const timersRef = useRef([]);
    const startedRef = useRef(false);

    useEffect(() => {
        return () => {
            // cleanup timers
            timersRef.current.forEach((t) => clearTimeout(t));
            timersRef.current = [];
        };
    }, []);

    const handleDiscover = useCallback(() => {
        // ensure we run only once per mount/session until explicitly reset
        if (startedRef.current) return;
        startedRef.current = true;

        setStep(1);
        setVisibleCards(0);

        // reveal three cards one by one
        for (let i = 0; i < 3; i++) {
            const t = setTimeout(() => {
                setVisibleCards((prev) => Math.max(prev, i + 1));
            }, i * 250 + 150);
            timersRef.current.push(t);
        }

        // reveal why section after cards
        const tWhy = setTimeout(() => setStep(2), 3 * 250 + 250);
        timersRef.current.push(tWhy);

        // reveal CTA after a bit
        const tCta = setTimeout(() => setStep(3), 3 * 250 + 700);
        timersRef.current.push(tCta);
    }, []);

    // trigger reveal automatically when this page mounts (e.g. when user clicks the Introduce nav link)
    useEffect(() => {
        // small delay so layout settles before starting animation
        const t = setTimeout(() => {
            handleDiscover();
        }, 120);
        timersRef.current.push(t);

        return () => clearTimeout(t);
    }, [handleDiscover]);
    return (
        <div className="landing-container">
            {/* HERO */}
            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-text">
                        <h1 className="title">BabeFoods</h1>
                        <p className="subtitle">
                            Nền tảng cung cấp thực phẩm dinh dưỡng cho bé – giúp ba mẹ an tâm lựa chọn những bữa ăn an
                            toàn, chất lượng và đầy đủ dưỡng chất.
                        </p>

                        <button className="btn-primary" onClick={() => navigate('/')}>
                            Khám phá ngay
                        </button>
                    </div>

                    <div className="hero-image">
                        <img src={heroImg} alt="Bé ăn uống" />
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features">
                <div className="features-inner">
                    <div className={`feature-card ${visibleCards >= 1 ? 'visible' : ''}`}>
                        <h3>Nguyên liệu sạch</h3>
                        <p>Được kiểm định và chọn lọc kỹ càng từ các nhà cung cấp uy tín.</p>
                    </div>

                    <div className={`feature-card ${visibleCards >= 2 ? 'visible' : ''}`}>
                        <h3>Thực đơn khoa học</h3>
                        <p>Dựa trên nhu cầu dinh dưỡng theo từng độ tuổi của bé.</p>
                    </div>

                    <div className={`feature-card ${visibleCards >= 3 ? 'visible' : ''}`}>
                        <h3>Giao hàng nhanh chóng</h3>
                        <p>Đảm bảo tươi ngon – giao tận nơi cho gia đình bạn.</p>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="why">
                <div className={`why-inner ${step >= 2 ? 'visible' : ''}`}>
                    <h2>Vì sao chọn BabeFoods?</h2>
                    <p>
                        Chúng tôi hiểu dinh dưỡng giai đoạn đầu đời cực kỳ quan trọng. BabeFoods cam kết mang đến những
                        sản phẩm chất lượng với công thức đạt chuẩn, giúp bé phát triển toàn diện và khỏe mạnh.
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section className="cta">
                <div className={`cta-inner ${step >= 3 ? 'visible' : ''}`}>
                    <h2>Bắt đầu hành trình dinh dưỡng cho bé ngay hôm nay</h2>
                    <button className="btn-primary" onClick={() => navigate('/dang-ky')}>
                        Đăng ký nhận ưu đãi
                    </button>
                </div>
            </section>
        </div>
    );
}
