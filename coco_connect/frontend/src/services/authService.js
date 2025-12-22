import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

export const loginUser = async (email, password) => {
  const response = await API.post("token/", {
    username: email,   // JWT expects username
    password: password,
  });

  return response.data;
};

export const registerUser = async (data) => {
  const response = await API.post("register/", data);
  return response.data;
};
