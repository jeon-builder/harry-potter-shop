import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HeroBanner from "../components/HeroBanner.jsx";
import HouseCrest from "../components/HouseCrest.jsx";
import PageLoader from "../components/PageLoader.jsx";
import { fetchProducts } from "../api/client.js";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";
import { categories, featureItems, formatPrice, houses } from "../data/home.js";
import { useReveal } from "../hooks/useReveal.js";
import "./HomePage.css";

function HomePage() {
  const location = useLocation();
  const notice = location.state?.notice;
  const skipLoader = Boolean(notice);
  const [loaderVisible, setLoaderVisible] = useState(!skipLoader);
  const [loaderFading, setLoaderFading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productStatus, setProductStatus] = useState("loading");
  const [activeCategory, setActiveCategory] = useState("all");
  const contentReady = !loaderVisible || loaderFading;
  const visibleProducts =
    activeCategory === "all"
      ? products
      : products.filter((item) => item.category === activeCategory);

  useReveal(contentReady && !loaderVisible && productStatus !== "loading");

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
        setProductStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setProductStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loaderVisible) return undefined;

    const id = location.hash.slice(1);
    if (!id) return undefined;

    const target = document.getElementById(id);
    if (!target) return undefined;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return undefined;
  }, [loaderVisible, location.hash]);

  useEffect(() => {
    if (skipLoader) return undefined;

    document.body.classList.add("is-loading");

    const fadeTimer = setTimeout(() => setLoaderFading(true), 1800);
    const hideTimer = setTimeout(() => {
      setLoaderVisible(false);
      document.body.classList.remove("is-loading");
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      document.body.classList.remove("is-loading");
    };
  }, [skipLoader]);

  return (
    <div className="shop-page">
      {loaderVisible ? <PageLoader fading={loaderFading} /> : null}

      <ShopHeader />
      <HeroBanner />

      {notice ? (
        <p className="shop-notice" role="status">
          {notice}
        </p>
      ) : null}

      <section className="shop-categories reveal" aria-label="카테고리">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`category-chip${activeCategory === category.id ? " is-active" : ""}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span aria-hidden="true">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </section>

      <section className="shop-section reveal" id="pickup">
        <h2>
          <span>Pickup Items</span>
          픽업
        </h2>
        {productStatus === "loading" ? <p className="shop-empty">상품을 불러오는 중입니다.</p> : null}
        {productStatus === "error" ? <p className="shop-empty">상품을 불러오지 못했습니다.</p> : null}
        {productStatus === "ready" && visibleProducts.length === 0 ? (
          <p className="shop-empty">이 카테고리에 등록된 상품이 없습니다.</p>
        ) : null}
        {productStatus === "ready" && visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((item, index) => (
              <Link
                key={item._id}
                className="product-card"
                to={`/products/${item._id}`}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <div className="product-thumb">
                  <img src={item.image} alt={item.name} />
                  <em>{item.category}</em>
                </div>
                <h3>{item.name}</h3>
                <p>{formatPrice(item.price)}</p>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="shop-intro reveal">
        <div className="owl" aria-hidden="true" />
        <h2>일상에 스며드는 작은 마법</h2>
        <p>
          기숙사 문장, 트렁크, 열차와 같은 익숙한 모티프를 담아 매일 쓸 수 있는 소품을 모았습니다.
          천천히 둘러보고 마음에 드는 아이템을 골라 보세요.
        </p>
      </section>

      <section className="shop-section reveal" id="features">
        <h2>
          <span>Features</span>
          특집
        </h2>
        <div className="feature-grid">
          {featureItems.map((item) => (
            <article key={item.id} className={`feature-card feature-card-${item.tone} reveal`}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shop-section shop-section-house reveal" id="house">
        <h2>
          <span>House</span>
          기숙사에서 찾기
        </h2>
        <div className="house-row">
          {houses.map((house) => (
            <HouseCrest key={house.id} house={house} />
          ))}
        </div>
      </section>

      <ShopFooter />
    </div>
  );
}

export default HomePage;
