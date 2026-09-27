import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { houses } from "../data/home.js";
import "./ShopFooter.css";

function ShopFooter() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(event) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="shop-footer">
      <div className="shop-ornament" aria-hidden="true" />

      <div className="shop-footer-inner">
        <div className="shop-footer-brand">
          <Link className="shop-logo" to="/">
            <span className="shop-logo-en">
              Harry Potter <em>|</em> Shop
            </span>
            <span className="shop-logo-sub">해리 포터 상점</span>
          </Link>
          <p>일상에 스며드는 작은 마법. 기숙사 문장과 트렁크 모티프를 담은 소품을 모았습니다.</p>
          <div className="shop-crests" aria-hidden="true">
            <span className="mini-crest mini-crest-g" />
            <span className="mini-crest mini-crest-s" />
            <span className="mini-crest mini-crest-r" />
            <span className="mini-crest mini-crest-h" />
          </div>
        </div>

        <nav className="shop-footer-col" aria-label="쇼핑 안내">
          <h2>쇼핑 안내</h2>
          <ul>
            <li>
              <Link to="/#pickup">신상품</Link>
            </li>
            <li>
              <Link to="/#house">기숙사에서 찾기</Link>
            </li>
            <li>
              <Link to="/#features">특집</Link>
            </li>
            {!user ? (
              <>
                <li>
                  <Link to="/login">로그인</Link>
                </li>
                <li>
                  <Link to="/signup">회원가입</Link>
                </li>
              </>
            ) : null}
            {user?.user_type === "admin" ? (
              <li>
                <Link to="/admin">어드민</Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <nav className="shop-footer-col" aria-label="기숙사">
          <h2>기숙사</h2>
          <ul>
            {houses.map((house) => (
              <li key={house.id}>
                <Link to="/#house">{house.ko}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shop-footer-col">
          <h2>고객 지원</h2>
          <ul>
            <li>평일 10:00–18:00</li>
            <li>주말 · 공휴일 휴무</li>
            <li>
              <a href="mailto:hello@harrypotter.shop">hello@harrypotter.shop</a>
            </li>
            <li>3만 원 이상 무료 배송</li>
          </ul>
        </div>

        <section className="shop-footer-col shop-footer-news" aria-label="소식 받기">
          <h2>소식 받기</h2>
          <p>신상품과 특집 소식을 이메일로 전해 드립니다.</p>
          <form className="shop-footer-form" onSubmit={handleSubscribe}>
            <label className="visually-hidden" htmlFor="footer-email">
              이메일 주소
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일 주소"
              required
              autoComplete="email"
            />
            <button type="submit">구독</button>
          </form>
          {subscribed ? (
            <p className="shop-footer-thanks" role="status">
              구독 신청이 완료되었습니다.
            </p>
          ) : null}
        </section>
      </div>

      <div className="shop-footer-bottom">
        <p>이 페이지는 학습용으로 만든 상점입니다. 공식 판매처가 아닙니다.</p>
        <p>© 2026 Harry Potter Shop</p>
        <button type="button" className="shop-footer-top" onClick={scrollToTop}>
          맨 위로
        </button>
      </div>
    </footer>
  );
}

export default ShopFooter;
