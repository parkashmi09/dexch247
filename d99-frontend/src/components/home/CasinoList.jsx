import { Link } from "react-router-dom";
import homeData from "../../constants/homeData.json";

const FALLBACK = "/assets/casino-icons/default.jpg";

export default function CasinoList() {
  return (
    <div className="casino-list mt-2">
      {homeData.casino_list.map((g) => (
        <div className="casino-list-item" key={g.slug}>
          <Link to={`/casino/${g.slug}`}>
            <div
              className="casino-list-item-banner"
              style={{
                backgroundImage: `url("${g.file}"), url("${FALLBACK}")`,
              }}
            />
            <div className="casino-list-name">{g.name}</div>
          </Link>
        </div>
      ))}
    </div>
  );
}
