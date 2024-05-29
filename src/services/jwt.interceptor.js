import axios from 'axios';
import router from '../router';

export function jwtInterceptor() {
    axios.interceptors.request.use(config => {
        // add auth header with jwt if account is logged in and request is to the api url
        const token = localStorage.getItem("token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    });
}

export function unAuthRedirect() {
    axios.interceptors.response.use(null, function(error) {
        if (error.response.status === 401) {
            console.log("Unauthorized login");
            router.push("/login");
            return Promise.reject(error);
        } 
    })
}