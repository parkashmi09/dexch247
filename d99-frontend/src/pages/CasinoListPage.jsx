import { Link, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import MobileMenuTabs from "../components/home/MobileMenuTabs.jsx";
import SidebarTabs from "../components/listPage/SidebarTabs.jsx";
import ScrollableTabs from "../components/listPage/ScrollableTabs.jsx";
import GameGrid from "../components/listPage/GameGrid.jsx";
import homeData from "../constants/homeData.json";
import { CASINO_PROVIDER_TABS, getProviderData } from "../constants/casinoCategories.js";

function getFilteredGames(providerData, categoryId) {
  const allGames = providerData.games || homeData.casino_list;
  const id = Number(categoryId);
  if (!id || id === providerData.allCategoryId) return allGames;
  const allowed = new Set(providerData.categorySlugs[id] || []);
  if (allowed.size === 0) return allGames;
  return allGames.filter((g) => allowed.has(g.slug));
}

export default function CasinoListPage() {
  const params = useParams();
  const provider = params.provider || "LC";
  const providerId = params.providerId || "4";
  const providerData = getProviderData(providerId);
  const categoryId = params.categoryId || String(providerData.allCategoryId);
  const activeCategoryId = Number(categoryId) || providerData.allCategoryId;
  const games = getFilteredGames(providerData, activeCategoryId);

  const sidebarTabs = providerData.categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    to: `/casino-list/${provider}/${providerId}/${cat.id}`,
  }));

  const providerTabs = CASINO_PROVIDER_TABS.map((tab) => ({
    id: tab.id,
    label: tab.name,
    to: `/casino-list/${provider}/${tab.id}`,
  }));

  return (
    <Layout variant="list-page own-casino-page">
      <MobileMenuTabs />
      <div className="container-fluid container-fluid-5">
        <div className="row row5">
          <SidebarTabs tabs={sidebarTabs} activeId={activeCategoryId} />
          <div className="col-xl-10 col-12">
            <div className="casino-tab-list d-xl-none">
              <ul className="nav nav-pills casino-tab" id="casino-tab">
                {providerTabs.map((tab) => (
                  <li className="nav-item" key={tab.id}>
                    <Link
                      className={`nav-link${providerId === tab.id ? " active" : ""}`}
                      to={tab.to}
                    >
                      <span>{tab.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <ScrollableTabs
              tabs={sidebarTabs}
              activeId={activeCategoryId}
              className="casino-sub-tab-list d-xl-none"
              listId="casino-sub-tab"
            />
            <div className="tab-content">
              <div className="tab-pane active" id="all-casino">
                <GameGrid
                  games={games}
                  variant="casino"
                  disableLinks={providerId === "45" || providerId === "52" || providerId === "19"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
