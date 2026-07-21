import React, { useState, useEffect, useMemo } from 'react';
import styles from './SportsViewMoreBetsModal.module.css';
import '../../pages/reports/style.css';
import { getMatchDownlineBets } from '../../services/api';

const SportsViewMoreBetsModal = ({ show, onHide, matchId, marketType }) => {
  const [topTab, setTopTab] = useState('normal'); // normal | bookmaker
  const [activeTab, setActiveTab] = useState('matched');
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter input states
  const [searchUser, setSearchUser] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('');

  // Applied filters (updated on Search submit)
  const [appliedFilters, setAppliedFilters] = useState({
    searchUser: '',
    ipAddress: '',
    amountFrom: '',
    amountTo: '',
  });

  // Radio type filter (applies immediately on change)
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    if (show && matchId) {
      // Reset filters on tab change
      setSearchUser('');
      setIpAddress('');
      setAmountFrom('');
      setAmountTo('');
      setTypeFilter('all');
      setAppliedFilters({ searchUser: '', ipAddress: '', amountFrom: '', amountTo: '' });
      fetchData();
    }
  }, [show, matchId, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === 'matched') {
        // Use the downline-scoped endpoint so that staff only see bets from
        // their own downline. Owner sees the full tree. The previous
        // /user/cricket/matched-bets/all endpoint had no hierarchy filter
        // and was leaking bets across agents.
        response = await getMatchDownlineBets({ eventId: matchId, limit: 500 });
      } else {
        response = { success: true, data: [] };
      }
      if (response && response.success) {
        setBets(response.data || []);
      } else {
        setBets([]);
      }
    } catch (error) {
      console.error('Error fetching modal bets:', error);
      setBets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedFilters({ searchUser, ipAddress, amountFrom, amountTo });
  };

  const handleReset = () => {
    setSearchUser('');
    setIpAddress('');
    setAmountFrom('');
    setAmountTo('');
    setTypeFilter('all');
    setAppliedFilters({ searchUser: '', ipAddress: '', amountFrom: '', amountTo: '' });
  };

  const filteredBets = useMemo(() => {
    return bets.filter((bet) => {
      const username = (bet.username || bet.user?.username || '').toLowerCase();
      const ip = (bet.ip || bet.ip_address || '').toLowerCase();
      const amount = parseFloat(bet.amount || bet.stake_amount || 0);

      const type = (bet.bet_type || bet.betType || bet.type || 'back').toLowerCase();
      const selection = (bet.selection || bet.selection_name || '').toLowerCase();

      // Dependable logic for Lay/No vs Back/Yes
      const isLay = type === 'lay' || type === 'no' || selection === 'no';

      if (appliedFilters.searchUser && !username.includes(appliedFilters.searchUser.toLowerCase()))
        return false;
      if (appliedFilters.ipAddress && !ip.includes(appliedFilters.ipAddress.toLowerCase()))
        return false;
      if (appliedFilters.amountFrom && amount < parseFloat(appliedFilters.amountFrom))
        return false;
      if (appliedFilters.amountTo && amount > parseFloat(appliedFilters.amountTo))
        return false;
      if (typeFilter === 'back' && isLay) return false;
      if (typeFilter === 'lay' && !isLay) return false;

      return true;
    });
  }, [bets, appliedFilters, typeFilter]);

  const handleDownloadCSV = () => {
    if (filteredBets.length === 0) return;
    const headers = ['Username', 'Nation', 'Rate', 'Amount', 'Date', 'IP'];
    const rows = filteredBets.map((bet) => [
      bet.username || bet.user?.username || '-',
      bet.selection || bet.selection_name || '-',
      bet.odds || '-',
      bet.amount || bet.stake_amount || '-',
      bet.created_at || '-',
      bet.ip || bet.ip_address || '-',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bets_${matchId}_${activeTab}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAmount = useMemo(
    () =>
      filteredBets
        .reduce((sum, bet) => sum + parseFloat(bet.amount || bet.stake_amount || 0), 0)
        .toFixed(2),
    [filteredBets]
  );

  // const handleDownloadCSV = () => {
  //   if (filteredBets.length === 0) return;

  //   const headers = ['Username', 'Nation', 'Rate', 'Amount', 'Date', 'IP'];
  //   const rows = filteredBets.map((bet) => [
  //     bet.username || bet.user?.username || '-',
  //     bet.selection || bet.selection_name || '-',
  //     bet.odds || '-',
  //     bet.amount || bet.stake_amount || '-',
  //     bet.created_at || '-',
  //     bet.ip || bet.ip_address || '-',
  //   ]);

  //   const csvContent = [
  //     headers.join(','),
  //     ...rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')),
  //   ].join('\n');

  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.setAttribute('href', url);
  //   link.setAttribute('download', `bets_${matchId}_${activeTab}.csv`);
  //   link.style.visibility = 'hidden';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };

  if (!show) return null;

  const tabContent = (tabId) => (
    <div>
      <div>
        <form method="post" data-vv-scope="searchBets" className="ajaxFormSubmit" onSubmit={handleSearch}>
          <div className="row row5 align-items-center mt-2 mb-3">
            <div className="col-xl-2">
              <label htmlFor="uname">Username</label>
              <input
                id="uname"
                type="text"
                placeholder="Search Username"
                className="form-control"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>
            <div className="col-xl-3">
              <div className="row row5">
                <div className="col-6">
                  <label htmlFor="amountfrom">Amount From</label>
                  <input
                    id="amountfrom"
                    name="amountFrom"
                    type="text"
                    placeholder="Amount From"
                    className="form-control"
                    value={amountFrom}
                    onChange={(e) => setAmountFrom(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label htmlFor="amountto">Amount To</label>
                  <input
                    id="amountto"
                    name="amountto"
                    type="text"
                    placeholder="Amount To"
                    className="form-control"
                    value={amountTo}
                    onChange={(e) => setAmountTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="col-xl-2">
              <label htmlFor="ipaddr">IP Address</label>
              <input
                id="ipaddr"
                name="ip"
                type="text"
                placeholder="IP Address"
                className="form-control"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
            </div>
            <div style={{ marginTop: '20px' }} className="col-xl-2">
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" className="btn btn-light" onClick={handleReset}>Reset</button>
            </div>
          </div>
        </form>

        <div className="modal-chekbox">
          <div role="radiogroup" tabIndex={-1} className="float-left bv-no-focus-ring">
            {[
              { value: 'all', label: 'All' },
              { value: 'back', label: 'Back' },
              { value: 'lay', label: 'Lay' },
              { value: 'deleted', label: 'Deleted' },
            ].map(({ value, label }) => (
              <div key={value} className="custom-control custom-control-inline custom-radio">
                <input
                  id={`radio-${tabId}-${value}`}
                  type="radio"
                  name={`radio-options-${tabId}`}
                  className="custom-control-input"
                  value={value}
                  checked={typeFilter === value}
                  onChange={() => setTypeFilter(value)}
                />
                <label htmlFor={`radio-${tabId}-${value}`} className="custom-control-label">
                  <span>{label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="custom-control-inline float-right">
          <h5>
            Total Soda:{' '}
            <span className="text-success mr-2">{filteredBets.length}</span>
            Total Amount:{' '}
            <span className="text-success">{totalAmount}</span>
          </h5>
        </div>
       

        {/* <div className="clearfix"></div> */}
      </div>
      <hr className="my-2 border-top border-light" />

      <div className="table-responsive report-table">
        <table className="table my-bets-table">
          <thead>
            <tr>
              <th className="user-name"><div>Username</div></th>
              <th className="event-name"><div>Nation</div></th>
              <th><div>Bet Type</div></th>
              <th className="text-right bet-user-rate"><div>Rate</div></th>
              <th className="text-right bet-amount"><div>Amount</div></th>
              <th className="bet-date"><div>Date</div></th>
              <th><div>IP</div></th>
              <th><div>B Details</div></th>
              <th className="text-right"><div>Action</div></th>
            </tr>
          </thead>
          <tbody>
            {filteredBets.length > 0 ? (
              filteredBets.map((bet, idx) => {
                const type = (bet.bet_type || bet.betType || bet.type || 'back').toLowerCase();
                const selection = (bet.selection || bet.selection_name || '').toLowerCase();
                const isLay = type === 'lay' || type === 'no' || selection === 'no';

                return (
                  <tr key={bet.id || idx} className={isLay ? 'lay-border' : 'back-border'}>
                    <td className="user-name">
                      <div>{bet.username || bet.user?.username || '-'}</div>
                    </td>
                    <td className="event-name">
                      <div>{bet.selection || bet.selection_name || '-'}</div>
                    </td>
                    <td>
                      <div className={isLay ? 'text-danger' : 'text-primary'} style={{ fontWeight: 'bold' }}>
                        {isLay ? 'LAY' : 'BACK'}
                      </div>
                    </td>
                    <td className="text-right bet-user-rate">
                      <div>{bet.odds || '-'}</div>
                    </td>
                    <td className="text-right bet-amount">
                      <div>{bet.amount || bet.stake_amount || '-'}</div>
                    </td>
                    <td className="bet-date">
                      <div>{bet.created_at || '-'}</div>
                    </td>
                    <td>
                      <a href="javascript:void(0)">{bet.ip || bet.ip_address || '-'}</a>
                    </td>
                    <td>
                      <a href="javascript:void(0)" className="text-success">Detail</a>
                    </td>
                    <td className="text-right">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          value={idx}
                          id={`chk-${tabId}-${idx}`}
                        />
                        <label className="custom-control-label" htmlFor={`chk-${tabId}-${idx}`}></label>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalDialogCustom}>
        <div className={styles.viewMoreModalContent}>
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>View More</h5>
            <button className={styles.closeButton} onClick={onHide}>&times;</button>
          </div>

          <div className={`${styles.modalBody} modal-body sports-view-more-modal`}>
            <ul role="tablist" className="nav nav-tabs d-inline-block text-uppercase">
              <li className="nav-item d-inline-block">
                <a
                  data-toggle="tab"
                  href="#"
                  className={`nav-link${topTab === 'normal' ? ' active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setTopTab('normal'); }}
                >
                  Normal
                </a>
              </li>
              <li className="nav-item d-inline-block">
                <a
                  data-toggle="tab"
                  href="#"
                  className={`nav-link${topTab === 'bookmaker' ? ' active' : ''}`}
                  onClick={(e) => { e.preventDefault(); setTopTab('bookmaker'); }}
                >
                  Bookmaker
                </a>
              </li>
            </ul>

            <div className="tab-content m-t-20">
              <div className="tabs">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <ul role="tablist" className="nav nav-pills card-header-pills">
                    <li role="presentation" className="nav-item">
                      <a
                        role="tab"
                        aria-selected={activeTab === 'matched'}
                        aria-setsize={2}
                        aria-posinset={1}
                        href="#"
                        className={`nav-link${activeTab === 'matched' ? ' active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setActiveTab('matched'); }}
                      >
                        Matched Bets
                      </a>
                    </li>
                    <li role="presentation" className="nav-item">
                      <a
                        role="tab"
                        tabIndex={activeTab === 'matched' ? -1 : 0}
                        aria-selected={activeTab === 'deleted'}
                        aria-setsize={2}
                        aria-posinset={2}
                        href="#"
                        className={`nav-link${activeTab === 'deleted' ? ' active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setActiveTab('deleted'); }}
                      >
                        Deleted Bets
                      </a>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={handleDownloadCSV}
                  >
                    Download CSV
                  </button>
                </div>

                <div className="tab-content">
                  <div
                    role="tabpanel"
                    aria-hidden={activeTab !== 'matched'}
                    className={`tab-pane card-body${activeTab === 'matched' ? ' active' : ''}`}
                    style={activeTab !== 'matched' ? { display: 'none' } : {}}
                  >
                    {loading ? (
                      <div className="text-center p-5">Loading...</div>
                    ) : (
                      <div id="matched-bet2" className={activeTab === 'matched' ? 'tab-pane active' : ''}>
                        {tabContent('matched')}
                      </div>
                    )}
                  </div>

                  <div
                    role="tabpanel"
                    aria-hidden={activeTab !== 'deleted'}
                    className={`tab-pane card-body${activeTab === 'deleted' ? ' active' : ''}`}
                    style={activeTab !== 'deleted' ? { display: 'none' } : {}}
                  >
                    {loading ? (
                      <div className="text-center p-5">Loading...</div>
                    ) : (
                      <div>
                        {tabContent('deleted')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportsViewMoreBetsModal;
