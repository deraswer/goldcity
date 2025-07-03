// app/api.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      } else {
        console.warn("No token available, skipping authorization header");
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Identity", "Credential", "KYC", "Bridge"],
  endpoints: () => ({}),
});
