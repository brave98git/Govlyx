import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthInput from "../components/auth/AuthInput";
import { loginUser } from "../api/authService";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError(null);

    // Frontend validation
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      if (response.success && response.data?.token) {
        // Save JWT token to localStorage
        localStorage.setItem("token", response.data.token);
        navigate("/");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Welcome back"
        subtitle="Login to continue to Govlyx"
      />

      {/* Error Message */}
      {error && (
        <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <button
          className="btn w-full bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-sm opacity-70">
        Don't have an account?{" "}
        <NavLink
          to="/register"
          className="text-lg text-red-400 font-bold hover:underline"
        >
          Register
        </NavLink>
      </p>
    </AuthLayout>
  );
};

export default Login;