import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchBalanceThunk,
  fetchUserProfileThunk,
} from "../../features/user/userSlice.js";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children, rightSidebar, variant = "home-page" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated, balance } = useSelector((s) => s.user);

  // On mount (first authenticated page load), fetch profile + balance if
  // we have a token but haven't loaded balance yet. This mirrors the old
  // NavBar behaviour which called getUserProfileWithWallet on mount.
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem("token");
    if (!token || token === "demo-token") return;

    // Fetch profile if we don't have user_id yet (e.g. page refresh)
    if (!user?.user_id) {
      dispatch(fetchUserProfileThunk());
    }

    // Fetch balance (also initialises the socket for real-time updates)
    if (balance === null) {
      dispatch(fetchBalanceThunk());
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="wrapper">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-container">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={`center-main-container ${variant}`}>
          <div className="center-container">{children}</div>
          {rightSidebar}
        </div>
      </div>
      <Footer />
    </div>
  );
}
