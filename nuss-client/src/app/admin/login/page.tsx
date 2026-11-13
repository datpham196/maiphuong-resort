"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, setAdminToken } from "@/services/admin-rooms";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await adminLogin(username, password);
      setAdminToken(result.accessToken);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <div className="login-card">
        <div className="login-decor" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="login-brand">
          <span className="login-brand-mark" aria-hidden="true" />
          <strong>Mai Phương</strong>
        </div>
        <p className="login-tagline">Quản lý nội dung resort nhanh và rõ ràng</p>
        <h1>Welcome Back!</h1>

        <form className="login-form" onSubmit={onSubmit}>
          <label className="login-field">
            <span>Tài khoản</span>
            <div className="login-input-line">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
              {username.trim() ? <em className="login-ok">✓</em> : null}
            </div>
            {username.trim() ? <p className="login-hint">Perfect!</p> : null}
          </label>

          <label className="login-field">
            <span>Mật khẩu</span>
            <div className="login-input-line">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
            {password.length >= 6 ? <p className="login-hint">Mật khẩu đã sẵn sàng.</p> : null}
          </label>

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Đang đăng nhập…" : "Sign In"}
          </button>
        </form>

        <p className="login-foot">Mai Phương Resort · nội bộ</p>
      </div>
    </main>
  );
}
