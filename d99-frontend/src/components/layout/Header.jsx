import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dropdown } from "react-bootstrap";
import { logout } from "../../features/user/userSlice.js";
import { isDemoUser } from "../../utils/demoUtils.js";
import { useExposure } from "../../hooks/useExposure.jsx";
import { getUserSportsCasinoOpenBets } from "../../apiservices/SportsApi.js";
import homeData from "../../constants/homeData.json";
import AviatorIcon from "../home/AviatorIcon.jsx";
import SetButtonValueModal from "../common/SetButtonValueModal.jsx";
import ExposureModal from "../exposureModal/ExposureModal.jsx";
import FirstLoginRulesModal from "../common/FirstLoginRulesModal.jsx";
import SearchBox from "./SearchBox.jsx";
import { useWhitelabel } from "../../hooks/useWhitelabel.js";

function UserDropdownMenu({
  className,
  id,
  show,
  onToggle,
  showBalance,
  showExposure,
  onToggleBalance,
  onToggleExposure,
  onRulesClick,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user.user);
  const isDemo = isDemoUser(user);

  const [showButtonModal, setShowButtonModal] = useState(false);

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <Dropdown className={className} show={show} onToggle={onToggle}>
      <Dropdown.Toggle
        as="a"
        id={id}
        className={`user-name ${className}`}
        style={{ cursor: "pointer" }}
      >
        <UserName />
        <i className="fas fa-chevron-down ms-1"></i>
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">
        <Dropdown.Item as={Link} to="/account-statement">
          Account Statement
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/current-bet">
          Current Bet
        </Dropdown.Item>
        {!isDemo && (
          <Dropdown.Item as={Link} to="/activity-log">
            Activity Logs
          </Dropdown.Item>
        )}
        <Dropdown.Item as={Link} to="/casino-results">
          Casino Results
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/live-casino-bets">
          Live Casino Bets
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setShowButtonModal(true)}>Set Button Values</Dropdown.Item>
        <Dropdown.Item as={Link} to="/secure-auth">
          Security Auth Verification
        </Dropdown.Item>
        <Dropdown.Item as={Link} to="/change-password">
          Change Password
        </Dropdown.Item>
        <Dropdown.Item className="d-xl-none" onClick={onRulesClick}>Rules</Dropdown.Item>

        {/* Plain anchors (not Dropdown.Item) so the menu stays open and the
            checkbox is purely state-driven — pointerEvents:none stops the
            browser's native checkbox toggle from desyncing the UI. */}
        <a
          className="dropdown-item d-xl-none"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBalance();
          }}
        >
          Balance
          <div className="form-check float-end" style={{ pointerEvents: "none" }}>
            <input
              className="form-check-input"
              type="checkbox"
              checked={showBalance}
              readOnly
            />
          </div>
        </a>

        <a
          className="dropdown-item d-xl-none"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExposure();
          }}
        >
          Exposure
          <div className="form-check float-end" style={{ pointerEvents: "none" }}>
            <input
              className="form-check-input"
              type="checkbox"
              checked={showExposure}
              readOnly
            />
          </div>
        </a>

        <Dropdown.Divider />
        <Dropdown.Item onClick={handleSignOut}>SignOut</Dropdown.Item>
      </Dropdown.Menu>
      <SetButtonValueModal show={showButtonModal} onHide={() => setShowButtonModal(false)} />
    </Dropdown>
  );
}

function UserName() {
  const user = useSelector((s) => s.user.user);
  return <>{user?.username || "User"}</>;
}

function BalanceDisplay({ showBalance, showExposure, onToggleBalance, onToggleExposure, onRulesClick }) {
  const { user, balance: reduxBalance, exposure: reduxExposure } = useSelector((s) => s.user);
  const { totalExposure, inrBalance } = useExposure();
  const [showExposureModal, setShowExposureModal] = useState(false);
  const [openBetsList, setOpenBetsList] = useState([]);

  const isDemo = isDemoUser(user);
  const token = localStorage.getItem("token");
  const isDemoMode = !token || isDemo;

  const displayBalance = isDemoMode ? (reduxBalance ?? 1500) : inrBalance;
  const displayExposure = isDemoMode ? (reduxExposure ?? 0) : totalExposure;

  const userId = user?._id || user?.user_id || user?.id;

  // Fetch open bets for badge count
  useEffect(() => {
    if (!userId || isDemoMode) return;
    let mounted = true;
    getUserSportsCasinoOpenBets(userId)
      .then((res) => {
        if (mounted && res?.data && Array.isArray(res.data)) {
          setOpenBetsList(res.data);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [userId, isDemoMode]);

  const openBetsCount = openBetsList.length;
  const canOpenExposureModal =
    (displayExposure != null && displayExposure !== 0) || openBetsCount > 0;

  return (
    <div className="user-balance ms-1 ms-xl-3">
      {showBalance && (
        <div>
          <span>Balance:</span>
          <b>{displayBalance !== null ? Number(displayBalance).toFixed(0) : "--"}</b>
        </div>
      )}
      <div>
        {showExposure && (
          <>
            <span>Exp:</span>
            <b
              className="pointer"
              style={{ cursor: canOpenExposureModal ? "pointer" : "default" }}
              onClick={() => { if (canOpenExposureModal) setShowExposureModal(true); }}
            >
              {displayExposure !== null ? Number(displayExposure).toFixed(0) : "--"}
            </b>
            {openBetsCount > 0 && (
              <span style={{ marginLeft: 2, fontSize: 11 }}>({openBetsCount})</span>
            )}
          </>
        )}
        {/* Mobile user dropdown — inline after exposure */}
        <UserDropdownMenu
          className="d-inline-block d-xl-none ms-1 ms-xl-3"
          id="user-dropdown-mobile"
          showBalance={showBalance}
          showExposure={showExposure}
          onToggleBalance={onToggleBalance}
          onToggleExposure={onToggleExposure}
          onRulesClick={onRulesClick}
        />
      </div>
      <ExposureModal
        show={showExposureModal}
        onHide={() => setShowExposureModal(false)}
        userId={userId}
        openBetsData={openBetsList}
      />
    </div>
  );
}

export default function Header({ setSidebarOpen }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/home" || location.pathname === "/";
  const { logo: LOGO, apkUrl: APK_URL, marqueeText: MARQUEE_TEXT } = useWhitelabel();

  // Balance/Exposure visibility toggles (mobile dropdown checkboxes).
  // Plain state — both always start enabled on page load.
  const [showBalance, setShowBalance] = useState(true);
  const [showExposure, setShowExposure] = useState(true);

  // Rules modal — opened from the desktop Rules link + mobile dropdown
  const [showRules, setShowRules] = useState(false);

  const toggleBalance = () => setShowBalance((prev) => !prev);
  const toggleExposure = () => setShowExposure((prev) => !prev);

  return (
    <section className="header">
      <div className="header-top">
        <div className="logo-header">
          {isHomePage ? (
            <a
              className="d-xl-none"
              onClick={() => setSidebarOpen(true)}
              style={{ cursor: "pointer" }}
            >
              <i className="fas fa-bars me-2"></i>
            </a>
          ) : (
            <Link className="d-xl-none" to="/home">
              <i className="fas fa-home me-1"></i>
            </Link>
          )}
          <Link to="/home">
            <img src={LOGO} alt="Logo" />
          </Link>
        </div>

        <div className="user-details">
          {/* Desktop search */}
          <div className="search-box-container d-none d-xl-block">
            <SearchBox />
          </div>

          {/* Rules + APK */}
          <div className="header-rules ms-3">
            <div>
              <a className="rules-link pointer" onClick={() => setShowRules(true)}>
                <b>Rules</b>
              </a>
            </div>
            <div>
              <a target="_blank" rel="noreferrer" href={APK_URL}>
                <span>
                  <b>Download Apk</b> <i className="fab fa-android"></i>
                </span>
              </a>
            </div>
          </div>

          {/* Balance + Exposure + Mobile dropdown */}
          <BalanceDisplay
            showBalance={showBalance}
            showExposure={showExposure}
            onToggleBalance={toggleBalance}
            onToggleExposure={toggleExposure}
            onRulesClick={() => setShowRules(true)}
          />

          {/* Desktop user dropdown */}
          <UserDropdownMenu
            className="d-none d-xl-block ms-3"
            id="user-dropdown-desktop"
            showBalance={showBalance}
            showExposure={showExposure}
            onToggleBalance={toggleBalance}
            onToggleExposure={toggleExposure}
            onRulesClick={() => setShowRules(true)}
          />
        </div>

        {/* Desktop marquee (below header-top, inside header) */}
        {/* <div className="news d-none d-xl-block">
          <marquee scrollAmount="3">{MARQUEE_TEXT}</marquee>
        </div> */}

        {/* Mobile search + marquee */}
        <div className="search-box-container d-xl-none">
          <SearchBox />
          <div className="news">
            <marquee scrollAmount="3">{MARQUEE_TEXT}</marquee>
          </div>
          <div className="depowith">
            <div className="d-xl-none d-flex justify-content-center"></div>
          </div>
        </div>
      </div>

      {/* Desktop nav bar */}
      <div className="header-bottom d-none d-xl-block">
        <nav className="navbar navbar-expand">
          <ul className="navbar-nav">
            {homeData.nav_items.map((item) => (
              <li className="nav-item" key={item.href + item.label}>
                <NavLink
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                  to={item.href}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="nav-item aviator">
              <NavLink className="nav-link" to="/aviator-list">
                <AviatorIcon />
                <span className="ms-1">Crash</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      {/* Rules modal — desktop Rules link + mobile dropdown Rules */}
      <FirstLoginRulesModal
        show={showRules}
        onHide={() => setShowRules(false)}
        onAccept={() => setShowRules(false)}
      />
    </section>
  );
}
