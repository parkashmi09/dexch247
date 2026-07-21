import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import BetTable from "../components/home/BetTable.jsx";

export default function AllSports() {
  const { sid } = useParams();
  const sportId = Number(sid) || 4;

  return (
    <Layout variant="home-page">
      <BetTable sid={sportId} />
    </Layout>
  );
}
