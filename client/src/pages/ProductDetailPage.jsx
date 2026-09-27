import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addCartItem, fetchProduct, fetchProducts } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";
import { displayCategory, formatPrice } from "../data/home.js";
import "./ProductDetailPage.css";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [bagNotice, setBagNotice] = useState("");
  const [bagReady, setBagReady] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setProduct(null);
    setRelated([]);
    setQuantity(1);
    setBagNotice("");
    setBagReady(false);
    setMessage("");
    window.scrollTo(0, 0);

    fetchProduct(id)
      .then((item) => {
        if (cancelled) return;
        setProduct(item);
        setStatus("ready");
        return fetchProducts().then((list) => {
          if (cancelled) return;
          setRelated(
            list
              .filter(
                (entry) =>
                  entry._id !== item._id &&
                  displayCategory(entry.category) === displayCategory(item.category),
              )
              .slice(0, 4),
          );
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function changeQuantity(delta) {
    setQuantity((current) => Math.min(99, Math.max(1, current + delta)));
  }

  async function handleAddToBag() {
    if (!product) return;

    if (!user) {
      navigate("/login", { replace: false, state: { from: `/products/${product._id}` } });
      return;
    }

    setAdding(true);
    setBagNotice("");
    setBagReady(false);

    try {
      await addCartItem({ product: product._id, quantity });
      setBagNotice(`${product.name} ${quantity}개를 가방에 담았습니다.`);
      setBagReady(true);
    } catch (error) {
      setBagNotice(error.message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="shop-page product-detail-page">
      <ShopHeader />

      {status === "loading" ? (
        <p className="shop-empty product-detail-status">상품을 불러오는 중입니다.</p>
      ) : null}

      {status === "error" ? (
        <section className="product-detail-status">
          <p className="shop-empty">{message || "상품을 찾을 수 없습니다."}</p>
          <Link className="text-link" to="/">
            홈으로 돌아가기
          </Link>
        </section>
      ) : null}

      {status === "ready" && product ? (
        <main className="product-detail">
          <nav className="product-breadcrumb" aria-label="현재 위치">
            <Link to="/">홈</Link>
            <span aria-hidden="true">/</span>
            <Link to="/#pickup">{displayCategory(product.category)}</Link>
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </nav>

          <section className="product-detail-hero">
            <div className="product-detail-media">
              <img src={product.image} alt={product.name} />
              <em>{displayCategory(product.category)}</em>
            </div>

            <div className="product-detail-info">
              <p className="eyebrow">Item</p>
              <h1>{product.name}</h1>
              <p className="product-detail-sku">SKU {product.sku}</p>
              <p className="product-detail-price">{formatPrice(product.price)}</p>
              <p className="product-detail-copy">
                {product.description || "이 상품에 대한 설명이 아직 없습니다."}
              </p>

              <div className="product-qty" role="group" aria-label="수량">
                <button type="button" onClick={() => changeQuantity(-1)} aria-label="수량 줄이기">
                  −
                </button>
                <span>{quantity}</span>
                <button type="button" onClick={() => changeQuantity(1)} aria-label="수량 늘리기">
                  +
                </button>
              </div>

              <button className="button product-bag-button" type="button" onClick={handleAddToBag} disabled={adding}>
                {adding ? "담는 중..." : "가방에 담기"}
              </button>

              {bagNotice ? (
                <p className="product-bag-notice" role="status">
                  {bagNotice}
                  {bagReady ? (
                    <>
                      {" "}
                      <Link to="/cart">가방 보기</Link>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
          </section>

          {related.length > 0 ? (
            <section className="shop-section product-related">
              <h2>
                <span>Related Items</span>
                비슷한 상품
              </h2>
              <div className="product-grid">
                {related.map((item) => (
                  <Link key={item._id} className="product-card" to={`/products/${item._id}`}>
                    <div className="product-thumb">
                      <img src={item.image} alt={item.name} />
                      <em>{displayCategory(item.category)}</em>
                    </div>
                    <h3>{item.name}</h3>
                    <p>{formatPrice(item.price)}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </main>
      ) : null}

      <ShopFooter />
    </div>
  );
}

export default ProductDetailPage;
