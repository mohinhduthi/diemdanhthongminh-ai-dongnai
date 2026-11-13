/**
 * AI SMARTATTEND ĐỒNG NAI - PRODUCTION CONFIGURATION & CREDENTIAL MANAGEMENT
 * Lưu cấu hình kết nối Supabase, Backend API và Gemini AI một cách an toàn.
 * Người dùng có thể cấu hình trực tiếp từ giao diện Quản trị viên hoặc file môi trường.
 */
(function () {
  const STORAGE_KEY = 'ai_smartattend_dongnai_prod_config_v1';

  const DEFAULT_CONFIG = {
    // Mode vận hành: 'production' | 'connected' | 'offline_resilient'
    mode: 'production',
    
    // Supabase PostgreSQL & Auth Credentials
    supabaseUrl: '',
    supabaseAnonKey: '',
    
    // Backend REST API Gateway (Node.js/Python server)
    apiBaseUrl: 'http://localhost:3001',
    
    // Gemini AI API Key (Chỉ lưu trong session hoặc backend proxy, không public)
    geminiApiKey: '',
    
    // AI Engine Status
    aiConnected: false,
    aiModel: 'SmartAttend Fraud Guard v2.0',

    // Hệ thống cảnh báo & geofence mặc định
    defaultGeofenceRadius: 300, // mét
    qrRotateInterval: 20, // giây
    sessionTimeoutMinutes: 120
  };

  class ConfigService {
    constructor() {
      this.config = this.loadConfig();
    }

    loadConfig() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
        }
      } catch (e) {
        console.warn('Could not read config from storage', e);
      }
      return { ...DEFAULT_CONFIG };
    }

    saveConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.error('Could not save config', e);
      }
    }

    get(key) {
      return this.config[key];
    }

    set(key, val) {
      this.config[key] = val;
      this.saveConfig(this.config);
    }

    isSupabaseReady() {
      return Boolean(this.config.supabaseUrl && this.config.supabaseAnonKey);
    }

    isGeminiReady() {
      return Boolean(this.config.geminiApiKey);
    }
  }

  window.SA = window.SA || { Views: {} };
  window.SA.Config = new ConfigService();
})();
