"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "../store";
import { setUser, clearUser } from "../features/authSlice";
import axios from "axios";

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch logged-in user on mount
    const loadUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        dispatch(setUser(res.data.user));
      } catch (err) {
        dispatch(clearUser());
      }
    };

    loadUser();

    // Axios interceptor for transparent JWT refresh without localStorage
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/api/auth/refresh")
        ) {
          originalRequest._retry = true;
          try {
            // Hit refresh API which automatically sets new accessToken cookie
            await axios.get("/api/auth/refresh");
            // Retry the original request without any manual headers (cookies are automatic)
            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Session expired, redirecting to login:", refreshError);
            dispatch(clearUser());
            if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
              window.location.href = "/register";
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch]);

  return <>{children}</>;
};

const ReduxProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
};

export default ReduxProvider;