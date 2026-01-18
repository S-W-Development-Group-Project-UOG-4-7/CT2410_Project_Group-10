import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   LOGIN (EMAIL BASED JWT)
========================= */
export const loginUser = async (email, password) => {
  try {
    const response = await API.post("token/", {
      email: email, // ✅ MUST BE email (NOT username)
      password: password,
    });

    // save tokens
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    return response.data;
  } catch (error) {
    console.error("LOGIN ERROR:", error.response?.data || error.message);
    throw error;
  }
};

/* =========================
   REGISTER
========================= */
export const registerUser = async (data) => {
  try {
    const response = await API.post("register/", data);
    return response.data;
  } catch (error) {
    console.error("REGISTER ERROR:", error.response?.data || error.message);
    throw error;
  }
};
