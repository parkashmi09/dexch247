export default function CasinoVideo({ src, gameName }) {
  return (
    <div className="casino-video">
      <div className="video-box-container">
        <div className="casino-video-box">
          {src ? (
            <iframe
              src={src}
              title={gameName || "Casino Game"}
              allowFullScreen
            />
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-white">
              Loading stream...
            </div>
          )}
        </div>
      </div>
      <div className="clock"></div>
    </div>
  );
}
