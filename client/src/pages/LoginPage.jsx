import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ShopFooter from "../components/ShopFooter.jsx";
import ShopHeader from "../components/ShopHeader.jsx";

const INITIAL_FORM = {
  email: "",
  password: "",
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const nextPath = location.state?.from || "/";
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const user = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });
      login(user);
      navigate(nextPath, { replace: true });
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
        <h1>로그인</h1>
        <p className="lede">가입한 이메일과 비밀번호로 로그인하세요.</p>

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
            <span>비밀번호 *</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </label>

          <button className="button" type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {message ? <p className={`form-message form-message-${status}`}>{message}</p> : null}

        <Link className="text-link" to="/signup">
          아직 계정이 없다면 회원가입
        </Link>
      </section>
      <ShopFooter />
    </div>
  );
}

export default LoginPage;
