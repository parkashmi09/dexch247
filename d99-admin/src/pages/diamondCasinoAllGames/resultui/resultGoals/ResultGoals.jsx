import React, { useState, useEffect } from 'react';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import "../resultTeen20c/Result.css";
import soccerBallImage from '../../../../assets/img/soccer-ball.png';

// Helper function to parse rdesc for Goals game
const parseRdesc = (rdesc) => {
  if (!rdesc) return { playerName: "", eventType: "" };
  
  const parts = rdesc.split('#');
  const playerName = parts[0] || "";
  const eventType = parts[1] || "";
  
  return { playerName, eventType };
};

// Helper function to get initials from player name
const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const ResultGoals = ({ 
  data = [], 
  gameData = {},
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [lastResults, setLastResults] = useState([]);
  const [detailResult, setDetailResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch last results on mount
  useEffect(() => {
    const fetchLastResults = async () => {
      try {
        const response = await getLastResults('goal');
        const results = [];
        
        // Handle t1 and t2 structure (Goals API format)
        if (response?.data?.data?.t1) {
          const result = response.data.data.t1;
          const rdescData = parseRdesc(result.rdesc);
          const displayName = getInitials(rdescData.playerName || result.winnat || "");
          
          results.push({
            mid: result.rid,
            win: displayName || result.win || "",
            playerName: rdescData.playerName || result.winnat || "",
            eventType: rdescData.eventType || "",
            fullData: result
          });
        }
        
        if (response?.data?.data?.t2) {
          const result = response.data.data.t2;
          const rdescData = parseRdesc(result.rdesc);
          const displayName = getInitials(rdescData.playerName || result.winnat || "");
          
          results.push({
            mid: result.rid,
            win: displayName || result.win || "",
            playerName: rdescData.playerName || result.winnat || "",
            eventType: rdescData.eventType || "",
            fullData: result
          });
        }
        
        // Handle array format if API returns multiple results
        if (response?.data?.data?.res && Array.isArray(response.data.data.res)) {
          const mappedResults = response.data.data.res.map(item => {
            const rdescData = parseRdesc(item.rdesc);
            const displayName = getInitials(rdescData.playerName || item.winnat || "");
            return {
              mid: item.rid || item.mid,
              win: displayName || item.win || "",
              playerName: rdescData.playerName || item.winnat || "",
              eventType: rdescData.eventType || "",
              fullData: item
            };
          });
          results.push(...mappedResults);
        }
        
        if (results.length > 0) {
          setLastResults(results);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    };
    
    fetchLastResults();
  }, []);

  const handleResultClick = async (result, index) => {
    setSelectedResult(result);
    setLoading(true);
    
    // First, ensure we have last results
    if (lastResults.length === 0) {
      try {
        const response = await getLastResults('goal');
        const results = [];
        
        // Handle t1 and t2 structure (Goals API format)
        if (response?.data?.data?.t1) {
          const result = response.data.data.t1;
          const rdescData = parseRdesc(result.rdesc);
          const displayName = getInitials(rdescData.playerName || result.winnat || "");
          
          results.push({
            mid: result.rid,
            win: displayName || result.win || "",
            playerName: rdescData.playerName || result.winnat || "",
            eventType: rdescData.eventType || "",
            fullData: result
          });
        }
        
        if (response?.data?.data?.t2) {
          const result = response.data.data.t2;
          const rdescData = parseRdesc(result.rdesc);
          const displayName = getInitials(rdescData.playerName || result.winnat || "");
          
          results.push({
            mid: result.rid,
            win: displayName || result.win || "",
            playerName: rdescData.playerName || result.winnat || "",
            eventType: rdescData.eventType || "",
            fullData: result
          });
        }
        
        // Handle array format if API returns multiple results
        if (response?.data?.data?.res && Array.isArray(response.data.data.res)) {
          const mappedResults = response.data.data.res.map(item => {
            const rdescData = parseRdesc(item.rdesc);
            const displayName = getInitials(rdescData.playerName || item.winnat || "");
            return {
              mid: item.rid || item.mid,
              win: displayName || item.win || "",
              playerName: rdescData.playerName || item.winnat || "",
              eventType: rdescData.eventType || "",
              fullData: item
            };
          });
          results.push(...mappedResults);
        }
        
        if (results.length > 0) {
          setLastResults(results);
        }
      } catch (error) {
        console.error('Error fetching last results:', error);
      }
    }
    
    // Find the mid for this result
    let mid = null;
    if (typeof result === 'object' && result.mid) {
      mid = result.mid;
    } else if (index < lastResults.length) {
      mid = lastResults[index]?.mid;
    } else if (index < data.length + (gameData?.lrs?.length || 0)) {
      // For older results, try to get from gameData or use a default
      mid = gameData?.data?.data?.mid || gameData?.mid;
    }
    
    // Fetch detail results if we have a mid
    if (mid) {
      try {
        const response = await getDetailResults('goal', mid.toString());
        if (response?.data?.data?.t1) {
          setDetailResult(response.data.data.t1);
        }
      } catch (error) {
        console.error('Error fetching detail results:', error);
      }
    }
    
    setLoading(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResult(null);
    setDetailResult(null);
  };

  // Format modal data based on selected result
  const getModalData = () => {
    if (!selectedResult) return null;

    // Use detailResult if available, otherwise use selectedResult data
    const resultData = detailResult || (typeof selectedResult === 'object' ? selectedResult.fullData : null);
    
    if (!resultData) {
      // Fallback to basic data
      return {
        roundId: gameData?.data?.data?.mid || gameData?.mid || "N/A",
        matchTime: gameData?.data?.data?.mt || new Date().toLocaleString(),
        playerName: typeof selectedResult === 'object' ? selectedResult.playerName : "",
        eventType: typeof selectedResult === 'object' ? selectedResult.eventType : "",
        card: "",
        winner: typeof selectedResult === 'object' ? selectedResult.playerName : selectedResult || "",
      };
    }

    const rdescData = parseRdesc(resultData.rdesc);
    
    return {
      roundId: resultData.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
      matchTime: resultData.mtime || gameData?.data?.data?.mt || new Date().toLocaleString(),
      playerName: rdescData.playerName || resultData.winnat || "",
      eventType: rdescData.eventType || "",
      card: resultData.card || "",
      winner: resultData.winnat || rdescData.playerName || "",
    };
  };

  const modalData = getModalData();

  // Combine API results with fallback data
  const allResults = lastResults.length > 0 
    ? lastResults.map(r => r.win || r.playerName || "")
    : [...data, ...(gameData?.lrs || [])];

  return (
    <>
      <div className="result-row">
        {allResults.map((res, index) => {
          const resultData = lastResults[index] || (typeof res === 'object' ? res : null);
          const displayText = typeof res === 'object' ? (res.win || res.playerName || "") : res;
          const resultObj = typeof res === 'object' ? res : (lastResults[index] || { win: res });
          
          return (
            <div
              key={index}
              className="result-circle yes"
              onClick={() => handleResultClick(resultObj, index)}
              style={{ cursor: 'pointer' }}
              title={resultData?.playerName || displayText}
            >
              {displayText}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalData && (
        <ResultModalLayout
          show={showModal}
          onHide={handleCloseModal}
          title="GOAL Result"
          roundId={modalData.roundId}
          matchTime={modalData.matchTime}
          loading={loading}
        >
          {/* Result Details with Soccer Ball */}
          <div className="text-center">
            <div className="goal-result cricket20ballresult">
              <img src={soccerBallImage} alt="Soccer Ball" />
              <span>
                {modalData.eventType ? `${modalData.eventType} by ${modalData.playerName}` : modalData.playerName ? `Shot Goal by ${modalData.playerName}` : 'Goal'}
              </span>
            </div>
          </div>
        </ResultModalLayout>
      )}
    </>
  );
};

export default ResultGoals;
