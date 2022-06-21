import axios from 'redaxios';

const baseURL = 'http://localhost:8080';

export const http: typeof axios = axios.create({ baseURL, withCredentials: true });
