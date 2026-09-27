import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { deleteProduct, fetchProducts } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import ShopFooter from "../../components/ShopFooter.jsx";
import ShopHeader from "../../components/ShopHeader.jsx";
import "./AdminPage.css";

function ProductListPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(location.state?.notice || "");

  useEffect(() => {
    if (!user || user.user_type !== "admin") {
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    fetchProducts()
      .then((list) => {
        if (cancelled) return;
        setProducts(list);
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || user.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  async function handleDelete(target) {
    if (!window.confirm(`${target.name} 상품을 삭제할까요?`)) {
      return;
    }

    try {
      await deleteProduct(target._id);
      setProducts((current) => current.filter((item) => item._id !== target._id));
      setMessage(`${target.name} 상품을 삭제했습니다.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="admin-page">
      <ShopHeader />

      <section className="admin-wrap">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>상품 조회</h1>
            <p className="lede">서버에서 불러온 상품 {status === "ready" ? products.length : "-"}개</p>
          </div>
          <div className="admin-heading-actions">
            <Link className="text-link admin-back" to="/admin">
              어드민으로
            </Link>
            <Link className="admin-create" to="/admin/products/new">
              상품 등록하기
            </Link>
          </div>
        </div>

        {message ? <p className="admin-message">{message}</p> : null}
        {status === "loading" ? <p className="lede">상품 목록을 불러오는 중입니다.</p> : null}
        {status === "error" ? <p className="form-message form-message-error">{message}</p> : null}
        {status === "ready" && products.length === 0 ? (
          <p className="lede">등록된 상품이 없습니다.</p>
        ) : null}

        {status === "ready" && products.length > 0 ? (
          <div className="admin-product-grid">
            {products.map((item) => (
              <article key={item._id} className="admin-product-card">
                <Link className="admin-product-link" to={`/products/${item._id}`}>
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="admin-product-body">
                  <p className="admin-product-meta">
                    {item.sku} · {item.category}
                  </p>
                  <h2>
                    <Link to={`/products/${item._id}`}>{item.name}</Link>
                  </h2>
                  <p className="admin-product-price">₩{Number(item.price).toLocaleString("ko-KR")}</p>
                  <p>{item.description || "설명이 없습니다."}</p>
                  <button type="button" className="admin-delete" onClick={() => handleDelete(item)}>
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
      <ShopFooter />
    </div>
  );
}

export default ProductListPage;
