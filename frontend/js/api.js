/* ───────────────────────────────────────────────
   api.js — Frontend API helper
   All requests go through the Express backend.
   ─────────────────────────────────────────────── */

const API = {
    /** Get JWT from localStorage */
    getToken() {
        return localStorage.getItem('wcs_token');
    },

    /** Get current user from localStorage */
    getUser() {
        const u = localStorage.getItem('wcs_user');
        return u ? JSON.parse(u) : null;
    },

    /** Save auth data */
    saveAuth(token, user) {
        localStorage.setItem('wcs_token', token);
        localStorage.setItem('wcs_user', JSON.stringify(user));
    },

    /** Clear auth data */
    clearAuth() {
        localStorage.removeItem('wcs_token');
        localStorage.removeItem('wcs_user');
    },

    /** Check if logged in */
    isLoggedIn() {
        return !!this.getToken();
    },

    /** Redirect to login if not authenticated */
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    /** Build headers with JWT */
    headers(json = false) {
        const h = {};
        const token = this.getToken();
        if (token) h['Authorization'] = `Bearer ${token}`;
        if (json) h['Content-Type'] = 'application/json';
        return h;
    },

    /** Handle response */
    async handleResponse(res) {
        if (res.status === 401) {
            this.clearAuth();
            window.location.href = 'index.html';
            throw new Error('Session expired');
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        return data;
    },

    /** GET request */
    async get(path) {
        const res = await fetch(path, { headers: this.headers() });
        return this.handleResponse(res);
    },

    /** POST request */
    async post(path, body) {
        const res = await fetch(path, {
            method: 'POST',
            headers: this.headers(true),
            body: JSON.stringify(body)
        });
        return this.handleResponse(res);
    },

    /** PUT request */
    async put(path, body) {
        const res = await fetch(path, {
            method: 'PUT',
            headers: this.headers(true),
            body: JSON.stringify(body)
        });
        return this.handleResponse(res);
    },

    /** PATCH request */
    async patch(path, body) {
        const res = await fetch(path, {
            method: 'PATCH',
            headers: this.headers(true),
            body: JSON.stringify(body)
        });
        return this.handleResponse(res);
    },

    /** DELETE request */
    async delete(path) {
        const res = await fetch(path, {
            method: 'DELETE',
            headers: this.headers(true)
        });
        return this.handleResponse(res);
    }
};
