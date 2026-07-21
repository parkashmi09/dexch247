
import React from "react"
import { Link, useParams, useNavigate } from "react-router"
import styles from "./AllGames.module.css"

import Card from "../../components/card"
import imageTeen20c from "../../assets/casinoimages2/teen20c.jpg"
import imageTeen33 from "../../assets/casinoimages2/teen33.jpg"
import imageTeen3 from "../../assets/casinoimages2/teen3.jpg"
import imageTeen32 from "../../assets/casinoimages2/teen32.jpg"
import imageTeen20b from "../../assets/casinoimages2/teen20b.jpg"
import imageTeenMuf from "../../assets/casinoimages2/teenmuf.jpg"
import imageTeenPatti2 from "../../assets/casinoimages2/patti2.jpg"
import imageTeen6 from "../../assets/casinoimages2/teen6.jpg"
import imageDtl20 from "../../assets/casinoimages2/dtl20.jpg"
import imageDt202 from "../../assets/casinoimages2/dt202.jpg"
import imageCard32 from "../../assets/casinoimages2/card32.jpg"
import imageCard32B from "../../assets/casinoimages2/card32eu.jpg"
import imageLucky7 from "../../assets/casinoimages2/lucky7.jpg"
import imageLucky7B from "../../assets/casinoimages2/lucky7eu.jpg"
import imageLucky7C from "../../assets/casinoimages2/lucky7eu2.jpg"
import imageGoal from "../../assets/casinoimages2/goal.jpg"
import imageSuper3 from "../../assets/casinoimages2/superover3.jpg"
import imageSuper from "../../assets/casinoimages2/superover.jpg"
import imageSuper2 from "../../assets/casinoimages2/superover2.jpg"
import imageTrio from "../../assets/casinoimages2/trio.jpg"
import imageRace2 from "../../assets/casinoimages2/race2.jpg"
import imageRace20 from "../../assets/casinoimages2/race20.jpg"
import imageAAA2 from "../../assets/casinoimages2/aaa2.jpg"
import imageTeen1 from "../../assets/casinoimages2/teen1.jpg"
import imageNotEnum from "../../assets/casinoimages2/notenum.jpg"
import imageSicbo from "../../assets/casinoimages2/sicbo.jpg"
import imageTrap from "../../assets/casinoimages2/trap.jpg"
import imageLottCard from "../../assets/casinoimages2/lottcard.jpg"
import imageRace17 from "../../assets/casinoimages2/race17.jpg"
import imageQueen from "../../assets/casinoimages2/queen.jpg"
import imageBallByBall from "../../assets/casinoimages2/ballbyball.jpg"
import imageTeen62 from "../../assets/casinoimages2/teen62.gif"
import imageMogambo from "../../assets/casinoimages2/mogambo.gif"
import imageDoliDana from "../../assets/casinoimages2/dolidana.gif"
import imageTeen41 from "../../assets/casinoimages2/teen41.jpg"
import imageTeen42 from "../../assets/casinoimages2/teen42.jpg"
import imageLucky15 from "../../assets/casinoimages2/lucky15.jpg"
import imageSicbo2 from "../../assets/casinoimages2/sicbo2.jpg"
import imageTeen from "../../assets/casinoimages2/teen.jpg"
import imageTeen20 from "../../assets/casinoimages2/teen20.jpg"
import imageTeen9 from "../../assets/casinoimages2/teen9.jpg"
import imageTeen8 from "../../assets/casinoimages2/teen8.jpg"
import imagePoker from "../../assets/casinoimages2/poker.jpg"
import imagePoker20 from "../../assets/casinoimages2/poker20.jpg"
import imagePoker6 from "../../assets/casinoimages2/poker6.jpg"
import imageBaccarat from "../../assets/casinoimages2/baccarat.jpg"
import imageBaccarat2 from "../../assets/casinoimages2/baccarat2.jpg"
import imageBaccarat29 from "../../assets/casinoimages2/teensin.jpg"
import imageDt20 from "../../assets/casinoimages2/dt20.jpg"
import imageDt6 from "../../assets/casinoimages2/dt6.jpg" 
import imageRoulette13 from "../../assets/casinoimages2/roulette13.jpg"

//---------------pending table games  
import image3CardJ from "../../assets/casinoimages2/3cardj.jpg"
import imageAAA from "../../assets/casinoimages2/aaa.jpg"
import imageAb20 from "../../assets/casinoimages2/ab20.jpg"
import imageAb3 from "../../assets/casinoimages2/ab3.jpg"
import imageAb4 from "../../assets/casinoimages2/ab4.jpg"
import imageAbj from "../../assets/casinoimages2/abj.jpg"
import imageBTable from "../../assets/casinoimages2/btable.jpg"
import imageBTable2 from "../../assets/casinoimages2/btable2.jpg"
import imageCMatch20 from "../../assets/casinoimages2/cmatch20.jpg"
import imageCMeter from "../../assets/casinoimages2/cmeter.jpg"
import imageCMeter1 from "../../assets/casinoimages2/cmeter1.jpg"
import imageCricketV3 from "../../assets/casinoimages2/cricketv3.jpg"
import imageDum10 from "../../assets/casinoimages2/dum10.jpg"
import imageJoker1 from "../../assets/casinoimages2/joker1.jpg"
import imageJoker120 from "../../assets/casinoimages2/joker120.jpg"
import imageJoker20 from "../../assets/casinoimages2/joker20.jpg"
import imageKbc from "../../assets/casinoimages2/kbc.jpg"
import imageLucky5 from "../../assets/casinoimages2/lucky5.jpg"
import imageOurRoullete from "../../assets/casinoimages2/ourroullete.jpg"
import imagePoison from "../../assets/casinoimages2/poison.jpg"
import imagePoison20 from "../../assets/casinoimages2/poison20.jpg"
// import imageRoulette11 from "../../assets/casinoimages2/roulette11.jpg"
// import imageRoulette12 from "../../assets/casinoimages2/roulette12.jpg"
// import imageRoulette13 from "../../assets/casinoimages2/roulette13.jpg"
import imageTeen120 from "../../assets/casinoimages2/teen120.jpg"
import imageTeenUnique from "../../assets/casinoimages2/teenunique.jpg"
import imageWar from "../../assets/casinoimages2/war.jpg"
import imageWorli from "../../assets/casinoimages2/worli.jpg"
import imageWorli2 from "../../assets/casinoimages2/worli2.jpg"






import CategoryGameWise from "./diamondCategoryGames"


const casinoGames = [
  "All Casino",
  "Roulette",
  "Teenpatti",
  "Poker",
  "Baccarat",
  "Dragon Tiger",
  "32 Cards",
  "Andar Bahar",
  "Lucky 7",
  "3 Card Judgement",
  "Casino War",
  "Worli",
]

const gamesConfig = [
  { path: "/casino/teen62", image: imageTeen62, title: "V-VIP TEENPATTI 1-DAY" },
  { path: "/casino/dolidana", image: imageDoliDana, title: "DOLI DANA" },
  { path: "/casino/mogambo", image: imageMogambo, title: "MOGAMBO" },

  { path: "/casino/lucky5", image: imageLucky5, title: "LUCKY 5" },
  // { path: "/casino/roulette13", image: imageRoulette13, title: "ROULETTE 13" },
  // { path: "/casino/ourroullete", image: imageOurRoullete, title: "OUR ROULETTE" },


  { path: "/casino/poison", image: imagePoison, title: "Teenpatti Poison One day" },
  //  { path: "/casino/ourroullete", image: imageOurRoullete, title: "OUR ROULETTE" },
  { path: "/casino/poison20", image: imagePoison20, title: "TEEnpatti poison 20 20" },
  // { path: "/casino/teenunique", image: imageTeenUnique, title: "Unique Teenpatti" },

 
  // { path: "/casino/joker120", image: imageJoker120, title: "Unlimited Joker 20-20" },
  { path: "/casino/joker20", image: imageJoker20, title: "Teenpatti Joker 20-20" },
  // { path: "/casino/joker1", image: imageJoker1, title: "Unlimited Joker One Day" },
  { path: "/casino/teen20c", image: imageTeen20c, title: "20-20 TEENPATTI c" },

  // { path: "/casino/btable2", image: imageBTable2, title: "Bollywood Casino 2" },
  { path: "/casino/superover3", image: imageSuper3, title: "Mini Super Over" },
  { path: "/casino/goal", image: imageGoal, title: "GOAL" },
  // { path: "/casino/ab4", image: imageAb4, title: "ANDAR BAHAR 150 Cards" },
  { path: "/casino/lucky15", image: imageLucky15, title: "LUCKY 15" },
  { path: "/casino/superover2", image: imageSuper2, title: "SUPER OVER 2" },
  { path: "/casino/teen41", image: imageTeen41, title: "QUEEN TOP OPEN TEENPATTI" },
  { path: "/casino/teen42", image: imageTeen42, title: "JACK TOP OPEN TEENPATTI" },
  { path: "/casino/sicbo2", image: imageSicbo2, title: "SICBO 2" },
  { path: "/casino/teen33", image: imageTeen33, title: "3 PATTI" },
  { path: "/casino/sicbo", image: imageSicbo, title: "SICBO" },
  { path: "/casino/ballbyball", image: imageBallByBall, title: "BALL BY BALL" },
  { path: "/casino/teen32", image: imageTeen32, title: "INSTANT TEENPATTI 2.0" },
  { path: "/casino/teen", image: imageTeen, title: "TEENPATTI 1 DAY" },
  { path: "/casino/teen20", image: imageTeen20, title: "20-20 TEENPATTI" },
  { path: "/casino/teen9", image: imageTeen9, title: "TEENPATTI TEST" },
  { path: "/casino/teen8", image: imageTeen8, title: "TEENPATTI OPEN" },
  { path: "/casino/poker ", image: imagePoker, title: "POKER 1 DAY" },
  { path: "/casino/poker20", image: imagePoker20, title: "20-20 POKER" },
  { path: "/casino/poker6", image: imagePoker6, title: "POKER 6 PLAYER" },
  { path: "/casino/baccarat", image: imageBaccarat, title: "BACCARAT" },
  // BACCARAT ki ui set krni hai ki 
  { path: "/casino/baccarat2", image: imageBaccarat2, title: "BACCARAT 2" },
  // BACCARAT 2 ki ui set krni hai ki 
  { path: "/casino/dt20", image: imageDt20, title: "20-20 DRAGON TIGER" },
  { path: "/casino/dt6", image: imageDt6, title: "1 DAY DRAGON TIGER" },
  { path: "/casino/dtl20", image: imageDtl20, title: "20 20 DTL" },
  { path: "/casino/dt202", image: imageDt202, title: "20 20 Dragon Tiger 2" },
  { path: "/casino/card32", image: imageCard32, title: "32 CARDS A" },
  { path: "/casino/card32eu", image: imageCard32B, title: "32 CARDS B" },
  // { path: "/casino/dtl20", image: imageDtl20, title: "20 20 DTL" },
  { path: "/casino/dt202", image: imageDt202, title: "DRAGON TIGER 2" },
  { path: "/casino/card32", image: imageCard32, title: "32 CARDS" },
  { path: "/casino/card32eu", image: imageCard32B, title: "32 CARDS B" },
  // { path: "/casino/ab20", image: imageAb20, title: "ANDAR BAHAR 20" },
  // { path: "/casino/abj", image: imageAbj, title: "ANDAR BAHAR 2" },
  { path: "/casino/lucky7", image: imageLucky7, title: "LUCKY 7 - A" },
  { path: "/casino/lucky7eu", image: imageLucky7B, title: "LUCKY 7 - B" },
  // { path: "/casino/3cardj", image: image3CardJ, title: "3 CARD JUDGEMENT" },
  // { path: "/casino/war", image: imageWar, title: "CASINO WAR" },

  // { path: "/casino/worli", image: imageWorli, title: "WORLI MATKA" },
  // { path: "/casino/worli2", image: imageWorli2, title: "Instant Worli" },
  // { path: "/casino/aaa", image: imageAAA, title: "AMAR AKBAR ANTHONY" },
  // { path: "/casino/btable", image: imageBTable, title: "Bollywood Casino" },
  // { path: "/casino/aaa", image: imageAAA2, title: "AMAR AKBAR ANTHONY" },
  // { path: "/casino/lottcard", image: imageLottCard, title: "LOTTERY CARD" },
  // { path: "/casino/cricketv3", image: imageCricketV3, title: "CRICKET V3" },
  // { path: "/casino/cmatch20", image: imageCMatch20, title: "CRICKET MATCH 20" },
  // { path: "/casino/cmeter", image: imageCMeter, title: "CRICKET METER" },
  { path: "/casino/teen6", image: imageTeen6, title: "TEENPATTI 2.0" },
  { path: "/casino/queen", image: imageQueen, title: "QUEEN" },
  { path: "/casino/race20", image: imageRace20, title: "RACE 20" },
  { path: "/casino/lucky7eu2", image: imageLucky7C, title: "LUCKY 7 - C" },
  { path: "/casino/superover", image: imageSuper, title: "SUPER OVER" },
  { path: "/casino/trap", image: imageTrap, title: "TRAP" },
  { path: "/casino/patti2", image: imageTeenPatti2, title: "2 CARDS TEENPATTI" },
  { path: "/casino/teensin", image: imageBaccarat29, title: "29 CARD BACCARAT" },
  { path: "/casino/teenmuf", image: imageTeenMuf, title: "MUFLIS" },
  { path: "/casino/race17", image: imageRace17, title: "RACE 17" },
  { path: "/casino/teen20b", image: imageTeen20b, title: "20 20 TEENPATTI B" },
  { path: "/casino/trio", image: imageTrio, title: "TRIO" },
  { path: "/casino/notenum", image: imageNotEnum, title: "NOTE NUMBER" },
  { path: "/casino/kbc", image: imageKbc, title: "KBC" },
  { path: "/casino/teen120", image: imageTeen120, title: "1 CArd 20- 20" },
  // { path: "/casino/kbc", image: imageKbc, title: "KBC" },   Table UI okk but not logicaly working ,bet is added
  { path: "/casino/teen1", image: imageTeen1, title: "1 Card 1 one-day" },
  // { path: "/casino/ab3", image: imageAb3, title: "ANDAR BAHAR 50 Cards" },
  // { path: "/casino/aaa2", image: imageAAA2, title: "AMAR AKBAR ANTHONY 2" },
  { path: "/casino/race2", image: imageRace2, title: "RACE 20-20" },
  { path: "/casino/teen3", image: imageTeen3, title: "TEENPATTI" },
  { path: "/casino/dum10", image: imageDum10, title: "DUM 10" },

  // { path: "/casino/dum10", image: imageDum10, title: "DUM 10" }, () table UI  dum 10 is working now)


  //-------------pending table games-----------------------------------------------------------------------
  








  { path: "/casino/cmeter1", image: imageCMeter1, title: "1 Card Meter" },
 
  // { path: "/casino/kbc", image: imageKbc, title: "KBC" },
  // { path: "/casino/lucky5", image: imageLucky5, title: "LUCKY 5" },

  
  // { path: "/casino/roulette11", image: imageRoulette11, title: "ROULETTE 11" },
  // { path: "/casino/roulette12", image: imageRoulette12, title: "ROULETTE 12" },
  // { path: "/casino/roulette13", image: imageRoulette13, title: "ROULETTE 13" },














];

export { gamesConfig };

const Games = ({ selectedCategory }) => {
  const normalized = (s) => (s ? s.toLowerCase() : "")

  const filtered = gamesConfig.filter((game) => {
    if (!selectedCategory || selectedCategory === "All Casino") return true
    const cat = normalized(selectedCategory)
    const title = normalized(game.title)
    if (title.includes(cat)) return true
    // handle common synonyms and short forms
    if (cat.includes("teenpatti") && title.includes("teen")) return true
    if (cat.includes("32 cards") && title.includes("32")) return true
    if (cat.includes("dragon") && title.includes("dragon")) return true
    return false
  })

  return (
    <div className={styles.section}>
      {filtered.map((game, index) => (
        <Link key={index} to={game.path}>
          <div className={styles.card}>
            <Card imageUrl={game.image} title={game.title} />
          </div>
        </Link>
      ))}
    </div>
  )
}

// Helper function to convert category name to URL slug
const categoryToSlug = (category) => {
  if (category === "All Casino") return ""
  // Handle special cases
  const specialCases = {
    "32 Cards": "32-cards",
    "Dragon Tiger": "dragon-tiger",
    "Andar Bahar": "andar-bahar",
    "Lucky 7": "lucky-7",
    "3 Card Judgement": "3-card-judgement",
    "Casino War": "casino-war",
    "Poker": "poker-games",
    "Baccarat": "baccarat-games"
  }
  if (specialCases[category]) {
    return specialCases[category]
  }
  return category.toLowerCase().replace(/\s+/g, "-")
}

// Helper function to convert URL slug to category name
const slugToCategory = (slug) => {
  if (!slug || slug === "") return "All Casino"
  // Handle special cases
  const specialCases = {
    "32-cards": "32 Cards",
    "dragon-tiger": "Dragon Tiger",
    "andar-bahar": "Andar Bahar",
    "lucky-7": "Lucky 7",
    "3-card-judgement": "3 Card Judgement",
    "casino-war": "Casino War",
    "poker-games": "Poker",
    "baccarat-games": "Baccarat"
  }
  if (specialCases[slug]) {
    return specialCases[slug]
  }
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function DiamondCasinoAllGames() {
  const { category } = useParams()
  const navigate = useNavigate()
  
  // Get category from URL or default to "All Casino"
  const selectedCategory = category ? slugToCategory(category) : "All Casino"

  // Handle category selection - navigate to route
  const handleCategorySelect = (categoryName) => {
    if (categoryName === "All Casino") {
      navigate("/casino")
    } else {
      const slug = categoryToSlug(categoryName)
      navigate(`/casino/${slug}`)
    }
  }

  return (
    <>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <SidebarList
            items={casinoGames}
            selectedValue={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </aside>

        <main className={styles.main}>
          <CategoryGameWise selectedCategory={selectedCategory} />
        </main>
      </div>
    </>
  )
}

export { Games }
