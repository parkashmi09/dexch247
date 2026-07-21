import { useWhitelabel } from "../../hooks/useWhitelabel.js";

export default function Footer() {
  const { supportText, copyrightText } = useWhitelabel();
  return (
    <>
      <section className="footer">
        <div className="footer-top">
          <div className="footer-links">
            <nav className="navbar navbar-expand-sm">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/terms-and-conditions"
                    target="_blank"
                  >
                    Terms and Conditions
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link"
                    href="/responsible-gaming"
                    target="_blank"
                  >
                    Responsible Gaming
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="support-detail">
            <h2>{supportText}</h2>
            <p></p>
          </div>
          <div className="social-icons-box"></div>
        </div>
      </section>
      <div className="footer-bottom">
        <div className="secure-logo">
          <div>
            <img src="/assets/brand/ssl.png" alt="SSL" />
          </div>
          <div className="ml-2">
            <b>100% SAFE</b>
            <div>Protected connection and encrypted data.</div>
          </div>
        </div>
        <div className="d-inline-block">
          <a href="#">
            <img src="/assets/brand/18plus.png" alt="18+" />
          </a>
          <a href="https://www.gamcare.org.uk/" target="_blank" rel="noreferrer">
            <img src="/assets/brand/gamcare.png" alt="GamCare" />
          </a>
          <a href="https://www.gamblingtherapy.org/" target="_blank" rel="noreferrer">
            <img src="/assets/brand/gt.png" alt="Gambling Therapy" />
          </a>
        </div>
      </div>
      <div className="footer-text">
        <p></p>
        <p className="text-center">{copyrightText}</p>
      </div>
    </>
  );
}
