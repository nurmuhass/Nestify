// services/authService.js
const API_BASE = "https://insighthub.com.ng/NestifyAPI";

export async function loginApi({ emailOrPhone, password }) {
  const res = await fetch(`${API_BASE}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrPhone, password }),
  });
  const json = await res.json();
  if (!res.ok || json.status !== "success") {
    throw new Error(json.msg || "Login error");
  }
  // Expect backend returns: { status:"success", token:"...", user:{...} }
  return { token: json.token, user: json.user };
}

export async function registerApi(form) {
  // form includes name, email, phone, password, isSeller, plus extra if seller
  const res = await fetch(`${API_BASE}/register.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const json = await res.json();
  if (!res.ok || json.status !== "success") {
    throw new Error(json.msg || "Registration error");
  }
  return { token: json.token, user: json.user };
}
