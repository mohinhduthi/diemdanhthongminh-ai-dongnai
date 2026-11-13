/**
 * AI SMARTATTEND ĐỒNG NAI - PRODUCTION DATA SERVICE & SUPABASE ADAPTER
 * Hỗ trợ giao tiếp 2 chiều: Supabase Database/Auth & Local Resilient Persistence
 */
(function () {
  const config = window.SA.Config;

  class SupabaseClient {
    constructor() {
      this.url = config.get('supabaseUrl');
      this.key = config.get('supabaseAnonKey');
      this.token = localStorage.getItem('sb_access_token') || null;
    }

    refreshCredentials() {
      this.url = config.get('supabaseUrl');
      this.key = config.get('supabaseAnonKey');
    }

    getHeaders() {
      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.key
      };
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }
      return headers;
    }

    async testConnection() {
      this.refreshCredentials();
      if (!this.url || !this.key) {
        return { ok: false, message: 'Chưa cấu hình Supabase URL hoặc Anon Key' };
      }
      try {
        const res = await fetch(`${this.url}/rest/v1/universities?select=count`, {
          method: 'GET',
          headers: this.getHeaders()
        });
        if (res.ok) {
          return { ok: true, message: 'Kết nối Supabase thành công!' };
        } else {
          const err = await res.text();
          return { ok: false, message: `Lỗi Supabase: ${res.status} - ${err}` };
        }
      } catch (e) {
        return { ok: false, message: `Lỗi mạng khi kết nối Supabase: ${e.message}` };
      }
    }

    // Đăng ký tài khoản người dùng thực qua Supabase Auth
    async signUp(email, password, metadata = {}) {
      this.refreshCredentials();
      if (!this.url) throw new Error('Supabase chưa cấu hình');

      const res = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key
        },
        body: JSON.stringify({
          email,
          password,
          data: metadata
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || data.message || 'Đăng ký thất bại');
      return data;
    }

    // Đăng nhập tài khoản qua Supabase Auth
    async signIn(email, password) {
      this.refreshCredentials();
      if (!this.url) throw new Error('Supabase chưa cấu hình');

      const res = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || data.message || 'Sai thông tin đăng nhập');
      this.token = data.access_token;
      localStorage.setItem('sb_access_token', data.access_token);
      return data;
    }

    async signOut() {
      this.token = null;
      localStorage.removeItem('sb_access_token');
    }

    // Truy vấn dữ liệu bảng qua Supabase PostgREST
    async query(table, select = '*', filters = {}) {
      this.refreshCredentials();
      let queryStr = `select=${encodeURIComponent(select)}`;
      for (const [k, v] of Object.entries(filters)) {
        queryStr += `&${encodeURIComponent(k)}=eq.${encodeURIComponent(v)}`;
      }

      const res = await fetch(`${this.url}/rest/v1/${table}?${queryStr}`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`Query failed: ${res.statusText}`);
      return await res.json();
    }

    async insert(table, rowData) {
      this.refreshCredentials();
      const res = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(rowData)
      });
      if (!res.ok) throw new Error(`Insert failed: ${await res.text()}`);
      return await res.json();
    }
  }

  window.SA = window.SA || { Views: {} };
  window.SA.Supabase = new SupabaseClient();
})();
