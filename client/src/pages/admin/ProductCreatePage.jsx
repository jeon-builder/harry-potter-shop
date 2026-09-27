import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { createProduct } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import CloudinaryUploadField from "../../components/CloudinaryUploadField.jsx";
import ShopFooter from "../../components/ShopFooter.jsx";
import ShopHeader from "../../components/ShopHeader.jsx";

const CATEGORIES = ["마법약물", "지팡이", "마법동물", "마법아이템"];

const INITIAL_FORM = {
  sku: "",
  name: "",
  price: "",
  category: "마법약물",
  image: "",
  description: "",
};

function ProductCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  if (!user || user.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      image: form.image.trim(),
      description: form.description.trim(),
    };

    if (!payload.sku || !payload.name || !payload.image || Number.isNaN(payload.price)) {
      setStatus("error");
      setMessage("SKU, 상품 이름, 가격, 이미지는 필수입니다.");
      return;
    }

    try {
      const product = await createProduct(payload);
      navigate("/admin/products", {
        replace: true,
        state: { notice: `${product.name} 상품을 등록했습니다.` },
      });
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  return (
    <div className="page page-signup">
      <ShopHeader />
      <section className="panel">
        <p className="eyebrow">Admin</p>
        <h1>상품 등록</h1>
        <p className="lede">상점 카탈로그에 올릴 상품 정보를 입력하세요.</p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>SKU *</span>
            <input name="sku" value={form.sku} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>상품 이름 *</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>상품 가격 *</span>
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>카테고리 *</span>
            <select name="category" value={form.category} onChange={handleChange} required>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <CloudinaryUploadField
            value={form.image}
            onChange={(image) => setForm((current) => ({ ...current, image }))}
          />

          <label className="field">
            <span>설명</span>
            <textarea name="description" rows="4" value={form.description} onChange={handleChange} />
          </label>

          <button className="button" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "등록 중..." : "상품 등록하기"}
          </button>
        </form>

        {message ? <p className={`form-message form-message-${status}`}>{message}</p> : null}

        <Link className="text-link" to="/admin/products">
          상품 조회로 돌아가기
        </Link>
      </section>
      <ShopFooter />
    </div>
  );
}

export default ProductCreatePage;
