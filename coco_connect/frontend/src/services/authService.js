import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

/*export const loginUser = async (email, password) => {
  const response = await API.post("token/", {
    username: email,   // JWT expects username
    password: password,
  });
  return response.data;
};*/

const API_BASE = "http://localhost:8000/api";

export async function loginUser(email, password) {
  // ✅ JWT login endpoint
  const res = await axios.post(`${API_BASE}/token/`, { username: email, password });
  // res.data should contain: access + refresh
  return res.data;
}

export const registerUser = async (data) => {
  // register endpoint is under /api/auth/register/ on the backend
  const response = await API.post("register/", data);
  return response.data;
};

export async function logoutUser() {
  const token = localStorage.getItem("access");
  try {
    if (token) {
      await axios.post(`${API_BASE}/logout/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (e) {
    console.warn("logout api failed", e?.response?.data || e.message);
  } finally {
    localStorage.clear();
    window.dispatchEvent(new Event("auth:changed"));
  }
}
