import { NavLink } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthHeader from "../components/auth/AuthHeader";
import AuthInput from "../components/auth/AuthInput";

const Register = () => {
  return (
    <AuthLayout>
      <AuthHeader
        title="Create account"
        subtitle="Join Govlyx anonymously"
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

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
        />

        <AuthInput
          label="Pincode"
          type="number"
          placeholder="110001"
          helperText="Used to personalize local feeds and updates"
        />

        <button className="btn w-full bg-blue-700 text-white hover:bg-blue-800">
          Register
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
