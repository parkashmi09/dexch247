import { useState } from "react";
import toast from "react-hot-toast";
import { changePassword } from "../apiservices/AuthService.js";
import Layout from "../components/layout/Layout.jsx";

export default function ChangePassword() {
  const [form, setForm] = useState({
    password: "",
    newPassword: "",
    newPasswordConfirm: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.newPasswordConfirm) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: form.password,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      setForm({ password: "", newPassword: "", newPasswordConfirm: "" });
    } catch (err) {
      toast.error(
        err?.response?.data?.error || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout variant="report-page">
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Change Password</h4>
        </div>
        <div className="card-body">
          <div className="report-form">
            <form className="" onSubmit={handleSubmit}>
              <div className="row row10">
                <div className="mb-3 position-relative col-md-6">
                  <label className="form-label">Current Password:</label>
                  <input
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Enter Current password"
                    value={form.password}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="row row10">
                <div className="mb-3 position-relative col-md-6">
                  <label className="form-label">New Password:</label>
                  <input
                    name="newPassword"
                    type="password"
                    className="form-control"
                    placeholder="Enter New Password"
                    value={form.newPassword}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="row row10">
                <div className="mb-4 position-relative col-md-6">
                  <label className="form-label">Confirm Password:</label>
                  <input
                    name="newPasswordConfirm"
                    type="password"
                    className="form-control"
                    placeholder="Confirm New Password"
                    value={form.newPasswordConfirm}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="row row10">
                <div className="mb-3 col-md-6">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block w-100"
                    disabled={loading}
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
