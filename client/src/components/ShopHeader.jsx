import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function ShopHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="shop-header">
      <div className="shop-ornament" aria-hidden="true" />

      <div className="shop-header-main">
        <div className="shop-crests" aria-hidden="true">
          <span className="mini-crest mini-crest-g" />
          <span className="mini-crest mini-crest-s" />
          <span className="mini-crest mini-crest-r" />
          <span className="mini-crest mini-crest-h" />
        </div>

        <Link className="shop-logo" to="/">
          <span className="shop-logo-en">
            Harry Potter <em>|</em> Shop
          </span>
          <span className="shop-logo-sub">해리 포터 상점</span>
        </Link>

        <div className="shop-tools">
          <form className="shop-search" onSubmit={(event) => event.preventDefault()}>
            <input type="search" placeholder="상품 검색" aria-label="상품 검색" />
            <button type="submit" aria-label="검색">
              ⌕
            </button>
          </form>
          <div className="shop-header-actions">
            {user ? (
              <>
                <span className="user-name" role="status">
                  {user.name}님
                </span>
                <button type="button" className="ghost-link" onClick={logout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link className="ghost-link" to="/login">
                  로그인
                </Link>
                <Link className="ghost-link" to="/signup">
                  회원가입
                </Link>
              </>
            )}
            <Link className="cart-button" to="/cart">
              가방
            </Link>
            <button
              type="button"
              className="shop-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="shop-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? "닫기" : "메뉴"}
            </button>
          </div>
        </div>
      </div>

      <nav id="shop-nav" className={`shop-nav${menuOpen ? " is-open" : ""}`} aria-label="주요 메뉴">
        <NavLink to="/" end>
          홈
        </NavLink>
        <a href="/#pickup">신상품</a>
        <a href="/#house">기숙사</a>
        <a href="/#features">특집</a>
        {user ? <NavLink to="/orders">주문내역</NavLink> : null}
        {!user ? (
          <NavLink to="/login">로그인</NavLink>
        ) : null}
        {user?.user_type === "admin" ? (
          <NavLink className="nav-admin" to="/admin">
            어드민
          </NavLink>
        ) : null}
      </nav>
    </header>
  );
}

export default ShopHeader;
