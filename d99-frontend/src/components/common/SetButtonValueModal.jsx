import { useState, useEffect } from "react";
import { Modal, Nav, Tab } from "react-bootstrap";
import toast from "react-hot-toast";
import { getStakeButtonValues, updateStakeButtonValues } from "../../apiservices/stakeButtonValueService.js";

function ButtonForm({ buttons, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="row row10">
        <div className="mb-1 col-6"><label className="form-label"><b>Price Label:</b></label></div>
        <div className="mb-1 col-6"><label className="form-label"><b>Price Value:</b></label></div>
      </div>
      {buttons.map((btn, i) => (
        <div className="row row10" key={i}>
          <div className="mb-3 col-6 position-relative">
            <input
              type="text"
              className="form-control"
              value={btn.label}
              onChange={(e) => onChange(i, "label", e.target.value)}
            />
          </div>
          <div className="mb-3 col-6 position-relative">
            <input
              type="text"
              className="form-control"
              value={btn.value}
              onChange={(e) => onChange(i, "value", e.target.value)}
            />
          </div>
        </div>
      ))}
      <div className="row row10">
        <div className="mb-3 col-md-6 col-12">
          <button type="submit" className="btn btn-primary btn-block w-100" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function SetButtonValueModal({ show, onHide }) {
  const [gameButtons, setGameButtons] = useState([]);
  const [casinoButtons, setCasinoButtons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    if (show) {
      setActiveTab("1");
      (async () => {
        try {
          const data = await getStakeButtonValues();
          setGameButtons(data.game_buttons || []);
          setCasinoButtons(data.casino_buttons || []);
        } catch {
          toast.error("Failed to load button values");
        }
      })();
    }
  }, [show]);

  const handleChange = (type, index, field, value) => {
    const setter = type === "game" ? setGameButtons : setCasinoButtons;
    setter((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: field === "value" ? (value === "" ? "" : Number(value) || value) : value };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStakeButtonValues({
        game_buttons: gameButtons,
        casino_buttons: casinoButtons,
      });
      toast.success("Button values updated successfully");
      onHide();
    } catch {
      toast.error("Failed to update button values");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md">
      <Modal.Header closeButton>
        <Modal.Title>Set Button Value</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
        <Tab.Container id="rules-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="pills" className="mt-1">
            <Nav.Item>
              <Nav.Link eventKey="1">Game Buttons</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="2">Casino Buttons</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="mt-1">
            <Tab.Pane eventKey="1">
              {activeTab === "1" && (
                <ButtonForm
                  buttons={gameButtons}
                  onChange={(i, f, v) => handleChange("game", i, f, v)}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              )}
            </Tab.Pane>
            <Tab.Pane eventKey="2">
              {activeTab === "2" && (
                <ButtonForm
                  buttons={casinoButtons}
                  onChange={(i, f, v) => handleChange("casino", i, f, v)}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  );
}
