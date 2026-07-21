import { getCasinoGameDetails, getMatchExposure, getMyBets } from "../../../apiservices/CasionApi";

import React from "react"
import { Link } from "react-router"
import styles from "./Category.module.css"
import Card from "../../../components/card"
import imageTeen20c from "../../../assets/casinoimages/teen20c.png"
import imageTeen41 from "../../../assets/casinoimages/teen41.jpg"
import imageTeen42 from "../../../assets/casinoimages/teen42.jpg"
import imageTeen33 from "../../../assets/casinoimages/teen33.jpg"
import imageTeen3 from "../../../assets/casinoimages/teen3.jpg"
import imageTeen32 from "../../../assets/casinoimages/teen32.jpg"
import imageTeen20b from "../../../assets/casinoimages/teen20b.jpg"
import imageTeenMuf from "../../../assets/casinoimages/teenmuf.jpg"
import imageTeenPatti2 from "../../../assets/casinoimages/patti2.jpg"
import imageTeen from "../../../assets/casinoimages/teen.jpg"
import imageTeen20 from "../../../assets/casinoimages/teen20.jpg"
import imageTeen9 from "../../../assets/casinoimages/teen9.jpg"
import imageTeen8 from "../../../assets/casinoimages/teen8.jpg"
import imageTeen6 from "../../../assets/casinoimages/teen6.jpg"
import imagePoker from "../../../assets/casinoimages/poker.jpg"
import imagePoker20 from "../../../assets/casinoimages/poker20.jpg"
import imagePoker6 from "../../../assets/casinoimages/poker6.jpg"
import imageBaccarat from "../../../assets/casinoimages/baccarat.jpg"
import imageBaccarat2 from "../../../assets/casinoimages/baccarat2.jpg"
import imageBaccarat29 from "../../../assets/casinoimages/baccarat29.jpg"
import imageDt20 from "../../../assets/casinoimages/dt20.jpg"
import imageDt6 from "../../../assets/casinoimages/dt6.jpg"
import imageDtl20 from "../../../assets/casinoimages/dtl20.jpg"
import imageDt202 from "../../../assets/casinoimages/dt202.jpg"
import imageCard32 from "../../../assets/casinoimages/card32.jpg"
import imageCard32B from "../../../assets/casinoimages/card32B.jpg"
import imageLucky7 from "../../../assets/casinoimages/lucky7.jpg"
import imageLucky15 from "../../../assets/casinoimages/lucky15.jpg"
import imageLucky7B from "../../../assets/casinoimages/lucky7B.jpg"
import imageLucky7C from "../../../assets/casinoimages/lucky7C.jpg"
import imageGoal from "../../../assets/casinoimages/goal.jpg"
import imageSuper3 from "../../../assets/casinoimages/superover3.jpg"
import imageSuper from "../../../assets/casinoimages/superover.jpg"
import imageSuper2 from "../../../assets/casinoimages/superover2.jpg"
import imageTrio from "../../../assets/casinoimages/trio.jpg"
import imageRace2 from "../../../assets/casinoimages/race2.jpg"
import imageRace20 from "../../../assets/casinoimages/race20.jpg"
import imageAAA2 from "../../../assets/casinoimages/aaa2.jpg"
import imageTeen1 from "../../../assets/casinoimages/teen1.jpg"
import imageNotEnum from "../../../assets/casinoimages/notenum.jpg"
import imageSicbo from "../../../assets/casinoimages/sicbo.jpg"
import imageSicbo2 from "../../../assets/casinoimages/sicbo2.jpg"
import imageTrap from "../../../assets/casinoimages/trap.jpg"
import imageLottCard from "../../../assets/casinoimages/lottcard.jpg"
import imageRace17 from "../../../assets/casinoimages/race17.jpg"
import imageQueen from "../../../assets/casinoimages/queen.jpg"
import imageBallByBall from "../../../assets/casinoimages/ballbyball.jpg"
import imageTeen62 from "../../../assets/casinoimages/teen62.gif";
import imageMogambo from "../../../assets/casinoimages/mogambo.gif"
import imageDoliDana from "../../../assets/casinoimages/dolidana.gif"

const gamesConfig = [
  { path: "/casino/teen62", image: imageTeen62, title: "V-VIP TEENPATTI 1-DAY" },
  { path: "/casino/dolidana", image: imageDoliDana, title: "DOLI DANA" },
  { path: "/casino/mogambo", image: imageMogambo, title: "MOGAMBO" },
  { path: "/casino/teen20c", image: imageTeen20c, title: "20-20 TEENPATTI" },
  //  { path: "/casino/ourroullete", image: imageOurRoullete, title: "OUR ROULETTE" },
  { path: "/casino/superover3", image: imageSuper3, title: "SUPER OVER 3" },
  { path: "/casino/goal", image: imageGoal, title: "GOAL" },
  { path: "/casino/lucky15", image: imageLucky15, title: "LUCKY 15" },
  { path: "/casino/superover2", image: imageSuper2, title: "SUPER OVER 2" },
  { path: "/casino/teen41", image: imageTeen41, title: "TEENPATTI TEST" },
  { path: "/casino/teen42", image: imageTeen42, title: "OPEN TEENPATTI" },
  { path: "/casino/sicbo2", image: imageSicbo2, title: "SICBO 2" },
  { path: "/casino/teen33", image: imageTeen33, title: "3 PATTI" },
  { path: "/casino/sicbo", image: imageSicbo, title: "SICBO" },
  { path: "/casino/ballbyball", image: imageBallByBall, title: "BALL BY BALL" },
  { path: "/casino/teen32", image: imageTeen32, title: "TEENPATTI 20-20" },
  { path: "/casino/teen", image: imageTeen, title: "TEENPATTI" },
  { path: "/casino/teen20", image: imageTeen20, title: "20-20 TEENPATTI" },
  { path: "/casino/teen9", image: imageTeen9, title: "9 CARDS" },
  { path: "/casino/teen8", image: imageTeen8, title: "TEST TEENPATTI" },
  { path: "/casino/poker ", image: imagePoker, title: "POKER" },
  { path: "/casino/poker20", image: imagePoker20, title: "POKER 20-20" },
  { path: "/casino/poker6", image: imagePoker6, title: "POKER 6 PLAYER" },
  { path: "/casino/baccarat", image: imageBaccarat, title: "BACCARAT" },
  // BACCARAT ki ui set krni hai ki 
  { path: "/casino/baccarat2", image: imageBaccarat2, title: "BACCARAT 2" },
  // BACCARAT 2 ki ui set krni hai ki 
  { path: "/casino/dt20", image: imageDt20, title: "DRAGON TIGER 20-20" },
  { path: "/casino/dt6", image: imageDt6, title: "DRAGON TIGER 1 DAY" },
  { path: "/casino/dt202", image: imageDt202, title: "DRAGON TIGER 2" },
  { path: "/casino/card32", image: imageCard32, title: "32 CARDS" },
  { path: "/casino/card32eu", image: imageCard32B, title: "32 CARDS B" },
  { path: "/casino/dtl20", image: imageDtl20, title: "DRAGON TIGER LION" },
  { path: "/casino/dt202", image: imageDt202, title: "DRAGON TIGER 2" },
  { path: "/casino/card32", image: imageCard32, title: "32 CARDS" },
  { path: "/casino/card32eu", image: imageCard32B, title: "32 CARDS B" },
  { path: "/casino/lucky7", image: imageLucky7, title: "LUCKY 7" },
  { path: "/casino/lucky7eu", image: imageLucky7B, title: "LUCKY 7 EU" },
  // { path: "/casino/aaa", image: imageAAA2, title: "AMAR AKBAR ANTHONY" },
  { path: "/casino/lottcard", image: imageLottCard, title: "LOTTERY CARD" },
  { path: "/casino/teen6", image: imageTeen6, title: "LUCKY 7" },
  { path: "/casino/queen", image: imageQueen, title: "QUEEN" },
  { path: "/casino/race20", image: imageRace20, title: "RACE 20" },
  { path: "/casino/lucky7eu2", image: imageLucky7C, title: "LUCKY 7 EU 2" },
  { path: "/casino/superover", image: imageSuper, title: "SUPER OVER" },
  { path: "/casino/trap", image: imageTrap, title: "TRAP" },
  { path: "/casino/patti2", image: imageTeenPatti2, title: "2 CARDS TEENPATTI" },
  { path: "/casino/teensin", image: imageBaccarat29, title: "TENSIN" },
  { path: "/casino/teenmuf", image: imageTeenMuf, title: "MUFLIS" },
  { path: "/casino/race17", image: imageRace17, title: "RACE 17" },
  { path: "/casino/teen20b", image: imageTeen20b, title: "TEENPATTI 1 DAY" },
  { path: "/casino/trio", image: imageTrio, title: "TRIO" },
  { path: "/casino/notenum", image: imageNotEnum, title: "NOTE NUMBER" },
  // { path: "/casino/kbc", image: imageKbc, title: "KBC" },   Table UI okk but not logicaly working ,bet is added
  { path: "/casino/teen1", image: imageTeen1, title: "TEENPATTI 1" },
  { path: "/casino/aaa2", image: imageAAA2, title: "AMAR AKBAR ANTHONY 2" },
  { path: "/casino/race2", image: imageRace2, title: "RACE 20-20" },
  { path: "/casino/teen3", image: imageTeen3, title: "TEENPATTI" },
  // { path: "/casino/dum10", image: imageDum10, title: "DUM 10" }, () table UI  dum 10 is working now)









];

const CategoryGameWise = ({ selectedCategory }) => {
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
    <div className={styles.sectionGameWise}>
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

export default CategoryGameWise
export { CategoryGameWise }
