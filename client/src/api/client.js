const API_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "hp-shop-token";

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchHealth() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("API health check failed");
  }

  return response.json();
}

export async function createUser(payload) {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_error) {
    throw new Error("서버 응답을 읽지 못했습니다.");
  }

  if (!response.ok) {
    throw new Error(data.message || "회원가입에 실패했습니다.");
  }

  return data;
}

export async function loginUser(payload) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_error) {
    throw new Error("서버 응답을 읽지 못했습니다.");
  }

  if (!response.ok) {
    throw new Error(data.message || "로그인에 실패했습니다.");
  }

  return data;
}

export async function fetchMe() {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_error) {
    throw new Error("서버 응답을 읽지 못했습니다.");
  }

  if (!response.ok) {
    throw new Error(data.message || "로그인 정보를 확인할 수 없습니다.");
  }

  return data;
}

async function readJson(response, fallbackMessage) {
  let data = {};
  try {
    data = await response.json();
  } catch (_error) {
    throw new Error("서버 응답을 읽지 못했습니다.");
  }

  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
}

export async function fetchUsers() {
  const response = await fetch(`${API_URL}/users`, {
    headers: authHeaders(),
  });

  return readJson(response, "유저 목록을 불러오지 못했습니다.");
}

export async function updateUser(id, payload) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readJson(response, "유저 정보를 수정하지 못했습니다.");
}

export async function deleteUser(id) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return readJson(response, "유저를 삭제하지 못했습니다.");
}

export async function fetchProducts() {
  const response = await fetch(`${API_URL}/products`);
  const data = await readJson(response, "상품 목록을 불러오지 못했습니다.");
  return Array.isArray(data) ? data : [];
}

export async function fetchProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`);
  return readJson(response, "상품을 불러오지 못했습니다.");
}

export async function createProduct(payload) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readJson(response, "상품을 등록하지 못했습니다.");
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return readJson(response, "상품을 삭제하지 못했습니다.");
}

export async function fetchCart() {
  const response = await fetch(`${API_URL}/cart`, {
    headers: authHeaders(),
  });

  return readJson(response, "장바구니를 불러오지 못했습니다.");
}

export async function addCartItem(payload) {
  const response = await fetch(`${API_URL}/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readJson(response, "장바구니에 담지 못했습니다.");
}

export async function updateCartItem(productId, payload) {
  const response = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readJson(response, "수량을 바꾸지 못했습니다.");
}

export async function deleteCartItem(productId) {
  const response = await fetch(`${API_URL}/cart/items/${productId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return readJson(response, "장바구니에서 빼지 못했습니다.");
}

export async function deleteCart() {
  const response = await fetch(`${API_URL}/cart`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return readJson(response, "장바구니를 비우지 못했습니다.");
}

export async function createOrder(payload) {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readJson(response, "주문을 만들지 못했습니다.");
}

export async function fetchOrders(scope) {
  const query = scope ? `?scope=${encodeURIComponent(scope)}` : "";
  const response = await fetch(`${API_URL}/orders${query}`, {
    headers: authHeaders(),
  });
  const data = await readJson(response, "주문 목록을 불러오지 못했습니다.");
  return Array.isArray(data) ? data : [];
}

export async function fetchOrder(id) {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    headers: authHeaders(),
  });

  return readJson(response, "주문을 불러오지 못했습니다.");
}

export async function updateOrder(id, payload) {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return readJson(response, "주문 상태를 바꾸지 못했습니다.");
}
