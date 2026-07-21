import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useWhitelabel } from "../../hooks/useWhitelabel.js";
import { getWelcomeBanner } from "../../apiservices/BannerApi.js";

const STORAGE_KEY = "showWelcomeModal";

// Phishing warning modal — opens only once right after login (the login flow
// sets the localStorage flag). Closing it clears the flag so it stays hidden
// until the next login. The banner is fetched dynamically and renders a
// device-specific image (mobile vs desktop), falling back to the bundled
// whitelabel banner if the feed is unavailable.
export default function WelcomeModal() {
  const { welcomeBanner: FALLBACK } = useWhitelabel();
  const [show, setShow] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getWelcomeBanner().then((b) => {
      if (!cancelled && b) setBanner(b);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Prefer the dynamic images; fall back to the bundled static banner.
  const desktop = banner?.img_desktop || FALLBACK;
  const mobile = banner?.img_mobile || banner?.img_desktop || FALLBACK;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          ⚠️ Beware Of Phishing Websites Before Login. Enable Security Auth To
          Secure Your ID.
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <picture>
          {/* Phones get the portrait image; tablet/desktop the wide one. */}
          <source media="(max-width: 767.98px)" srcSet={mobile} />
          <img src={desktop} className="img-fluid w-100 d-block" alt="Welcome" />
        </picture>
        {banner?.bdesc?.trim() ? (
          <p
            className="text-center mb-0 px-3 py-2"
            style={{ whiteSpace: "pre-line" }}
          >
            {banner.bdesc.trim()}
          </p>
        ) : null}
      </Modal.Body>
    </Modal>
  );
}
