import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthInput from "../components/auth/AuthInput";
import { registerCitizen } from "../api/authService";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError(null);
    setSuccess(null);

    // Frontend validation
    if (!form.email || !form.password || !form.confirmPassword || !form.pincode) {
      setError("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.pincode.length !== 6) {
      setError("Pincode must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await registerCitizen({
        email: form.email,
        password: form.password,
        pincode: form.pincode,
      });

      if (response.success) {
        setSuccess(response.message || "Registered successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeader
        title="Create account"
        subtitle="Join Govlyx anonymously"
      />

      {/* Error Message */}
      {error && (
        <div className="mb-3 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-3 rounded-md bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-400">
          {success}
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

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <AuthInput
          label="Pincode"
          type="number"
          placeholder="110001"
          helperText="Used to personalize local feeds and updates"
          name="pincode"
          value={form.pincode}
          onChange={handleChange}
        />

        <button
          className="btn w-full bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-sm opacity-70">
        Already have an account?{" "}
        <NavLink
          to="/login"
          className="text-lg text-red-400 font-bold hover:underline"
        >
          Login
        </NavLink>
      </p>
    </AuthLayout>
  );
};

export default Register;