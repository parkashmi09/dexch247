import { Modal } from 'react-bootstrap'

/**
 * RunAmountModal Component
 * 
 * Modal component for displaying Run Amount data.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Function} props.onHide - Function to close the modal
 * @param {string} props.title - Modal title (default: "Run Amount")
 * @param {Array} props.data - Array of run amount data (default: [])
 */
function RunAmountModal({ show, onHide, title = "Run Amount", data = [] }) {
  const handleClose = () => {
    onHide()
  }

  // Default data structure
  const defaultData = [
    { run: 10, amount: 100 },
    { run: 20, amount: 200 },
    { run: 30, amount: 300 },
    { run: 40, amount: 400 },
    { run: 50, amount: 500 }
  ]

  const displayData = data.length > 0 ? data : defaultData

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      dialogClassName="modal-md modal-dialog-scrollable"
    >
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
        <button 
          type="button" 
          className="close text-white" 
          onClick={handleClose}
          aria-label="Close"
        >
          x
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className="table-responsive run-amount-container">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Run</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length > 0 ? (
                displayData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.run}</td>
                    <td>{item.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center">No record found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default RunAmountModal

