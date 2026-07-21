import { useState } from 'react';
import { Modal, Nav, Tab } from 'react-bootstrap';
import { RULES_DATA } from './firstLoginRulesData.js';

const FLAG_URL =
  'https://versionobj.ecoassetsservice.com/v104/static/front/img/flags/flag_english.png';

const CATEGORIES = Object.keys(RULES_DATA);

export default function FirstLoginRulesModal({ show, onHide, onAccept }) {
  const [activeKey, setActiveKey] = useState('0');

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      className="rules-modal"
      scrollable
    >
      <Modal.Header>
        <div className="modal-title h4">Rules</div>
        <div className="rules-langualge">
          <div className="dropdown">
            <button type="button" className="dropdown-toggle btn">
              <img src={FLAG_URL} alt="English flag" />
              English
            </button>
          </div>
        </div>
        <button type="button" className="btn-close" aria-label="Close" onClick={onHide} />
      </Modal.Header>

      <Modal.Body>
        <Tab.Container activeKey={activeKey} onSelect={setActiveKey} id="tules-tabs">
          <div className="rules-left-sidebar">
            <Nav as="div" className="nav-pills" role="tablist">
              {CATEGORIES.map((cat, idx) => (
                <Nav.Item key={cat}>
                  <Nav.Link eventKey={String(idx)} href="#">
                    {cat}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>

          <div className="rules-content">
            <Tab.Content>
              {CATEGORIES.map((cat, idx) => (
                <Tab.Pane key={cat} eventKey={String(idx)}>
                  {RULES_DATA[cat].map((section, sIdx) => (
                    <div key={sIdx}>
                      <div className="rules-content-title">{section.title}</div>
                      <div className="rules-content-desc">
                        <div className="table-responsive">
                          <table className="table table-bordered">
                            <tbody>
                              {section.content.map((rule, rIdx) => {
                                const isRed =
                                  typeof rule === 'object' && rule.color === 'red';
                                const text =
                                  typeof rule === 'object' ? rule.text : rule;
                                return (
                                  <tr key={rIdx}>
                                    <td>
                                      <span className={isRed ? 'text-danger' : ''}>
                                        {text}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </div>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer>
        <span>I agree all rules</span>
        <div>
          <button className="btn btn-success" onClick={onAccept}>
            Accept
          </button>
          <button className="btn btn-danger ms-1" onClick={onHide}>
            Cancel
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
