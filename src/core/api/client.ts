// import axios from "axios";

// export const API_BASE_URL =
//   "https://web120.ir/apartment/app_ver1";

// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 15000,
//   responseType: "text",
//   transformResponse: [
//     (data) => data,
//   ],
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "text/plain, application/json",
//   },
// });


// import axios from "axios";

// export const apiClient = axios.create({
//   baseURL: "/api",
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "text/plain, application/json",
//   },
// });


import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api/php",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "text/plain, application/json",
  },
});