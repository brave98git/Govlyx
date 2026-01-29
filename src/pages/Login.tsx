import { NavLink } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthInput from "../components/auth/AuthInput";

const Login = () => {
  return (
    <AuthLayout >
      <AuthHeader
        title="Welcome back"
        subtitle="Login to continue to Govlyx"
      />

      {/* Form */}
      <div className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="••••••••"
        />

        <button className="btn w-full bg-blue-700 text-white hover:bg-blue-800">
          Login
        </button>
      </div>

      {/* Footer */}
      <p className="mt-4 text-center text-sm opacity-70">
        Don’t have an account?{" "}
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
