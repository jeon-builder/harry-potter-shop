import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";
import { createUser } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

const INITIAL_FORM = {
  email: "",
  name: "",
  password: "",
  user_type: "customer",
  address: "",
};

function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveUserToServer() {
    const payload = {
      email: form.email.trim(),
      name: form.name.trim(),
      password: form.password,
      user_type: form.user_type,
      address: form.address.trim(),
    };

    if (!payload.email || !payload.name || !payload.password || !payload.user_type) {
      throw new Error("이메일, 이름, 비밀번호, 회원 유형은 필수입니다.");
    }

    return createUser(payload);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const auth = await saveUserToServer();
      login(auth);
      navigate("/", {
        replace: true,
        state: { notice: `${auth.user.name}님, 회원가입이 완료되었습니다.` },
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
        <p className="eyebrow">Account</p>
        <h1>회원가입</h1>
        <p className="lede">상점 이용을 위해 계정을 만들어 주세요.</p>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>이메일 *</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>이름 *</span>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </label>

          <label className="field">
            <span>비밀번호 *</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span>회원 유형 *</span>
            <select name="user_type" value={form.user_type} onChange={handleChange} required>
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label className="field">
            <span>주소</span>
            <input
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </label>

          <button className="button" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "가입 중..." : "회원가입"}
          </button>
        </form>

        {message ? <p className={`form-message form-message-${status}`}>{message}</p> : null}

        <Link className="text-link" to="/">
          메인으로 돌아가기
        </Link>
      </section>
      <ShopFooter />
    </div>
  );
}

export default SignupPage;
