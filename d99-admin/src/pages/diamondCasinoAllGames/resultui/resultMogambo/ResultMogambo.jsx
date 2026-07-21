import React, { useState, useEffect } from 'react';
import { FaTrophy } from 'react-icons/fa';
import { getLastResults, getDetailResults } from '../../../../apiservices/CasionApi';
import ResultModalLayout from '../../../../components/resultModalLayout';
import { getCardImage } from '../../../casinoComponents/resultVisuals/cardAssets';
import "./Result.css";

// Parse API card string: "2HH,ADD,KCC" → first 2 = Daga/Teja, last 1 = Mogambo (token strings).
const parseCards = (cardString) => {
    if (!cardString) return { dagaTeja: [], mogambo: [] };
    const cards = String(cardString).split(',').map(c => c.trim()).filter(Boolean);
    return {
        dagaTeja: cards.slice(0, 2),
        mogambo: cards.slice(2, 3),
    };
};

// Map API res items to display format: win "1" = W (Daga/Teja), "2" = L (Mogambo)
const mapResToDisplay = (res) => {
    if (!Array.isArray(res) || res.length === 0) return [];
    return res.map(item => ({
        mid: item.mid,
        win: item.win === "1" ? "W" : item.win === "2" ? "L" : item.win
    }));
};

const ResultMogambo = ({
    data = [],
    gameData = {},
}) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [lastResults, setLastResults] = useState([]);
    const [detailResult, setDetailResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Use API-backed data when provided (from game details res), else fetch
    const displayResults = (data && data.length > 0)
        ? mapResToDisplay(data)
        : lastResults;

    // Fetch last results only when data is not provided
    useEffect(() => {
        if (data && data.length > 0) return;
        const fetchLastResults = async () => {
            try {
                const response = await getLastResults('mogambo');
                if (response?.data?.data?.res) {
                    setLastResults(mapResToDisplay(response.data.data.res));
                }
            } catch (error) {
                console.error('Error fetching last results:', error);
            }
        };
        fetchLastResults();
    }, [data]);

    const handleResultClick = async (result, index) => {
        setSelectedResult(result);
        setLoading(true);
        
        // Resolve mid from current display list (API-backed data or fetched lastResults)
        let mid = displayResults[index]?.mid ?? null;
        if (mid == null && (gameData?.data?.data?.mid || gameData?.mid)) {
            mid = gameData?.data?.data?.mid || gameData?.mid;
        }
        
        // Fetch detail results if we have a mid
        if (mid) {
            try {
                const response = await getDetailResults('mogambo', mid.toString());
                const t1 = response?.data?.data?.t1 ?? response?.data?.t1;
                if (t1) setDetailResult(t1);
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

    // Format modal data from API t1: rid, mtime, ename, rdesc (Winner#Total), card, winnat, win
    const getModalData = () => {
        if (!selectedResult) return null;

        const cards = detailResult?.card ? parseCards(detailResult.card) : { dagaTeja: [], mogambo: [] };
        let winnerName = detailResult?.winnat || "";
        let totalScore = "";

        if (detailResult?.rdesc) {
            const parts = detailResult.rdesc.split('#');
            if (!winnerName) winnerName = parts[0] || "";
            totalScore = parts[1] || "";
        }
        const winner = winnerName || (detailResult?.win === "1" ? "Daga/Teja" : detailResult?.win === "2" ? "Mogambo" : "");

        let isDagaTejaWinner = false;
        let isMogamboWinner = false;
        if (winnerName && (winnerName.includes("Daga") || winnerName.includes("Teja"))) isDagaTejaWinner = true;
        else if (winnerName && winnerName.includes("Mogambo")) isMogamboWinner = true;
        else if (detailResult?.win === "1") isDagaTejaWinner = true;
        else if (detailResult?.win === "2") isMogamboWinner = true;
        else if (selectedResult === "W" || selectedResult === "D") isDagaTejaWinner = true;
        else if (selectedResult === "L" || selectedResult === "M") isMogamboWinner = true;

        return {
            roundId: detailResult?.rid || gameData?.data?.data?.mid || gameData?.mid || "N/A",
            matchTime: detailResult?.mtime || gameData?.data?.data?.mt || "N/A",
            dagaTeja: { tokens: cards.dagaTeja, isWinner: isDagaTejaWinner, name: "Daga / Teja" },
            mogambo: { tokens: cards.mogambo, isWinner: isMogamboWinner, name: "Mogambo" },
            winner,
            total: totalScore,
        };
    };

    const modalData = getModalData();

    // Prepare results list for rendering the ticks (use displayResults)
    const allResults = displayResults.map(r => r.win);

    return (
        <>
            <div className="result-row">
                {allResults.map((res, index) => (
                    <div
                        key={displayResults[index]?.mid ?? index}
                        className={`result-circle ${res === "W" ? "daga" : "mogambo"}`}
                        onClick={() => handleResultClick(res, index)}
                        style={{ cursor: 'pointer' }}
                    >
                        {res}
                    </div>
                ))}
            </div>

            {modalData && (
                <ResultModalLayout
                    show={showModal}
                    onHide={handleCloseModal}
                    title="Mogambo Result"
                    roundId={modalData.roundId}
                    matchTime={modalData.matchTime}
                    loading={loading}
                >
                    {/* Structure matches reference: col-12 col-lg-8 (casino-result-content) + col-12 col-lg-4 (casino-result-desc) */}
                    <div className="col-12 col-lg-8">
                        <div className="casino-result-content">
                            <div className="casino-result-content-item text-center">
                                <div className="casino-result-cards">
                                    <div className="d-inline-block">
                                        <h4>{modalData.dagaTeja.name}</h4>
                                        {(modalData.dagaTeja.tokens || []).map((token, index) => (
                                            <div key={index} className="casino-result-cards-item">
                                                <img src={getCardImage(token)} alt={`${modalData.dagaTeja.name} card ${index + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="casino-result-content-diveder" />
                            <div className="casino-result-content-item text-center">
                                <div className="casino-result-cards">
                                    {modalData.mogambo.isWinner && (
                                        <div className="casino-result-cards-item">
                                            <FaTrophy color="#4caf50" size={32} className="winner-icon" />
                                        </div>
                                    )}
                                    <div className="d-inline-block">
                                        <h4>{modalData.mogambo.name}</h4>
                                        {(modalData.mogambo.tokens || []).map((token, index) => (
                                            <div key={index} className="casino-result-cards-item">
                                                <img src={getCardImage(token)} alt={`${modalData.mogambo.name} card ${index + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4">
                        <div className="casino-result-desc">
                            {(modalData.winner != null && modalData.winner !== "") && (
                                <div className="casino-result-desc-item">
                                    <div>Winner</div>
                                    <div>{modalData.winner}</div>
                                </div>
                            )}
                            {(modalData.total != null && modalData.total !== "") && (
                                <div className="casino-result-desc-item">
                                    <div>Total</div>
                                    <div>{modalData.total}</div>
                                </div>
                            )}
                        </div>
                    </div>

                </ResultModalLayout>
            )}
        </>
    );
};

export default ResultMogambo;
