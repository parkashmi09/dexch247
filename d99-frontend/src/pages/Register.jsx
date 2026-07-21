import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../apiservices/AuthService.js";

const LOGO = "/assets/brand/logo.png";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", phone: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error("Username and password are required");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({
        username: form.username,
        phone: form.phone,
        password: form.password,
      });
      toast.success("Account created — please log in");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wrapper">
      <div className="login-page">
        <div className="login-box">
          <div className="logo-login">
            <img src={LOGO} alt="Logo" />
          </div>
          <div className="login-form mt-4">
            <h4 className="text-center login-title">
              REGISTER <i className="fas fa-hand-point-down"></i>
            </h4>
            <form onSubmit={submit}>
              <div className="mb-4 input-group position-relative">
                <input
                  name="username"
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  value={form.username}
                  onChange={onChange}
                  autoComplete="username"
                />
                <span className="input-group-text">
                  <i className="fas fa-user"></i>
                </span>
              </div>
              <div className="mb-4 input-group position-relative">
                <input
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={onChange}
                  autoComplete="tel"
                />
                <span className="input-group-text">
                  <i className="fas fa-phone"></i>
                </span>
              </div>
              <div className="mb-4 input-group position-relative">
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="new-password"
                />
                <span className="input-group-text">
                  <i className="fas fa-key"></i>
                </span>
              </div>
              <div className="mb-4 input-group position-relative">
                <input
                  name="confirm"
                  type="password"
                  className="form-control"
                  placeholder="Confirm password"
                  value={form.confirm}
                  onChange={onChange}
                  autoComplete="new-password"
                />
                <span className="input-group-text">
                  <i className="fas fa-key"></i>
                </span>
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                  Create account<i className="fas fa-user-plus float-end mt-1"></i>
                </button>
              </div>
              <p className="mt-3 text-center">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
