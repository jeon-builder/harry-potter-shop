import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { deleteUser, fetchProducts, fetchUsers, updateUser } from "../../api/client.js";
import { useAuth } from "../../auth/AuthContext.jsx";
import ShopFooter from "../../components/ShopFooter.jsx";
import ShopHeader from "../../components/ShopHeader.jsx";
import "./AdminPage.css";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

function AdminPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState(location.state?.notice || "");

  async function loadAdminData() {
    setStatus("loading");
    try {
      const [userList, productList] = await Promise.all([fetchUsers(), fetchProducts()]);
      setUsers(userList);
      setProducts(productList);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  useEffect(() => {
    if (user?.user_type === "admin") {
      loadAdminData();
    }
  }, [user]);

  if (!user || user.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  async function handleTypeChange(target, userType) {
    try {
      const updated = await updateUser(target._id, { user_type: userType });
      setUsers((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setMessage(`${updated.name}님의 권한을 ${updated.user_type}(으)로 변경했습니다.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDelete(target) {
    if (target._id === user._id) {
      setMessage("현재 로그인한 계정은 삭제할 수 없습니다.");
      return;
    }

    if (!window.confirm(`${target.name}님을 삭제할까요?`)) {
      return;
    }

    try {
      await deleteUser(target._id);
      setUsers((current) => current.filter((item) => item._id !== target._id));
      setMessage(`${target.name}님을 삭제했습니다.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const adminCount = users.filter((item) => item.user_type === "admin").length;
  const customerCount = users.length - adminCount;

  return (
    <div className="admin-page">
      <ShopHeader />

      <section className="admin-wrap">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>어드민</h1>
            <p className="lede">{user.name}님, 회원과 상품을 관리할 수 있습니다.</p>
          </div>
          <div className="admin-heading-actions">
            <Link className="admin-create" to="/admin/orders">
              주문관리
            </Link>
            <Link className="admin-create" to="/admin/products">
              상품관리
            </Link>
            <Link className="admin-create" to="/admin/products/new">
              상품 등록하기
            </Link>
          </div>
        </div>

        <div className="admin-stats">
          <article>
            <strong>{users.length}</strong>
            <span>전체 회원</span>
          </article>
          <article>
            <strong>{adminCount}</strong>
            <span>어드민</span>
          </article>
          <article>
            <strong>{customerCount}</strong>
            <span>일반 회원</span>
          </article>
          <article>
            <strong>{products.length}</strong>
            <span>등록 상품</span>
          </article>
        </div>

        {message ? <p className="admin-message">{message}</p> : null}

        {status === "loading" ? <p className="lede">회원 목록을 불러오는 중입니다.</p> : null}
        {status === "error" ? <p className="form-message form-message-error">{message}</p> : null}

        {status === "ready" ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>권한</th>
                  <th>주소</th>
                  <th>가입일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>
                      <select
                        value={item.user_type}
                        disabled={item._id === user._id}
                        onChange={(event) => handleTypeChange(item, event.target.value)}
                      >
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{item.address || "-"}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-delete"
                        disabled={item._id === user._id}
                        onClick={() => handleDelete(item)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
      <ShopFooter />
    </div>
  );
}

export default AdminPage;
