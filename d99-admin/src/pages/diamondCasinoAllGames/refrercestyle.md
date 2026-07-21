@import url(https://fonts.googleapis.com/css?family=Noto+Sans);
@import url("https://fonts.googleapis.com/css2?family=Hind:wght@300;400&display=swap");
@import url(https://fonts.googleapis.com/css?family=Anonymous+Pro);
@import url(https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap);

/*Game Detail Design(54)*/

/*Theme CSS*/

:root {
  --bg-body: #23292e;
  --text-body: #aaafb5;
  --bg-sidebar: #16191c;
  --text-sidebar: #aaafb5;
  --bg-table: #2e3439;
  --text-table: #aaafb5;
  --bg-table-header: #3c444b;
  --text-table-header: #aaafb5;
  --text-highlight: #ffffff;
  --text-fancy: #fdcf13;
  --btn-primary: #03b37f;
  --btn-secondary: #03b37f52;
  --btn-reset: #fc4242;
  --bg-tabs: #03b37f33;
  --bg-primary: #0088cc;
  --bg-primary90: #0088cce6;
  --text-primary: #ffffff;
  --bg-secondary: #2c3e50;
  --bg-secondary70: #2c3e50b3;
  --bg-secondary85: #2c3e50d9;
  --text-secondary: #ffffff;
}

:root {
  --text-white: #ffffff;
  --text-black: #000000;
  --text-yellow: #ef910f;
  --text-red: #fc4242;
  --text-green: #03b37f;
  --bg-success: #03b37f;
  --bg-success-hover: #008e64;
  --bg-warning: #ef910f;
  --bg-danger: #fc4242;
  --bg-info: #f18521;
  --bg-bet: #03b37f52;
  --bg-tabs: #03b37f33;
  --book-green: #128412;
  --book-red: #bb2834;
  --back: #72bbef;
  --back-hover: #4fa1dc;
  --back1: #72bbefcc;
  --back2: #72bbefa3;
  --lay: #f994ba;
  --lay-hover: #e16f9a;
  --lay1: #f994bacc;
  --lay2: #f994baa3;
  --back-title: #72bbef80;
  --lay-title: #f994ba80;
  --football: #03b37f;
  --football_75: #03b37fbf;
  --football_50: #03b37f80;
  --tennis: #f18521;
  --tennis_75: #f18521bf;
  --tennis_50: #f1852180;
  --boxing: #e44e23;
  --boxing_75: #e44e23bf;
  --boxing_50: #e44e2380;
  --cricket: #20327b;
  --cricket_75: #20327bbf;
  --cricket_50: #20327b80;
  --golf: #015900;
  --golf_75: #015900bf;
  --golf_50: #01590080;
  --beach-volleyball: #ff9c63;
  --beach-volleyball_75: #ff9c63bf;
  --beach-volleyball_50: #ff9c6380;
  --table-tennis: #db2752;
  --table-tennis_75: #db2752bf;
  --table-tennis_50: #db275280;
  --futsal: #74c94b;
  --futsal_75: #74c94bbf;
  --futsal_50: #74c94b80;
  --horse-racing: #9e4025;
  --horse-racing_75: #9e4025bf;
  --horse-racing_50: #9e402580;
  --egames: #623cea;
  --egames_75: #623ceabf;
  --egames_50: #623cea80;
  --grey-hounds: #e89780;
  --grey-hounds_75: #e89780bf;
  --grey-hounds_50: #e8978080;
  --trotting: #996658;
  --trotting_75: #996658bf;
  --trotting_50: #99665880;
  --speedway: #c14347;
  --speedway_75: #c14347bf;
  --speedway_50: #c1434780;
  --basketball: #fbb03b;
  --basketball_75: #fbb03bbf;
  --basketball_50: #fbb03b80;
  --moto-gp: #9fbe3c;
  --moto-gp_75: #9fbe3cbf;
  --moto-gp_50: #9fbe3c80;
  --chess: #0e345e;
  --chess_75: #0e345ebf;
  --chess_50: #0e345e80;
  --vollyball: #074a60;
  --vollyball_75: #074a60bf;
  --vollyball_50: #074a6080;
  --ice-hockey: #2f7ed5;
  --ice-hockey_75: #2f7ed5bf;
  --ice-hockey_50: #2f7ed580;
  --equine-sports: #e07a5f;
  --equine-sports_75: #e07a5fbf;
  --equine-sports_50: #e07a5f80;
  --australians-rules: #ff6457;
  --australians-rules_75: #ff6457bf;
  --australians-rules_50: #ff645780;
  --badminton: #3c7a57;
  --badminton_75: #3c7a57bf;
  --badminton_50: #3c7a5780;
  --formula-1: #bf6f7e;
  --formula-1_75: #bf6f7ebf;
  --formula-1_50: #bf6f7e80;
  --nascar: #cb2755;
  --nascar_75: #cb2755bf;
  --nascar_50: #cb275580;
  --hockey: #3d2b58;
  --hockey_75: #3d2b58bf;
  --hockey_50: #3d2b5880;
  --supercars: #772b59;
  --supercars_75: #772b59bf;
  --supercars_50: #772b5980;
  --netball: #279a95;
  --netball_75: #279a95bf;
  --netball_50: #279a9580;
  --surfing: #81a6ff;
  --surfing_75: #81a6ffbf;
  --surfing_50: #81a6ff80;
  --cycling: #60a5da;
  --cycling_75: #60a5dabf;
  --cycling_50: #60a5da80;
  --gaelick-sports: #07695f;
  --gaelick-sports_75: #07695fbf;
  --gaelick-sports_50: #07695f80;
  --biathlon: #2f158b;
  --biathlon_75: #2f158bbf;
  --biathlon_50: #2f158b80;
  --motorbikes: #bd6a58;
  --motorbikes_75: #bd6a58bf;
  --motorbikes_50: #bd6a5880;
  --athletics: #d96c0d;
  --athletics_75: #d96c0dbf;
  --athletics_50: #d96c0d80;
  --squash: #446ea6;
  --squash_75: #446ea6bf;
  --squash_50: #446ea680;
  --basketball-3-3: #e83d1a;
  --basketball-3-3_75: #e83d1abf;
  --basketball-3-3_50: #e83d1a80;
  --floorball: #04adbf;
  --floorball_75: #04adbfbf;
  --floorball_50: #04adbf80;
  --sumo: #d95b66;
  --sumo_75: #d95b66bf;
  --sumo_50: #d95b6680;
  --virtual-sports: #d592ff;
  --virtual-sports_75: #d592ffbf;
  --virtual-sports_50: #d592ff80;
  --handball: #69306d;
  --handball_75: #69306dbf;
  --handball_50: #69306d80;
  --politics: #b4845b;
  --politics_75: #b4845bbf;
  --politics_50: #b4845b80;
  --weather: #518cad;
  --weather_75: #518cadbf;
  --weather_50: #518cad80;
  --tv-games: #513896;
  --tv-games_75: #513896bf;
  --tv-games_50: #51389680;
  --lottery: #e9bc26;
  --lottery_75: #e9bc26bf;
  --lottery_50: #e9bc2680;
  --bowls: #590902;
  --bowls_75: #590902bf;
  --bowls_50: #59090280;
  --waterpolo: #21a3b8;
  --waterpolo_75: #21a3b8bf;
  --waterpolo_50: #21a3b880;
  --alpine-skiing: #509bff;
  --alpine-skiing_75: #509bffbf;
  --alpine-skiing_50: #509bff80;
  --sailing: #00b4d8;
  --sailing_75: #00b4d8bf;
  --sailing_50: #00b4d880;
  --hurling: #52b788;
  --hurling_75: #52b788bf;
  --hurling_50: #52b78880;
  --ski-jumping: #70c1b3;
  --ski-jumping_75: #70c1b3bf;
  --ski-jumping_50: #70c1b380;
  --bandy: #d99b84;
  --bandy_75: #d99b84bf;
  --bandy_50: #d99b8480;
  --motor-sports: #a175c8;
  --motor-sports_75: #a175c8bf;
  --motor-sports_50: #a175c880;
  --baseball: #c06c84;
  --baseball_75: #c06c84bf;
  --baseball_50: #c06c8480;
  --rugby-union: #8a101c;
  --rugby-union_75: #8a101cbf;
  --rugby-union_50: #8a101c80;
  --rugby-league: #ed5f62;
  --rugby-league_75: #ed5f62bf;
  --rugby-league_50: #ed5f6280;
  --curling: #5478bf;
  --curling_75: #5478bfbf;
  --curling_50: #5478bf80;
  --darts: #b21347;
  --darts_75: #b21347bf;
  --darts_50: #b2134780;
  --americal-footbal: #d3393d;
  --americal-footbal_75: #d3393dbf;
  --americal-footbal_50: #d3393d80;
  --snooker: #11b24b;
  --snooker_75: #11b24bbf;
  --snooker_50: #11b24b80;
  --lottery-specials: #a53860;
  --lottery-specials_75: #a53860bf;
  --lottery-specials_50: #a5386080;
  --special-bets: #e63946;
  --special-bets_75: #e63946bf;
  --special-bets_50: #e6394680;
  --lotto: #05668d;
  --lotto_75: #05668dbf;
  --lotto_50: #05668d80;
  --font-headline: 16px;
  --font-header: 16px;
  --font-body: 16px;
  --font-caption: 14px;
  --font-big: 32px;
  --font-button: 16px;
  --font-odds: 16px;
  --font-value: 14px;
  --font-small: 12px;
  --font-v-small: 10px;
  --font-24: 24px;
  --font-timer: 48px;
  --font-56: 56px;
  --font-18: 18px;
  --font-13: 13px;
  --font-bold: bold;
  --font-regular: normal;
  --font-semi: 600;
  --font-medium: 500;
}

@font-face {
  font-family: "timer";
  src: url("../fonts/timer.woff2") format("woff2"),
    url("../fonts/timer.woff") format("woff");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "worli";
  src: url("../fonts/worli.woff2") format("woff2"),
    url("../fonts/worli.woff") format("woff");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: Card Characters;
  src: url(../fonts/card.ttf);
}

* {
  outline: 0 !important;
}

a {
  color: #212529;
}

.pr {
  position: relative;
}

.text-success {
  color: #128412 !important;
}

.text-danger {
  color: #bb2834 !important;
}

html {
  scroll-behavior: smooth;
}
.row {
  margin-right: -15px;
  margin-left: -15px;
}
.col,
.col-1,
.col-2,
.col-3,
.col-4,
.col-5,
.col-6,
.col-7,
.col-8,
.col-9,
.col-10,
.col-11,
.col-12,
.col-auto,
.col-lg,
.col-lg-1,
.col-lg-2,
.col-lg-3,
.col-lg-4,
.col-lg-5,
.col-lg-6,
.col-lg-7,
.col-lg-8,
.col-lg-9,
.col-lg-10,
.col-lg-11,
.col-lg-12,
.col-lg-auto,
.col-md,
.col-md-1,
.col-md-2,
.col-md-3,
.col-md-4,
.col-md-5,
.col-md-6,
.col-md-7,
.col-md-8,
.col-md-9,
.col-md-10,
.col-md-11,
.col-md-12,
.col-md-auto,
.col-sm,
.col-sm-1,
.col-sm-2,
.col-sm-3,
.col-sm-4,
.col-sm-5,
.col-sm-6,
.col-sm-7,
.col-sm-8,
.col-sm-9,
.col-sm-10,
.col-sm-11,
.col-sm-12,
.col-sm-auto,
.col-xl,
.col-xl-1,
.col-xl-2,
.col-xl-3,
.col-xl-4,
.col-xl-5,
.col-xl-6,
.col-xl-7,
.col-xl-8,
.col-xl-9,
.col-xl-10,
.col-xl-11,
.col-xl-12,
.col-xl-auto {
  padding-right: 15px;
  padding-left: 15px;
}
.form-control {
  font-size: 1rem;
}
body.login .login-bg {
  background-image: url("../../admin/img/login-bg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  height: 100%;
}

body[data-sidebar="dark"] .vertical-menu {
  background: var(--bg-sidebar);
}

body[data-sidebar="dark"] .navbar-brand-box {
  background: var(--bg-body);
}

body[data-sidebar="dark"] #sidebar-menu ul li a,
body[data-sidebar="dark"] #sidebar-menu ul li ul.sub-menu li a,
body[data-sidebar="dark"] #sidebar-menu ul li a i {
  color: var(--text-sidebar);
}

body[data-sidebar="dark"] .mm-active {
  color: var(--text-body) !important;
}

body[data-sidebar="dark"] .mm-active > i,
body[data-sidebar="dark"] #sidebar-menu ul li a:hover,
body[data-sidebar="dark"] #sidebar-menu ul li a:hover i {
  color: #000 !important;
  opacity: 0.8;
}

.navbar-header {
  background: var(--bg-body);
  color: var(--text-highlight) !important;
}

.header-item {
  color: var(--text-highlight) !important;
}

.navbar-header .dropdown.show .header-item {
  background-color: var(--bg-body);
}

.page-item.active .page-link {
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border-color: var(--bg-primary);
  border-radius: 3px !important;
}

.page-content {
  /* min-height: 100vh; */
  min-height: calc(100vh - 52px);
  padding: 10px 15px 70px;
  margin-top: 0;
}
.btn {
  font-size: 1rem;
  padding: 0.375rem 0.75rem;
  line-height: 1.5;
  border-radius: 0.25rem;
}
.btn-primary,
.btn-primary:hover,
.btn-primary:focus,
.btn-primary:active {
  background-color: var(--bg-primary) !important;
  border-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

.bg-primary {
  background-color: var(--bg-body) !important;
}

.tab-bg-primary {
  background-color: transparent !important;
  border-top: 3px solid var(--bg-body) !important;
}

.btn-theme1,
.btn-theme1:hover,
.btn-theme1:focus,
.btn-theme1:active {
  background-color: var(--bg-sidebar);
  border-color: var(--bg-sidebar);
  color: var(--text-highlight);
}

.btn-theme2,
.btn-theme2:hover,
.btn-theme2:focus,
.btn-theme2:active {
  background-color: var(--bg-body);
  border-color: var(--bg-body);
  color: var(--text-highlight);
}

.btn-theme3,
.btn-theme3:hover,
.btn-theme3:focus,
.btn-theme3:active {
  background-color: var(--bg-table);
  border-color: var(--bg-table);
  color: var(--text-highlight);
}

.btn-theme4,
.btn-theme4:hover,
.btn-theme4:focus,
.btn-theme4:active {
  background-color: var(--bg-table-header);
  border-color: var(--bg-table-header);
  color: var(--text-highlight);
}

.bg-theme-header {
  background-color: var(--bg-table-header);
}

.container-fluid-5 {
  padding-left: 5px !important;
  padding-right: 5px !important;
}

.row.row1 {
  margin-left: -1px;
  margin-right: -1px;
}

.row.row1 > [class*="col-"] {
  padding-left: 1px;
  padding-right: 1px;
}

.row.row2 {
  margin-left: -2px;
  margin-right: -2px;
}

.row.row2 > [class*="col-"] {
  padding-left: 2px;
  padding-right: 2px;
}

.row.row3 {
  margin-left: -3px;
  margin-right: -3px;
}

.row.row3 > [class*="col-"] {
  padding-left: 3px;
  padding-right: 3px;
}

.row.row4 {
  margin-left: -4px;
  margin-right: -4px;
}

.row.row4 > [class*="col-"] {
  padding-left: 4px;
  padding-right: 4px;
}

.row.row5 {
  margin-left: -5px;
  margin-right: -5px;
}

.row.row5 > [class*="col-"] {
  padding-left: 5px;
  padding-right: 5px;
}

.row.row6 {
  margin-left: -6px;
  margin-right: -6px;
}

.row.row6 > [class*="col-"] {
  padding-left: 6px;
  padding-right: 6px;
}

.row.row7 {
  margin-left: -7px;
  margin-right: -7px;
}

.row.row7 > [class*="col-"] {
  padding-left: 7px;
  padding-right: 7px;
}

.row.row8 {
  margin-left: -8px;
  margin-right: -8px;
}

.row.row8 > [class*="col-"] {
  padding-left: 8px;
  padding-right: 8px;
}

.row.row9 {
  margin-left: -9px;
  margin-right: -9px;
}

.row.row9 > [class*="col-"] {
  padding-left: 9px;
  padding-right: 9px;
}

.row.row10 {
  margin-left: -10px;
  margin-right: -10px;
}

.row.row10 > [class*="col-"] {
  padding-left: 10px;
  padding-right: 10px;
}

.box10 {
  width: 10%;
  min-width: 10%;
  max-width: 10%;
}

.box15 {
  width: 15%;
  min-width: 15%;
  max-width: 15%;
}

.box20 {
  width: 20%;
  min-width: 20%;
  max-width: 20%;
}

.box25 {
  width: 25%;
  min-width: 25%;
  max-width: 25%;
}

.box30 {
  width: 30%;
  min-width: 30%;
  max-width: 30%;
}

.box35 {
  width: 35%;
  min-width: 35%;
  max-width: 35%;
}

.box40 {
  width: 40%;
  min-width: 40%;
  max-width: 40%;
}

.box45 {
  width: 45%;
  min-width: 45%;
  max-width: 45%;
}

.box50 {
  width: 50%;
  min-width: 50%;
  max-width: 50%;
}

.box55 {
  width: 55%;
  min-width: 55%;
  max-width: 55%;
}

.box60 {
  width: 60%;
  min-width: 60%;
  max-width: 60%;
}

.box65 {
  width: 65%;
  min-width: 65%;
  max-width: 65%;
}

.box70 {
  width: 70%;
  min-width: 70%;
  max-width: 70%;
}

.box75 {
  width: 75%;
  min-width: 75%;
  max-width: 75%;
}

.box80 {
  width: 80%;
  min-width: 80%;
  max-width: 80%;
}

.box85 {
  width: 85%;
  min-width: 85%;
  max-width: 85%;
}

.box90 {
  width: 90%;
  min-width: 90%;
  max-width: 90%;
}

.box95 {
  width: 95%;
  min-width: 95%;
  max-width: 95%;
}

.box100 {
  width: 100%;
  min-width: 100%;
  max-width: 100%;
}

.suspended {
  position: relative;
}

.suspended.lock-top:before {
  background-position: top 3px center;
}

.suspended:before {
  content: "";
  background-image: url("../img/lock.svg");
  background-size: 15px 15px;
  background-repeat: no-repeat;
  position: absolute;
  z-index: 100;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-position: center;
  /* filter: invert(1); */
}

.suspended:after {
  content: "";
  background-color: rgba(255, 255, 255, 0.7);
  position: absolute;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
  cursor: not-allowed;
  border-radius: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.suspendedtext {
  position: relative;
}

.suspendedtext:after {
  content: attr(data-title);
  text-transform: uppercase;
  background-color: #131313c2;
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  height: 100%;
  width: 100%;
  right: 0;
  top: 0;
  color: var(--text-red);
  font-size: var(--font-headline);
  font-weight: var(--font-bold);
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  border-radius: 0;
  cursor: not-allowed;
}

.suspendedfull {
  position: relative;
}

.suspendedfull:after {
  content: attr(data-title);
  text-transform: uppercase;
  background-color: #131313c2;
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  height: 100%;
  width: 100%;
  right: 8px;
  top: 2px;
  color: var(--text-red);
  font-size: var(--font-headline);
  font-weight: var(--font-bold);
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  cursor: not-allowed;
}

.detail-page-container {
  line-height: 15px;
  letter-spacing: 0;
  color: var(--text-black);
  font-size: 14px;
}

.center-main-container {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  padding: 10px;
}

.center-content {
  /* width: calc(100% - 612px);
  margin-right: 12px; */
  max-width: 65% !important;
  -ms-flex: 0 0 65% !important;
  flex: 0 0 65% !important;
  padding-right: 17px;
}

.right-sidebar {
  /* width: 600px;
  max-height: calc(100vh - 72px);
  overflow-x: hidden;
  overflow-y: auto; */
  max-width: 35% !important;
  -ms-flex: 0 0 35% !important;
  flex: 0 0 35% !important;
  padding-left: 0;
}

.right-sidebar .right-sidebar {
  width: 100%;
  max-width: 100% !important;
}
/* .right-sidebar.sticky {
  position: fixed;
  right: 12px;
  top: 72px;
  max-height: calc(100vh - 132px);
} */

.bl-box {
  height: 32px;
  width: 72px;
  border-radius: 0;
  padding: 5px 0;
  text-align: center;
  margin-right: 0;
  float: left;
  cursor: pointer;
}

.bl-box:last-child {
  margin-right: 0 !important;
}

.bl-box span {
  height: 19px;
  color: var(--text-black);
  font-size: var(--font-caption);
  font-weight: var(--font-medium);
  text-align: center;
}

.bl-box .odds {
  height: 22px;
  color: var(--text-black);
  font-weight: var(--font-medium);
  text-align: center;
  font-size: var(--font-odds);
}

ul,
li {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-top-row {
  width: 100%;
}

.market-container {
  /* width: 100%; */
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  margin-left: -15px;
  margin-right: -15px;
}

.more-market {
  width: 100%;
}

.maximum-bet input {
  display: inline-block;
  width: 150px;
}

.btn-back,
.btn-back:hover,
.btn-back:focus,
.btn-back:active {
  background-color: var(--bg-info);
  border-color: var(--bg-info);
  color: #fff;
  padding: 4px;
}

.bl-box .odds {
  height: 22px;
  color: var(--text-black);
  font-weight: var(--font-bold);
  text-align: center;
  font-size: var(--font-odds);
}

.back {
  background-color: var(--back);
}

.back:hover {
  background-color: var(--back-hover);
}

.back2 {
  background-color: var(--back2);
}

.back1 {
  background-color: var(--back1);
}

.lay {
  background-color: var(--lay);
}

.lay:hover {
  background-color: var(--lay-hover);
}

.lay1 {
  background-color: var(--lay1);
}

.lay2 {
  background-color: var(--lay2);
}

.bet-table {
  background-color: var(--bg-table);
  border-radius: 0;
  margin-top: 0;
}

.bet-table-header {
  height: 40px;
  padding: 8px;
  border-radius: 0;
  display: flex;
  width: 100%;
}

.bet-table-body {
  box-shadow: 0 0 5px #c7c7c7;
  border-radius: 0 0 5px 5px;
}

.bet-table-body:hover {
  /* box-shadow: 0 0 10px #868686; */
}

.bet-table-row {
  padding: 6px 8px;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-items: center;
  border-bottom: 1px solid #fff;
}

.game-header {
  padding: 10px 20px;
  color: var(--text-secondary);
  width: 100%;
  background-color: var(--bg-secondary);
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.game-header .game-header-name {
  max-width: calc(100% - 150px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* text-transform: uppercase; */
  font-size: 16px;
  font-weight: bold;
}

.game-header-date {
  float: right;
  font-size: 16px;
  font-weight: bold;
}

.banner {
  height: 290px;
  border-radius: 0;
  background: linear-gradient(
    0deg,
    #100b1e 0%,
    #160d27 26.42%,
    #11091d 48.45%,
    #030309 100%
  );
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
}

.detail-page-container .banner,
.detail-page-container .banner img {
  height: auto;
}

.detail-page-container .banner.scorestats,
.detail-page-container .banner.scorestats img {
  height: 250px;
  background-position: center;
  background-size: cover;
}

.detail-page-container .banner.scorecard-banner,
.detail-page-container .banner.scorecard-banner img {
  height: 115px;
  background-position: center;
  background-size: cover;
}

.detail-page-container .banner.scorestats iframe {
  height: 235px;
  position: absolute;
  width: 85%;
  border: 0;
}
.market-1,
.market-2,
.market-3,
.market-4,
.market-5,
.market-6,
.market-7,
.market-8,
.market-9,
.market-10,
.market-11,
.market-12,
.market-13 {
  padding-left: 15px;
  padding-right: 15px;
  margin-bottom: 10px;
}
.detail-page-container .market-1 {
  /* min-width: calc(100% - 6px);
  margin-left: 3px;
  margin-right: 3px; */
  min-width: 100%;
}

.detail-page-container .market-2 {
  /* min-width: calc(33.33% - 6px);
  max-width: calc(100% - 6px);
  margin-left: 3px;
  margin-right: 3px; */
  flex: 1;
  min-width: 100%;
  max-width: 100%;
}

.detail-page-container .market-11 {
  /* min-width: calc(50% - 6px);
  max-width: calc(100% - 6px);
  margin-left: 3px;
  margin-right: 3px; */
  flex: 1;
  min-width: 50%;
  max-width: 100%;
}

.detail-page-container .market-3 {
  /* margin-left: 3px;
  margin-right: 3px;
  min-width: calc(50% - 6px); */
  flex: 1;
  min-width: 50%;
}

.detail-page-container .market-4,
.detail-page-container .market-12,
.detail-page-container .market-13 {
  /* margin-left: 0;
  margin-right: 0;
  min-width: 100%; */
  flex: 1;
  min-width: 100%;
}
.market-4 .market-nation-detail .market-nation-name {
  font-weight: bold;
}
.detail-page-container .market-5 {
  /* margin-left: 3px;
  margin-right: 3px;
  min-width: calc(100% - 6px); */
  min-width: 100%;
  flex: 1;
}

.detail-page-container .market-6 {
  /* min-width: calc(50% - 6px);
  max-width: calc(100% - 6px);
  margin-left: 3px;
  margin-right: 3px; */
  flex: 1;
  min-width: 50%;
  max-width: 100%;
}

.detail-page-container .market-9 {
  /* min-width: calc(50% - 6px);
  max-width: calc(100% - 6px);
  margin-left: 3px;
  margin-right: 3px; */
  flex: 1;
  min-width: 50%;
  max-width: 100%;
}

.detail-page-container .market-10 {
  /* min-width: calc(50% - 6px);
  max-width: calc(100% - 6px);
  margin-left: 3px;
  margin-right: 3px; */
  flex: 1;
  min-width: 50%;
  max-width: 100%;
}

.detail-page-container .bet-table-header {
  height: auto;
  padding: 5px;
  border-radius: 0;
  background-color: var(--bg-secondary70);
  color: var(--text-secondary);
  width: 100%;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.detail-page-container .bet-table-header .btn {
  padding: 2px 5px;
}
.detail-page-container .bet-table-header.collapsed img {
  transform: rotate(180deg);
}

.detail-page-container .bet-table {
  margin-top: 0;
  background-color: transparent;
  color: #333;
}

.detail-page-container .bet-table-row {
  padding: 0 0 0 8px;
  background-color: #ececec;
}
.detail-page-container .bet-table-row.bet-table-row-top {
  background-color: transparent;
}
.bet-table-body .bet-table-row:first-child {
  padding: 0 0 0 8px;
}

.detail-page-container .max-bet {
  font-size: 12px;
  float: right;
  text-align: right;
}

.detail-page-container .nation-name {
  width: calc(100% - 510px);
  padding-right: 5px;
}

.detail-page-container .nation-name span:first-child {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-block;
  font-weight: bold;
}

.detail-page-container .market-2 .nation-name {
  width: calc(100% - 170px);
}

.detail-page-container .market-11 .nation-name {
  width: calc(100% - 170px);
}

.detail-page-container .market-3 .nation-name {
  width: calc(100% - 300px);
}

.detail-page-container .market-5 .nation-name {
  width: calc(100% - 300px);
}

.detail-page-container .market-3 .bet-table-header .nation-name {
  width: calc(100% - 140px);
}

.detail-page-container .market-3 .bet-table-row-top .nation-name {
  width: calc(100% - 224px);
}

.detail-page-container .market-4 .bet-table-row-top .nation-name,
.detail-page-container .market-12 .bet-table-row-top .nation-name,
.detail-page-container .market-13 .bet-table-row-top .nation-name {
  width: calc(100% - 340px);
}

.detail-page-container .market-4 .bet-table-header .nation-name,
.detail-page-container .market-12 .bet-table-header .nation-name,
.detail-page-container .market-13 .bet-table-header .nation-name {
  width: calc(100% - 200px);
}

.detail-page-container .market-5 .bet-table-header .nation-name {
  width: calc(100% - 140px);
}

.detail-page-container .market-6 .nation-name {
  width: calc(100% - 242px);
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
}

.detail-page-container .market-6 .bet-table-header .nation-name {
  width: calc(100% - 140px);
}

.detail-page-container .market-6 .fancy-tripple .bet-table-row {
  border-bottom: 0;
}

.detail-page-container .market-6 .nation-name p {
  height: auto;
  width: 100%;
  white-space: normal;
  overflow: unset;
  text-overflow: unset;
  color: #3154fd !important;
}

.detail-page-container .market-6 .nation-name p:last-child {
  width: 100%;
  text-align: left;
  color: #000 !important;
}

.detail-page-container .market-6 .fancy-tripple {
  border-bottom: 1px solid var(--bg-table-header);
}

.detail-page-container .market-6 .fancy-tripple:last-child {
  border-bottom: 0;
}

.detail-page-container .fancy-market .fancy-tripple {
  border-bottom: 1px solid var(--bg-table-header);
}

.detail-page-container .fancy-market .fancy-tripple:last-child {
  border-bottom: 0;
}

.detail-page-container .fancy-market .fancy-tripple .bet-table-row {
  border-bottom: 0;
}

.detail-page-container .fancy-market .nation-name {
  width: calc(100% - 224px);
}

.fancy-min-max {
  font-size: var(--font-small);
  text-align: right;
  width: 72px;
  line-height: 16px;
  color: var(--text-table);
}

.detail-page-container .fancy-min-max {
  color: #17a2b8 !important;
  font-size: 14px;
  padding-right: 10px;
}

.detail-page-container .market-9 .nation-name {
  width: calc(100% - 85px);
}

.detail-page-container .market-9 .bet-table-header .nation-name {
  width: calc(100% - 140px);
}

.detail-page-container .market-10 .nation-name {
  width: calc(100% - 148px);
}

.detail-page-container .market-10 .bet-table-header .nation-name {
  width: calc(100% - 140px);
}

.detail-page-container .bl-title {
  height: 30px;
  border-radius: 0;
  width: 85px;
  text-align: center;
  line-height: 30px;
  color: var(--text-black);
  font-weight: var(--font-medium);
  margin-right: 0;
  cursor: default;
  font-size: var(--font-caption);
}

.detail-page-container .bl-title.back {
  background-color: var(--back-hover);
  font-weight: bold;
}

.detail-page-container .bl-title.lay {
  background-color: var(--lay-hover);
  font-weight: bold;
}

.detail-page-container .bl-title:last-child {
  margin-right: 0;
}

.detail-page-container .bl-box {
  width: 85px;
  height: auto;
  min-height: 45px;
  padding: 4px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-left: 1px solid #fff;
}

.detail-page-container .bl-box span {
  height: 14px;
  line-height: 14px;
  margin-top: 3px;
  font-size: 12px;
}

.detail-page-container .bl-box .odds {
  height: 16px;
  line-height: 16px;
  font-size: 16px;
  margin-bottom: 1px;
}

.detail-page-container .bl-box.no-val {
  line-height: 38px;
  padding: 0;
  /* border: 0; */
}

.detail-page-container .bl-box.no-val .odds {
  color: var(--text-table);
}

.detail-page-container .nation-name p {
  color: #333;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0;
  line-height: 1;
}

.detail-page-container .nation-name p span.book-per {
  font-size: 12px;
  margin-left: 10px;
  vertical-align: top;
}

.detail-page-container .nation-name p:last-child {
  margin-bottom: 0;
  font-size: 14px;
  line-height: 18px;
  height: 18px;
}

.bet-table .bet-table-header:not(:first-child) {
  border-radius: 0;
}

.detail-tabs {
  height: 60px;
  border-radius: 8px 8px 0 0;
  background-color: var(--bg-sidebar);
  margin-top: 16px;
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.detail-tabs .nav-tabs {
  border: 0;
}

.detail-tabs .nav-tabs .nav-link {
  color: var(--text-table);
  padding-top: 0;
  padding-bottom: 4px;
  padding-left: 12px;
  padding-right: 12px;
  border: 0;
}

.detail-tabs .nav-tabs .nav-item.active .nav-link {
  color: var(--text-highlight);
  font-weight: var(--font-semi);
  border-bottom: 2px solid var(--text-highlight);
}

.detail-tabs .nav-tabs .nav-link:focus,
.detail-tabs .nav-tabs .nav-link:hover {
  border: 0;
  color: var(--text-highlight);
}

.detail-page-container .market-1 .bet-table-row {
  padding-left: 0;
  padding-right: 0;
}

.detail-page-container .market-1 .bet-table-row .market-1-item {
  padding: 2px 8px;
  border-bottom: 1px solid var(--bg-table-header);
  display: flex;
  flex: 1 1 auto;
  justify-content: space-between;
  align-items: center;
  min-width: 33.33%;
  max-width: 50%;
}

.detail-page-container .market-1 .bet-table-row .market-1-item > div {
  cursor: pointer;
}

.detail-page-container .market-1 .bet-table-row .market-1-item:nth-child(3n) {
  border-right: 0;
}

.market-1 .suspendedfull:after {
  width: 100%;
  right: 0;
}

.market-1 .suspendedtext:after {
  right: 0;
  width: 100%;
  height: calc(100% - 2px);
}

.market-2 .suspendedtext:after {
  width: 170px;
  height: 100%;
}

.market-11 .suspendedtext:after {
  width: 148px;
  height: 38px;
}

.market-2 .suspendedfull:after {
  width: 148px;
  height: calc(100% - 4px);
}

.market-11 .suspendedfull:after {
  width: 148px;
  height: calc(100% - 4px);
}
:root[data-theme="dark"] .market-3 .suspendedtext:after {
  width: 300px;
  height: 38px;
}

.market-3 .suspendedfull:after {
  width: 300px;
  height: calc(100% - 4px);
}

.market-4 .suspendedtext:after,
.market-13 .suspendedtext:after {
  width: 508px;
  height: 46px;
}

.market-4 .suspendedfull:after,
.market-12 .suspendedfull:after,
.market-13 .suspendedfull:after {
  width: 508px;
  height: calc(100% - 4px);
}

.market-5 .suspendedtext:after {
  right: 160px;
  width: 148px;
  height: 38px;
}

.market-5 .suspendedfull:after {
  right: 160px;
  width: 148px;
  height: calc(100% - 4px);
}

.market-6 .suspendedtext:after {
  width: 170px;
  right: 72px;
  height: 100%;
}

.market-9 .suspendedtext::after {
  width: 72px;
  right: 8px;
  height: calc(100% - 4px);
}

.market-10 .suspendedtext::after {
  width: 72px;
  right: 84px;
  height: calc(100% - 4px);
}

.modal-big {
  max-width: 90%;
}

.tab-content > .tab-pane {
  padding: 0;
}

.id-address label {
  width: 100%;
}

.id-address input {
  display: inline-block;
  width: 48%;
}

.bl-type label {
  width: 100%;
}

.video-tv iframe {
  width: 100%;
  height: 254px;
  border: 0;
  background-color: #434343;
}

.bl-type select {
  width: 60%;
}

.detail-page-container .card {
  margin-bottom: 10px;
}

.detail-page-container .card-body {
  padding: 8px;
}

.detail-page-container .card-header {
  padding: 4px 12px;
  background-color: var(--bg-table-header);
  color: var(--text-table-header);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 42px;
}

.detail-page-container .card-header .card-title {
  color: var(--text-table-header);
  font-size: 14px;
  margin-bottom: 0;
  font-weight: normal;
  text-transform: uppercase;
}

.table th,
.table td {
  font-size: 14px;
  color: #1e1e1e;
}

.modal-body .tab-content > .tab-pane {
  padding: 7px;
  border: 1px solid #ced4da;
}

.back-border {
  border-left: 5px solid var(--back);
  background-color: #72bbef57 !important;
}

.lay-border {
  border-left: 5px solid var(--lay);
  background-color: #f994ba57 !important;
}

.andar-border {
  border-left: 5px solid #fc4242;
  background-color: #fc424214 !important;
}

.bahar-border {
  border-left: 5px solid #fdcf13;
  background-color: #fdcf1314 !important;
}

.my-bet-box {
  background-color: var(--bg-table-header);
  padding: 5px;
  margin-bottom: 3px;
  color: #000;
  font-size: 14px;
}

.my-bet-box-top-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 5px;
}

.my-bet-box-top-row > div {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.my-bet-nation-name,
.my-bet-market-name {
  width: 50%;
}

.my-bet-market-name {
  text-align: right;
}

.my-bet-box-bottom-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 5px;
}

.my-bet-box-bottom-row > div {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.my-bet-box-bottom-row .my-bet-urate,
.my-bet-box-bottom-row .my-bet-bhav {
  width: 10%;
}

.my-bet-box-bottom-row .my-bet-amount {
  width: 20%;
}

.my-bet-box-bottom-row .my-bet-place-date,
.my-bet-box-bottom-row .my-bet-uname {
  width: 30%;
}

#user-book ul.mtree.transit li.mtree-closed > a::after {
  content: "";
}

#user-book ul.mtree.transit li.mtree-open > a::after {
  content: "";
}

.mtree-open ul li::before {
  background: var(--theme1-bg);
  bottom: auto;
  content: "";
  height: 8px;
  left: 0px;
  margin-top: 2px;
  position: absolute;
  right: auto;
  width: 8px;
  z-index: 1;
  border-radius: 50%;
}

#user-book .mtree-open ul li::before {
  background: none;
  height: 0;
  width: 0;
}

.mtree-open ul li::after {
  border-left: 1px solid #000;
  bottom: 0;
  content: "";
  left: 4px;
  position: absolute;
  top: 0px;
}

#user-book .mtree-open ul li::after {
  border-left: 0;
}

#user-book .mtree > li {
  background-color: var(--bg-success);
}

#user-book .mtree-level-1 > li {
  background-color: var(--bg-info);
}

#user-book .mtree-level-2 > li {
  background-color: var(--bg-table);
}

#user-book .mtree-level-3 > li {
  background-color: var(--bg-table-header);
}

#user-book .mtree-level-4 > li {
  background-color: #5d8aa9;
}

#user-book .mtree-level-5 > li {
  background-color: #72a0c1;
}

/*Casino Page CSS goes here*/

.casino-table {
  border-radius: 0;
  padding-bottom: 0;
  position: relative;
  transform: translateZ(0);
}

.casino-video {
  text-align: center;
  position: relative;
  background-color: transparent;
  background-color: #2e3439;
  border-radius: 0;
}

.casino-video .video-box-container {
  max-width: 100%;
  margin-left: auto;
}

.casino-video .video-box {
  position: relative;
  max-width: 100%;
  width: 100%;
  padding-bottom: 56.25%;
}

.casino-video .video-box > img,
.casino-video .video-box > iframe {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  border: 0;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.five-cricket .casino-video .video-box > img,
.five-cricket .casino-video .video-box > iframe {
  border-radius: 8px;
}

.casino-video-title {
  position: absolute;
  left: 5px;
  top: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 5px;
  z-index: 10;
  text-align: center;
  min-width: 220px;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.casino-video-title .casino-name {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 20px;
  color: #fdcf13;
  line-height: 22px;
}

.casino-video-rid {
  font-weight: bold;
  color: #ddd;
  font-size: 14px;
  margin-top: 3px;
}

.casino-video-cards {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  padding: 5px 20px 5px 5px;
  display: inline-block;
  /* height: 160px; */
  height: auto;
  overflow: hidden;
  transition: 1s;
  /* width: 195px; */
  width: auto;
  border-radius: 0 8px 8px 0;
}

.casino-video-cards.hide-cards {
  width: 0 !important;
  transition: 1s;
}

.casino-cards-shuffle {
  position: absolute;
  right: 5px;
  top: 50%;
  width: auto !important;
  font-size: 30px;
  transform: translateY(-50%);
  cursor: pointer;
  color: #b3b3b3;
  display: none;
}

.casino-video-cards-container {
  width: 100%;
  overflow: hidden;
  display: -webkit-flex;
  flex-wrap: wrap;
  flex-direction: column;
  height: auto;
  transition: 1s;
  color: #fff;
}

.casino-video-cards-container > div {
  display: flex;
  display: -webkit-flex;
  flex-wrap: nowrap;
  width: 100%;
  margin-bottom: 5px;
}

.casino-video-cards-container > div:last-child {
  margin-bottom: 0;
}

.lucky7 .casino-video-cards {
  height: 115px;
  width: 85px;
}

.casino-video-cards img {
  margin-right: 8px;
  width: 35px;
}

.casino-timer {
  position: absolute;
  right: 5px;
  bottom: 5px;
  display: flex;
  display: -webkit-flex;
}

.base-timer {
  position: relative;
  width: 100px;
  height: 100px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
}

.base-timer__svg {
  transform: scaleX(-1);
}

.base-timer__circle {
  fill: none;
  stroke: none;
}

.base-timer__path-elapsed {
  stroke-width: 7px;
  stroke: grey;
}

.base-timer__path-remaining {
  stroke-width: 7px;
  stroke-linecap: round;
  transform: rotate(90deg);
  transform-origin: center;
  transition: 1s linear all;
  fill-rule: nonzero;
  stroke: currentColor;
}

.base-timer__label.green,
.base-timer__path-remaining.green {
  color: rgb(65, 184, 131);
}

.base-timer__label.orange,
.base-timer__path-remaining.orange {
  color: orange;
}

.base-timer__label.red,
.base-timer__path-remaining.red {
  color: red;
}

.base-timer__label {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 0;
  display: flex;
  display: -webkit-flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: var(--text-yellow);
  font-family: timer;
}

.base-timer__label > span {
  min-width: 20px;
  text-align: center;
  line-height: 1;
}

.casino-video-right-icons {
  position: absolute;
  right: 5px;
  top: 5px;
  display: flex;
  display: -webkit-flex;
}

.casino-video-lr-icon,
.casino-video-home-icon,
.casino-video-rules-icon {
  background-color: rgba(0, 0, 0, 0.5);
  border: 2px solid #999;
  border-radius: 50%;
  height: 40px;
  width: 40px;
  display: flex;
  display: -webkit-flex;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
  cursor: pointer;
}

.casino-video-rules-icon .fa-info-circle {
  color: #fff !important;
}

.casino-video-lr-icon i,
.casino-video-home-icon i,
.casino-video-rules-icon i {
  font-size: var(--font-24);
  color: #fff;
  cursor: pointer;
}

.casino-video-lr-icon {
  margin-right: 0;
}

.casino-video-last-results {
  display: flex;
  display: -webkit-flex;
  align-content: flex-start;
  flex-wrap: wrap;
  transition: 1s;
  overflow: hidden;
  color: #fff;
  justify-content: flex-end;
  margin-top: 10px;
  width: 100%;
}

.casino-video-last-results.hide-lr {
  height: 0;
  transition: 1s;
  padding-top: 0;
  padding-bottom: 0;
}

.casino-video-last-results span,
.casino-video-last-results a {
  width: 30px;
  margin-left: 2px;
  height: 30px;
  background-color: #0088cc;
  cursor: pointer;
  font-weight: bold;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.casino-video-last-results span.resulta {
  color: #ff4500;
  background-color: #355e3b;
}

.casino-video-last-results span.resultb {
  background: #355e3b;
  color: #ffff33;
}

.casino-video-last-results span.resultc {
  color: var(--text-green);
  background-color: #355e3b;
}

.casino-video-last-results span.resulttie {
  color: var(--text-white);
  background-color: #355e3b;
}

.baccarat .casino-video-last-results span.resulta {
  color: #fff;
  background-color: #086cb8;
}

.baccarat .casino-video-last-results span.resultb {
  color: #fff;
  background-color: #ae2130;
}

.baccarat .casino-video-last-results span.resulttie {
  background-color: #11b24b;
  color: #fff;
}

.lucky7 .casino-video-last-results span.resulthigh {
  background: #355e3b;
  color: #ffff33;
}

.lucky7 .casino-video-last-results span.resultlow {
  background: #355e3b;
  color: #ff4500;
}
.race20 .casino-video-last-results span {
  background-color: #d5d5d5;
  border: 1px solid #626262;
}
/* .casino-video-last-results a.result-more {
  width: 100%;
  line-height: 1.8;
  margin-right: 5px;
  margin-bottom: 5px;
  color: var(--text-white);
} */

.casino-video-cards-container .dealer-name {
  font-weight: bold;
  text-transform: uppercase;
  font-size: var(--font-small);
  justify-content: flex-start;
  white-space: nowrap;
}

.casino-detail {
  padding: 10px 10px 40px;
  background-color: #f8f8fb;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 6px #e2e2e2;
}

.casino-table:hover {
  /* box-shadow: 0 2px 7px #bbb;
  background-color: #f6f6f6; */
}

.casino-box-header {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  padding: 0 6px;
  align-items: center;
}

.casino-box-row {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  padding: 2px 0;
  align-items: center;
  position: relative;
}

.casino-bl-box {
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}

.casino-bl-box-item {
  margin-right: 4px;
  border-radius: 0;
  text-align: center;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
  color: var(--text-black);
  text-align: center;
  /* cursor: pointer; */
  cursor: not-allowed;
  height: 40px;
}

.casino-nation-name {
  padding: 4px;
  background-color: #ddd;
}

.casino-bl-box-item:last-child {
  margin-right: 0;
}

.casino-table .back,
.casino-table .lay {
  background-color: transparent;
}

.casino-table .back {
  background-color: transparent;
  border: 2px solid var(--back);
}

.casino-table .back:hover {
  border: 2px solid var(--back);
}

.casino-table .lay {
  background-color: transparent;
  border: 2px solid var(--lay);
}

.casino-table .lay:hover {
  border: 2px solid var(--lay);
}

.casino-bl-box-item > span,
.casino-rb-box-player > span {
  display: block;
  width: 100%;
  line-height: 14px;
}

.casino-bl-box-item .casino-box-odd,
.casino-rb-box-player .casino-box-odd {
  font-weight: var(--font-bold);
  font-size: var(--font-odds);
  height: 16px;
  line-height: 16px;
  margin-bottom: 2px;
  width: 100%;
  color: #333;
}

.casino-bl-box-title .casino-bl-box-item span {
  width: auto;
}

.casino-bl-box-title .casino-bl-box-item {
  color: var(--text-black);
  height: 24px !important;
  font-size: var(--font-caption);
  flex-direction: row;
}

.fa-info-circle {
  color: #4a4a4a !important;
  font-size: var(--font-caption);
  cursor: pointer;
  transition: 0.5s;
  z-index: 1;
}

.icon-range {
  position: absolute;
  top: 100%;
  background-color: var(--bg-sidebar);
  padding: 4px;
  max-width: 100%;
  word-wrap: break-word;
  font-size: var(--font-small);
  z-index: 10;
  right: 0;
  transition: 0.1s;
  text-transform: capitalize;
  color: var(--text-table);
  z-index: 150;
}

.casino-detail .casino-nation-name.no-border {
  background-color: transparent;
  padding: 0;
}

.casino-bl-box-title .playera {
  color: var(--text-red) !important;
}

.casino-bl-box-title .playerb {
  color: var(--text-yellow) !important;
}

.casino-card-img img {
  width: 30px;
  height: auto;
  margin-left: 5px;
}

/*Teenpatti 2020*/

.teen20casino-container {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.teen20left,
.teen20right {
  width: 49%;
}

.teen20center {
  width: 2px;
  background-color: #e0e0e0;
}

.teenpatti20 .casino-bl-box-item .casino-book {
  position: absolute;
  bottom: -20px;
}

.teenpatti20 .casino-bl-box-item {
  width: calc(25% - 3px);
  height: 40px;
  text-transform: uppercase;
  position: relative;
}

.teenpatti20 .casino-rb-box-container {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 5px;
}

.teenpatti20 .casino-rb-box {
  width: calc(50% - 4px);
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  position: relative;
  flex-direction: column;
}

.teenpatti20 .casino-rb-box-player {
  width: 100%;
  text-align: left;
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-highlight);
  min-height: 46px;
  cursor: pointer;
  border-radius: 4px;
  position: relative;
}

.teenpatti20 .casino-rb-box-player .casino-book {
  position: absolute;
  bottom: -20px;
  text-align: center;
  left: 0;
  width: calc(100% - 20px);
}

.casino-rb-box-player span {
  display: block;
  width: 100%;
}

.teenpatti20 .casino-rb-box-player > div {
  padding: 0 8px;
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
}

.teenpatti20 .casino-rb-box-player img {
  height: 25px;
  max-height: 25px;
  margin-left: 5px;
  width: 22px;
}

.teenpatti20 .casino-rb-box-player-range {
  justify-content: flex-end;
  display: flex;
  display: -webkit-flex;
  width: 100%;
  margin-top: 5px;
}

/*Teenpatti 1day*/

.teen1daycasino-container {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}

.teen1dayleft,
.teen1dayright {
  width: 49%;
}

.teen1daycenter {
  width: 2px;
  background-color: grey;
}

.teenpatti1day .casino-nation-name {
  width: 50%;
  position: relative;
  background-color: #ddd;
}

.teenpatti1day .casino-bl-box {
  width: 50%;
}

.teenpatti1day .casino-bl-box-item {
  width: calc(50% - 2px);
}

.teen1dayother {
  width: 100%;
  margin-top: 15px;
}

.teenpatti1day .teen1dayother .casino-nation-name {
  width: 22%;
}

.teenpatti1day .teen1dayother .casino-bl-box {
  width: 13%;
}

.teenpatti1day .teen1dayother .casino-bl-box-item {
  width: calc(100% - 4px);
  height: 40px;
}

/*Teenpatti Open*/

.teenpattiopen .casino-open-card-box {
  display: flex;
  flex-wrap: wrap;
  background-color: #434343;
  padding: 10px;
  border-radius: 16px;
  margin-bottom: 10px;
}

.teenpattiopen .casino-open-card-box > div {
  width: 12.5%;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  color: var(--text-fancy);
}

.teenpattiopen .casino-open-card-box > div > div {
  text-align: center;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.teenpattiopen .casino-open-card-box img {
  width: 30px;
  margin-right: 5px;
}

.teenpattiopen .casino-nation-name {
  width: calc(100% - 85%);
  position: relative;
}

.teenpattiopen .casino-bl-box {
  width: 85%;
}

.teenpattiopen .casino-bl-box .casino-book {
  position: absolute;
  bottom: -20px;
  z-index: 10;
}

.teenpattiopen .casino-bl-box .casino-box-odd.open-pair {
  font-size: var(--font-caption);
}

.teenpattiopen .casino-bl-box-item {
  width: calc(12.5% - 4px);
  height: 40px;
}

.teenpattiopen .casino-detail .casino-box-header .casino-bl-box-item {
  height: 20px !important;
}

.teenpattiopen .casino-detail .casino-box-header .casino-bl-box-item img {
  height: 35px;
}

.teenpattiopen .teenopenother .casino-bl-box {
  width: 100%;
}

.teenpattiopen .teenopenother .casino-bl-box-item {
  width: calc(25% - 4px);
  color: var(--text-highlight);
  height: 56px;
  padding: 0;
  position: relative;
}

.teenpattiopen .teenopenother .odds-min-max {
  width: calc(25% - 4px);
}

.casino-min-max {
  font-size: var(--font-small);
  color: var(--text-black);
  font-weight: normal;
}

.teenpattiopen .casino-video-cards {
  height: 110px;
}

/*Baccarat*/

.baccarat .casino-detail {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.statistics {
  width: 25%;
}

.baccarat .statistics-title {
  height: 22px;
  font-weight: var(--font-bold);
  text-transform: uppercase;
  margin-bottom: 14px;
}

.baccarat .baccarat-bets-odds {
  width: 75%;
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
}

.baccarat .baccarat-odds {
  display: flex;
  display: -webkit-flex;
  width: 100%;
  margin-bottom: 50px;
}

.baccarat .baccarat-odd-block {
  flex: 1 1 auto;
  margin-right: 16px;
  position: relative;
}

.baccarat .baccarat-odd-block .casino-min-max {
  position: absolute;
  right: 0;
  top: -18px;
  width: 100%;
}

.baccarat .player-pair .casino-min-max {
  position: absolute;
  top: -25px;
  left: 0;
  width: 100%;
  text-align: left;
}

.baccarat .player .casino-min-max {
  position: absolute;
  left: 0;
  top: -25px;
  width: 100%;
  text-align: left;
}

.baccarat .tie .casino-min-max {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  text-align: center;
}

.baccarat .player .casino-min-max {
  position: absolute;
  left: 0;
  top: -25px;
  width: 100%;
  text-align: left;
}

.baccarat .banker .casino-min-max {
  position: absolute;
  top: -25px;
  right: 0;
  width: 100%;
  text-align: right;
}

.baccarat .banker-pair .casino-min-max {
  position: absolute;
  right: 0;
  top: -25px;
  width: 100%;
  text-align: right;
}

.baccarat .player-pair .casino-min-max .icon-range {
  left: 0;
  right: unset;
}

.baccarat .player .casino-min-max .icon-range {
  left: 0;
  right: unset;
}

.baccarat .baccarat-odd-block:last-child {
  margin-right: 0;
}

.baccarat .baccarat-odd-block .baccarat-odd-name {
  padding: 6px 2px;
  text-align: center;
  color: var(--text-white);
  background-color: #434343;
  cursor: pointer;
  border-radius: 4px;
  text-transform: uppercase;
}

.baccarat .baccarat-odd-block .baccarat-odd-val {
  text-align: center;
  line-height: 18px;
  font-size: 14px;
  font-weight: bold;
  margin-top: 5px;
  position: relative;
}

.baccarat .baccarat-bets {
  display: flex;
  display: -webkit-flex;
  width: 100%;
  margin-top: 0;
  margin-bottom: 20px;
  position: relative;
}

.baccarat .player-pair {
  margin-right: 1%;
  width: 16%;
  height: 80px;
  margin-top: 0;
}

.baccarat .player-pair .baccarat-bets-name {
  border-radius: 30px 0 0 30px;
  background-color: #509bff;
}

.baccarat .baccarat-bets-name {
  height: 100%;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  flex-direction: column;
  color: var(--text-white);
  padding-left: 0;
  text-align: center;
  cursor: pointer;
}

.baccarat .player-pair .baccarat-bets-name div {
  margin-bottom: 0;
}

.baccarat .player-pair .baccarat-bets-val {
  text-align: center;
  line-height: 18px;
  font-size: 14px;
  font-weight: bold;
  margin-top: 5px;
}

.baccarat .player {
  width: 22%;
  height: 80px;
  position: relative;
}

.baccarat .suspended img {
  position: relative;
  /* z-index: 10; */
  cursor: not-allowed;
}

.baccarat .player .baccarat-bets-name {
  background-color: #509bff;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  align-items: flex-start;
  padding-left: 20px;
}

.baccarat .player .baccarat-bets-val {
  text-align: center;
  line-height: 18px;
}

.baccarat .tie {
  width: 22%;
  border-radius: 0;
  z-index: 10;
  height: 80px;
}

.baccarat .tie .baccarat-bets-name {
  background-color: #11b24b;
  border-radius: 0;
}

.baccarat .tie .baccarat-bets-val {
  text-align: center;
  line-height: 18px;
  margin-top: 3px;
}

.baccarat .banker {
  width: 22%;
  height: 80px;
  position: relative;
}

.baccarat .banker .baccarat-bets-name {
  background-color: #d3393d;
  align-items: flex-end;
  padding-right: 20px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.baccarat .banker .baccarat-bets-val {
  text-align: center;
  line-height: 18px;
}

.baccarat .baccarat-bets-val {
  font-size: 18px;
}

.baccarat .banker-pair {
  width: 16%;
  margin-left: 1%;
  height: 80px;
  margin-top: 0;
  position: relative;
}

.baccarat .banker-pair .baccarat-bets-name {
  border-radius: 0 30px 30px 0;
  background-color: #d3393d;
}

.baccarat .banker-pair .baccarat-bets-val {
  text-align: center;
  line-height: 18px;
}

.baccarat .baccarat-min-max {
  display: flex;
  display: -webkit-flex;
  justify-content: flex-end;
  width: 100%;
  font-size: 12px;
  line-height: 14px;
}

.baccarat .player > span,
.baccarat .banker > span {
  float: left;
  margin-left: 10px;
}

.baccarat .player img,
.baccarat .banker img {
  width: 25px;
}

.l-rotate,
.r-rotate {
  width: 70px;
}

.l-rotate img,
img.l-rotate {
  transform: rotate(270deg);
}

.r-rotate > img,
img.r-rotate {
  transform: rotate(90deg);
}

.r-rotate > img,
img.r-rotate {
  transform: rotate(90deg);
}

.baccarat .baccarat-odd-block .baccarat-odd-name:hover {
  opacity: 0.8;
  cursor: pointer;
}

.baccarat .player-pair .baccarat-bets-name:hover,
.baccarat .player .baccarat-bets-name:hover {
  background: #509bffc9;
  cursor: pointer;
}

.baccarat .tie .baccarat-bets-name:hover {
  background: #0c9a1d;
  cursor: pointer;
}

.baccarat .banker .baccarat-bets-name:hover,
.baccarat .banker-pair .baccarat-bets-name:hover {
  background-color: #d3393ddb;
  cursor: pointer;
}

/* .player-pair .suspended:before,
.player .suspended:before {
  background-position: left 10px top 10px;
}

.banker-pair .suspended:before,
.banker .suspended:before {
  background-position: right 10px top 10px;
} */

.player-pair .suspended:after {
  border-radius: 30px 0 0 30px;
}

.banker-pair .suspended:after {
  border-radius: 0 30px 30px 0;
}

.player .suspended:after {
  border-radius: 0;
}

.tie .suspended:after {
  border-radius: 0;
}

.banker .suspended:after {
  border-radius: 0;
}

.baccarat .suspended img {
  position: relative;
  /* z-index: 10; */
  cursor: not-allowed;
}

.baccarat .player span,
.baccarat .banker span {
  margin-left: 5px;
}

/*Lucky 7*/

.lucky7 .casino-detail {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
}

.lucky7 .casino-detail .casino-box {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  align-content: flex-start;
}

.lucky7 .casino-detail .casino-box.low-high-box {
  width: 49%;
  margin-right: 2%;
}

.lucky7 .casino-detail .casino-box.sidebets-box {
  width: 49%;
}

.lucky7 .casino-detail .casino-box.cards-box {
  width: 100%;
}

.lucky7 .sidebets-box .casino-odds,
.lucky7 .low-high-box .casino-odds {
  color: #fff;
}

.lucky7 .casino-detail .cards-top {
  width: 100%;
}

.cards-top .cards-top-box {
  padding: 5px;
  border: 5px solid #43434390;
  cursor: pointer;
  display: block !important;
}

.lucky7 .casino-detail .casino-box:last-child {
  margin-right: 0;
}

.lucky7 .casino-detail .casino-box .low-odds {
  background-color: #434343;
  border: 5px solid var(--bg-danger);
  padding: 0;
  color: var(--text-highlight);
  width: 33.33%;
  padding: 6px;
  height: 76px;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.lucky7 .casino-detail .casino-box .high-odds {
  background-color: #434343;
  border: 5px solid var(--bg-success);
  padding: 0;
  color: var(--text-highlight);
  width: 33.33%;
  padding: 6px;
  height: 76px;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.lucky7 .casino-detail .casino-box .high-odds .casino-book,
.lucky7 .casino-detail .casino-box .low-odds .casino-book {
  position: absolute;
  bottom: -25px;
}

.lucky7 .casino-detail .casino-box .high-odds + .casino-min-max,
.lucky7 .casino-detail .casino-box .low-odds + .casino-min-max {
  margin-top: 25px;
}

.lucky7-card {
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  width: 33.33%;
  background-color: #43434333;
  padding: 6px;
}

.lucky7-card img {
  height: 60px;
}

.lucky7-extra-bets {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  width: 100%;
}

.lucky7-extra-bets-item-container {
  width: 23.5%;
  margin-right: 2%;
  margin-bottom: 5px;
}

.lucky7-extra-bets-item {
  background-color: #434343;
  padding: 6px;
  border-radius: 8px;
  height: 76px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #fff;
  position: relative;
}

.lucky7-extra-bets-item .casino-book {
  position: absolute;
  bottom: -20px;
}

.lucky7-extra-bets-item + .casino-min-max {
  margin-top: 25px;
}

.lucky7-extra-bets-item-container:nth-child(4n) {
  margin-right: 0;
}

.lucky7 .casino-min-max {
  width: 100%;
  text-align: right;
  position: relative;
  height: 20px;
}

.casino-card-item .card-image img {
  width: 40px;
}

.cards-top .casino-card-item {
  display: inline-block;
  width: auto;
  margin-right: 5px;
  margin-bottom: 0;
  min-width: 40px !important;
}

.casino-card-item .card-image {
  display: inline-block;
}

.casino-card-item .card-image img {
  width: 48px;
}

.casino-card-item .card-image {
  cursor: pointer;
}

.casino-cards {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
}

.casino-card-item {
  margin-right: 5px;
  margin-left: 5px;
  width: auto;
  margin-bottom: 10px;
}

.cards-box .casino-card-item,
.casino-cards .casino-card-item {
  min-width: 80px;
}

.card-image.suspended::after {
  border-radius: 0;
}

.casino-odds {
  font-weight: var(--font-bold);
  text-align: center;
  width: 100%;
  line-height: 18px;
  color: var(--text-black);
  position: relative;
}

.casino-buttons img {
  height: 25px;
}

.poker1day .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
  background-color: transparent;
}

.poker1day .casino-bl-box {
  width: 50%;
}

.poker1day .casino-bl-box-item {
  width: calc(50% - 2px);
}

.poker1day .casino-bl-box {
  width: 50%;
}

.poker1day .casino-bl-box-item {
  width: calc(50% - 2px);
}

.poker1day .playerabcardbox {
  width: 20%;
  background-color: #434343;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 100%;
  border-radius: 8px;
  height: 180px;
}

.playerafabcy .icon-range,
.playerbfabcy .icon-range {
  left: 0;
  right: unset;
}

.poker1day .playerabcardbox .poker-icon img {
  width: 120px;
}

.poker1day .dealer-name {
  font-size: 18px;
  font-weight: bold;
}

.poker1day .dealer-name.playerb {
  color: var(--text-fancy);
}

.poker1day .dealer-name.playera {
  color: var(--text-red);
}

.poker1day .playerbfabcy {
  padding: 6px;
  padding-bottom: 6px;
  border: 2px solid var(--text-fancy);
  background-color: #fdcf132e;
  min-height: 72px;
}

.poker1day .playerabcardbox img {
  width: 30px;
  margin-right: 5px;
}

.poker1day .poker1dayother .casino-bl-box {
  width: 100%;
}

.poker1day .poker1dayother .casino-bl-box-item {
  width: calc(50% - 4px);
  color: var(--text-highlight);
  height: 56px;
  padding: 0;
}

.poker1day .poker1dayother .odds-min-max {
  width: calc(50% - 4px);
  position: relative;
}

.poker20 .casino-video-cards {
  width: 195px;
  height: 170px;
}

.poker20 .casino-video-cards-container {
  flex-direction: row;
}

.poker1day .casino-video-cards .playeracards,
.poker1day .casino-video-cards .playerbcards,
.poker20 .casino-video-cards .playeracards,
.poker20 .casino-video-cards .playerbcards {
  width: 50%;
}

.poker1day .casino-video-cards .playerbcards,
.poker20 .casino-video-cards .playerbcards {
  text-align: right;
  justify-content: flex-end;
}

.poker1day .casino-video-cards-container > div,
.poker20 .casino-video-cards-container > div {
  flex-wrap: wrap;
  width: 100%;
}

.poker1day .casino-video-cards {
  width: 195px;
  height: auto;
}

.poker1day .casino-video-cards span img,
.poker20 .casino-video-cards span img {
  width: 27px;
}

.poker1day .casino-video-cards span:last-child img,
.poker20 .casino-video-cards span:last-child img {
  margin-right: 0;
}

.poker1day .casino-video-cards-container > div,
.poker20 .casino-video-cards-container > div {
  flex-wrap: wrap;
}

.poker1day .casino-detail {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.poker1day .playerabox,
.poker1day .playerbbox {
  width: 39%;
}

.poker1day .playerafabcy {
  padding: 6px;
  border: 2px solid var(--text-red);
  background-color: #fc42422e;
  min-height: 72px;
}

/*Casino Result*/

.casino-result-round {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  font-size: 18px;
}

.casino-result-cards {
  display: block;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 1rem;
  padding-bottom: 1rem;
}
.casino-result-cards .winner-label {
  background-color: #28a745;
  padding: 7px;
  color: #fff;
  font-size: 20px;
}
.casino-result-content {
  padding: 6px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.casino-result-cards-item .winner-icon {
  height: 55px;
}

.casino-result-cards-item img {
  width: 50px;
}

.casino-result-content-item {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  width: 49%;
}

.casino-result-content-diveder {
  width: 2px;
  height: 130px;
  background-color: #ddd;
}

.casino-result-cards-item {
  margin-bottom: 5px;
  margin-right: 5px;
  display: inline-block;
}

.casino-result-cards-item:last-child {
  margin-right: 0;
}

.casino-result-desc {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding: 6px;
  box-shadow: 0 0 5px;
  margin-top: 10px;
  width: 80%;
  margin-left: auto;
}

.casino-result-desc-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: flex-start;
  width: 100%;
  margin: 0 10px;
}

.casino-result-desc-item div:first-child {
  width: 30%;
  text-align: right;
  margin-right: 2%;
  color: var(--text-table);
}

.casino-result-desc-item div:last-child {
  width: 68%;
  text-align: left;
  word-break: break-all;
}

.teenpatti .suspended:after {
  width: calc(40% - 4px);
  right: 6px;
  left: unset;
  top: 6px;
  border-radius: 3px;
  height: calc(100% - 12px);
}

.casino-open-result {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
}

.casino-open-result-item {
  width: 11.1%;
  text-align: center;
}

.casino-open-result-item h4 {
  font-size: var(--font-18);
}

.casino-open-result .casino-result-cards {
  height: auto;
  margin-right: 10px;
}

.casino-open-result .casino-result-cards-item {
  margin-bottom: 5px;
}

.poker20casino-container {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.poker20left,
.poker20right {
  width: 49%;
}

.poker20 .casino-bl-box {
  width: 100%;
}

.poker20 .casino-bl-box-item {
  width: calc(33.33% - 3px);
  height: 40px;
  text-transform: uppercase;
  position: relative;
}

.poker20 .casino-bl-box-item {
  margin-bottom: 22px;
}

.poker20 .casino-bl-box-title .casino-bl-box-item {
  margin-bottom: 0;
}

.poker20 .casino-bl-box-item .casino-book {
  position: absolute;
  bottom: -20px;
}

.poker20center {
  width: 2px;
  background-color: grey;
}

/*Sic Bo*/

.sicbo-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sicbo-title-box {
  background-color: #666666;
  color: #fff;
  border-radius: 10px;
  padding: 0 5px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  min-width: 70px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  -ms-border-radius: 10px;
  -o-border-radius: 10px;
}

.sicbo-middle {
  display: flex;
  flex-wrap: nowrap;
  margin-top: 5px;
  justify-content: space-between;
}

.sicbo-middle-midle {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: auto;
}

.sicbo-middle-top-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}

.sicbo-square-box {
  text-transform: uppercase;
  background-image: linear-gradient(
    rgba(153, 146, 135, 0.7),
    rgba(162, 142, 130, 0.7)
  );
  border-radius: 6px;
  padding: 5px;
  color: #1d1b2d;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin: 0 1px;
  flex: 1 1 auto;
  cursor: pointer;
}

.sicbo-middle-small,
.sicbo-middle-big {
  flex: unset;
  min-width: 60px;
}

.sicbo-middle-top-box-odd {
  margin: 0 5px;
  min-width: 50px;
}

.sicbo-box-value {
  font-weight: bold;
}

.sicbo-middle-middle-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10px;
  width: 100%;
}
.sicbo-middle-middle-row
  .sicbo-cube-box-container:first-child
  .sicbo-title-box {
  display: flex;
  justify-content: space-between;
}
.sicbo-cube-box-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  margin: 0 1px;
}

.sicbo-middle-middle-row .sicbo-cube-box-container {
  flex: 1 auto;
}

.sicbo-cube-box-group {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}

.sicbo-cube-box {
  width: 50px;
  height: 50px;
}

.sicbo-cube-single img {
  height: 30px;
}

.sicbo-cube-double,
.sicbo-cube-tripple {
  position: relative;
}

.sicbo-cube-double img {
  height: 20px;
}

.sicbo-cube-double img:first-child {
  position: absolute;
  left: 5px;
  top: 5px;
}

.sicbo-cube-double img:last-child {
  position: absolute;
  right: 5px;
  bottom: 5px;
}

.sicbo-cube-tripple img {
  height: 13px;
}

.sicbo-cube-tripple img:first-child {
  position: absolute;
  left: 5px;
  top: 5px;
}

.sicbo-cube-tripple img:nth-child(2) {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.sicbo-cube-tripple img:last-child {
  position: absolute;
  right: 5px;
  bottom: 5px;
}

.sicbo-bottom {
  display: flex;
  margin-top: 10px;
}

.sicbo-bottom .sicbo-cube-box-container {
  margin: 0 auto;
}

.sicbo-bottom .sicbo-cube-box {
  flex: unset;
  height: 60px;
  justify-content: space-between;
}

.sicbo-cube-combination img {
  height: 20px;
}

/*End Casino Page CSS*/

/*Modal*/
.modal-dialog {
  margin: 24px auto;
  max-width: 530px;
}
.modal-dialog.modal-xl {
  max-width: 90%;
}
.modal-big {
  max-width: 90%;
}
.modal-content {
  padding: 0 1rem;
}
.modal-big .modal-content {
  /* padding: 0; */
  border-radius: 0;
}
.market-analysis-modal .modal-content {
  padding: 0;
}
.modal-body {
  max-height: calc(100vh - 58px);
  overflow-x: hidden;
  overflow-y: auto;
}

.modal-header {
  padding: 1rem;
}
.modal-title {
  font-size: 1.5rem;
}
/*End Modal*/

/*Market Analysis*/

.market-analysis-container {
  margin-bottom: 10px;
  margin-top: 10px;
  box-shadow: 0 0 5px;
}

.market-analysis-content {
  padding: 10px 10px 0 10px;
}

.market-analysis-title {
  display: flex;
  justify-content: space-between;
  padding: 6px;
  background-color: var(--bg-sidebar);
  color: var(--text-sidebar);
  font-size: 16px;
}

.market-analysis-title a {
  color: var(--text-sidebar);
}

.market-analysis-container .table {
  background-color: transparent;
  margin-bottom: 10px;
}

.market-analysis-container .table thead {
  background-color: var(--bg-table-header);
  color: #fff;
}

/*User Lock*/

.user-lock-list {
  width: 300px;
  padding: 20px;
}

.user-lock-list li a {
  display: block;
  color: #000;
  padding: 4px;
}

.user-lock-list .navbar-nav .dropdown-menu {
  position: relative !important;
}

.user-lock-list .dropdown-menu {
  background-color: transparent;
  box-shadow: none;
}

.user-lock-list .dropdown-toggle::after {
  display: none;
}

.user-lock-nav .nav-item > .dropdown-menu {
  padding-left: 30px;
}

.user-lock-nav .nav-item > .dropdown-menu .dropdown-menu {
  padding-left: 15px;
}

.user-lock-search {
  position: relative;
}

.search-box {
  position: absolute;
  top: 100%;
  background-color: #eee;
  width: 100%;
  z-index: 100;
  max-height: 250px;
  overflow-x: hidden;
  overflow-y: auto;
}

.search-box div {
  padding: 5px;
  cursor: pointer;
}

.search-box div:hover {
  background-color: #333;
  color: #fff;
}

.user-lock-search .fa-spinner {
  position: absolute;
  right: 10px;
  top: 40px;
}

#market-analysis .modal-xl {
  max-width: 80%;
}

.block-title {
  background-color: transparent;
  color: #1e1e1e;
  padding: 6px 8px;
  margin-bottom: 5px;
  font-size: 1.5rem;
}

.search-analysis .analysis-detail,
.search-analysis .search-analysis-table {
  max-height: 250px;
  overflow-x: hidden;
  overflow-y: auto;
}

.market-analysis-content-detail {
  max-height: 250px;
  overflow: auto;
  margin-bottom: 10px;
}

.analysis-detail {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.5);
  box-shadow: 1px 1px 4px #000;
  padding: 5px;
}

.search-analysis i {
  font-size: 16px;
}

.battle-header {
  background-color: var(--bg-table-header);
  padding: 8px;
  display: flex;
  justify-content: space-between;
  color: var(--text-highlight);
}

.battle-content {
  border: 1px solid var(--bg-table-header);
}

.battle-content-row {
  display: flex;
  justify-content: space-between;
  padding: 4px;
  cursor: pointer;
  border: 1px solid var(--bg-table-header);
  border-top: 0;
  border-bottom: 1px solid var(--bg-table-header);
}

.battle-content-detail {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 4px;
  border-bottom: 1px solid var(--bg-table-header);
}

.battle-detail-content {
  width: 48%;
  margin-right: 1%;
}

.battle-detail-content-box {
  width: 100%;
  padding: 6px;
  box-shadow: 0 0 5px;
}

.battle-detail-content:nth-child(2n) {
  margin-right: 0;
}

.battle-detail-content-title {
  width: 100%;
  font-weight: var(--font-bold);
  text-transform: uppercase;
}

.battle-detail-content-row {
  display: flex;
  justify-content: space-between;
}

.battle-detail-content-info {
  width: 100%;
  padding: 6px;
}

.dream-result-container .battle-detail-content {
  width: 95%;
  margin-right: 0;
}

.captain-icon {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  display: inline-block;
  line-height: 20px;
  background-color: var(--bg-bet);
  text-align: center;
  font-size: var(--font-small);
  color: #fff;
}

/*Scorecard*/

.scorecard {
  border-radius: 8px;
  background-color: var(--bg-table);
  font-size: var(--font-caption);
  width: 100%;
  margin-bottom: 10px;
  color: var(--text-table);
  font-size: 14px;
}
.scorecard p {
  margin-bottom: 0;
}
.scorecard .team-1:last-child {
  margin-top: 10px;
}
.scorecard-header {
  border-radius: 8px 8px 0 0;
  height: 32px;
  background-color: var(--bg-sidebar);
  font-size: var(--font-small);
  padding: 5px 10px;
}

.scorecard-row {
  padding: 5px 10px;
  border-bottom: 1px solid var(--bg-table-header);
}

.scorecard-row:last-child {
  border-bottom: 0;
}

.ball-runs {
  background: #0088cc;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  display: inline-block;
  line-height: 30px;
  text-align: center;
  color: #fff;
  font-weight: bold;
  margin-left: 2px;
}
.detail-page-container .scorecard .ball-by-ball {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.ball-runs.four {
  background-color: #087f23;
}

.ball-runs.six {
  background-color: #883997;
}

.ball-runs.wicket {
  background-color: #ff0000;
}

.score-top-row {
  display: flex;
  flex-wrap: wrap;
}

.score-team {
  width: 65%;
}

.score-rr {
  width: 35%;
  text-align: right;
}

.score-message {
  width: 100%;
}

.rules-icon {
  height: 70px;
  line-height: 70px;
}

.rules-icon a {
  color: #fff;
  text-decoration: underline !important;
  font-weight: bold;
}

/*Main Rules*/

.main-rules {
  margin-left: 10px;
}

.main-rules a {
  color: var(--text-fancy);
  text-decoration: underline;
}

.main-rules-container .menu-box li a {
  border-bottom: 0;
}

.main-rules-container .menu-box li a ~ ul > li {
  padding-left: 10px;
}

.main-rules-container .menu-box li a ~ ul ul li {
  padding-left: 50px;
  background-color: var(--bg-table-header);
  padding-top: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--bg-table);
  cursor: default;
  margin-bottom: 4px;
  border-radius: 4px;
  margin-top: 4px;
}

.main-rules-container .menu-box li ul > li > a,
.main-rules-container .menu-box li ul > li > a:hover,
.main-rules-container .menu-box li ul > li > a:focus,
.main-rules-container .menu-box li ul > li > a:active {
  background: transparent;
}

.main-rules-container .navbar-nav .dropdown-menu.show li .dropdown-toggle {
  position: relative;
  background: none;
}

.main-rules-container .navbar-nav li.show .dropdown-toggle:before {
  position: absolute;
  content: "\f056";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  left: 5px;
}

.main-rules-container .navbar-nav .dropdown-toggle:before {
  position: absolute;
  content: "\f055";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  left: 5px;
}

.main-rules-container .navbar-nav .dropdown-toggle span {
  padding-left: 10px;
}

.main-rules-container .card {
  background: transparent;
  border: 0;
  margin-bottom: 0;
}

.main-rules-container .card-header {
  border: 0;
  border-radius: 0;
  background-color: transparent;
  padding: 4px;
}

.main-rules-container .card-header a {
  color: var(--text-table);
  position: relative;
  color: var(--text-black);
  padding-left: 20px;
}

.main-rules-container .card-header a::before {
  position: absolute;
  content: "\f056";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  left: 0;
}

.main-rules-container .card-header a.collapsed::before {
  position: absolute;
  content: "\f055";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  left: 0;
}

.main-rules-container .card-body {
  padding: 6px;
}

.main-rules-container .rule-text {
  background-color: #ddd;
  color: var(--text-black);
  padding: 5px;
  margin-left: 20px;
  margin-bottom: 5px;
}

.main-rules-container .menu-box {
  float: left;
  width: 100%;
}

.casino-rules {
  text-align: center;
}

.casino-rules img {
  max-height: calc(100vh - 126px);
  width: auto;
}

.rules-language-container {
  text-align: right;
}

.rules-language-container {
  color: var(--text-highlight);
}

.rules-language-container .dropdown-menu.show {
  transform: unset !important;
  top: 100% !important;
  right: 0 !important;
}

.rules-language-container .dropdown-toggle img {
  height: 20px;
}

.rules-language-container .dropdown-toggle {
  cursor: pointer;
  color: var(--text-black);
}

.rules-language-container .dropdown-toggle::after {
  display: none;
}

.rules-language {
  background-color: var(--bg-table-header);
  padding: 6px;
  position: absolute;
  width: 200px;
  right: 0 !important;
  left: unset !important;
  top: 55px;
  text-align: left;
  color: var(--text-highlight);
  border: 0;
}

.rules-language > div {
  margin-bottom: 10px;
  cursor: pointer;
}

.rules-language > div:last-child {
  margin-bottom: 0;
}

.rules-language img {
  height: 20px;
}

.modal-footer {
  justify-content: space-between;
  padding: 8px;
}

/*Creat Account*/

.previlage-box {
  display: flex;
  flex-wrap: wrap;
  background-color: #dfdddd;
  padding: 10px;
}

.previlages h4 {
  width: 100%;
}

.previlage-item {
  min-width: 180px;
  margin-right: 10px;
  margin-bottom: 10px;
}

.previlage-master {
  text-align: right;
}

.previlage-master .form-group {
  display: inline-block;
}

.previlage-master .form-group input {
  width: auto;
  display: inline-block;
}

.create-account-container table {
  width: 100%;
}

.create-account-container td,
.create-account-container th {
  white-space: nowrap;
  height: 40px;
}

.create-account-container td .btn {
  padding: 4px 10px;
}

.create-account-container .fixed-col-1 {
  position: absolute;
  left: 0;
  width: 150px;
}

.create-account-container .fixed-col-2 {
  position: absolute;
  left: 150px;
  width: 150px;
}

.create-account-container .fixed-col-3 {
  position: absolute;
  left: 300px;
  width: 150px;
}

.create-account-container .outer {
  position: relative;
}

.create-account-container .inner {
  overflow-x: scroll;
  overflow-y: visible;
  margin-left: 450px;
}

/*Poker 6Player*/

.poker6player .teen1dayleft,
.poker6player .teen1dayright {
  width: 100%;
}

.poker6player .teen1dayright {
  margin-top: 20px;
}

.poker6player .teen1daycenter {
  display: none;
}

.poker-result-board {
  background: var(--bg-body);
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  color: var(--text-white);
}

.poker-result-board span {
  font-weight: bold;
  padding: 2px 10px;
  background-color: var(--bg-success);
  color: var(--text-black);
}

.poker6player h4 {
  color: var(--text-yellow);
  font-size: var(--font-body);
  font-weight: bold;
}

.poker6player .poker6box {
  background-color: var(--bg-tabs);
  border-radius: 4px;
  padding: 4px;
  width: 100%;
  color: var(--text-highlight);
  cursor: pointer;
  height: 52px;
}

.poker6player .poker6box .player-card {
  position: relative;
  z-index: 1;
}

.poker6player .poker6box .player-card img {
  z-index: 10;
  width: 24px;
}

.poker6player .poker6box .casino-nation-name {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poker6player .casino-tabs {
  height: 36px;
  background-color: var(--bg-table-header);
  margin-bottom: 10px;
  justify-content: flex-start;
  border-radius: 0;
}

.poker6player .casino-tabs .nav-tabs {
  margin: 0;
}

.poker6player .poker6box {
  background-color: #cfcfcf;
  border-radius: 4px;
  padding: 4px;
  width: 100%;
  color: #333;
  cursor: pointer;
}

.poker6player .poker6box .casino-nation-name {
  width: 100%;
}

.poker6player .poker6box .casino-nation-name > div {
  line-height: 1;
}

.player-card {
  width: auto;
  text-align: center;
  display: inline-block;
  margin-left: 5px;
}

.player-card span {
  display: inline-block;
  width: 18px;
}

.player-card img {
  width: 35px;
}

.poker6player .poker6val {
  width: 100%;
  position: relative;
}

.poker6player .casino-video-cards span img {
  width: 27px;
}

.poker6player .casino-video-cards {
  height: 50px;
}

.casino-row-container {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
}

.casino-col-container {
  width: 32.66%;
  margin-bottom: 10px;
  margin-right: 1%;
}

.poker6player .casino-col-container .w-100 {
  height: 22px;
}

.poker6player .casino-col-container:nth-child(3n) {
  margin-right: 0;
}

.casino-tabs {
  height: 50px;
  background-color: var(--bg-tabs);
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 0 0 8px 8px;
}

.poker6player .casino-tabs {
  height: 36px;
  background-color: var(--bg-table-header);
  margin-bottom: 10px;
  justify-content: flex-start;
  border-radius: 0;
}

.casino-tabs .nav-tabs {
  border: 0;
  margin-left: 30px;
  margin-right: 30px;
  position: relative;
  flex-wrap: nowrap;
  overflow: hidden;
  scroll-behavior: smooth;
  white-space: nowrap;
}

.poker6player .casino-tabs .nav-tabs {
  margin: 0;
}

.casino-tabs .nav-tabs .nav-link {
  color: var(--text-highlight);
  padding-top: 0;
  padding-bottom: 4px;
  padding-left: 12px;
  padding-right: 12px;
  border: 0;
  text-align: center;
}

.casino-tabs .nav-tabs .nav-item .nav-link.active {
  color: var(--text-fancy);
  border-bottom: 3px solid var(--bg-warning);
  background-color: transparent;
}

.poker6result .casino-open-result-item {
  width: 16.66%;
}

.teenpatti2 .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
  font-size: 14px;
}

.teenpatti2 .casino-bl-box {
  width: 50%;
}

.teenpatti2 .casino-card-item {
  min-width: 75px;
}

.teenpatti2 .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 40px;
}

.teenpatti2 .tee2suit .casino-bl-box {
  width: 100%;
}

.teenpatti2 .tee2suit .casino-bl-box-item {
  width: calc(25% - 3px);
  height: 54px;
  position: relative;
}

.teenpatti2 .tee2suit .casino-bl-box-item .casino-book {
  position: absolute;
  bottom: -22px;
}

.teenpatti2 .casino-card-img img {
  margin-left: 0;
}

.teenpatti2 .tee2suit .casino-bl-box-item span {
  margin-top: 3px;
  position: relative;
}

.teenpatti2 .tee2suit .tee2suitheader .casino-bl-box-item,
.teenpatti2 .teen2eo .tee2eoheader .casino-bl-box-item {
  height: 32px;
  position: relative;
}

.teenpatti2 .teen2uo .casino-bl-box-item {
  width: 100%;
  height: 32px;
}

.teenpatti2 .teen2uo {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
}

.teenpatti2 .teen2uo .casino-nation-name {
  width: 35%;
}

.teenpatti2 .teen2uo .casino-bl-box {
  width: calc(15% - 8px);
  margin-right: 16px;
}

.teenpatti2 .teen2uo .casino-bl-box:last-child {
  margin-right: 0;
}

.teenpatti2 .teen2uo .teen1dayleft,
.teenpatti2 .teen2uo .teen1dayright {
  margin-top: 10px;
}

.teenpatti2 .teen2eo .casino-bl-box {
  width: 100%;
}

.teenpatti2 .teen2eo .casino-bl-box-item {
  position: relative;
}

.teenpatti2 .teen2eo .casino-bl-box-item .casino-book {
  position: absolute;
  bottom: -20px;
}

.teenpatti2 .teen2cards .casino-card-item .card-image img {
  height: auto;
}

.teenpattitest .casino-video-cards-container > div > div {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.teenpattitest .casino-video-cards-container > div {
  flex-wrap: wrap;
}

.teenpattitest .casino-video-cards span img {
  width: 37px;
}

.teenpattitest .casino-video-cards {
  width: 160px;
}

.teenpattitest .casino-video-cards {
  height: 255px;
}

.teentestother {
  width: 100%;
  margin-top: 15px;
}

.teenpattitest .teentestother .casino-nation-name {
  width: 22%;
}

.teenpattitest .casino-nation-name {
  background-color: #ddd;
  padding-right: 10px;
  position: relative;
}

.teenpattitest .teentestother .casino-bl-box {
  width: 13%;
}

.teenpattitest .teentestother .casino-bl-box .casino-book {
  position: absolute;
  bottom: -20px;
}

.teenpattitest .teentestother .casino-bl-box-item {
  width: calc(100% - 4px);
  height: 40px;
  position: relative;
}

.dt1day .casino-video-cards,
.dt20 .casino-video-cards {
  width: 135px;
  height: 80px;
}

.dt1dayfancy {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.dt1day .dragonfancy {
  width: 40%;
  padding: 6px;
  padding-bottom: 6px;
  padding-bottom: 0;
  border: 2px solid var(--text-red);
  background-color: #fc42422e;
}

.dt1day .dt1dayfancy .casino-nation-name {
  background-color: transparent;
  width: 50%;
  padding-right: 10px;
  position: relative;
}

.dt1day .dt1dayfancy .casino-nation-name .icon-range {
  left: 0;
  right: unset;
}

.dt1day .dt1dayfancy .casino-bl-box {
  width: 50%;
  margin-right: 0;
}

.dt1day .dt1dayfancy .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 40px;
}

.dt1day .casino-book {
  position: absolute;
  bottom: -20px;
}

.dt1day .casino-min-max {
  margin-top: 20px;
}

.dt1day .pairfancy {
  width: 18%;
  padding: 6px;
  padding-bottom: 6px;
  padding-bottom: 0;
  background-color: #ddd;
}

.dt1day .dt1dayfancy .pairfancy .casino-bl-box-item {
  width: calc(100% - 2px);
}

.dt1day .tigerfancy {
  width: 40%;
  padding: 6px;
  padding-bottom: 6px;
  padding-bottom: 0;
  border: 2px solid var(--text-fancy);
  background-color: #fdcf132e;
}

.dt1day .casino-bl-box {
  width: calc(25% - 3px);
  margin-right: 4px;
}

.dt1day .casino-bl-box:last-child {
  margin-right: 0;
}

.dt1day .casino-bl-box-item {
  width: 100%;
  height: 50px;
}

.dt1day .casino-box-row.casino-title {
  background-color: #ddd;
  padding: 7px;
  margin-bottom: 5px;
}

.text-playera {
  color: var(--text-red);
}

.text-playerb {
  color: var(--text-yellow);
  font-weight: bold;
}

.dt20 .casino-detail {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.dt20 .dtobx-top {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  position: relative;
}

.dt20 .dragon-box {
  width: 40%;
  padding: 6px;
  padding-right: 6px;
  border: 2px solid var(--text-red);
  background-color: #fc42422e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  padding-right: 60px;
  position: relative;
}

.dt20 .tiebox {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  left: 40%;
  transform: translateX(-50%);
  padding: 6px;
  display: flex;
  align-items: center;
  background-color: var(--bg-success);
  color: var(--text-white);
  flex-direction: column;
  justify-content: center;
  z-index: 10;
}

.dt20 .tiger-box {
  width: 40%;
  padding: 6px;
  padding-left: 6px;
  border: 2px solid var(--text-fancy);
  background-color: #fdcf132e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  padding-left: 60px;
  position: relative;
}

.dt20 .pair-box {
  width: 18%;
  margin-left: 2%;
  background-color: #434343;
  padding: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  flex-wrap: wrap;
  position: relative;
  color: #fff;
}

.dt20 .pair-box .casino-book {
  position: absolute;
  bottom: -20px;
  right: 0;
}

.dt20 .casino-bl-box {
  width: calc(25% - 3px);
  margin-right: 4px;
}

.dt20 .dragon-box .casino-book {
  left: 0;
  position: absolute;
  bottom: -20px;
}

.dt20 .tiebox .casino-book {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.dt20 .tiger-box .casino-book {
  right: 0;
  position: absolute;
  bottom: -20px;
}

.dt20 .casino-bl-box-item .casino-book {
  position: absolute;
  bottom: -20px;
}

.dt20 .casino-bl-box:last-child {
  margin-right: 0;
}

.dt20 .casino-bl-box-item {
  width: 100%;
  height: 50px;
}

.dt20 .suspended.tiebox:after {
  border-radius: 50%;
}

.dt20 .casino-title {
  background-color: #ddd;
  padding: 7px;
  margin-bottom: 5px;
}

.dtl20 .casino-video-cards {
  height: 115px;
}

.dtl20 .casino-nation-name {
  width: 25%;
  position: relative;
  height: 45px;
  align-items: center;
  display: flex;
}

.dtl20 .casino-bl-box {
  width: calc(25% - 4px);
  margin-right: 6px;
}

.dtl20 .casino-bl-box:last-child {
  margin-right: 0;
  margin-bottom: 0;
}

.dtl20 .casino-bl-box-item {
  width: 100%;
  height: 45px;
  position: relative;
}

.dtl20 .casino-bl-box .casino-book {
  position: absolute;
  bottom: -20px;
}

.dtl20 .dtl20info {
  position: absolute;
  z-index: 1;
  width: 25%;
  text-align: right;
  padding-right: 5px;
}

.dtl20 .casino-box-row {
  margin-bottom: 20px;
}

.aaa .casino-video-cards {
  height: 88px;
  width: 80px;
}

.aaa .casino-nation-name {
  background-color: transparent;
  text-align: center;
}

.aaa .casino-nation-name,
.aaa .casino-bl-box,
.aaa .casino-book {
  width: 100%;
}

.aaa .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 40px;
}

.aaa .aaa-oe .casino-bl-box {
  width: 50%;
}

.aaa .aaa-oe .casino-bl-box-item {
  width: calc(100% - 4px);
  height: 56px;
}

.aaa .bc-fancy .casino-bl-box-item {
  width: calc(100% - 2px);
}

.casino-remark {
  display: flex;
  display: -webkit-flex;
  align-items: center;
  background-color: #d3d3d36b;
  color: #333;
  border-radius: 16px;
  height: 32px;
  width: 100%;
  background-color: transparent;
  margin-top: 0 !important;
}

.casino-remark .remark-icon {
  width: 50px;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  background-color: #434343;
  display: none;
}

.casino-remark .remark-icon img {
  height: 20px;
}

.casino-remark marquee {
  width: 100%;
  color: #17a2b8;
}

/*Casino War*/

.casino-war .casino-video-cards {
  height: 85px;
  width: 80px;
  top: 0;
  transform: unset;
}

.casino-war-container {
  width: 100%;
}

.casino-war .casino-war-container .casino-war-title .casino-bl-box-item {
  height: 20px;
}

.casino-war .casino-war-container .casino-nation-name {
  width: 40%;
  position: relative;
  background-color: transparent;
}

.casino-war .casino-war-container .casino-bl-box {
  width: 10%;
}
.casino-war .casino-card-img img {
  /* width: 18px; */
}
.casino-war .casino-box-row {
  padding: 0;
  border-bottom: 1px solid #fff;
}
.casino-war .casino-war-container .casino-bl-box {
  border-left: 1px solid #fff;
  border-right: 1px solid #fff;
}
.casino-war .casino-war-container .casino-bl-box-item {
  width: 100%;
  height: 40px;
}

.casino-war.casino-table .back {
  background-color: var(--back);
  border: 0;
}
.casino-war.casino-table .lay {
  background-color: var(--lay);
  border: 0;
}
.war-result .casino-open-result-item {
  width: 14.2%;
}

.war-result .casino-open-result-item .casino-result-cards-item img {
  height: auto;
  width: 30px;
}

.war-result .casino-open-result-item .casino-result-cards-item .winner-icon {
  height: auto;
  width: 50px;
}

/*Worli Matka*/

.worli .casino-video-cards {
  height: 80px;
  top: 0;
  transform: unset;
}

.worli .casino-tabs {
  height: auto;
  padding: 6px;
  border-radius: 0;
}

.worli .casino-tabs .nav-tabs {
  flex-wrap: wrap;
  margin: 0;
}

.worlibox {
  display: flex;
  margin-top: 10px;
  flex-wrap: wrap;
}

.worli-left {
  width: 58%;
  margin-right: 2%;
  display: flex;
  flex-wrap: wrap;
}

.worli-right {
  width: 40%;
  display: flex;
  flex-wrap: wrap;
}

.worli-full {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.worli-box-title {
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
}

.worli-box-row {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.worli-left .worli-odd-box,
.worli-full .worli-odd-box {
  width: calc(20% - 2px);
  margin-right: 2px;
}

.worli-left .worli-odd-box:nth-child(5n),
.worli-full .worli-odd-box:nth-child(5n) {
  margin-right: 0;
}

.worli-right .worli-odd-box {
  width: calc(50% - 2px);
  margin-right: 2px;
}

.worli-right .worli-odd-box:nth-child(2n) {
  margin-right: 0;
}

.worli-odd-box {
  text-align: center;
  font-family: "worli";
  height: 70px;
  color: #333;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
}

.worli-odd-box.back.selected {
  background-color: var(--bg-success);
}

.worli-odd-box .worli-odd {
  font-size: 40px;
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
}

.worli-odd-box .worli-odd ~ span {
  font-family: "Noto Sans";
}

.sp .worli-right .worli-odd-box,
.dp .worli-right .worli-odd-box,
.card56 .worli-right .worli-odd-box,
.card64 .worli-right .worli-odd-box,
.colordp .worli-right .worli-odd-box {
  height: 142px;
  width: 100%;
}

.abr .worli-left .worli-odd-box {
  width: calc(33.33% - 2px);
}

.abr .worli-left .worli-odd-box:nth-child(3n) {
  margin-right: 0;
}

.abr .worli-right .worli-odd-box {
  width: 100%;
}

.abr .worli-right .worli-odd-box:last-child {
  margin-right: 0;
}

.trio .worli-full .worli-odd-box {
  width: 100%;
}

.worli-cards-container {
  display: flex;
  flex-wrap: wrap;
}

.worli-cards-block {
  width: calc(10% - 9px);
  text-align: center;
  background-color: var(--bg-table-header);
  padding: 10px;
  font-size: 20px;
  color: var(--text-white);
  border-radius: 8px;
  box-shadow: 0 0 2px;
  margin-right: 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.worli-cards-block span {
  margin-right: 5px;
}

.worli-cards-block:nth-child(10n) {
  margin-right: 0;
}

/*Casino Meter*/

.cmeter .teen1dayleft,
.cmeter .teen1dayright {
  background-color: #ccc;
  padding: 10px;
  cursor: pointer;
  border-radius: 0;
  width: 100%;
  margin-bottom: 10px;
}

.cmeter .casino-card-item {
  min-width: 45px !important;
}

.cmeter .casino-card-item .card-image img {
  height: auto;
  width: 40px;
}

.cmeter-card-box {
  background-color: var(--bg-tabs);
  padding: 0 10px 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: column;
  border-radius: 16px;
}

.cmeter-card-low,
.cmeter-card-high {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.cmeter-card-box img {
  width: 30px;
  margin-right: 5px;
}

/*3 Card Judgement*/

.threecardj .casino-video-cards {
  height: 85px;
  top: 50px;
  transform: unset;
  right: 5px;
  left: unset;
  width: auto;
}

.threecardj .casino-card-item {
  min-width: 40px !important;
}

.threecardj-cards .casino-cards {
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: center;
  padding-bottom: 5px;
}

.threecardj-bl-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  height: auto;
  cursor: pointer;
  margin-bottom: 10px;
}

.casino-table.threecardj .back {
  border: 2px solid var(--back);
}

.casino-table.threecardj .lay {
  border: 2px solid var(--lay);
}

.threecardj-cards {
  width: 90%;
  height: 100%;
}

.threecardj-cards.suspended:after {
  border-radius: 0;
}

.threecardj-title {
  width: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
}

.threecardj .suspended::before {
  background-size: 35px 35px;
}

.ab-cards {
  width: 90%;
}

.threecardj-odds {
  padding: 4px;
  width: 100%;
  font-size: 18px;
}

/*32 Cards*/

.cards32a .casino-video-cards-container > div,
.cards32b .casino-video-cards-container > div {
  flex-wrap: wrap;
}

.cards32a .casino-video-cards span img,
.cards32b .casino-video-cards span img {
  width: 28px;
}

.cards32b .casino-nation-name {
  font-size: 14px;
}

.cards32a .casino-video-cards,
.cards32b .casino-video-cards {
  width: 200px;
}

.cards32a .casino-video-cards-container > div > div,
.cards32b .casino-video-cards-container > div > div {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.cards32a .casino-video-cards,
.cards32b .casino-video-cards {
  height: auto;
  top: 0;
  transform: unset;
}
.cards32a .teen1daycenter,
.cards32b .teen1daycenter {
  display: none;
}
.cards32a .casino-box-row,
.cards32b .casino-box-row {
  background-color: #ddd;
  border-bottom: 1px solid #fff;
  padding: 0;
}
.cards32a .casino-nation-name,
.cards32b .casino-nation-name {
  width: 33.3%;
  padding-right: 10px;
  position: relative;
}
.casino-table.cards32a .back,
.casino-table.cards32b .back {
  background-color: var(--back);
}
.casino-table.cards32a .lay,
.casino-table.cards32b .lay {
  background-color: var(--lay);
  border: 0;
}
.cards32a .casino-bl-box,
.cards32b .casino-bl-box {
  width: 66.6%;
}

.cards32b .teen1dayright.right1 .casino-bl-box .casino-bl-box-item {
  width: calc(100% - 2px);
}

.cards32a .casino-bl-box-item,
.cards32b .casino-bl-box-item {
  width: 50%;
  height: 48px;
  margin: 0;
  border-left: 1px solid #fff;
  border-right: 1px solid #fff;
}

.cards32b .cards32bextra .casino-bl-box {
  width: 100%;
}

.cards32b .cards32bextra .casino-bl-box .casino-bl-box-item {
  width: calc(10% - 4px);
  margin-bottom: 20px;
  height: 80px;
  position: relative;
}

.cards32b .cards32bextra .casino-bl-box .casino-bl-box-item.back {
  border: 2px solid var(--back);
}

.cards32b .cards32bextra .casino-bl-box .casino-bl-box-item.back:hover {
  border: 3px solid var(--back);
}

.cards32b .cards32bextra .casino-bl-box .casino-bl-box-item:nth-child(10n) {
  margin-right: 0;
}

.cards32b .cards32bextra .casino-bl-box .casino-bl-box-item .casino-box-odd {
  font-family: "Anonymous Pro";
  font-size: 60px;
  height: 50px;
  line-height: 50px;
}

.cards32b .casino-bl-box-item .casino-book {
  position: absolute;
  bottom: -20px;
}

.cards32b .teen1dayright .casino-bl-box-item .casino-book {
  position: absolute;
  bottom: -17px;
}

.cards32b .casino-box-row {
  margin-bottom: 20px;
}

.card32result .casino-result-cards-item img {
  width: 45px;
}

.card32result .casino-result-cards {
  justify-content: flex-start;
}

.card32result .casino-result-cards h4 {
  /* min-width: 120px; */
  font-size: 1.5rem;
}

.card32result .casino-result-cards h4 .badge {
  height: 20px;
  width: 20px;
  line-height: 20px;
  text-align: center;
  padding: 0;
  vertical-align: top;
}

.card32result .casino-result-cards-item .winner-icon {
  height: auto;
  width: 50px;
}

/*Casino Queen*/

.casino-queen .casino-video-cards {
  height: 275px;
  width: 135px;
}

.casino-queen .casino-video-cards-container > div {
  flex-wrap: wrap;
}

.casino-queen .casino-video-cards-container > div > div {
  display: flex;
  flex-wrap: nowrap;
}

.casino-queen .casino-video-cards-container .dealer-name {
  height: 16px;
  justify-content: flex-start;
}

.casino-queen .casino-video-cards span img {
  width: 30px;
}

.casino-queen .casino-nation-name,
.casino-queen .casino-bl-box {
  width: 100%;
}

.casino-queen .casino-nation-name {
  background-color: transparent;
  text-align: center;
}

.casino-queen .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 48px;
}

/*2020 Cricket Match*/

.cricket20 .casino-video-cards {
  width: 80px;
  height: 110px;
}

.cricket20 .score-box {
  position: relative;
  height: 64px;
  margin-top: 30px;
  padding: 0;
  background-image: url("../img/balls/score-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 45px;
}

.cricket20 .casino-remark {
  margin-top: 62px;
  margin-bottom: 45px;
}

.cricket20 .ball-image {
  width: 50px;
  position: absolute;
  z-index: 1000;
  top: 40px;
  left: 10px;
}

.cricket20 .score-img {
  width: 70%;
}

.cricket20 .team-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  color: var(--text-white);
}

.cricket20 .blbox {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 50%;
  width: 150px;
  height: 40px;
  transform: translateX(-50%);
  bottom: -15px;
}

.cricket20.casino-table .casino-detail .blbox .back,
.cricket20.casino-table .casino-detail .blbox .back:hover {
  border: 0;
  background-color: var(--back);
  cursor: pointer;
}

.casino-table.cricket20 .casino-detail .blbox .lay,
.casino-table.cricket20 .casino-detail .blbox .lay:hover {
  border: 0;
  background-color: var(--lay);
  cursor: pointer;
}

.cricket20 .blbox div {
  width: 50%;
  text-align: center;
  color: var(--text-white);
  height: 40px;
  line-height: 40px;
  color: var(--text-black);
}

.cricket20 .ball-icon {
  position: absolute;
  left: 50%;
  top: -25px;
  height: 50px;
  transform: translateX(-50%);
}

.cricket20 .ball-icon img {
  height: 60px;
}

.cricket20 .min-max {
  position: absolute;
  bottom: 0;
  right: 5px;
}

.cricket20 .backbox {
  position: absolute;
  top: 0;
  left: 70%;
  width: 15%;
  height: 50px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-weight: bold;
  font-size: 18px;
}

.cricket20 .laybox {
  position: absolute;
  top: 0;
  left: 85%;
  width: 15%;
  height: 50px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 18px;
  font-weight: bold;
}

.cricket20 .c20minmax {
  position: absolute;
  bottom: -20px;
  right: 15px;
  min-width: 200px;
}

.c20book {
  position: absolute;
  left: 15px;
  bottom: -20px;
  font-size: 18px;
}

.cricket20 .suspended::after {
  border-radius: 0;
}

.cricket20 .casino-video-last-results img {
  width: 30px;
}

/*Andar Bahar*/

.andar-bahar .casino-video-cards {
  width: 230px;
  height: 120px;
}

.andar-bahar .ab-slider {
  width: 85%;
  margin: 0 auto 10px;
}

.andar-bahar .owl-carousel .owl-nav button.owl-next,
.andar-bahar .owl-carousel .owl-nav button.owl-prev {
  position: absolute;
  font-size: 30px;
  height: 100%;
  top: 0;
  margin: 0;
  width: 20px;
}

.andar-bahar .casino-video .owl-carousel .owl-nav button.owl-next,
.andar-bahar .casino-detail .owl-carousel .owl-nav button.owl-prev {
  left: -20px;
}

.andar-bahar .casino-video .owl-carousel .owl-nav button.owl-prev,
.andar-bahar .casino-detail .owl-carousel .owl-nav button.owl-next {
  right: -20px;
}

.owl-theme .owl-nav [class*="owl-"]:hover {
  background-color: transparent;
  color: inherit;
}

.andar-bahar .owl-theme .owl-nav {
  margin: 0;
}

.andar-bahar .casino-video-cards-container > div {
  flex-wrap: wrap;
}

.andar-bahar .casino-video-cards span img {
  height: auto;
  width: 35px;
}

.ab-bg {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 10px;
}

.andar-cards-box {
  width: 49%;
  display: flex;
  padding: 10px;
  justify-content: center;
  flex-wrap: wrap;
  border: 3px solid #fc4242;
  background: #fc424214;
}

.bahar-cards-box {
  width: 49%;
  padding: 10px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  border: 3px solid #fdcf13;
  background: #fdcf1314;
}

.andar-cards-box h5,
.bahar-cards-box h5 {
  position: relative;
  font-size: 20px;
}

.andar-cards-box h5 .casino-min-max,
.bahar-cards-box h5 .casino-min-max {
  position: absolute;
  right: 0;
  top: 0;
  color: #333;
}

.andar-cards-box > .casino-card-item,
.bahar-cards-box > .casino-card-item {
  width: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 75px;
  height: auto;
  margin-bottom: 5px;
}

.andar-box-container,
.bahar-box-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.andar-box-container.suspended:after,
.bahar-box-container.suspended:after {
  border-radius: 0;
}

.andar-box-container {
  border: 2px solid #ffa07a;
}

.bahar-box-container {
  border: 2px solid #90ee90;
}

.andar-bahar .casino-detail .owl-carousel .owl-stage {
  margin: 0 auto;
}

.ab-title {
  width: 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--bg-table-header);
  font-family: ab;
  font-size: 40px;
  line-height: 34px;
}

.ab-cards {
  width: 90%;
}

.andar-bahar2 .teen20left,
.andar-bahar2 .teen20right {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.andar-bahar2 .casino-detail .casino-video-cards {
  height: auto;
  position: relative;
  top: 0;
  width: 100%;
  background-color: var(--bg-table-header);
}

.andar-bahar2 .ab2-title {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5%;
  margin-right: 2%;
  color: var(--text-black);
  height: 60px;
}

.andar-bahar2 .sa-sb-box {
  background-color: #434343;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--text-fancy);
  width: 20%;
  margin-right: 2%;
  color: var(--text-white);
  height: 60px;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.andar-bahar2 .sa-sb-box:hover,
.andar-bahar2 .sa-sb-box:focus {
  border: 2px solid var(--text-fancy);
}

.andar-bahar2 .ab2-bet {
  background-color: #434343;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--text-fancy);
  width: 30%;
  margin-right: 2%;
  color: var(--text-white);
  height: 60px;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.andar-bahar2 .ab2-bet:hover,
.andar-bahar2 .ab2-bet:focus {
  border: 2px solid var(--text-fancy);
}

.ab2oddeven .casino-box-row,
.ab2cards .casino-box-row {
  width: 100%;
}

.ab2oddeven .casino-bl-box {
  width: 50%;
}

.ab2cards .casino-bl-box {
  width: 25%;
}

.ab2oddeven .casino-bl-box-item {
  width: calc(100% - 8px);
  height: 40px;
}

.ab2cards .casino-bl-box-item {
  width: calc(100% - 4px);
  height: 40px;
}

.ab-book {
  position: absolute;
  bottom: -24px;
  font-size: 18px;
}

.ab-result.owl-carousel .owl-item img {
  width: 35px;
}

.ab-result .owl-stage {
  margin: 0 auto;
}

.andar-bahar2 .casino-video-cards span img {
  width: 30px;
}

.andar-bahar2 .ab-slider,
.ab2-result .ab-slider {
  max-width: 85%;
  position: relative;
  margin: 0 auto;
}

.andar-bahar2 .casino-video-cards {
  width: 300px;
  height: 100px;
}

.andar-bahar2 .owl-carousel .owl-nav button.owl-next,
.andar-bahar2 .owl-carousel .owl-nav button.owl-prev {
  position: absolute;
  top: 0;
  height: 100%;
  width: 30px;
  font-size: 30px;
}

.andar-bahar2 .owl-theme .owl-nav [class*="owl-"]:hover {
  background-color: transparent;
}

.andar-bahar2 .owl-theme .owl-nav {
  margin-top: 0;
}

.andar-bahar2 .owl-carousel .owl-nav button.owl-next {
  left: -30px;
}

.andar-bahar2 .owl-carousel .owl-nav button.owl-prev {
  right: -30px;
}

.owl-theme .owl-nav {
  margin-bottom: 0;
}

.ab2-result .owl-carousel .owl-nav button.owl-next,
.ab2-result .owl-carousel .owl-nav button.owl-prev {
  position: absolute;
  top: 0;
  width: 30px;
  font-size: 30px;
}

.ab2-result .owl-carousel .owl-nav button.owl-next {
  right: -30px;
}

.ab2-result .owl-carousel .owl-nav button.owl-prev {
  left: -30px;
}

.ab2-result .custom-slider {
  background-color: transparent;
  padding: 0;
  padding: 0 35px;
  margin-left: 5px;
  min-height: auto;
}

.ab2-result .casino-result-cards-item {
  margin-right: 3px;
  display: block;
}

.ab2-result .casino-result-cards-item img {
  width: 35px !important;
}

.ab2-result .abj-title,
.ab3-result .abj-title {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  font-size: 18px;
}

.ab2-result .abj-common-card,
.ab3-result .abj-common-card {
  display: flex;
  align-items: center;
}

/*Race*/

.race20 .casino-video-cards {
  width: 320px;
  height: auto;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 0;
}

.race20 .casino-video-cards span img {
  width: 35px;
}

.race20 .casino-video-cards-container > div {
  align-items: center;
}

.race20 .total-points {
  display: flex;
  margin-top: 10px;
}

.race20 .total-points > div {
  padding: 5px;
  margin-right: 5px;
  border: 1px solid var(--text-fancy);
  color: var(--text-black);
}

.race20 .total-points > div > div {
  line-height: 16px;
  color: #fff;
}

.race20 .casino-nation-name {
  background-color: transparent;
  text-align: center;
}

.race20 .casino-bl-box,
.race20 .casino-nation-name {
  width: 100%;
  position: relative;
}

.race20 .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 46px;
  position: relative;
}

.race20 .casino-nation-name img {
  width: 25px;
}

.race20 .casino-yn {
  display: flex;
  width: 100%;
}

.race20 .casino-yn > div {
  width: 50% !important;
  margin-right: 1%;
  text-align: center;
  position: relative;
}

.race20 .casino-yn .yn-header {
  height: auto;
  padding: 5px;
}

.race20 .casino-yn .casino-odds-box-bhav {
  flex-direction: row;
}

.race20 .win-with .casino-bl-box-item {
  width: 100%;
}

.race20 .casino-video-last-results img {
  height: 26px;
}

.race-result-box .casino-result-cards-item {
  position: absolute;
  right: -100px;
}

.race-result-box .casino-result-cards-item img {
  width: 40px;
}

.race-result-box {
  width: 275px;
  position: relative;
  z-index: 10;
}

.race-result-box > div {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.race-result-box > div span {
  margin-right: 4px;
}

.race-result-box .result-image.k-image {
  position: absolute;
  right: -45px;
}

.race-result-box .video-winner-text {
  color: #000;
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  height: calc(100% - 5px);
  font-size: 22px;
  width: 42px;
  height: 100%;
  border: 1px solid yellow;
  padding: 2px 12px;
  z-index: -1;
  background-color: #efeded;
  width: 46px;
  font-weight: bold;
}

.race-result-box img {
  width: 50px;
}

.rf-minheight {
  min-height: 20px;
}

.race20 .icon-range {
  left: 50%;
  transform: translateX(-50%);
  right: unset;
}

/*Five Cricket*/

.five-cricket .casino-video {
  width: 100%;
  margin-top: 10px;
}

.five-cricket.casino-table {
  background-color: transparent;
}

.five-cricket .casino-video-cards {
  height: 100%;
  width: auto;
  top: 0;
  transform: unset;
}

.five-cricket .casino-video-cards span img {
  width: 30px;
}

.cricket-rule img {
  width: 25px;
}

.cricket-rule .card-body {
  background: transparent;
  color: #333;
}
.cricket-rule > .card-body {
  padding: 0;
}
.cricket-rule .card-body .card-header {
  background-color: transparent;
  color: #333;
}
.cricket-rule .row {
  align-items: center;
}

.cricket-rule {
  font-weight: bold;
  border: 1px solid #999;
  box-shadow: 0 8px 6px -6px #000;
  color: #000;
  border-radius: 0;
  margin-bottom: 5px;
  font-size: 14px !important;
}

.detail-page-container.five-cricket.super-over .market-2 {
  width: calc(100% - 6px);
  max-width: calc(100% - 6px);
  min-width: calc(100% - 6px);
}

.detail-page-container .cricket-rule .card-header {
  display: block;
}

/* .five-cricket .scorecard {
  width: 616px;
  border-radius: 8px;
  background-color: var(--bg-table);
  position: absolute;
  font-size: var(--font-caption);
  max-width: 95%;
} */

.five-cricket .scorecard-row {
  padding: 5px 10px;
  border-bottom: 1px solid var(--bg-table-header);
}

.five-cricket .scorecard-row:last-child {
  border-bottom: 0;
}

.five-cricket.casino-table .back {
  background-color: var(--back);
  border: 0;
}

.five-cricket.casino-table .lay {
  background-color: var(--lay);
  border: 0;
}

.five-video-baner {
  position: relative;
  top: 0;
  max-width: 100%;
  width: 100%;
  padding-bottom: 56.25%;
  background: #000;
}

.five-video-baner img {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  object-fit: cover;
  border: 0;
}

.five-cricket-nation {
  position: absolute;
  left: 10%;
  top: 17%;
  color: var(--text-black);
  font-size: var(--font-18);
}

.five-cricket-date {
  position: absolute;
  right: 10%;
  top: 17%;
  color: var(--text-black);
  font-size: var(--font-18);
}

/* .five-cricket .ball-runs {
  width: 20px;
  height: 20px;
  line-height: 20px;
} */

.detail-page-container.five-cricket .market-2,
.detail-page-container.five-cricket .market-6 {
  max-width: calc(50% - 6px);
}

.five-cricket-result .table {
  /* background-color: var(--bg-table);
  color: var(--text-table);
  font-size: 14px; */
}

.five-cricket-result .table thead {
  /* background-color: var(--bg-table-header); */
}

.five-cricket-result .table thead th {
  font-weight: bold;
  font-size: 16px;
  border-bottom: 0;
}

.five-cricket-result .table th,
.five-cricket-result .table td {
  /* border-top: 1px solid #666;
  font-size: 14px;
  min-width: 80px; */
  padding: 0.75rem;
}

.five-cricket-result h4 {
  background-color: var(--bg-secondary85);
  padding: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: bold;
}

.score-head {
  /* background-color: var(--bg-table-header);
  padding: 10px;
  color: var(--text-white); */
}

.animate-text {
  position: absolute;
  font-size: 22px;
  width: 100%;
  background-color: #343434;
  text-align: left;
  top: 0;
  padding: 15px;
  text-transform: uppercase;
}

.animate-text span {
  opacity: 0;
  color: var(--text-white);
  font-weight: bold;
  display: inline-block;
  transform: translate(-150px, -50px) rotate(-180deg) scale(3);
  animation: revolveScale 0.4s forwards;
}

.animate-text span:nth-of-type(2) {
  animation-delay: 0.04s;
}

.animate-text span:nth-of-type(3) {
  animation-delay: 0.08s;
}

.animate-text span:nth-of-type(4) {
  animation-delay: 0.12s;
}

.animate-text span:nth-of-type(5) {
  animation-delay: 0.16s;
}

.animate-text span:nth-of-type(6) {
  animation-delay: 0.2s;
}

.animate-text span:nth-of-type(7) {
  animation-delay: 0.24s;
}

.animate-text span:nth-of-type(8) {
  animation-delay: 0.28s;
}

.animate-text span:nth-of-type(9) {
  animation-delay: 0.32s;
}

.animate-text span:nth-of-type(10) {
  animation-delay: 0.36s;
}

.animate-text span:nth-of-type(11) {
  animation-delay: 0.4s;
}

.animate-text span:nth-of-type(12) {
  animation-delay: 0.44s;
}

.animate-text span:nth-of-type(13) {
  animation-delay: 0.48s;
}

.animate-text span:nth-of-type(14) {
  animation-delay: 0.52s;
}

.animate-text span:nth-of-type(15) {
  animation-delay: 0.56s;
}

.animate-text span:nth-of-type(16) {
  animation-delay: 0.6s;
}

.animate-text span:nth-of-type(17) {
  animation-delay: 0.64s;
}

.animate-text span:nth-of-type(18) {
  animation-delay: 0.68s;
}

.animate-text span:nth-of-type(19) {
  animation-delay: 0.72s;
}

.animate-text span:nth-of-type(20) {
  animation-delay: 0.76s;
}

.animate-text span:nth-of-type(21) {
  animation-delay: 0.8s;
}

.animate-text span:nth-of-type(22) {
  animation-delay: 0.84s;
}

.animate-text span:nth-of-type(23) {
  animation-delay: 0.88s;
}

.animate-text span:nth-of-type(24) {
  animation-delay: 0.92s;
}

.animate-text span:nth-of-type(25) {
  animation-delay: 0.96s;
}

.animate-text span:nth-of-type(26) {
  animation-delay: 1s;
}

@keyframes revolveScale {
  60% {
    transform: translate(20px, 20px) rotate(30deg) scale(0.3);
  }
  100% {
    transform: translate(0) rotate(0) scale(1);
    opacity: 1;
  }
}

.book-green {
  color: var(--book-green) !important;
  z-index: 10;
  font-weight: bold;
}

.book-red {
  color: var(--book-red) !important;
  z-index: 10;
  font-weight: bold;
}

.detail-page-container .market-6.ball-by-ball .bet-table-header .nation-name {
  width: calc(100% - 148px);
}
.detail-page-container .market-6.ball-by-ball .nation-name {
  width: calc(100% - 148px);
}

.cricket20ballpopup img {
  width: 100px;
}

.cricket20ballpopup {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -50px;
  margin-top: -50px;
  z-index: 10;
}

.cricket20ballpopup span {
  position: absolute;
  top: 50%;
  left: 40%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-weight: bold;
  text-transform: uppercase;
  font-family: timer;
  font-size: 32px;
}

.goal .cricket20ballpopup {
  margin-left: -135px;
  margin-top: -135px;
  z-index: 10;
}

.goalresult span {
  position: absolute;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
  top: unset;
  left: 58%;
  color: #000;
  font-weight: bold;
  bottom: -10px;
  font-size: 15px;
  width: 60%;
  height: 40px;
  display: flex;
  align-items: center;
  bottom: -10px;
  justify-content: center;
  font-family: "Roboto Condensed", sans-serif;
}

.goal .cricket20ballpopup span {
  top: unset;
  left: 58%;
  color: #000;
  bottom: -10px;
  font-size: 15px;
  width: 60%;
  height: 40px;
  display: flex;
  align-items: center;
  bottom: -10px;
  justify-content: center;
  font-family: "Roboto Condensed", sans-serif;
}

.goal .cricket20ballpopup img {
  height: 250px;
  width: auto;
}

.cricket20ballresult {
  position: relative;
  width: auto;
  left: unset;
  top: unset;
  margin: 0;
  display: inline-block;
}

.goalresult img {
  height: 250px;
  width: auto !important;
}

.detail-page-container .ball-by-ball {
  flex: none;
  max-width: 100% !important;
}

.ball-by-ball.detail-page-container .market-6 {
  min-width: calc(100% - 6px);
  width: 100%;
  margin: 0;
}
.goal.ball-by-ball.detail-page-container .market-6 {
  min-width: calc(50% - 6px);
}
/*Media Queries*/

/* @media only screen and (min-width: 1280px) and (max-width: 1599px) {
  .center-content {
    width: calc(100% - 362px);
  }
  .right-sidebar {
    width: 350px;
  }
  .scorecard {
    font-size: var(--font-small);
  }
  .casino-bl-box-item .casino-box-odd {
    font-size: var(--font-small);
  }
  .casino-bl-box-item span {
    font-size: var(--font-small);
  }
  .casino-book {
    font-size: 18px !important;
    line-height: 18px !important;
  }
  .casino-video-last-results {
    width: 65px;
    height: 185px;
  }
  .casino-video-last-results span,
  .casino-video-last-results a {
    width: 25px;
    height: 25px;
    line-height: 25px;
  }
  .casino-video-cards {
    width: 195px;
    height: 135px;
  }
  .race20 .casino-video-cards {
    top: 70%;
  }
  .casino-queen .casino-video-cards {
    height: 200px;
  }
  .casino-queen .casino-video-cards span img {
    width: 15px;
  }
  .base-timer {
    height: 70px;
    width: 70px;
  }
  .base-timer__label {
    height: 70px;
    width: 70px;
    font-size: 40px;
  }
  .base-timer__label > span {
    min-width: 15px;
  }
  .teenpattiopen .casino-detail .casino-box-header .casino-bl-box-item img {
    height: 25px;
  }
  .teenpattiopen .casino-video-cards {
    height: 95px;
  }
  .teenpattitest .teentestother .casino-bl-box-item {
    font-size: 13px;
  }
  .teenpatti2 .teen2uo .casino-nation-name {
    font-size: 12px;
  }
  .casino-video-cards span img {
    width: 42px;
  }
  .dt1day .casino-video-cards,
  .dt20 .casino-video-cards {
    width: 120px;
    height: 70px;
  }
  .dtl20 .casino-video-cards {
    height: 100px;
  }
  .dtl20 .casino-card-img img {
    width: 16px;
    margin-left: 0px;
  }
  .aaa .casino-nation-name,
  .aaa .casino-bl-box {
    font-size: 14px;
  }
  .teenpattiopen .casino-open-card-box img {
    width: 20px;
  }
  .worli .casino-video-cards {
    height: 70px;
  }
  .cmeter .casino-card-item .card-image img {
    width: 23px;
  }
  .threecardj .casino-video-cards {
    height: 70px;
  }
  .cricket20 .ball-icon img {
    height: 50px;
  }
  .cricket20 .blbox {
    width: 90px;
  }
  .cricket20 .casino-video-cards {
    width: 70px;
    height: 95px;
  }
} */

/*Custom CSS*/
#sidebar-menu ul li ul.sub-menu {
  padding: 0 10px;
}
#sidebar-menu > .sub-menu {
  margin-top: 15px;
}
#sidebar-menu ul li ul.sub-menu li ul.sub-menu li {
  padding: 0.4rem 0.5rem 0.4rem 1.5rem;
}
#sidebar-menu ul li ul.sub-menu li ul.sub-menu li a {
  padding: 0;
}
.user-book .mtree li {
  padding: 1px 0 1px 0px;
  position: relative;
}

.user-book .mtree li td:first-child {
  padding-left: 20px;
  border-left: 0;
}

.user-book .table td,
.user-book .table th {
  padding: 5px;
}

.user-book table {
  table-layout: fixed;
  margin-bottom: 0;
}

.max-bet span {
  display: inline !important;
}

.detail-page-container .market-1 .max-bet {
  float: none;
}

body[data-sidebar="dark"] #sidebar-menu ul li ul.sub-menu li a {
  white-space: normal;
}

.user-lock-nav li label {
  margin-bottom: 0;
  padding-left: 5px;
}

.user-lock-nav ul li {
  padding: 5px 10px;
}

.user-lock-nav {
  padding: 10px;
}

.user-lock-nav > li {
  margin-bottom: 5px;
  background: #e4e4e4;
  padding: 5px 10px;
}

.user-lock-container .fa-angle-down {
  font-size: 16px;
  color: #000;
}

.user-lock-nav .nav-item > .sub-menu {
  margin-left: 30px;
  background-color: #d0d0d0;
}

.user-lock-nav .nav-item > .sub-menu .sub-menu {
  margin-left: 35px;
  background-color: #bfbfbf;
}

.user-lock-nav .nav-item > .sub-menu .sub-menu .sub-menu {
  background-color: #c7c7c7;
  padding: 5px;
  border: 1px solid #b5b5b5;
}

.user-lock-nav .nav-item > .sub-menu .sub-menu li {
  padding: 2px 10px;
}

.user-lock-nav input[type="checkbox"]:disabled {
  background-color: red;
}

.custom-checkbox
  .custom-control-input:disabled:checked
  ~ .custom-control-label::before {
  background-color: rgb(181 181 181);
}

.user-lock-nav .custom-control {
  display: inline-block;
}

.user-lock-nav .arrow-icon {
  width: 25px;
  display: inline-block;
}

.site-searchbox {
  width: 300px;
  position: relative;
}

.multiselect__select:before {
  content: none;
}

.ipCheck {
  width: 0;
}

.pointer {
  cursor: pointer;
}

#accStmtTable tbody tr {
  cursor: pointer;
}

#accStmtTable tbody tr.nocursor {
  cursor: default;
}

#accStmtTable tbody tr:focus {
  outline: none;
}

.battle-result {
  width: 100%;
  overflow: auto;
}

.battle-result-container {
  min-width: 1000px;
  width: 100%;
}

.battle-result-container .battle-content-row > div,
.battle-result-container .battle-header > div {
  width: 20%;
}

.dream-result-container .battle-content-row > div,
.dream-result-container .battle-header > div {
  width: 16.66%;
}

.remark {
  text-align: right;
  color: #666;
  font-size: 11px;
  line-height: 1.2;
  margin-top: 4px;
}

.sec-remark {
  text-align: right;
  color: #b9b9b9;
  font-size: 11px;
  line-height: 1.2;
  padding-top: 4px;
  padding-bottom: 4px;
}

.more-market a {
  color: #fff;
  text-decoration: underline !important;
}

.more-market tr {
  background: var(--bg-table-header);
  color: #fff;
}

.market-analysis .bx-sync {
  font-size: 20px;
  color: #333;
  margin-top: 10px;
}

.pointer {
  cursor: pointer;
}

.bank-panel .transfer-amt {
  width: auto;
  display: inline-block;
  width: 120px;
}

.table-fixed {
  table-layout: fixed;
}

.dropdown-menu-full {
  width: 100%;
}

.p-relative {
  position: relative;
}

.p-unset {
  position: unset;
}

.text-ellipsis {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.total-highlight {
  background: #f4f4f4;
  color: #000;
}

.total-highlight td {
  font-size: 14px;
}

.ma-link:hover {
  text-decoration: underline !important;
}

.bt0 {
  border-top: 0 !important;
}

.tab-content {
  border: 0;
}

/*Custom CSS*/

.back-border {
  box-shadow: inset 3px 0 0px var(--back);
  border-left: 0;
}

.lay-border {
  box-shadow: inset 3px 0 0px var(--lay);
  border-left: 0;
}

#matched-bet .back-border td,
#matched-bet .lay-border td {
  border: 0;
}

#matched-bet .andar-border td,
#matched-bet .bahar-border td {
  border: 0;
}

.casino-result-cards-item img {
  border-radius: 0px;
  box-shadow: 2px 3px 3px -1px #00000096;
}

.casino-result-cards-item .winner-icon {
  box-shadow: none;
  border-radius: 0;
}

.baccarat .baccarat-bets-odds {
  width: 100%;
}

.swal2-theme-title {
  color: #fff !important;
}

.desktop-banner {
  width: 100%;
  box-shadow: 3px 8px 8px #00000036;
}

.create-account-container .fa-circle,
.create-account-container .fa-check-circle {
  font-size: 18px;
}

.create-account-container .custom-switch .custom-control-label {
  vertical-align: middle;
}

.create-account-form {
  border: 1px solid #eff2f7;
  padding: 10px;
  background: #f9f9f9;
}

.previlage-box {
  background-color: #ececec;
  border: 1px solid #ddd;
}

/*New Home Design*/
html,
body {
  height: 100%;
  font-family: "Roboto Condensed", sans-serif;
  color: #1e1e1e;
  font-size: 14px;
  line-height: 15px;
  background-color: #fff;
}
body {
  min-height: unset !important;
}
.home-new {
  flex-wrap: wrap;
  background-color: var(--bg-body);
  background-image: -webkit-radial-gradient(
    50%,
    circle closest-corner,
    #0c5a68,
    rgba(12, 90, 104, 0) 70%
  );
}

.home-new .container {
  max-width: 1400px;
  padding: 0;
  box-shadow: 0 0 40px #0c5a68;
}

.home-new .site-news-line {
  color: var(--text-yellow);
}

.home-new-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-top: 0;
  padding-bottom: 0;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: var(--bg-body);
  max-width: 1400px;
  margin: 0 auto;
  height: 72px;
}

.home-new-logo {
  display: flex;
  align-items: center;
  padding-left: 5px;
}

.home-new-logo img {
  max-width: 230px;
  max-height: 50px;
}

.home-new-header .navbar {
  flex: 1;
}

.home-new-header .header-right {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home-new-header .header-right .btn {
  padding: 10px 50px;
  text-transform: uppercase;
}

.header-sport-list {
  max-width: 100%;
  height: 100%;
  width: calc(100% - 160px);
  padding-left: 10px;
}

.header-sport-list marquee {
  height: 80px;
}

.home-new-header .header-right a {
  background-color: var(--bg-table-header) !important;
  color: var(--text-table-header) !important;
}

.header-right a,
.header-right .btn {
  height: 100% !important;
  display: flex !important;
  justify-content: center;
  align-items: center;
  background-color: var(--text-fancy) !important;
  color: var(--text-black) !important;
  border-radius: 0 !important;
  border: 0 !important;
  font-size: 18px;
}

.home-new-header a {
  color: #fff;
  padding-right: 16px !important;
  padding-left: 16px !important;
}

.home-new-header a.router-link-active {
  color: var(--text-fancy);
  font-weight: bold;
}

.home-new-header-bottom {
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  height: 58px;
  position: relative;
  overflow: hidden;
}

.home-new-header-bottom .btn {
  min-width: 150px;
  background-color: var(--text-yellow);
  border-color: var(--text-yellow);
  color: var(--text-black);
  border-radius: 40px;
  height: 40px;
  text-transform: uppercase;
}

.home-new-header-bottom .download-apk {
  color: var(--text-yellow);
}

.home-new .carousel img {
  width: 100%;
}

.home-new .casino-banners {
  background-color: transparent;
}

.casino-banner-item.login-hover {
  position: relative;
}

.casino-banner-item.login-hover:hover img {
  filter: blur(5px);
  transition: 0.8s;
}

.casino-banner-item.login-hover div {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  color: var(--text-fancy);
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  transition: 1s;
}

.casino-banner-item.login-hover:hover div {
  opacity: 1;
}

.home-new .sport-list-title {
  color: var(--text-fancy);
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 20px;
  text-align: left;
  display: inline-block;
  border-bottom: 1px solid var(--text-fancy);
  margin-left: 15px;
}

.all-sports-list {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  height: 100%;
  white-space: nowrap;
}

.sport-list-item {
  padding: 5px;
  width: auto;
  margin-right: 10px;
  margin-bottom: 0;
  text-align: center;
  cursor: pointer;
  transition: 0.8s;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  color: var(--text-white);
}

.sport-list-item img {
  height: 30px;
  max-width: 50px;
}

.sport-list-item:nth-child(16n) {
  margin-right: 0;
}

.modal-login-new.modal {
  top: 0;
}

.modal-login-new .modal-content {
  border-radius: 0 0 8px 8px;
}

.modal-login-new .modal-header {
  padding: 0;
}

.close-login-modal {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  background-color: var(--bg-table-header);
  color: red;
  font-size: 24px;
  cursor: pointer;
}

.modal-login-new .modal-body {
  padding: 16px;
}

.modal-login-new .modal-body h5 {
  color: var(--text-fancy);
  font-weight: bold;
  text-transform: uppercase;
}

.modal-login-new .modal-body label {
  color: #fff;
  font-size: 16px;
}

.modal-login-new .form-group {
  margin-right: 0;
}

.modal-login-new .form-control {
  transition: 0.8s;
}

.modal-login-new .form-control:hover,
.modal-login-new .form-control:focus {
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.home-new .casino-banners-list {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 10px;
}

.home-new .casino-banners-list .casino-banner-item {
  box-shadow: 0 0 10px #2b2366;
  width: calc(12.5% - 8.75px);
  margin-right: 10px;
  margin-left: 0;
  margin-bottom: 10px;
}

.home-new .casino-banners-list .casino-banner-item:nth-child(8n) {
  margin-right: 0;
}

.home-new .casino-banners-list.live-casinos .casino-banner-item {
  width: calc(25% - 10px);
}

.home-new .casino-banners-list.live-casinos .casino-banner-item:nth-child(4n) {
  margin-right: 0;
}

.home-new .casino-banners-list.live-casinos .casino-banner-item:nth-child(8n) {
  margin-right: 10px !important;
}

.home-new .casino-banners-list.fantasy-games .casino-banner-item {
  width: calc(33.3% - 10px);
}

.home-new .casino-banners-list.fantasy-games .casino-banner-item:nth-child(8n) {
  margin-right: 10px !important;
}

.home-new .casino-banners-list.fantasy-games.others .casino-banner-item {
  width: 66%;
}

/*.home-new .casino-banners-list.fantasy-games .casino-banner-item:nth-child(3n) {
    margin-right: 0;
}*/

.top-winners-list-container {
  width: 100%;
  padding: 10px;
}

.top-winner-list-box-container {
  display: flex;
  flex-wrap: wrap;
  height: 200px;
}

.top-winner-list-box {
  display: flex;
  flex-wrap: wrap;
  background-color: var(--bg-sidebar);
  padding: 10px;
  border-radius: 16px;
  justify-content: center;
  width: 200px;
  height: 200px;
  align-items: center;
  font-size: 14px;
  margin-right: 30px;
  box-shadow: 0 0 10px #2b2366;
  color: var(--text-sidebar);
}

.top-winners-list-container .player-detail {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.home-new .footer {
  padding: 24px;
  position: relative;
  left: unset;
  height: auto;
  background-color: transparent;
  color: var(--text-white);
}

.home-new .footer h4 {
  color: var(--text-fancy);
  font-weight: bold;
  display: inline-block;
  border-bottom: 1px solid var(--text-fancy);
  font-size: 22px;
  margin-bottom: 20px;
}

.home-new .footer .img-logo {
  max-width: 250px;
  max-height: 60px;
}

.home-new .footer .footer-link a {
  color: var(--text-body);
}

.home-new .footer .gt img {
  height: 50px;
}

.home-new .footer .footer-social img {
  height: 30px;
}

.home-new .upcoming-fixure {
  height: 56px;
  margin-left: 0;
  width: 100%;
  border-radius: 0;
}

.home-new .fixure-title {
  border-radius: 0;
}

.home-new .fixure-title::after {
  width: 56px;
  height: 56px;
  border-top: 28px solid transparent;
  border-left: 28px solid var(--bg-table-header);
  border-bottom: 28px solid transparent;
  right: -56px;
}

.home-new .fixure-box-container {
  height: 56px;
  align-items: center;
}

.upcoming-fixure {
  margin-left: 10px;
  flex: 1;
  width: 50%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  height: 38px;
  background-color: var(--bg-sidebar);
  border-radius: 8px;
}

.fixure-box-container {
  display: flex;
  flex-wrap: nowrap;
}

.fixure-box {
  margin-right: 20px;
  padding: 5px;
  font-size: 14px;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  color: var(--text-sidebar);
}

.fixure-box > div:last-child {
  font-size: 11px;
  margin-top: 3px;
  margin-left: 25px;
}

.fixure-title {
  float: left;
  width: 70px;
  background-color: var(--bg-table-header);
  text-align: center;
  padding: 8px 0;
  border-radius: 8px 0px 0px 8px;
  font-weight: var(--font-bold);
  height: 100%;
  position: relative;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  margin-right: 25px;
  color: #fff;
  font-size: 12px;
  padding-left: 10px;
  line-height: normal;
}

.fixure-title::after {
  content: "";
  position: absolute;
  width: 38px;
  height: 38px;
  border-top: 19px solid transparent;
  border-left: 19px solid var(--bg-table-header);
  border-bottom: 19px solid transparent;
  right: -38px;
  top: 0;
}

.upcoming-fixure marquee {
  float: right;
  width: calc(100% - 95px);
  padding: 0;
  padding-right: 20px;
}

@font-face {
  font-family: "dfont";
  src: url("../fonts/dfont.eot?x4borr");
  src: url("../fonts/dfont.eot?x4borr#iefix") format("embedded-opentype"),
    url("../fonts/dfont.ttf?x4borr") format("truetype"),
    url("../fonts/dfont.woff?x4borr") format("woff"),
    url("../fonts/dfont.svg?x4borr#dfont") format("svg");
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.d-icon {
  font-family: "dfont" !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-tv2:before {
  content: "\e901";
}

.icon-search1:before {
  content: "\e944";
}

.icon-locked:before {
  content: "\e946";
}

.icon-lock:before {
  content: "\e947";
}

.icon-arrow-down1:before {
  content: "\e948";
}

.icon-arrow-down-left:before {
  content: "\e94c";
}

.icon-arrow-down-right:before {
  content: "\e94f";
}

.icon-arrow-left:before {
  content: "\e950";
}

.icon-arrow-right:before {
  content: "\e951";
}

.icon-arrow-up1:before {
  content: "\e952";
}

.icon-arrow-up-left:before {
  content: "\e953";
}

.icon-arrow-up-right:before {
  content: "\e954";
}

.icon-check:before {
  content: "\e955";
}

.icon-chevron-down:before {
  content: "\e956";
}

.icon-chevron-left:before {
  content: "\e957";
}

.icon-chevron-right:before {
  content: "\e958";
}

.icon-chevron-up:before {
  content: "\e959";
}

.icon-chevrons-down:before {
  content: "\e95a";
}

.icon-chevrons-left:before {
  content: "\e95b";
}

.icon-chevrons-right:before {
  content: "\e95c";
}

.icon-chevrons-up:before {
  content: "\e95d";
}

.icon-lock1:before {
  content: "\e95e";
}

.icon-menu:before {
  content: "\e95f";
}

.icon-monitor:before {
  content: "\e960";
}

.icon-more-horizontal:before {
  content: "\e961";
}

.icon-more-vertical:before {
  content: "\e962";
}

.icon-refresh-ccw:before {
  content: "\e963";
}

.icon-refresh-cw:before {
  content: "\e964";
}

.icon-trending-down:before {
  content: "\e965";
}

.icon-trending-up:before {
  content: "\e966";
}

.icon-tv:before {
  content: "\e967";
}

.icon-user1:before {
  content: "\e968";
}

.icon-x-circle:before {
  content: "\e969";
}

.icon-x-square:before {
  content: "\e96a";
}

.icon-1:before {
  content: "\e902";
}

.icon-2:before {
  content: "\e903";
}

.icon-3:before {
  content: "\e904";
}

.icon-4:before {
  content: "\e905";
}

.icon-5:before {
  content: "\e906";
}

.icon-6:before {
  content: "\e907";
}

.icon-7:before {
  content: "\e908";
}

.icon-8:before {
  content: "\e909";
}

.icon-9:before {
  content: "\e90a";
}

.icon-10:before {
  content: "\e90b";
}

.icon-11:before {
  content: "\e90c";
}

.icon-12:before {
  content: "\e90d";
}

.icon-13:before {
  content: "\e90e";
}

.icon-14:before {
  content: "\e90f";
}

.icon-15:before {
  content: "\e910";
}

.icon-16:before {
  content: "\e911";
}

.icon-17:before {
  content: "\e912";
}

.icon-18:before {
  content: "\e913";
}

.icon-19:before {
  content: "\e914";
}

.icon-20:before {
  content: "\e915";
}

.icon-21:before {
  content: "\e916";
}

.icon-22:before {
  content: "\e917";
}

.icon-23:before {
  content: "\e918";
}

.icon-24:before {
  content: "\e919";
}

.icon-25:before {
  content: "\e91a";
}

.icon-26:before {
  content: "\e91b";
}

.icon-27:before {
  content: "\e91c";
}

.icon-28:before {
  content: "\e91d";
}

.icon-29:before {
  content: "\e91e";
}

.icon-30:before {
  content: "\e91f";
}

.icon-31:before {
  content: "\e920";
}

.icon-32:before {
  content: "\e921";
}

.icon-33:before {
  content: "\e922";
}

.icon-34:before {
  content: "\e923";
}

.icon-35:before {
  content: "\e924";
}

.icon-36:before {
  content: "\e925";
}

.icon-37:before {
  content: "\e926";
}

.icon-38:before {
  content: "\e927";
}

.icon-39:before {
  content: "\e928";
}

.icon-40:before {
  content: "\e929";
}

.icon-41:before {
  content: "\e92a";
}

.icon-42:before {
  content: "\e92b";
}

.icon-43:before {
  content: "\e92c";
}

.icon-44:before {
  content: "\e92d";
}

.icon-46:before {
  content: "\e92e";
}

.icon-47:before {
  content: "\e92f";
}

.icon-48:before {
  content: "\e930";
}

.icon-49:before {
  content: "\e931";
}

.icon-50:before {
  content: "\e932";
}

.icon-51:before {
  content: "\e933";
}

.icon-52:before {
  content: "\e934";
}

.icon-53:before {
  content: "\e935";
}

.icon-54:before {
  content: "\e936";
}

.icon-55:before {
  content: "\e937";
}

.icon-56:before {
  content: "\e938";
}

.icon-57:before {
  content: "\e939";
}

.icon-58:before {
  content: "\e93a";
}

.icon-59:before {
  content: "\e93b";
}

.icon-60:before {
  content: "\e93c";
}

.icon-61:before {
  content: "\e93d";
}

.icon-62:before {
  content: "\e93e";
}

.icon-63:before {
  content: "\e93f";
}

.icon-64:before {
  content: "\e940";
}

.icon-65:before {
  content: "\e941";
}

.icon-arrow-down:before {
  content: "\e942";
}

.icon-arrow-up:before {
  content: "\e943";
}

.icon-close:before {
  content: "\e945";
}

.icon-favourite:before {
  content: "\e900";
}

.icon-lock2:before {
  content: "\e949";
}

.icon-search:before {
  content: "\e94a";
}

.icon-suits:before {
  content: "\e94b";
}

.icon-tv1:before {
  content: "\e94d";
}

.icon-user:before {
  content: "\e94e";
}

#loading {
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  position: fixed;
  background-color: #fff;
  z-index: 9999;
}

.d-banner img {
  height: 250px;
}

.run-amount-container,
.run-amount-container table td {
  font-size: 14px;
  color: #000;
  font-weight: 500;
}

.casino-banners {
  padding: 10px 10px 0 10px;
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  margin-top: 6px;
}

.casino-banner-item {
  width: calc(16.66% - 8.4px);
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  animation: slide-down 0.5s ease-out;
}

.slot-banner-full {
  width: 100% !important;
}

@keyframes slide-down {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

.casino-banner-item img {
  border-radius: 4px;
  width: 100%;
}

.casino-banner-item:nth-child(6n) {
  margin-right: 0;
}

.casino-banner-item.launch-soon {
  position: relative;
  cursor: not-allowed;
}

.casino-banner-item.launch-soon img {
  transition: 0.8s;
}

.casino-banner-item.launch-soon:hover img {
  filter: blur(10px);
  transition: 0.8s;
}

.casino-banner-item.launch-soon:hover::after {
  position: absolute;
  content: "Launch Soon";
  color: var(--text-fancy);
  font-weight: var(--font-bold);
  top: 0;
  left: 0;
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  z-index: 1000;
  transition: 0.8s;
}

.login-text-box {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  padding: 20px;
  color: #f6f6f6;
  font-size: 16px;
  text-align: center;
}

.login .card {
  background-color: transparent;
  box-shadow: none;
}

.login .form-group {
  margin-bottom: 25px;
}

.login .form-control::placeholder {
  color: #a2a2a2;
}

body.login .login-bg {
  background-position: left;
}

.login-bottom-text {
  position: absolute;
  bottom: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  color: #f6f6f6;
  font-size: 16px;
  text-align: center;
  width: 90%;
  left: 5%;
}

.race-result-box .result-image img {
  border-radius: 0px;
  box-shadow: 2px 3px 3px -1px #00000096;
}

.race-result-box .result-image.icons img {
  border-radius: 0px;
  box-shadow: none;
}

.race-result-box > div span {
  margin-right: 10px;
}

.race-result-box {
  width: 405px;
  margin: 20px 0;
}

.race-result-box .result-image.k-image {
  position: absolute;
  right: -65px;
}

.race-result-box .video-winner-text {
  line-height: 1;
}

.row.row5 > .col {
  padding-left: 5px;
  padding-right: 5px;
}

.bg-primary.bg-soft {
  background-color: rgba(85, 110, 230, 0.25) !important;
}

.login-bg .card-body {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
}

.login-bg .logo-img {
  width: auto;
  height: 75px;
  display: inline;
  padding-bottom: 15px;
  margin: 0 auto;
}

.login-bg .card-body:hover {
  box-shadow: inset 0 0px 7px #2f2f2f;
}

.login-bg .btn-theme1:hover {
  opacity: 0.9;
}

.login-bg input {
  border: 2px solid #e8e8e8 !important;
}

.login-bg input:focus {
  border: 2px solid #333 !important;
}

.login-bg .copyright-text {
  text-align: center;
  margin-top: 5px;
  color: #fff;
}

.home-new .btn-submit {
  height: 50px;
  background-color: var(--text-fancy);
  color: var(--text-black) !important;
}

.right-bar {
  width: 500px;
  right: -500px;
  background-color: var(--bg-sidebar);
}

.right-bar .closebtn {
  width: 70px;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAA80lEQVRIibXUsQlCMRCA4VNrW8ENBFdwGMdwDFewcQQrURzBQsTCASxsdIDfQh+EZ5J3l5c7SBES8h25SwQYAEtgBIjzmAIHYCbAmm9snPEpcP1ZewEWwNsZD9ELMGkWPPE/FJBwgwceRdtwg78q4Uk0BtfCs2gK7ot3ojm4FFehXbAVV6MaWIubUC3chZtRC5zCi1Ar3Ma3pWgJ3MaLUECGYo+7iDyC+VlEnuZTjJmGNb1Fau5y1bFGKv7h+qC5bq8Ca56MGa+BFuG1UDNeEzXhtVE17oGqcC+0E/dEs7g3msQFODmjMXwlwBw4OqMhvgPGH2JWxTitpt5pAAAAAElFTkSuQmCC);
  background-repeat: no-repeat;
  height: 40px;
  height: 75px;
  position: absolute;
  top: 0;
  right: 0;
  background-position: 50%;
  transition: 0.8s;
}

.right-bar .closebtn:hover {
  background-color: #00000061;
}

.swal2-container {
  z-index: 10000 !important;
}

.right-bar hr {
  border-top: 1px solid rgb(255 255 255 / 14%);
}

.all-sports-list {
  padding: 0px;
}

.navbar-header .upcoming-fixure {
  height: 40px;
  flex-wrap: nowrap;
  flex: unset;
  width: auto;
}

.navbar-header .fixure-box {
  line-height: 1;
}

.navbar-header .fixure-title::after {
  width: 40px;
  height: 40px;
  border-top: 20px solid transparent;
  border-left: 20px solid var(--bg-table-header);
  border-bottom: 20px solid transparent;
  right: -40px;
}

.navbar-header .fixure-box-container {
  flex-wrap: nowrap;
}

.nowrap {
  white-space: nowrap;
}

.casino-video .video-box-container {
  max-width: calc(100% - 255px);
}

.five-cricket .casino-video .video-box-container {
  max-width: 100%;
}

.casino-video-title {
  /* min-width: 245px; */
}

.casino-book {
  font-size: 18px;
  line-height: 18px;
}

.cp-success-box {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.lottery .casino-video-last-results span {
  width: 50px !important;
}

.lottery .casino-video-last-results {
  position: relative;
  width: 100%;
  height: auto;
  background-color: transparent;
  justify-content: center;
  top: 0;
  margin-top: 20px;
}

.lottery .casino-video-last-results span,
.lottery .casino-video-last-results a {
  width: 35px;
  height: 35px;
  line-height: 35px;
}

.logo span.logo-lg {
  display: block;
}

.logo span.logo-lg .site-logo {
  max-width: 100%;
  max-height: 40px;
  height: auto;
  width: auto;
}

.right-bar {
  max-width: 90%;
}

.bank-panel .table th,
.bank-panel .table td {
  white-space: nowrap;
}

.apexcharts-menu-item {
  font-size: 10px !important;
}

/*Custom CSS*/

.security-auth {
  font-size: 14px;
}

.security-auth .verify-code {
  width: auto;
  font-size: var(--font-56);
  line-height: 1;
  color: var(--text-table-header);
  background: var(--bg-table-header);
  padding: 10px;
  border-radius: 8px;
  display: inline-block;
  letter-spacing: 40px;
  font-weight: 600;
  padding-left: 40px;
}

.security-auth .secure-password .form-control {
  height: 38px;
  display: inline-block;
  width: auto;
}

.follow-instruction {
  background-color: var(--bg-table-header);
  padding: 10px;
  color: var(--text-table-header);
  display: inline-block;
  padding: 8px;
}

.security-auth .login-auth {
  background-color: transparent;
}

.login-auth {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-sidebar);
}

.login-auth .log-logo img {
  max-width: 300px;
}

.login-auth input {
  width: 70px;
  height: 70px;
  padding: 5px;
  margin: 0 10px;
  font-size: 30px;
  border-radius: 4px;
  border: 0;
  text-align: center;
  background-color: var(--bg-table);
  color: var(--text-table);
}

.login-auth .featured-box-login {
  padding: 20px;
  color: var(--text-table-header);
  margin-top: 30px;
}

.login-auth .featured-box-login a {
  color: var(--text-success);
}

.login-auth form > div {
  justify-content: center;
}

.security-auth .login-auth {
  min-height: unset;
  flex-direction: column;
}

@media only screen and (max-width: 767px) {
  .login-auth input {
    width: 40px;
    height: 40px;
    margin: 0 5px;
  }
  .login-auth .featured-box-login h3 {
    font-size: 22px;
  }
  .security-auth .verify-code {
    font-size: 30px;
    letter-spacing: 24px;
    padding-left: 24px;
  }
  .security-auth .secure-password .form-control {
    margin-bottom: 10px;
  }
}

#rules-modal .modal-body {
  padding: 0;
  background-color: #434343;
}

.andar-bahar2 .suspended.lock-top {
  background-position: center;
}

/*Custom New*/

.security-auth .casino-report-tabs .nav-tabs {
  justify-content: center;
}

.menu-box::-webkit-scrollbar-track {
  background: var(--bg-table);
}

.menu-box::-webkit-scrollbar-thumb {
  background-color: var(--bg-table-header);
}

.menu-box li {
  cursor: pointer;
  padding: 5px 0 5px 12px;
}
#side-menu .menu-box .sub-menu > li {
  padding-left: 0;
}
#side-menu .menu-box .sub-menu > li b {
  font-size: 14px;
}
.menu-box li span {
  font-size: 12px;
}
.menu-box li a {
  color: var(--text-sidebar);
  padding: 8px 16px;
  display: block;
  font-size: 12px;
}

body[data-sidebar="dark"] #sidebar-menu #event-tree ul li.show a {
  color: #000;
}

/* .menu-box li ul > li > a {
  background-color: var(--bg-table-header);
  color: var(--text-table-header);
} */
/* 
.menu-box li ul ul li a {
  background-color: var(--bg-sidebar);
  color: #fff;
} */

.menu-box .sub-menu li:not(.show) a[class*="sport"] {
  background-color: transparent;
  color: #000 !important;
}

.menu-box li a[class*="sport"] > span.sport-name {
  margin-left: 0;
}

.menu-box li a {
  position: relative;
}

.menu-box li:not(.show) a[class*="sport"]:before,
.menu-box li.show a[class*="sport"]:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  background-size: contain;
  background-repeat: no-repeat;
}

.menu-box li a .d-icon {
  font-size: var(--font-18);
  width: 30px;
  display: inline-block;
}

.menu-box li a .d-icon.icon-23,
.menu-box li a .d-icon.icon-26 {
  font-size: 10px;
}

.menu-box li:not(.show) a.sport1 .icon-1 {
  color: var(--football);
}

.menu-box li:not(.show) a.sport2 .icon-2 {
  color: var(--tennis);
}

.menu-box li:not(.show) a.sport3 .icon-3 {
  color: var(--boxing);
}

.menu-box li:not(.show) a.sport4 .icon-4 {
  color: var(--cricket);
}

.menu-box li:not(.show) a.sport5 .icon-5 {
  color: var(--golf);
}

.menu-box li:not(.show) a.sport6 .icon-6 {
  color: var(--boxing);
}

.menu-box li:not(.show) a.sport7 .icon-7 {
  color: var(--beach-volleyball);
}

.menu-box li:not(.show) a.sport8 .icon-8 {
  color: var(--table-tennis);
}

.menu-box li:not(.show) a.sport9 .icon-9 {
  color: var(--futsal);
}

.menu-box li:not(.show) a.sport10 .icon-10 {
  color: var(--horse-racing);
}

.menu-box li:not(.show) a.sport11 .icon-11 {
  color: var(--egames);
}

.menu-box li:not(.show) a.sport12 .icon-12 {
  color: var(--grey-hounds);
}

.menu-box li:not(.show) a.sport13 .icon-13 {
  color: var(--trotting);
}

.menu-box li:not(.show) a.sport14 .icon-14 {
  color: var(--speedway);
}

.menu-box li:not(.show) a.sport15 .icon-15 {
  color: var(--basketball);
}

.menu-box li:not(.show) a.sport16 .icon-16 {
  color: var(--moto-gp);
}

.menu-box li:not(.show) a.sport17 .icon-17 {
  color: var(--chess);
}

.menu-box li:not(.show) a.sport18 .icon-18 {
  color: var(--vollyball);
}

.menu-box li:not(.show) a.sport19 .icon-19 {
  color: var(--ice-hockey);
}

.menu-box li:not(.show) a.sport20 .icon-20 {
  color: var(--equine-sports);
}

.menu-box li:not(.show) a.sport21 .icon-21 {
  color: var(--australians-rules);
}

.menu-box li:not(.show) a.sport22 .icon-22 {
  color: var(--badminton);
}

.menu-box li:not(.show) a.sport23 .icon-23 {
  color: var(--formula-1);
}

.menu-box li:not(.show) a.sport24 .icon-24 {
  color: var(--nascar);
}

.menu-box li:not(.show) a.sport25 .icon-25 {
  color: var(--hockey);
}

.menu-box li:not(.show) a.sport26 .icon-26 {
  color: var(--supercars);
}

.menu-box li:not(.show) a.sport27 .icon-27 {
  color: var(--netball);
}

.menu-box li:not(.show) a.sport28 .icon-28 {
  color: var(--surfing);
}

.menu-box li:not(.show) a.sport29 .icon-29 {
  color: var(--cycling);
}

.menu-box li:not(.show) a.sport30 .icon-30 {
  color: var(--gaelick-sports);
}

.menu-box li:not(.show) a.sport31 .icon-31 {
  color: var(--biathlon);
}

.menu-box li:not(.show) a.sport32 .icon-32 {
  color: var(--motorbikes);
}

.menu-box li:not(.show) a.sport33 .icon-33 {
  color: var(--athletics);
}

.menu-box li:not(.show) a.sport34 .icon-34 {
  color: var(--squash);
}

.menu-box li:not(.show) a.sport35 .icon-35 {
  color: var(--basketball-3-3);
}

.menu-box li:not(.show) a.sport36 .icon-36 {
  color: var(--floorball);
}

.menu-box li:not(.show) a.sport37 .icon-37 {
  color: var(--sumo);
}

.menu-box li:not(.show) a.sport38 .icon-38 {
  color: var(--virtual-sports);
}

.menu-box li:not(.show) a.sport39 .icon-39 {
  color: var(--handball);
}

.menu-box li:not(.show) a.sport40 .icon-40 {
  color: var(--politics);
}

.menu-box li:not(.show) a.sport41 .icon-41 {
  color: var(--weather);
}

.menu-box li:not(.show) a.sport42 .icon-42 {
  color: var(--tv-games);
}

.menu-box li:not(.show) a.sport43 .icon-43 {
  color: var(--lottery);
}

.menu-box li:not(.show) a.sport44 .icon-44 {
  color: var(--bowls);
}

.menu-box li:not(.show) a.sport45 .icon-45 {
  color: var(--poker);
}

.menu-box li:not(.show) a.sport46 .icon-46 {
  color: var(--waterpolo);
}

.menu-box li:not(.show) a.sport47 .icon-47 {
  color: var(--alpine-skiing);
}

.menu-box li:not(.show) a.sport48 .icon-48 {
  color: var(--sailing);
}

.menu-box li:not(.show) a.sport49 .icon-49 {
  color: var(--hurling);
}

.menu-box li:not(.show) a.sport50 .icon-50 {
  color: var(--ski-jumping);
}

.menu-box li:not(.show) a.sport51 .icon-51 {
  color: var(--bandy);
}

.menu-box li:not(.show) a.sport52 .icon-52 {
  color: var(--motor-sports);
}

.menu-box li:not(.show) a.sport53 .icon-53 {
  color: var(--baseball);
}

.menu-box li:not(.show) a.sport54 .icon-54 {
  color: var(--rugby-union);
}

.menu-box li:not(.show) a.sport55 .icon-55 {
  color: var(--rugby-league);
}

.menu-box li:not(.show) a.sport56 .icon-56 {
  color: var(--curling);
}

.menu-box li:not(.show) a.sport57 .icon-57 {
  color: var(--darts);
}

.menu-box li:not(.show) a.sport58 .icon-58 {
  color: var(--americal-footbal);
}

.menu-box li:not(.show) a.sport59 .icon-59 {
  color: var(--snooker);
}

.menu-box li:not(.show) a.sport60 .icon-60 {
  color: var(--gaelick-sports);
}

.menu-box li:not(.show) a.sport61 .icon-61 {
  color: var(--lottery-specials);
}

.menu-box li:not(.show) a.sport62 .icon-62 {
  color: var(--football);
}

.menu-box li:not(.show) a.sport63 .icon-63 {
  color: var(--special-bets);
}

.menu-box li:not(.show) a.sport64 .icon-64 {
  color: var(--egames);
}

.menu-box li:not(.show) a.sport65 .icon-65 {
  color: var(--grey-hounds);
}

.menu-box li.show a[class*="sport"] {
  color: var(--text-white);
}

.menu-box li a[class*="sport"] {
  display: flex;
  display: -webkit-flex;
  align-items: center;
}

.menu-box li a.sport1 ~ ul > li > a.active {
  background-color: var(--football_75);
  color: #fff !important;
}

.menu-box li a.sport1 ~ ul ul li a.active {
  background-color: var(--football_50);
  color: #fff !important;
}

.menu-box li a.sport2 ~ ul > li > a.active {
  background-color: var(--tennis_75);
  color: #fff !important;
}

.menu-box li a.sport2 ~ ul ul li a.active {
  background-color: var(--tennis_50);
  color: #fff !important;
}

.menu-box li a.sport3 ~ ul > li > a.active {
  background-color: var(--boxing_75);
  color: #fff !important;
}

.menu-box li a.sport3 ~ ul ul li a.active {
  background-color: var(--boxing_50);
  color: #fff !important;
}

.menu-box li a.sport4 ~ ul > li > a.active {
  background-color: var(--cricket_75);
  color: #fff !important;
}

.menu-box li a.sport4 ~ ul ul li a.active {
  background-color: var(--cricket_50);
  color: #fff !important;
}

.menu-box li a.sport5 ~ ul > li > a.active {
  background-color: var(--golf_75);
  color: #fff !important;
}

.menu-box li a.sport5 ~ ul ul li a.active {
  background-color: var(--golf_50);
  color: #fff !important;
}

.menu-box li a.sport6 ~ ul > li > a.active {
  background-color: var(--boxing_75);
  color: #fff !important;
}

.menu-box li a.sport6 ~ ul ul li a.active {
  background-color: var(--boxing_50);
  color: #fff !important;
}

.menu-box li a.sport7 ~ ul > li > a.active {
  background-color: var(--beach-volleyball_75);
  color: #fff !important;
}

.menu-box li a.sport7 ~ ul ul li a.active {
  background-color: var(--beach-volleyball_50);
  color: #fff !important;
}

.menu-box li a.sport8 ~ ul > li > a.active {
  background-color: var(--table-tennis_75);
  color: #fff !important;
}

.menu-box li a.sport8 ~ ul ul li a.active {
  background-color: var(--table-tennis_50);
  color: #fff !important;
}

.menu-box li a.sport9 ~ ul > li > a.active {
  background-color: var(--futsal_75);
  color: #fff !important;
}

.menu-box li a.sport9 ~ ul ul li a.active {
  background-color: var(--futsal_50);
  color: #fff !important;
}

.menu-box li a.sport10 ~ ul > li > a.active {
  background-color: var(--horse-racing_75);
  color: #fff !important;
}

.menu-box li a.sport10 ~ ul ul li a.active {
  background-color: var(--horse-racing_50);
  color: #fff !important;
}

.menu-box li a.sport11 ~ ul > li > a.active {
  background-color: var(--egames_75);
  color: #fff !important;
}

.menu-box li a.sport11 ~ ul ul li a.active {
  background-color: var(--egames_50);
  color: #fff !important;
}

.menu-box li a.sport12 ~ ul > li > a.active {
  background-color: var(--grey-hounds_75);
  color: #fff !important;
}

.menu-box li a.sport12 ~ ul ul li a.active {
  background-color: var(--grey-hounds_50);
  color: #fff !important;
}

.menu-box li a.sport13 ~ ul > li > a.active {
  background-color: var(--trotting_75);
  color: #fff !important;
}

.menu-box li a.sport13 ~ ul ul li a.active {
  background-color: var(--trotting_50);
  color: #fff !important;
}

.menu-box li a.sport14 ~ ul > li > a.active {
  background-color: var(--speedway_75);
  color: #fff !important;
}

.menu-box li a.sport14 ~ ul ul li a.active {
  background-color: var(--speedway_50);
  color: #fff !important;
}

.menu-box li a.sport15 ~ ul > li > a.active {
  background-color: var(--basketball_75);
  color: #fff !important;
}

.menu-box li a.sport15 ~ ul ul li a.active {
  background-color: var(--basketball_50);
  color: #fff !important;
}

.menu-box li a.sport16 ~ ul > li > a.active {
  background-color: var(--moto-gp_75);
  color: #fff !important;
}

.menu-box li a.sport16 ~ ul ul li a.active {
  background-color: var(--moto-gp_50);
  color: #fff !important;
}

.menu-box li a.sport17 ~ ul > li > a.active {
  background-color: var(--chess_75);
  color: #fff !important;
}

.menu-box li a.sport17 ~ ul ul li a.active {
  background-color: var(--chess_50);
  color: #fff !important;
}

.menu-box li a.sport18 ~ ul > li > a.active {
  background-color: var(--vollyball_75);
  color: #fff !important;
}

.menu-box li a.sport18 ~ ul ul li a.active {
  background-color: var(--vollyball_50);
  color: #fff !important;
}

.menu-box li a.sport19 ~ ul > li > a.active {
  background-color: var(--ice-hockey_75);
  color: #fff !important;
}

.menu-box li a.sport19 ~ ul ul li a.active {
  background-color: var(--ice-hockey_50);
  color: #fff !important;
}

.menu-box li a.sport20 ~ ul > li > a.active {
  background-color: var(--equine-sports_75);
  color: #fff !important;
}

.menu-box li a.sport20 ~ ul ul li a.active {
  background-color: var(--equine-sports_50);
  color: #fff !important;
}

.menu-box li a.sport21 ~ ul > li > a.active {
  background-color: var(--australians-rules_75);
  color: #fff !important;
}

.menu-box li a.sport21 ~ ul ul li a.active {
  background-color: var(--australians-rules_50);
  color: #fff !important;
}

.menu-box li a.sport22 ~ ul > li > a.active {
  background-color: var(--badminton_75);
  color: #fff !important;
}

.menu-box li a.sport22 ~ ul ul li a.active {
  background-color: var(--badminton_50);
  color: #fff !important;
}

.menu-box li a.sport23 ~ ul > li > a.active {
  background-color: var(--formula-1_75);
  color: #fff !important;
}

.menu-box li a.sport23 ~ ul ul li a.active {
  background-color: var(--formula-1_50);
  color: #fff !important;
}

.menu-box li a.sport24 ~ ul > li > a.active {
  background-color: var(--nascar_75);
  color: #fff !important;
}

.menu-box li a.sport24 ~ ul ul li a.active {
  background-color: var(--nascar_50);
  color: #fff !important;
}

.menu-box li a.sport25 ~ ul > li > a.active {
  background-color: var(--hockey_75);
  color: #fff !important;
}

.menu-box li a.sport25 ~ ul ul li a.active {
  background-color: var(--hockey_50);
  color: #fff !important;
}

.menu-box li a.sport26 ~ ul > li > a.active {
  background-color: var(--supercars_75);
  color: #fff !important;
}

.menu-box li a.sport26 ~ ul ul li a.active {
  background-color: var(--supercars_50);
  color: #fff !important;
}

.menu-box li a.sport27 ~ ul > li > a.active {
  background-color: var(--netball_75);
  color: #fff !important;
}

.menu-box li a.sport27 ~ ul ul li a.active {
  background-color: var(--netball_50);
  color: #fff !important;
}

.menu-box li a.sport28 ~ ul > li > a.active {
  background-color: var(--surfing_75);
  color: #fff !important;
}

.menu-box li a.sport28 ~ ul ul li a.active {
  background-color: var(--surfing_50);
  color: #fff !important;
}

.menu-box li a.sport29 ~ ul li > a.active {
  background-color: var(--cycling_75);
  color: #fff !important;
}

.menu-box li a.sport29 ~ ul ul li a.active {
  background-color: var(--cycling_50);
  color: #fff !important;
}

.menu-box li a.sport30 ~ ul > li > a.active {
  background-color: var(--gaelick-sports_75);
  color: #fff !important;
}

.menu-box li a.sport30 ~ ul ul li a.active {
  background-color: var(--gaelick-sports_50);
  color: #fff !important;
}

.menu-box li a.sport31 ~ ul > li > a.active {
  background-color: var(--biathlon_75);
  color: #fff !important;
}

.menu-box li a.sport31 ~ ul ul li a.active {
  background-color: var(--biathlon_50);
  color: #fff !important;
}

.menu-box li a.sport32 ~ ul > li > a.active {
  background-color: var(--motorbikes_75);
  color: #fff !important;
}

.menu-box li a.sport32 ~ ul ul li a.active {
  background-color: var(--motorbikes_50);
  color: #fff !important;
}

.menu-box li a.sport33 ~ ul > li > a.active {
  background-color: var(--athletics_75);
  color: #fff !important;
}

.menu-box li a.sport33 ~ ul ul li a.active {
  background-color: var(--athletics_50);
  color: #fff !important;
}

.menu-box li a.sport34 ~ ul > li > a.active {
  background-color: var(--squash_75);
  color: #fff !important;
}

.menu-box li a.sport34 ~ ul ul li a.active {
  background-color: var(--squash_50);
  color: #fff !important;
}

.menu-box li a.sport35 ~ ul > li > a.active {
  background-color: var(--basketball-3-3_75);
  color: #fff !important;
}

.menu-box li a.sport35 ~ ul ul li a.active {
  background-color: var(--basketball-3-3_50);
  color: #fff !important;
}

.menu-box li a.sport36 ~ ul > li > a.active {
  background-color: var(--floorball_75);
  color: #fff !important;
}

.menu-box li a.sport36 ~ ul ul li a.active {
  background-color: var(--floorball_50);
  color: #fff !important;
}

.menu-box li a.sport37 ~ ul > li > a.active {
  background-color: var(--sumo_75);
  color: #fff !important;
}

.menu-box li a.sport37 ~ ul ul li a.active {
  background-color: var(--sumo_50);
  color: #fff !important;
}

.menu-box li a.sport38 ~ ul > li > a.active {
  background-color: var(--virtual-sports_75);
  color: #fff !important;
}

.menu-box li a.sport38 ~ ul ul li a.active {
  background-color: var(--virtual-sports_50);
  color: #fff !important;
}

.menu-box li a.sport39 ~ ul > li > a.active {
  background-color: var(--handball_75);
  color: #fff !important;
}

.menu-box li a.sport39 ~ ul ul li a.active {
  background-color: var(--handball_50);
  color: #fff !important;
}

.menu-box li a.sport40 ~ ul > li > a.active {
  background-color: var(--politics_75);
  color: #fff !important;
}

.menu-box li a.sport40 ~ ul ul li a.active {
  background-color: var(--politics_50);
  color: #fff !important;
}

.menu-box li a.sport41 ~ ul > li > a.active {
  background-color: var(--weather_75);
  color: #fff !important;
}

.menu-box li a.sport41 ~ ul ul li a.active {
  background-color: var(--weather_50);
  color: #fff !important;
}

.menu-box li a.sport42 ~ ul > li > a.active {
  background-color: var(--tv-games_75);
  color: #fff !important;
}

.menu-box li a.sport42 ~ ul ul li a.active {
  background-color: var(--tv-games_50);
  color: #fff !important;
}

.menu-box li a.sport43 ~ ul > li > a.active {
  background-color: var(--lottery_75);
  color: #fff !important;
}

.menu-box li a.sport43 ~ ul ul li a.active {
  background-color: var(--lottery_50);
  color: #fff !important;
}

.menu-box li a.sport44 ~ ul > li > a.active {
  background-color: var(--bowls_75);
  color: #fff !important;
}

.menu-box li a.sport44 ~ ul ul li a.active {
  background-color: var(--bowls_50);
  color: #fff !important;
}

.menu-box li a.sport45 ~ ul > li > a.active {
  background-color: var(--poker_75);
  color: #fff !important;
}

.menu-box li a.sport45 ~ ul ul li a.active {
  background-color: var(--poker_50);
  color: #fff !important;
}

.menu-box li a.sport46 ~ ul > li > a.active {
  background-color: var(--waterpolo_75);
  color: #fff !important;
}

.menu-box li a.sport46 ~ ul ul li a.active {
  background-color: var(--waterpolo_50);
  color: #fff !important;
}

.menu-box li a.sport47 ~ ul > li > a.active {
  background-color: var(--alpine-skiing_75);
  color: #fff !important;
}

.menu-box li a.sport47 ~ ul ul li.active {
  background-color: var(--alpine-skiing_50);
  color: #fff !important;
}

.menu-box li a.sport48 ~ ul > li > a.active {
  background-color: var(--sailing_75);
  color: #fff !important;
}

.menu-box li a.sport48 ~ ul ul li a.active {
  background-color: var(--sailing_50);
  color: #fff !important;
}

.menu-box li a.sport49 ~ ul > li > a.active {
  background-color: var(--hurling_75);
  color: #fff !important;
}

.menu-box li a.sport49 ~ ul ul li a.active {
  background-color: var(--hurling_50);
  color: #fff !important;
}

.menu-box li a.sport50 ~ ul > li > a.active {
  background-color: var(--ski-jumping_75);
  color: #fff !important;
}

.menu-box li a.sport50 ~ ul ul li a.active {
  background-color: var(--ski-jumping_50);
  color: #fff !important;
}

.menu-box li a.sport51 ~ ul > li > a.active {
  background-color: var(--bandy_75);
  color: #fff !important;
}

.menu-box li a.sport51 ~ ul ul li a.active {
  background-color: var(--bandy_50);
  color: #fff !important;
}

.menu-box li a.sport52 ~ ul > li > a.active {
  background-color: var(--motor-sports_75);
  color: #fff !important;
}

.menu-box li a.sport52 ~ ul ul li a.active {
  background-color: var(--motor-sports_50);
  color: #fff !important;
}

.menu-box li a.sport53 ~ ul > li > a.active {
  background-color: var(--baseball_75);
  color: #fff !important;
}

.menu-box li a.sport53 ~ ul ul li a.active {
  background-color: var(--baseball_50);
  color: #fff !important;
}

.menu-box li a.sport54 ~ ul > li > a.active {
  background-color: var(--rugby-union_75);
  color: #fff !important;
}

.menu-box li a.sport54 ~ ul ul li a.active {
  background-color: var(--rugby-union_50);
  color: #fff !important;
}

.menu-box li a.sport55 ~ ul > li > a.active {
  background-color: var(--rugby-league_75);
  color: #fff !important;
}

.menu-box li a.sport55 ~ ul ul li a.active {
  background-color: var(--rugby-league_50);
  color: #fff !important;
}

.menu-box li a.sport56 ~ ul > li > a.active {
  background-color: var(--curling_75);
  color: #fff !important;
}

.menu-box li a.sport56 ~ ul ul li a.active {
  background-color: var(--curling_50);
  color: #fff !important;
}

.menu-box li a.sport57 ~ ul > li > a.active {
  background-color: var(--darts_75);
  color: #fff !important;
}

.menu-box li a.sport57 ~ ul ul li a.active {
  background-color: var(--darts_50);
  color: #fff !important;
}

.menu-box li a.sport58 ~ ul > li > a.active {
  background-color: var(--americal-footbal_75);
  color: #fff !important;
}

.menu-box li a.sport58 ~ ul ul li a.active {
  background-color: var(--americal-footbal_50);
  color: #fff !important;
}

.menu-box li a.sport59 ~ ul > li > a.active {
  background-color: var(--snooker_75);
  color: #fff !important;
}

.menu-box li a.sport59 ~ ul ul li a.active {
  background-color: var(--snooker_50);
  color: #fff !important;
}

.menu-box li a.sport60 ~ ul > li > a.active {
  background-color: var(--gaelick-sports_75);
  color: #fff !important;
}

.menu-box li a.sport60 ~ ul ul li a.active {
  background-color: var(--gaelick-sports_50);
  color: #fff !important;
}

.menu-box li a.sport61 ~ ul > li > a.active {
  background-color: var(--lottery-specials_75);
  color: #fff !important;
}

.menu-box li a.sport61 ~ ul ul li a.active {
  background-color: var(--lottery-specials_50);
  color: #fff !important;
}

.menu-box li a.sport62 ~ ul > li > a.active {
  background-color: var(--football_75);
  color: #fff !important;
}

.menu-box li a.sport62 ~ ul ul li a.active {
  background-color: var(--football_50);
  color: #fff !important;
}

.menu-box li a.sport63 ~ ul > li > a.active {
  background-color: var(--special-bets_75);
  color: #fff !important;
}

.menu-box li a.sport63 ~ ul ul li a.active {
  background-color: var(--special-bets_50);
  color: #fff !important;
}

.menu-box li a.sport64 ~ ul > li > a.active {
  background-color: var(--egames_75);
  color: #fff !important;
}

.menu-box li a.sport64 ~ ul ul li a.active {
  background-color: var(--egames_50);
  color: #fff !important;
}

.menu-box li a.sport65 ~ ul > li > a.active {
  background-color: var(--grey-hounds_75);
  color: #fff !important;
}

.menu-box li a.sport65 ~ ul ul li a.active {
  background-color: var(--grey-hounds_50);
  color: #fff !important;
}

.sport1color {
  color: var(--football);
}

.sport2color {
  color: var(--tennis);
}

.sport3color {
  color: var(--boxing);
}

.sport4color {
  color: var(--cricket);
}

.sport5color {
  color: var(--golf);
}

.sport6color {
  color: var(--boxing);
}

.sport7color {
  color: var(--beach-volleyball);
}

.sport8color {
  color: var(--table-tennis);
}

.sport9color {
  color: var(--futsal);
}

.sport10color {
  color: var(--horse-racing);
}

.sport11color {
  color: var(--egames);
}

.sport12color {
  color: var(--grey-hounds);
}

.sport13color {
  color: var(--trotting);
}

.sport14color {
  color: var(--speedway);
}

.sport15color {
  color: var(--basketball);
}

.sport16color {
  color: var(--moto-gp);
}

.sport17color {
  color: var(--chess);
}

.sport18color {
  color: var(--vollyball);
}

.sport19color {
  color: var(--ice-hockey);
}

.sport20color {
  color: var(--equine-sports);
}

.sport21color {
  color: var(--australians-rules);
}

.sport22color {
  color: var(--badminton);
}

.sport23color {
  color: var(--formula-1);
}

.sport24color {
  color: var(--nascar);
}

.sport25color {
  color: var(--hockey);
}

.sport26color {
  color: var(--supercars);
}

.sport27color {
  color: var(--netball);
}

.sport28color {
  color: var(--surfing);
}

.sport29color {
  color: var(--cycling);
}

.sport30color {
  color: var(--gaelick-sports);
}

.sport31color {
  color: var(--biathlon);
}

.sport32color {
  color: var(--motorbikes);
}

.sport33color {
  color: var(--athletics);
}

.sport34color {
  color: var(--squash);
}

.sport35color {
  color: var(--basketball-3-3);
}

.sport36color {
  color: var(--floorball);
}

.sport37color {
  color: var(--sumo);
}

.sport38color {
  color: var(--virtual-sports);
}

.sport39color {
  color: var(--handball);
}

.sport40color {
  color: var(--politics);
}

.sport41color {
  color: var(--weather);
}

.sport42color {
  color: var(--tv-games);
}

.sport43color {
  color: var(--lottery);
}

.sport44color {
  color: var(--bowls);
}

.sport45color {
  color: var(--poker);
}

.sport46color {
  color: var(--waterpolo);
}

.sport47color {
  color: var(--alpine-skiing);
}

.sport48color {
  color: var(--sailing);
}

.sport49color {
  color: var(--hurling);
}

.sport50color {
  color: var(--ski-jumping);
}

.sport51color {
  color: var(--bandy);
}

.sport52color {
  color: var(--motor-sports);
}

.sport53color {
  color: var(--baseball);
}

.sport54color {
  color: var(--rugby-union);
}

.sport55color {
  color: var(--rugby-league);
}

.sport56color {
  color: var(--curling);
}

.sport57color {
  color: var(--darts);
}

.sport58color {
  color: var(--americal-footbal);
}

.sport59color {
  color: var(--snooker);
}

.sport60color {
  color: var(--gaelick-sports);
}

.sport61color {
  color: var(--lottery-specials);
}

.sport62color {
  color: var(--football);
}

.sport63color {
  color: var(--special-bets);
}

.sport64color {
  color: var(--egames);
}

.sport65color {
  color: var(--grey-hounds);
}

.lotto {
  background-color: var(--lotto);
}

.sport1,
.sport1:hover,
.sport1:focus,
.sport1:active {
  background-color: var(--football);
  color: #fff !important;
}

.sport2,
.sport2:hover,
.sport2:focus,
.sport2:active {
  background-color: var(--tennis);
  color: #fff !important;
}

.sport3,
.sport3:hover,
.sport3:focus,
.sport3:active {
  background-color: var(--boxing);
  color: #fff !important;
}

.sport4,
.sport4:hover,
.sport4:focus,
.sport4:active {
  background-color: var(--cricket);
  color: #fff !important;
}

.sport5,
.sport5:hover,
.sport5:focus,
.sport5:active {
  background-color: var(--golf);
  color: #fff !important;
}

.sport6,
.sport6:hover,
.sport6:focus,
.sport6:active {
  background-color: var(--boxing);
  color: #fff !important;
}

.sport7,
.sport7:hover,
.sport7:focus,
.sport7:active {
  background-color: var(--beach-volleyball);
  color: #fff !important;
}

.sport8,
.sport8:hover,
.sport8:focus,
.sport8:active {
  background-color: var(--table-tennis);
  color: #fff !important;
}

.sport9,
.sport9:hover,
.sport9:focus,
.sport9:active {
  background-color: var(--futsal);
  color: #fff !important;
}

.sport10,
.sport10:hover,
.sport10:focus,
.sport10:active {
  background-color: var(--horse-racing);
  color: #fff !important;
}

.sport11,
.sport11:hover,
.sport11:focus,
.sport11:active {
  background-color: var(--egames);
  color: #fff !important;
}

.sport12,
.sport12:hover,
.sport12:focus,
.sport12:active {
  background-color: var(--grey-hounds);
  color: #fff !important;
}

.sport13,
.sport13:hover,
.sport13:focus,
.sport13:active {
  background-color: var(--trotting);
  color: #fff !important;
}

.sport14,
.sport14:hover,
.sport14:focus,
.sport14:active {
  background-color: var(--speedway);
  color: #fff !important;
}

.sport15,
.sport15:hover,
.sport15:focus,
.sport15:active {
  background-color: var(--basketball);
  color: #fff !important;
}

.sport16,
.sport16:hover,
.sport16:focus,
.sport16:active {
  background-color: var(--moto-gp);
  color: #fff !important;
}

.sport17,
.sport17:hover,
.sport17:focus,
.sport17:active {
  background-color: var(--chess);
  color: #fff !important;
}

.sport18,
.sport18:hover,
.sport18:focus,
.sport18:active {
  background-color: var(--vollyball);
  color: #fff !important;
}

.sport19,
.sport19:hover,
.sport19:focus,
.sport19:active {
  background-color: var(--ice-hockey);
  color: #fff !important;
}

.sport20,
.sport20:hover,
.sport20:focus,
.sport20:active {
  background-color: var(--equine-sports);
  color: #fff !important;
}

.sport21,
.sport21:hover,
.sport21:focus,
.sport21:active {
  background-color: var(--australians-rules);
  color: #fff !important;
}

.sport22,
.sport22:hover,
.sport22:focus,
.sport22:active {
  background-color: var(--badminton);
  color: #fff !important;
}

.sport23,
.sport23:hover,
.sport23:focus,
.sport23:active {
  background-color: var(--formula-1);
  color: #fff !important;
}

.sport24,
.sport24:hover,
.sport24:focus,
.sport24:active {
  background-color: var(--nascar);
  color: #fff !important;
}

.sport25,
.sport25:hover,
.sport25:focus,
.sport25:active {
  background-color: var(--hockey);
  color: #fff !important;
}

.sport26,
.sport26:hover,
.sport26:focus,
.sport26:active {
  background-color: var(--supercars);
  color: #fff !important;
}

.sport27,
.sport27:hover,
.sport27:focus,
.sport27:active {
  background-color: var(--netball);
  color: #fff !important;
}

.sport28,
.sport28:hover,
.sport28:focus,
.sport28:active {
  background-color: var(--surfing);
  color: #fff !important;
}

.sport29,
.sport29:hover,
.sport29:focus,
.sport29:active {
  background-color: var(--cycling);
  color: #fff !important;
}

.sport30,
.sport30:hover,
.sport30:focus,
.sport30:active {
  background-color: var(--gaelick-sports);
  color: #fff !important;
}

.sport31,
.sport31:hover,
.sport31:focus,
.sport31:active {
  background-color: var(--biathlon);
  color: #fff !important;
}

.sport32,
.sport32:hover,
.sport32:focus,
.sport32:active {
  background-color: var(--motorbikes);
  color: #fff !important;
}

.sport33,
.sport33:hover,
.sport33:focus,
.sport33:active {
  background-color: var(--athletics);
  color: #fff !important;
}

.sport34,
.sport34:hover,
.sport34:focus,
.sport34:active {
  background-color: var(--squash);
  color: #fff !important;
}

.sport35,
.sport35:hover,
.sport35:focus,
.sport35:active {
  background-color: var(--basketball-3-3);
  color: #fff !important;
}

.sport36,
.sport36:hover,
.sport36:focus,
.sport36:active {
  background-color: var(--floorball);
  color: #fff !important;
}

.sport37,
.sport37:hover,
.sport37:focus,
.sport37:active {
  background-color: var(--sumo);
  color: #fff !important;
}

.sport38,
.sport38:hover,
.sport38:focus,
.sport38:active {
  background-color: var(--virtual-sports);
  color: #fff !important;
}

.sport39,
.sport39:hover,
.sport39:focus,
.sport39:active {
  background-color: var(--handball);
  color: #fff !important;
}

.sport40,
.sport40:hover,
.sport40:focus,
.sport40:active {
  background-color: var(--politics);
  color: #fff !important;
}

.sport41,
.sport41:hover,
.sport41:focus,
.sport41:active {
  background-color: var(--weather);
  color: #fff !important;
}

.sport42,
.sport42:hover,
.sport42:focus,
.sport42:active {
  background-color: var(--tv-games);
  color: #fff !important;
}

.sport43,
.sport43:hover,
.sport43:focus,
.sport43:active {
  background-color: var(--lottery);
  color: #fff !important;
}

.sport44,
.sport44:hover,
.sport44:focus,
.sport44:active {
  background-color: var(--bowls);
  color: #fff !important;
}

.sport45,
.sport45:hover,
.sport45:focus,
.sport45:active {
  background-color: var(--poker);
  color: #fff !important;
}

.sport46,
.sport46:hover,
.sport46:focus,
.sport46:active {
  background-color: var(--waterpolo);
  color: #fff !important;
}

.sport47,
.sport47:hover,
.sport47:focus,
.sport47:active {
  background-color: var(--alpine-skiing);
  color: #fff !important;
}

.sport48,
.sport48:hover,
.sport48:focus,
.sport48:active {
  background-color: var(--sailing);
  color: #fff !important;
}

.sport49,
.sport49:hover,
.sport49:focus,
.sport49:active {
  background-color: var(--hurling);
  color: #fff !important;
}

.sport50,
.sport50:hover,
.sport50:focus,
.sport50:active {
  background-color: var(--ski-jumping);
  color: #fff !important;
}

.sport51,
.sport51:hover,
.sport51:focus,
.sport51:active {
  background-color: var(--bandy);
  color: #fff !important;
}

.sport52,
.sport52:hover,
.sport52:focus,
.sport52:active {
  background-color: var(--motor-sports);
  color: #fff !important;
}

.sport53,
.sport53:hover,
.sport53:focus,
.sport53:active {
  background-color: var(--baseball);
  color: #fff !important;
}

.sport54,
.sport54:hover,
.sport54:focus,
.sport54:active {
  background-color: var(--rugby-union);
  color: #fff !important;
}

.sport55,
.sport55:hover,
.sport55:focus,
.sport55:active {
  background-color: var(--rugby-league);
  color: #fff !important;
}

.sport56,
.sport56:hover,
.sport56:focus,
.sport56:active {
  background-color: var(--curling);
  color: #fff !important;
}

.sport57,
.sport57:hover,
.sport57:focus,
.sport57:active {
  background-color: var(--darts);
  color: #fff !important;
}

.sport58,
.sport58:hover,
.sport58:focus,
.sport58:active {
  background-color: var(--americal-footbal);
  color: #fff !important;
}

.sport59,
.sport59:hover,
.sport59:focus,
.sport59:active {
  background-color: var(--snooker);
  color: #fff !important;
}

.sport60,
.sport60:hover,
.sport60:focus,
.sport60:active {
  background-color: var(--gaelick-sports);
  color: #fff !important;
}

.sport61,
.sport61:hover,
.sport61:focus,
.sport61:active {
  background-color: var(--lottery-specials);
  color: #fff !important;
}

.sport62,
.sport62:hover,
.sport62:focus,
.sport62:active {
  background-color: var(--football);
  color: #fff !important;
}

.sport63,
.sport63:hover,
.sport63:focus,
.sport63:active {
  background-color: var(--special-bets);
  color: #fff !important;
}

.sport64,
.sport64:hover,
.sport64:focus,
.sport64:active {
  background-color: var(--egames);
  color: #fff !important;
}

.sport65,
.sport65:hover,
.sport65:focus,
.sport65:active {
  background-color: var(--grey-hounds);
  color: #fff !important;
}

.sport66,
.sport66:hover,
.sport66:focus,
.sport66:active {
  background-color: var(--kabaddi);
  color: #fff !important;
}

.casino-tabs-admin {
  height: 50px;
  background-color: transparent;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 8px;
}

.casino-tabs-admin .nav-tabs {
  border: 0;
  margin-left: 30px;
  margin-right: 30px;
  position: relative;
  flex-wrap: nowrap;
  overflow: hidden;
  scroll-behavior: smooth;
  white-space: nowrap;
  padding-bottom: 0;
}

.casino-tabs-admin .casino-tabs-menu {
  background-color: #eaeaeab8;
  border-radius: 8px;
  position: relative;
  height: 44px;
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
}

.casino-tabs-admin .casino-tabs-menu .nav-tabs > li > a {
  color: #616161;
}

.casino-tabs-admin .casino-tabs-menu .nav-tabs .nav-link.active {
  background-color: #ddd;
  color: #000;
  font-weight: 600;
}

.casino-tabs-admin .nav-tabs-custom .nav-item {
  margin-bottom: 0;
}

.casino-tabs-admin .nav-tabs-custom .nav-item .nav-link:after {
  background: transparent;
}

.casino-tabs-admin .arrow-tabs {
  position: absolute;
  top: 0;
  height: 40px;
  justify-content: center;
  align-items: center;
  display: flex;
  display: -webkit-flex;
  font-size: 26px;
  padding: 0;
  background: #e0e0e0;
}

.casino-tabs-admin .arrow-tabs:hover {
  color: #000;
}

.casino-tabs-admin .arrow-tabs.arrow-left {
  left: 0;
}

.casino-tabs-admin .arrow-tabs.arrow-right {
  right: 0;
}

.flex-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-direction: column;
}

.ab20-result .casino-result-cards-item img {
  margin-right: 5px;
}

.custom-slider {
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  padding: 5px 35px;
  position: relative;
  border-radius: 8px;
  border: 2px solid #d2d2d2;
}

.custom-slider .casino-result-cards-item {
  margin-bottom: 0;
}

.custom-slider-inner {
  border: 0;
  position: relative;
  flex-wrap: nowrap;
  overflow: hidden;
  scroll-behavior: smooth;
  white-space: nowrap;
  width: 100%;
  padding-bottom: 0;
  border-radius: 8px;
}

.custom-slider .arrow-nav {
  position: absolute;
  color: #333;
  font-size: 30px;
  top: 0;
  background: #d2d2d2;
  height: 100%;
  display: flex;
  align-items: center;
}

.custom-slider .arrow-left {
  left: 0;
}

.custom-slider .arrow-right {
  right: 0;
}

.casino-cards-odds-title {
  background-color: #ddd;
  color: #000;
  padding: 5px;
}

.dt20 .casino-cards-odds-title {
  margin-top: 30px;
}

.teenpatti2 .tee2suit .casino-bl-box-item.suspended.lock-top:before {
  background-position: center;
}

.teenpatti2 .teen2eo .casino-bl-box-item.suspended.lock-top:before {
  background-position: center;
}

.carousal-23 .carousel-item {
  padding-top: 23.47% !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}

/*Pasa*/

.pasa .casino-video {
  background-image: linear-gradient(
    0deg,
    #100b1e 0%,
    #160d27 26.42%,
    #11091d 48.45%,
    #030309 100%
  );
}

.pasa .casino-video-title {
  /* min-width: 180px;
  padding: 5px;
  background-color: #f8f9fa35; */
}

.pasa .casino-video-title .casino-name {
  font-size: 14px;
  line-height: 1;
}

.pasa .casino-video-rid {
  font-size: 12px;
  line-height: 1;
  margin-top: 3px;
}

.pasa .casino-video .video-box-container {
  max-width: 100%;
  margin-left: auto;
}

.pasa .casino-video-cards {
  height: 80px;
}

.pasa .casino-nation-name {
  width: 100%;
  text-align: center;
}

.pasa .casino-bl-box {
  width: 100%;
}

.pasa .casino-bl-box-item {
  height: 48px;
}

.pasa .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 48px;
}

.pasa .pasa-fancy .casino-nation-name {
  background-color: transparent;
}

.pasa .pasa-sesssion .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
  text-align: left;
}

.pasa .pasa-sesssion .casino-bl-box {
  width: 50%;
}

.pasa .pasa-sesssion .casino-bl-box-item {
  height: 48px;
}

.pasa .pasa-sesssion .casino-box-odd {
  font-size: 18px;
  margin-top: 3px;
}

.pasa .pasa-cards .casino-nation-name {
  background-color: transparent;
}

.pasa .pasa-other-bets {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  align-items: flex-start;
}

.pasa .pasa-other-bet {
  width: 19%;
}

.pasa .pasa-other-bet .casino-nation-name {
  width: 100%;
  background-color: transparent;
}

.pasa .pasa-other-bet .casino-bl-box {
  width: 100%;
}

.pasa .pasa-other-bet .casino-bl-box-item {
  height: 48px;
  width: 100%;
}

/*Trap*/

/*Trap*/

.trap .casino-video-cards {
  height: 385px;
  width: 100px;
}

.trap .casino-video-cards span {
  color: #fff;
  font-size: 18px;
}

.trap .casino-video-cards span img {
  width: 30px;
}

.trap .casino-video-cards span .player-count {
  color: var(--text-fancy);
  font-weight: bold;
}

.trap .casino-video-cards span b {
  border-bottom: 1px solid var(--text-fancy);
}

.trap .casino-nation-name {
  background-image: url("../img/trape-bg.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-color: transparent;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #000;
  width: calc(100% - 148px);
}

.trap .casino-bl-box {
  width: auto;
}

.trap .casino-bl-box-item {
  height: 50px;
  width: 72px;
}

.trap .teen1daycasino-container {
  margin-bottom: 10px;
}

.trap .seven-up-down-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border: 2px solid #72bbef;
  /*background-color: #72BBEF40;*/
}

.trap .up-box {
  /*background-image: url('../img/trape-bg.png');*/
  background-image: url("../img/trape-back.png");
  background-size: cover;
  background-repeat: no-repeat;
  width: 50%;
  height: 50px;
  display: flex;
  align-items: center;
  color: #000;
  padding-left: 10px;
  padding-right: 40px;
  position: relative;
  justify-content: flex-end;
}

.trap .down-box {
  /*background-image: url('../img/trape-bg.png');*/
  background-image: url("../img/trape-back.png");
  background-size: cover;
  background-repeat: no-repeat;
  width: 50%;
  text-align: right;
  height: 50px;
  display: flex;
  align-items: center;
  color: #000;
  padding-right: 10px;
  padding-left: 40px;
  justify-content: flex-start;
  position: relative;
}

.trap .seven-box {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.trap .seven-box img {
  height: 70px;
}

.trap .up-down-odds {
  font-weight: bold;
  font-size: 18px;
}

.trap .up-box .up-down-book {
  position: absolute;
  left: 10px;
}

.trap .down-box .up-down-book {
  position: absolute;
  right: 10px;
}

.trap-number {
  position: relative;
  box-shadow: 0 0 10px;
  opacity: 0.5;
}

/*.trap .casino-nation-name .book-red,.trap .casino-nation-name .book-green,.trap .seven-up-down-box .book-red,.trap .seven-up-down-box .book-green
{
    background: rgba(0,0,0,0.5);
    padding: 0px 5px;
}*/

.jqk-box img {
  width: 30px;
}

.down-box.suspended.lock-top:before,
.up-box.suspended.lock-top:before {
  background-position: center;
}

/*Teenpatti 2 cards*/

.teenpatti2cards .casino-video-cards {
  width: auto;
}
.teenpatti2cards .casino-video .video-box-container {
  max-width: 100%;
}
.teenpatti2cards .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
}

.teenpatti2cards .casino-bl-box {
  width: 50%;
}

.teenpatti2cards .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 48px;
}

.teenpatti2cards .casino-bl-boxfull .casino-bl-box-item {
  width: 100%;
}

.teenpatti2cards .total-odds span {
  font-size: 12px;
}

.teenpatti2cards .total-odds .casino-box-odd {
  font-size: 18px;
  margin-top: 3px;
}

.teenpatti2cards .total-odds .casino-bl-box-item {
  height: 48px;
}

.teenpatti2cards .teenpatti2cardsextra {
  position: relative;
}

.teenpatti2cards .teenpatti2cardsextra .casino-bl-boxfull {
  width: 100%;
}

.teenpatti2cards .teenpatti2cardsextra .casino-bl-boxfull .casino-bl-box-item {
  height: 48px;
}

.teenpatti2cardsextra-book {
  position: absolute;
  right: 10px;
  bottom: 0;
}

.casino-vieo-rules {
  flex-wrap: wrap;
  background-color: #000;
  color: #fff;
  font-size: 12px;
  width: 0;
  top: 50px;
  right: 0;
  height: calc(100% - 160px);
  border-radius: 8px;
  display: none;
  position: absolute;
  text-align: left;
}

.casino-vieo-rules.show-rules {
  display: flex;
  max-width: calc(100% - 200px);
  width: 800px;
  z-index: 11;
}

.casino-vieo-rules .rules-header {
  background-color: #333;
  display: flex;
  justify-content: center;
  font-size: 16px;
  padding: 2px;
  width: 100%;
}

.casino-vieo-rules .rules-header i {
  position: absolute;
  right: 10px;
  top: 6px;
  cursor: pointer;
}

.casino-vieo-rules .rules-body {
  padding: 10px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #666666 #333333;
  height: calc(100% - 30px);
  line-height: normal;
  width: 100%;
}

.casino-vieo-rules .rules-body .table {
  color: #fff;
}

.casino-vieo-rules .rules-body::-webkit-scrollbar {
  width: 8px;
}

.casino-vieo-rules .rules-body::-webkit-scrollbar-track {
  background: #666666;
}

.casino-vieo-rules .rules-body::-webkit-scrollbar-thumb {
  background-color: #333333;
}

.sin-khal .casino-video {
  background-image: linear-gradient(
    0deg,
    #100b1e 0%,
    #160d27 26.42%,
    #11091d 48.45%,
    #030309 100%
  );
}

.sin-khal .casino-video-title {
  /* min-width: 180px;
  padding: 5px;
  background-color: #f8f9fa35; */
}

.sin-khal .casino-video-title .casino-name {
  font-size: 16px;
  line-height: 1;
}

.sin-khal .casino-video-rid {
  font-size: 14px;
  line-height: 1;
  margin-top: 3px;
}

.sin-khal .casino-video .video-box-container {
  max-width: 100%;
  margin-left: auto;
}

.sin-khal .casino-bl-box {
  position: relative;
  z-index: 9;
  width: auto;
}

.sin-khal .casino-bl-box-item {
  width: calc(25% - 3px);
  height: 40px;
  text-transform: uppercase;
  position: relative;
}

.sin-khal-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.sin-khal-box img {
  height: 100px;
  z-index: 10;
}

.sin-khal-box .casino-bl-box-item {
  width: 150px;
}

.sin-khal-box .casino-bl-box-item.back {
  margin-left: -4px;
  border-right: 0;
  border-radius: 0;
  border-left: 0;
}

.sin-khal-box .casino-bl-box-item.back:hover,
.sin-khal-box .casino-bl-box-item.back:focus {
  border-right: 0;
  border-left: 0;
  border-top-width: 2px;
  border-bottom-width: 2px;
}

.sin-khal-box .casino-bl-box-item.lay {
  margin-left: -4px;
  border-left: 0;
  border-radius: 0;
}

.sin-khal-box .casino-bl-box-item.lay:focus,
.sin-khal-box .casino-bl-box-item.lay:hover {
  border-left: 0;
  border-top-width: 2px;
  border-bottom-width: 2px;
  border-right-width: 2px;
}

.sin-khal-box-book {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
}

/*Muflis Teenpatti*/

.muflis .casino-video {
  background-image: linear-gradient(
    0deg,
    #100b1e 0%,
    #160d27 26.42%,
    #11091d 48.45%,
    #030309 100%
  );
}

.muflis .casino-video .video-box-container {
  max-width: 100%;
  margin-left: auto;
}

.muflis .casino-video-title {
  /* min-width: 180px;
  padding: 5px;
  background-color: #f8f9fa35; */
}

.muflis .casino-video-title .casino-name {
  font-size: 16px;
  line-height: 1;
}

.muflis .casino-video-rid {
  font-size: 14px;
  line-height: 1;
  margin-top: 3px;
}

.muflis .casino-nation-name {
  background-color: transparent;
  text-align: center;
}

.muflis .casino-nation-name,
.muflis .casino-bl-box {
  width: 100%;
}

.muflis .casino-bl-box-item {
  width: 100%;
  height: 40px;
}

/*Race to 17 Casino*/

.raceto17 .casino-video {
  background-image: linear-gradient(
    0deg,
    #100b1e 0%,
    #160d27 26.42%,
    #11091d 48.45%,
    #030309 100%
  );
}

.raceto17 .casino-video-title {
  /* min-width: 180px;
  padding: 5px;
  background-color: #f8f9fa35; */
}

.raceto17 .casino-video-title .casino-name {
  font-size: 16px;
  line-height: 1;
}

.raceto17 .casino-video-rid {
  font-size: 14px;
  line-height: 1;
  margin-top: 3px;
}

.raceto17 .casino-video .video-box-container {
  max-width: 100%;
  margin-left: auto;
}

.raceto17 .casino-video-cards {
  width: 85px;
  height: 265px;
}

.raceto17 .race-total {
  color: #fdcf13;
  font-size: 14px;
}

.raceto17 .casino-video-cards span img {
  margin-right: 8px;
  width: 30px;
}

.raceto17 .casino-nation-name,
.raceto17 .casino-bl-box {
  width: 100%;
}

.raceto17 .casino-nation-name {
  background-color: transparent;
  text-align: center;
}

.raceto17 .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 40px;
}

.raceto17 .casino-detail .col-3 {
  border-right: 2px solid grey;
}

.raceto17 .casino-detail .col-3:last-child {
  border-right: 0;
}

/*Teenpatti 20B*/

.teenpatti20b .casino-video {
  background-image: linear-gradient(
    0deg,
    #100b1e 0%,
    #160d27 26.42%,
    #11091d 48.45%,
    #030309 100%
  );
}

.teenpatti20b .casino-video-title {
  min-width: 180px;
  padding: 5px;
  background-color: #f8f9fa35;
}

.teenpatti20b .casino-video-title .casino-name {
  font-size: 16px;
  line-height: 1;
}

.teenpatti20b .casino-video-rid {
  font-size: 14px;
  line-height: 1;
  margin-top: 3px;
}

.teenpatti20b .casino-video .video-box-container {
  max-width: calc(100% - 190px);
  margin-left: auto;
}

.teenpatti20b .casino-detail .casino-nation-name.no-border {
  background-color: transparent !important;
}

.teenpatti20b .casino-bl-box {
  width: 100%;
}

.teenpatti20b .casino-bl-box-item {
  width: calc(25% - 3px);
  height: 40px;
  text-transform: uppercase;
  position: relative;
}

.teenpatti20b .casino-rb-box-container {
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 5px;
}

.teenpatti20b .casino-rb-box {
  width: calc(50% - 4px);
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  position: relative;
  flex-direction: column;
}

.teenpatti20b .casino-rb-box-player {
  width: 100%;
  text-align: left;
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-table);
  min-height: 46px;
  cursor: pointer;
  border-radius: 4px;
}

.teenpatti20b .casino-rb-box-player > div {
  padding: 0 8px;
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
}

.teenpatti20b .casino-rb-box-player img {
  height: auto;
  margin-left: 5px;
  width: 35px;
}

/*Note Number*/

.note .casino-video-cards {
  width: 60px;
  height: 285px;
}

.note .casino-video-cards span img {
  width: 30px;
}

.note .casino-nation-name,
.note .casino-bl-box {
  width: 100%;
}

.note .casino-nation-name {
  background-color: transparent;
  text-align: center;
  height: auto;
}

.note .casino-nation-name:first-child {
  height: 43px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.note .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 40px;
}

.note .note-baccarat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-wrap: wrap;
}

.note .note-baccarat .casino-bl-box-item {
  width: 100%;
}

.note .note-baccarat .casino-nation-name {
  height: auto;
}

.note-cards .casino-card-item {
  margin: 0;
  width: 20%;
  margin-bottom: 10px;
}

.note .oe-cards img {
  height: 30px;
}

/*Teenpatti 20-24*/

.teenpatti2024 .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.teenpatti2024 .casino-detail .casino-nation-name.no-border > div {
  display: flex;
  width: 100%;
}

.teenpatti2024 .casino-nation-name img {
  height: 30px;
}

.teenpatti2024 .casino-bl-box {
  width: 50%;
}

.teenpatti2024 .casino-bl-box-item {
  width: calc(50% - 2px);
}

.grecaptcha-badge {
  display: none !important;
}

.recaptchaTerms {
  color: #74788d !important;
}

.recaptchaTerms a {
  color: var(--text-fancy);
}

/*Kaun Banega Crorepati*/

.kbc .casino-video .video-box-container {
  max-width: 100%;
}

.kbc .casino-video-cards {
  height: 240px;
  width: 60px;
}

.kbc .casino-video-cards img {
  width: 30px;
}

.kbc .casino-nation-name,
.kbc .casino-bl-box {
  width: 100%;
}

.kbc .casino-nation-name {
  background-color: transparent;
  text-align: center;
}

.kbc .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 40px;
}

.kbc .kbc-btns {
  align-items: center;
}

.kbc .casino-box-row {
  padding: 5px;
}

.kbc .kbc-btns .casino-nation-name {
  background: transparent;
  border-radius: 0;
  color: #000;
  padding: 6px;
  border-bottom: 3px solid var(--back);
  text-align: center;
}

.kbc .kbc-btns .btn-group {
  width: 85%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.kbc .kbc-btns .btn {
  background-color: transparent;
  color: #000;
  border: 3px solid var(--back);
  width: calc(50% - 4px);
  flex: 0 0 auto;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-left: 1px;
  border-top: 0;
  border-radius: 0;
  font-weight: bold;
  font-size: 18px;
}

.kbc .kbc-btns .btn.suspended:after {
  border-radius: 0;
}

.kbc .kbc-btns.kbcothers .btn {
  width: calc(25% - 4px);
}

.kbc .kbc-btns .btn img {
  width: 30px;
}

.kbc .kbc-btns .btn.btn-primary {
  color: var(--text-white);
  opacity: 1;
  width: 130px;
  height: 130px;
  border-radius: 50% !important;
}

.kbc .kbc-btns .btn-hf {
  width: 100%;
}

.kbcbtesbox {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
}

.kbcbtesbox .bet-box {
  background: var(--bg-table-header);
  padding: 5px 10px;
  border-radius: 8px;
  margin-left: 3px;
  margin-right: 3px;
  width: calc(33.33% - 6px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #000;
  margin-bottom: 0;
}

.kbcbtesbox .bet-box span {
  flex: 1;
  text-align: center;
}

.kbcbtesbox .bet-box i {
  color: var(--text-red);
  cursor: pointer;
}

.kbcbtesbox .bet-input {
  width: calc(33.33% - 6px);
  margin-bottom: 10px;
}

.kbcbtesbox > div {
  width: calc(33.33% - 6px);
}

.kbcbtesbox .hfquitbtns {
  width: 96%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.kbcbtesbox .hfquitbtns .btn {
  width: 48%;
}

.kbcbtesbox.casino-place-bet-row .bet-box {
  padding: 0;
  font-weight: bold;
}

.kbcbtesbox.casino-place-bet-row {
  width: 96%;
  margin: 0 auto 0;
  border-bottom: 0;
  padding-bottom: 0;
}

.kbcbtesbox.casino-place-bet-row .bet-box {
  background-color: transparent;
}

.hfquitbtns {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.kbc .hfquitbtns .hbtn,
.casino-place-bet-box .hfquitbtns .hbtn {
  background-image: linear-gradient(-180deg, #03b37f 0%, #06553e 100%);
  border-color: #116f52 !important;
  border-width: 10px !important;
  border-top: 10px solid #131399;
  margin-right: 20px;
}

.kbc .hfquitbtns .fbtn,
.casino-place-bet-box .hfquitbtns .fbtn {
  background-image: linear-gradient(-180deg, #fc4242 0%, #6f0404 100%);
  border-color: #6f0404 !important;
  border-width: 10px !important;
  border-top: 10px solid #6f0404;
}

.hfquitbtns .fbtn.selected,
.kbc .hfquitbtns .hbtn.selected {
  border-color: var(--text-fancy) !important;
  box-shadow: 0 0 10px #fff !important;
}

.kbcbtesbox .hbtn {
  /*border: 1px solid #03B37F;*/
  color: #03b37f;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
}

.kbcbtesbox .fbtn {
  /*border: 1px solid #FC4242;*/
  color: #fc4242;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
}

.kbcbtesbox .fivebtn {
  /*border: 1px solid #FC4242;*/
  color: #115dbf;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
}

.kbc-result-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
}

.kbc-result-box .casino-box-row {
  width: calc(16.66% - 4px);
  margin-right: 4px;
}

.kbc-result-box .question-name {
  width: 100%;
  background: var(--bg-table-header);
  border-radius: 12px;
  color: #fff;
  padding: 6px;
  border: 1px solid var(--text-fancy);
  text-align: center;
}

.kbc-result-box .answer-name {
  width: 80%;
  padding: 6px;
  margin: 0 auto;
  color: #fff;
  text-align: center;
  border: 3px solid var(--back);
  border-top: 0;
}

.kbc-result-box .answer-name.true {
  background-color: #03b37f;
}

.kbc-result-box .answer-name.false {
  background-color: #fc4242;
}

.kbc-result-box .kbchf {
  width: 100%;
  text-align: center;
  color: #fff;
}

.kbc-result-box .kbchf .kbc-result-box-half {
  /*border: 1px solid #03B37F;*/
  color: #03b37f;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
}

.kbc-result-box .kbchf .kbc-result-box-full {
  /*border: 1px solid #FC4242;*/
  color: #fc4242;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
}

.kbc-result-box .kbchf .kbc-result-box-five {
  /*border: 1px solid #115DBF;*/
  color: #115dbf;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
}

.view-more-modal .kbcbtesbox .bet-box {
  width: calc(16.66% - 6px);
}

/*Teenpatti 1 card day*/

.teen1oneday .casino-nation-name {
  background-image: none !important;
}

.teen1oneday .casino-video-cards,
.teen1t20 .casino-video-cards {
  height: auto;
  width: auto;
}

.teen1oneday .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
}

.teen1oneday .casino-bl-box {
  width: 50%;
}

.teen1oneday .casino-bl-box-item {
  width: calc(50% - 2px);
}

.teen1oneday .casino-video-cards-container > div,
.teen1t20 .casino-video-cards-container > div {
  flex-wrap: wrap;
}

.teen1oneday .casino-video-cards-container > div > div,
.teent20 .casino-video-cards-container > div > div {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.teen1oneday .teen1daycasino-container {
  margin-bottom: 10px;
}

.teen1oneday .seven-up-down-box {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border: 2px solid #72bbef;
}

.teen1oneday .up-box {
  width: 50%;
  height: 50px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 40px;
  position: relative;
  justify-content: flex-end;
}

.teen1oneday .up-box .up-down-book {
  position: absolute;
  left: 10px;
}

.teen1oneday .down-box .up-down-book {
  position: absolute;
  right: 10px;
}

.teen1oneday .up-down-odds {
  font-weight: bold;
  font-size: 18px;
}

.teen1oneday .down-box {
  width: 50%;
  text-align: right;
  height: 50px;
  display: flex;
  align-items: center;
  padding-right: 10px;
  padding-left: 40px;
  justify-content: flex-start;
  position: relative;
}

.teen1oneday .seven-box {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.teen1oneday .seven-box img {
  height: 70px;
}

/*Teenpatti 1 Card 20-20*/

.teen1t20 .dtobx-top {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  position: relative;
}

.teen1t20 .dragon-box {
  width: 40%;
  padding: 6px;
  border: 2px solid var(--text-red);
  background-color: #fc42422e;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  padding-right: 60px;
  cursor: pointer;
}

.teen1t20 .flex-book {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}

.teen1t20 .dragon-box b,
.teen1t20 .tiger-box b {
  font-size: var(--font-18);
}

.teen1t20 .flex-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-direction: column;
}

.teen1t20 .tiebox {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  left: 40%;
  transform: translateX(-50%);
  padding: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-success);
  color: var(--text-white);
  flex-direction: column;
  justify-content: center;
  z-index: 10;
  cursor: pointer;
}

.teen1t20 .tiger-box {
  width: 40%;
  padding: 6px;
  border: 2px solid var(--text-fancy);
  background-color: #fdcf132e;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  padding-left: 60px;
  cursor: pointer;
}

.teen1t20 .pair-box {
  width: 18%;
  margin-left: 2%;
  background-color: var(--bg-tabs);
  padding: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  flex-wrap: wrap;
  cursor: pointer;
}

.teen1t20 .tiebox.suspended::after {
  border-radius: 50%;
}

/*Dus Ka Dum */

.duskadum .casino-video-cards {
  height: 55px;
  width: 200px;
}

.duskadum .casino-video-current-card {
  position: absolute;
  left: 200px;
  top: 50%;
  transform: translateY(-50%);
  background: #9191917d;
  padding: 5px;
}

.duskadum .casino-video-cards span img {
  height: auto;
  width: 32px;
}

.duskadum .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
  height: 52px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.duskadum .casino-bl-box {
  width: 50%;
}

.duskadum .casino-bl-box-item {
  width: calc(50% - 2px);
  height: 52px;
}

.duskadum .dkd-other {
  padding-top: 20px;
  position: relative;
  margin-top: 20px !important;
}

.duskadum .dkd-other::before {
  content: "";
  background-color: var(--text-fancy);
  height: 1px;
  width: 50%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -moz-transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  -o-transform: translateX(-50%);
  top: 0;
}

.duskadum .dkd-other .casino-bl-box {
  width: calc(25% - 3px);
  margin-right: 4px;
}

.duskadum .dkd-other .casino-bl-box:last-child {
  margin-right: 0;
}

.duskadum .dkd-other .casino-bl-box-item {
  width: 100%;
}

.duskadum .dum-slider {
  width: 85%;
  margin: 0 auto 10px;
}

.dum-result .dum-slider {
  max-width: 85%;
  position: relative;
  margin: 0 auto;
}

.duskadum .owl-carousel .owl-nav button.owl-next,
.duskadum .owl-carousel .owl-nav button.owl-prev {
  position: absolute;
  font-size: 30px;
  height: 100%;
  top: 0;
  margin: 0;
  width: 20px;
}

.duskadum .casino-video .owl-carousel .owl-nav button.owl-next,
.duskadum .casino-detail .owl-carousel .owl-nav button.owl-prev {
  left: -15px;
}

.duskadum .casino-video .owl-carousel .owl-nav button.owl-prev,
.duskadum .casino-detail .owl-carousel .owl-nav button.owl-next {
  right: -15px;
}

.duskadum .owl-theme .owl-nav {
  margin: 0;
}

.duskadum .casino-detail .owl-carousel .owl-stage {
  margin: 0 auto;
}

.duskadum .casino-video-current-card img {
  width: 32px;
}

.duskadum .dkd-total {
  padding: 5px;
  margin-right: 0;
  border: 1px solid var(--text-fancy);
  color: var(--text-white);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  margin-top: 5px;
  align-items: center;
}

.duskadum .dkd-total .numeric {
  font-size: 26px;
  margin-left: 5px;
}

/*1 Card Meter*/
.one-card-meter .casino-video .video-box-container {
  max-width: 100%;
}
.one-card-meter .casino-video-cards {
  height: auto;
  width: auto;
}

.one-card-meter .casino-detail {
  padding: 30px 5px;
}

.one-card-meter .meter-btns {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.one-card-meter .meter-btns .meter-btn-box {
  width: 100%;
}

.one-card-meter .meter-btns .meter-btn-box.suspended::after {
  background-color: #737574d6;
  z-index: 1;
}

.one-card-meter .meter-btns .meter-btn {
  width: 48%;
}

.one-card-meter .meter-btns .meter-btn .btn-fighter-1 {
  transition: all 0.5s;
  position: relative;
  width: 100%;
  height: 70px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 0;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  -ms-border-radius: 0;
  -o-border-radius: 0;
  z-index: 1;
}

.one-card-meter .meter-btns .meter-btn .btn-fighter-1 img {
  transform: rotate(90deg);
  height: 40px;
  margin-left: 10px;
}

.one-card-meter .meter-btns .meter-btn .btn-fighter-1::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--back);
  border-radius: 0;
  z-index: -2;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  -ms-border-radius: 0;
  -o-border-radius: 0;
  border: 3px solid #e22739;
  box-shadow: 0 0px 6px #c8c8c8;
}

.one-card-meter .meter-btns .meter-btn .btn-fighter-2 {
  transition: all 0.5s;
  position: relative;
  width: 100%;
  height: 70px;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
  -ms-transition: all 0.5s;
  -o-transition: all 0.5s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 0;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  -ms-border-radius: 0;
  -o-border-radius: 0;
  z-index: 1;
}

.one-card-meter .meter-btns .meter-btn .btn-fighter-2 img {
  transform: rotate(270deg);
  height: 40px;
  margin-right: 10px;
  -webkit-transform: rotate(270deg);
  -moz-transform: rotate(270deg);
  -ms-transform: rotate(270deg);
  -o-transform: rotate(270deg);
}

.one-card-meter .meter-btns .meter-btn .btn-fighter-2::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--back);
  border-radius: 0;
  z-index: -2;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  -ms-border-radius: 0;
  -o-border-radius: 0;
  border: 3px solid #ecc116;
  box-shadow: 0 0px 6px #c8c8c8;
}

.meter_mm_book {
  display: flex;
  justify-content: space-between;
}

/*Virtual Casino Design Start*/

.vcasino .casino-video {
  border-radius: 0;
}

.vcasino .casino-video-last-results {
  position: relative;
  top: 0;
  background-color: transparent;
  justify-content: center;
  width: 100%;
  right: 0;
  padding: 0;
  margin-top: 10px;
  height: auto;
  margin-left: 0;
}

.vcasino .casino-video .video-box-container {
  max-width: 100%;
}

.vcasino .casino-video .video-box {
  min-height: 200px;
  padding-bottom: 0;
}

.vcasino .progress {
  border-radius: 0;
  height: 6px;
  background-color: #2e3439;
}

.vcasino .vcasino-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: absolute;
  left: 50%;
  width: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.vcasino .player-card {
  position: relative;
}

.vcasino .player-card img {
  width: 50px;
}
.vcasino .vcasino-cards img {
  width: 50px;
}
.vcasino .player-card span {
  width: auto;
}

.vcasino .vcasino-cards .v-winner {
  position: absolute;
  left: -70px;
  margin-top: 15px;
  width: 60px;
}

.vcasino .vcasino-cards .playerb-card .v-winner {
  position: absolute;
  right: -70px;
  width: 60px;
  left: unset;
}

.vcasino .casino-detail {
  background-color: #fadda7;
  border-radius: 0;
}

.vcasino .casino-vieo-rules.show-rules {
  min-height: 50vh;
}

.vcasino .casino-video-last-results a.result-more {
  width: 35px;
}

/*Virtual 1Day Teenpatti Starts*/

.vteen1day .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 60%;
  margin: 0 auto;
}

.vteen1day .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.vcasino .playera {
  color: var(--text-red) !important;
  font-weight: bold;
  font-size: 18px;
}

.vcasino .playerb {
  color: var(--text-green) !important;
  font-weight: bold;
  font-size: 18px;
}

.vcasino .tie {
  color: #ffffff !important;
  font-weight: bold;
  font-size: 18px;
}

.vteen1day .odds-section {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 10px;
}

.vteen1day .odds-box {
  width: 33.3%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
}

.vteen1day .odds-box .casino-bl-box-item {
  width: calc(50% - 2px);
}

.others-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.vteen1day .others-odds .odds-box {
  width: 16.66%;
  align-items: center;
}

.vteen1day .others-odds .odds-box .casino-bl-box-item {
  width: calc(100% - 4px);
}

/*Virtual 1Day Teenpatti End*/

/*Virtual 20 Teenpatti Starts*/

.vteen20 .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 60%;
  margin: 0 auto;
}

.vteen20 .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.vteen20 .odds-section {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 10px;
}

.vteen20 .odds-box {
  width: 33.3%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
}

.vteen20 .odds-box img {
  height: 25px;
}

.vteen20 .odds-box .casino-bl-box-item {
  width: calc(100% - 2px);
}

.vteen20 .others-odds .odds-box .casino-bl-box-item {
  flex-wrap: wrap;
}

.vteen20 .others-odds .casino-rb-box {
  width: calc(25% - 8px);
  margin-right: 8px;
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  position: relative;
  flex-direction: column;
}

.vteen20 .others-odds .casino-rb-box-player {
  width: 100%;
  text-align: left;
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  align-items: center;
  min-height: 46px;
  cursor: pointer;
  border-radius: 4px;
  position: relative;
}

.vteen20 .casino-rb-box-player > div {
  padding: 0 8px;
  display: flex;
  display: -webkit-flex;
  flex-wrap: wrap;
}

.vteen20 .casino-rb-box-player img {
  margin-left: 5px;
  width: 22px;
}

.vteen20 .casino-rb-box-player-range {
  justify-content: flex-end;
  display: flex;
  display: -webkit-flex;
  width: 100%;
  margin-top: 5px;
}

/*Virtual 20 Teenpatti End*/

/*Dragon Tiger 1day Starts*/

.vdt1day .odds-title,
.vdt20 .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 75%;
  margin: 0 auto;
}

.vdt1day .main-odds,
.vdt20 .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 85%;
  margin: 0 auto;
  position: relative;
}

.vdt20 .main-odds {
  margin-top: 100px;
}

.vdt1day .dpt-box,
.vdt20 .dpt-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 5px;
  border-radius: 8px;
  width: 30%;
  height: 50px;
  cursor: pointer;
  position: relative;
}

.vdt20 .dpt-box {
  height: 50px;
}

.back-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 5px;
  border-radius: 8px;
  width: 24%;
  background-color: transparent;
  border: 2px solid var(--back);
  margin-bottom: 30px;
  height: 44px;
  cursor: pointer;
  position: relative;
  align-items: center;
}

.lay-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 5px;
  border-radius: 8px;
  width: 24%;
  background-color: transparent;
  border: 2px solid var(--lay);
  margin-bottom: 4vh;
  height: 6vh;
  cursor: pointer;
  align-items: center;
  position: relative;
}

.dragon-box {
  background-color: #ef05181a;
  border: 2px solid #f46a59;
}

.dpt-box.tie-box {
  position: absolute;
  top: -75px;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
}

.tie-box {
  background-color: #0041a21a;
  border: 2px solid #0041a2;
}

.dragon-box > div:first-child,
.pair-box > div:first-child,
.tie-box > div:first-child,
.tiger-box > div:first-child,
.back-box > div:first-child {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 90%;
}

.dragon-box .dt-name,
.pair-box .dt-name,
.tie-box .dt-name,
.tiger-box .dt-name {
  font-size: 18px;
  font-weight: bold;
  color: #000;
  display: flex;
  align-items: center;
  position: relative;
}

.vdt1day .dragon-box .dt-odds,
.vdt1day .tiger-box .dt-odds,
.vdt1day .pair-box .dt-odds {
  width: 55%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.dragon-box .dt-odds,
.pair-box .dt-odds,
.tie-box .dt-odds,
.tiger-box .dt-odds {
  font-size: 16px;
  font-weight: bold;
  color: #000;
}

.vdt1day .dragon-box .dt-odds .back-box,
.vdt1day .tiger-box .dt-odds .back-box,
.vdt1day .pair-box .dt-odds .back-box {
  background-color: var(--back);
}

.vdt1day .dragon-box .dt-odds .back-box,
.vdt1day .dragon-box .dt-odds .lay-box,
.vdt1day .tiger-box .dt-odds .back-box,
.vdt1day .tiger-box .dt-odds .lay-box {
  height: auto;
  justify-content: center;
  width: 49%;
  margin-bottom: 0;
}

.vdt1day .dragon-box .dt-odds .lay-box,
.vdt1day .tiger-box .dt-odds .lay-box {
  background-color: var(--lay);
}

.dragon-box .dt-book,
.pair-box .dt-book,
.dt-book,
.tie-box .dt-book,
.tiger-box .dt-book,
.back-box .dt-book {
  font-size: 14px;
  text-align: center;
  position: absolute;
  bottom: -25px;
  left: 0;
}

.vlucky7 .even-box .v-min-max {
  position: absolute;
  bottom: -25px;
  right: 0;
  width: 100%;
  text-align: right;
}

.pair-box {
  background-color: #0041a21a;
  border: 2px solid #0041a2;
}

.vdt1day .pair-box .dt-odds .back-box {
  height: auto;
  justify-content: center;
  width: 100%;
  margin-bottom: 0;
}

.tiger-box {
  background-color: #00a2001a;
  border: 2px solid #00a200;
}

.vdt1day .other-odds,
.vdt20 .other-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  margin-top: 5vh;
}

.dragon-section {
  /*background-image: linear-gradient(to right, transparent, #EF051880);*/
  width: 49%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 5px;
}

.lh-box > div:first-child,
.even-box > div:first-child {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}

.back-box .dt-name {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  color: #fff;
}

.back-box .dt-odds {
  font-size: 16px;
  font-weight: bold;
}

.lh-box .dt-book,
.back-box .dt-book {
  margin-top: 0.5vh;
  font-size: 2vh;
}

.tiger-section {
  /*background-image: linear-gradient(to right, #00A20080, transparent);*/
  width: 49%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 5px;
}

.back-box .dt-name img {
  height: 22px;
  margin-right: 5px;
}

.vcasino-card-box-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 2vh;
}

.vcasino-card-box-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  justify-content: center;
  width: 100%;
  margin-top: 2vh;
}

.vcasino-card-box {
  width: 14%;
  cursor: pointer;
  text-align: center;
}

.vcasino-card-box img {
  height: 50px;
}

.vcasino-card-odds {
  width: auto;
  font-weight: bold;
  font-size: 18px;
  border: 2px solid #000;
  padding: 8px;
}

/*Dragon Tiger 1day End*/

/*Lucky7 Virtual Statrs*/

.vlucky7 .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 75%;
  margin: 0 auto;
  margin-top: 2vh;
  position: relative;
}

.lh-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 5px;
  border-radius: 8px;
  width: 30%;
  height: 50px;
  cursor: pointer;
  position: relative;
}

.low-box {
  background-color: #ef05181a;
  border: 2px solid #f46a59;
}

.lh-box > div:first-child,
.even-box > div:first-child {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.lh-box .dt-name {
  font-size: 2.5vh;
  font-weight: bold;
  color: #000;
}

.lh-box .dt-odds {
  font-size: 2.5vh;
  font-weight: bold;
  color: #000;
}

.lh-box .dt-book,
.back-box .dt-book {
  margin-top: 0.5vh;
  font-size: 2vh;
}

.high-box {
  background-color: #00a2001a;
  border: 2px solid #00a200;
}

.vlucky7 .other-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 75%;
  margin: 0 auto;
  margin-top: 5vh;
}

.vlucky7 .other-odds .back-box {
  width: 24%;
}

.lh-box .dt-book,
.back-box .dt-book {
  margin-top: 5px;
  font-size: 14px;
}

.vlucky7 .back-box .dt-name img {
  margin-right: 0.5vh;
}

.vlucky7 .vcasino-card-box-top {
  width: 100%;
  justify-content: space-between;
  margin-top: 2vh;
}

.vcasino-card-bhav {
  font-size: 2vh;
  font-weight: bold;
}

.vlucky7 .vcasino-card-box-top .vcasino-card-box {
  width: 7.5%;
}

.vlucky7 .vcasino-card-box-top .vcasino-card-box > div:last-child {
  margin-top: 0.5vh;
}

.vlucky7 .vcasino-card-box img {
  height: 8vh;
}

/*Lucky7 Virtual Ends*/

/*Virtual Casino Muflis Starts*/

.vmuflis.vcasino .casino-detail {
  background-image: linear-gradient(to right, #555, #333, #555);
}

.vmuflis.virtual-casino-container {
  color: #fff;
}

.vmuflis .table-actions,
.vmuflis .decks-block,
.vmuflis .decks-mask-block,
.vmuflis .cards-showing-block {
  width: 97vh;
}

.vmuflis .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 60%;
  margin: 0 auto;
  margin-bottom: 0;
}

.vmuflis .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 75%;
  margin: 0 auto;
  margin-top: 0;
}

.vmuflis .odds-section {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 1.5vh;
}

.vmuflis .vodds-box {
  width: 33.3%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  font-size: 18px;
  align-items: center;
  color: #fff;
}

.vmuflis .vodds-box .casino-bl-box {
  width: 100%;
}

.vmuflis .vodds-box .casino-bl-box-item.back {
  background-color: transparent;
  border: 2px solid var(--back);
}

.vmuflis .vodds-box .casino-bl-box-item {
  width: calc(100% - 2px);
  height: 50px;
  color: #fff;
}

.vmuflis .vodds-box .casino-bl-box-item span {
  font-weight: normal;
  font-size: 14px;
  height: auto;
  line-height: 1;
  color: #fff;
}

.vmuflis .vodds-box .casino-bl-box-item .casino-box-odd {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  height: auto;
  margin-bottom: 0;
  color: #fff;
}

.vmuflis .teen20rules {
  position: absolute;
  bottom: 0;
  right: 0;
  max-width: 25%;
  transform: perspective(900px) rotateX(10deg) scale(1) translateZ(-100px);
  bottom: -4vh;
}

.vmuflis .teen20rules .table {
  border: 1px solid #fff !important;
  background-color: transparent;
  color: #fff;
}

.vmuflis .teen20rules .table td,
.vmuflis .teen20rules .table th {
  border-bottom: 1px solid #fff !important;
  border-right: 1px solid #fff !important;
  border-top: 1px solid #fff !important;
  border-left: 1px solid #fff;
  font-size: 2vh;
  vertical-align: middle;
  padding: 0.5vh;
}

.vmuflis .teen20rules .table thead {
  background-color: transparent;
  color: #fff;
}

.vmuflis .teen20rules .table thead th {
  font-size: 18px;
}

.vmuflis .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.vmuflis .vodds-box .fa-info-circle {
  color: #fff !important;
}

/*Virtual Casino Muflis Ends*/

/*Virtual Casino Race to 17 Starts*/

.vraceto17.vcasino .casino-detail {
  background-image: linear-gradient(to right, #555, #333, #555);
  position: relative;
}

.vraceto17 .table-actions,
.vraceto17 .decks-block,
.vraceto17 .decks-mask-block,
.vraceto17 .cards-showing-block {
  width: 130vh !important;
  max-width: 100% !important;
}

.vraceto17.virtual-casino-container {
  color: #fff;
}

.vraceto17 .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 75%;
  margin: 0 auto;
}

.vraceto17 .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 90%;
  margin: 0 auto;
  /*margin-top: 10vh;*/
}

.vraceto17 .vodds-box {
  width: 49%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  font-size: 2.3vh;
  margin-bottom: 2vh;
}

.vraceto17 .vrt17-odd-name {
  font-size: 16px;
  margin-bottom: 5px;
  color: #fff;
  position: relative;
}

.vraceto17 .vodds-box .casino-bl-box {
  width: 100%;
}

.vraceto17 .vodds-box .casino-bl-box-item {
  width: calc(50% - 4px);
  margin-top: 0;
  color: #fff;
  height: 40px;
  margin-right: 4px;
}

.vraceto17 .vodds-box .casino-bl-box-item.back {
  background-color: transparent;
  border: 2px solid var(--back);
}

.vraceto17 .vodds-box .casino-bl-box-item.lay {
  background-color: transparent;
  border: 2px solid var(--lay);
}

.vraceto17 .odds-book {
  font-size: 14px;
  margin-top: 0.5vh;
  color: #fff;
}

.vraceto17 .arrow17 {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 7vh;
  margin-top: 0;
}

.vraceto17 .arrow17 > div {
  border: 3px solid #bf8636;
  border-radius: 50%;
  margin-right: 10px;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;
}

.vraceto17 .arrow17 img {
  height: 5vh;
}

.vraceto17 .vcard-total {
  position: absolute;
  left: 20%;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.vraceto17 .vcard-total > div:first-child {
  font-size: 18px;
  width: 100%;
  margin-bottom: 5px;
  text-align: center;
}

.vraceto17 .vcard-total > div:last-child {
  margin-left: 10px;
  border: 2px solid #ff8f00;
  border-radius: 50%;
  padding: 5px;
  height: 35px;
  width: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
}

.vraceto17 .vodds-box .casino-bl-box-item .casino-box-odd {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  height: auto;
  margin-bottom: 0;
  color: #fff;
}

.vraceto17 .vodds-box .fa-info-circle {
  color: #fff !important;
}

.vcasino.vraceto17 .vcasino-cards {
  justify-content: center;
  width: 100%;
}

.vcasino.vraceto17 .vcasino-cards img {
  margin-right: 5px;
}

.vraceto17 .total-point {
  color: #fff;
}

/*Virtual Casino Race to 17 Ends*/

/*Virtual Casino Amar Akbar Anthony Starts*/

.vaaa.vcasino .casino-detail {
  /*background-image: url('../img/vcasino-bg2.jpg');*/
  background-image: linear-gradient(to right, #555, #333, #555);
}

.vaaa .virtual-casino-odds {
  margin-top: -40px;
}

.vaaa.virtual-casino-container {
  color: #fff;
}

.vaaa.vcasino .tie {
  color: #fba500 !important;
}

.vaaa .table-actions,
.vaaa .decks-block,
.vaaa .decks-mask-block,
.vaaa .cards-showing-block {
  width: 130vh !important;
  max-width: 100% !important;
}

.vaaa .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 75%;
  margin: 0 auto;
}

.vaaa .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  margin-top: 0;
}

.vaaa .vodds-box {
  width: 32%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  font-size: 2.3vh;
}

.vaaa .vodds-box .casino-bl-box {
  width: 100%;
}

.vaaa .vodds-box .casino-bl-box-item {
  width: calc(50% - 8px);
  margin-top: 0;
  color: #fff;
  height: 40px;
  margin-right: 8px;
}

.vaaa .vodds-box .casino-bl-box-item.back {
  background-color: transparent;
  border: 2px solid var(--back);
}

.vaaa .vodds-box .casino-bl-box-item.lay {
  background-color: transparent;
  border: 2px solid var(--lay);
}

.vaaa .vodds-box .casino-bl-box-item .casino-box-odd {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  height: auto;
  margin-bottom: 0;
  color: #fff;
}

.vaaa .other-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  margin-top: 3vh;
}

.vaaa .other-odds .back-box {
  width: 49%;
  align-content: center;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
}

.vaaa .other-odds .oe-box,
.vaaa .other-odds .color-box,
.vaaa .other-odds .uo-box {
  width: 32%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.vaaa .vcasino-card-box-top {
  width: 100%;
  justify-content: center;
  margin-top: 2vh;
}

.vaaa .vcasino-card-odds {
  width: 10%;
  font-size: 16px;
  color: #fff;
  padding: 4px;
  text-align: center;
}

.vaaa .vcasino-card-box-top {
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-top: 2vh;
}

.vaaa .vcasino-card-box-top .vcasino-card-box {
  width: 7.5%;
}

.vaaa .vcasino-card-box img {
  height: 7vh;
}

.vaaa .vcasino-card-box-top .vcasino-card-box > div:last-child {
  margin-top: 5px;
  font-size: 12px;
  color: #fff;
}

.vaaa .vcasino-card-odds {
  border: 2px solid #fff;
}

.vaaa .odds-book {
  font-size: 14px !important;
  margin-top: 5px;
  color: #fff;
}

.vaaa .virtual-casino-odds .odds-book.book-red,
.vaaa .virtual-casino-odds .dt-book.book-red {
  color: #ff172b !important;
}

.vaaa .virtual-casino-odds .odds-book.book-green,
.vaaa .virtual-casino-odds .dt-book.book-green {
  color: #18ca18 !important;
}

.vaaa .vcasino-last-results span.vresulta {
  color: #fc4242;
}

.vaaa .vcasino-last-results span.vresultb {
  color: #fba500;
}

.vaaa .vcasino-last-results span.vresultc {
  color: #00a200;
}

.vcasino .odds-title .playera,
.vcasino .odds-title .playerb,
.vcasino .odds-title .tie {
  font-size: 3vh;
  width: 33%;
  text-align: center;
}

.vaaa .vcasino-card-box .suspended:after {
  border-radius: 0;
  transform: perspective(1800px) rotateX(0deg) scale(1) translateZ(70px);
}

.vcasino .playera > div:first-child,
.vcasino .playerb > div:first-child,
.vcasino .tie > div:first-child {
  color: #fff;
  margin-bottom: 0.5vh;
}

.winner-animation {
  /*transform: perspective(900px) rotateX(-8deg) scale(2) translateZ(100px) translateX(-50%) translateY(-50%);
    transition: 1.5s;
    position: absolute;
    left: 50%;
    top: 50%;*/
  z-index: 1000;
  /*background: #000;
    padding: 5px;*/
  animation-name: winnerani;
  animation-duration: 3s;
  /*animation-iteration-count: infinite;*/
  animation-timing-function: ease-in-out;
}

@keyframes winnerani {
  0% {
    transform: scale(1);
  }
  50% {
    /*transform: translateX(-50%) translateY(-50%);
        position: absolute;
        left: 50%;
        top: 50%;*/
    transform: scale(2) perspective(1800px) rotateX(40deg);
  }
  100% {
    transform: scale(1);
  }
}

.vaaa .odds-book.book-red,
.vaaa .dt-book.book-red {
  color: #f43241;
}

.vaaa .odds-book.book-green,
.vaaa .dt-book.book-green {
  color: #15ee15;
}

.vaaa .back-box .dt-odds {
  color: #fff;
}

.vaaa.vcasino .tie {
  color: #fba500 !important;
}

.aaa-min-max {
  color: #fff;
  font-size: 12px;
}

.vaaa .odds-book.book-red,
.vaaa .dt-book.book-red {
  color: #f42727 !important;
}

.vaaa .odds-book.book-green,
.vaaa .dt-book.book-green {
  color: #1bd01b !important;
}

.vaaa .lh-box .dt-book,
.vaaa .back-box .dt-book {
  color: #fff;
}

/*Virtual Casino Amar Akbar Anthony Ends*/

/*Virtual Casino Bollywood Table Starts*/

.vbt .table-actions,
.vbt .decks-block,
.vbt .decks-mask-block,
.vbt .cards-showing-block {
  width: 130vh !important;
  max-width: 100% !important;
}

.vbt .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 auto;
}

.vbt.vcasino .tie {
  width: 16%;
}

.vbt .casino-detail {
  background-image: linear-gradient(to right, #555, #333, #555);
}

.vbt.virtual-casino-container {
  color: #fff;
}

.vbt.vcasino .playera > div:first-child,
.vbt.vcasino .playerb > div:first-child,
.vbt.vcasino .tie > div:first-child {
  color: #fdcf13 !important;
}

.vbt.vcasino .playera,
.vbt.vcasino .playerb,
.vbt.vcasino .tie {
  font-size: 12px;
  color: #fdcf13 !important;
}

.vbt.vcasino .playera > div,
.vbt.vcasino .playerb > div,
.vbt.vcasino .tie > div {
  line-height: 1;
}

.vbt .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  margin: 0 auto;
  margin-top: 5px;
}

.vbt .vodds-box {
  width: 16%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  font-size: 2.3vh;
}

.vbt .vodds-box .casino-bl-box {
  width: 100%;
}

.vbt .vodds-box .casino-bl-box-item {
  width: calc(100% - 4px);
  margin-top: 0;
  color: #fff;
  height: 40px;
  margin-right: 4px;
  margin-bottom: 4px;
}

.vbt .vodds-box .casino-bl-box-item.back {
  background-color: transparent;
  border: 2px solid var(--back);
}

.vbt .vodds-box .casino-bl-box-item.lay {
  background-color: transparent;
  border: 2px solid var(--lay);
}

.vbt .vodds-box .casino-bl-box-item .casino-box-odd {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  height: auto;
  margin-bottom: 0;
  color: #fff;
}

.vbt .odds-book,
.vbt .dt-book {
  font-size: 12px !important;
  color: #fff;
}

.vbt .odds-book.book-red,
.vbt .dt-book.book-red {
  color: #ff3143 !important;
}

.vbt .odds-book.book-green,
.vbt .dt-book.book-green {
  color: #18ca18 !important;
}

.vbt .other-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin: 0 auto;
  margin-top: 1vh;
}

.vbt .other-odds .vodds-box {
  width: 19%;
}

.vbt .other-odds .back-box {
  width: 19%;
  flex-wrap: nowrap;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.vbt .other-odds .vodds-box .casino-bl-box-item {
  width: calc(50% - 4px);
}

.vbt .vcasino-card-box img {
  height: 6vh;
}

.vbt .vcasino-card-odds {
  border: 2px solid #fff;
  width: 20%;
  font-size: 16px;
  padding: 4px;
  color: #fff;
  text-align: center;
}

.vbt .vcasino-card-box-container {
  width: 40%;
  justify-content: center;
  align-items: center;
  margin-top: 0;
  margin-left: auto;
  margin-right: auto;
}

.vbt .vcasino-card-box-container .vcasino-card-box-top {
  width: 80%;
  justify-content: center;
  align-items: center;
}

.vbt .vcasino-card-box-top .vcasino-card-box > div:last-child {
  margin-top: 5px;
  font-size: 12px;
  color: #fff;
}

.vbt .vbt-odd-name {
  font-size: 16px;
  margin-bottom: 5px;
  color: #fff;
}

.odds-title > div {
  width: 16%;
  text-align: center;
}

.odds-title .card-character {
  font-family: Card Characters;
  font-size: 22px;
  margin-top: 3px;
  margin-bottom: 3px;
}

.odds-title .red-card {
  color: red;
}

.odds-title .black-card {
  color: black;
}

.vaaa .vcasino-card-box .suspended:after {
  border-radius: 0;
  transform: perspective(1800px) rotateX(0deg) scale(1) translateZ(50px);
}

.vbt .vcasino-card-box .suspended::after {
  border-radius: 0;
  transform: perspective(1800px) rotateX(0deg) scale(1) translateZ(50px);
}

.vbt .odds-title {
  align-items: flex-end;
  margin-bottom: 10px;
}

.vbt .back-box .dt-odds {
  color: #fff;
}

.vbt .color-box {
  width: 38%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.vbt .other-odds .color-box .back-box {
  width: 49%;
}

.bt-min-max {
  color: #fff;
  font-size: 12px;
}

.vbt .ddb-box {
  width: 19%;
}

.vbt .other-odds .ddb-box .back-box {
  width: 100%;
}

.vbt.vcasino .playera > div:first-child,
.vbt.vcasino .playerb > div:first-child,
.vbt.vcasino .tie > div:first-child {
  font-size: 18px;
}

.vaaa .casino-video-last-results span,
.vaaa .casino-video-last-results a,
.vbt .casino-video-last-results span,
.vbt .casino-video-last-results a,
.vmuflis .casino-video-last-results span,
.vmuflis .casino-video-last-results a,
.vraceto17 .casino-video-last-results span,
.vraceto17 .casino-video-last-results a {
  background-color: #646464;
}

/*Virtual Casino Bollywood Table Ends*/

/*Virtual Casino Baccarat Starts*/

.vbaccarat .casino-detail {
  background-image: linear-gradient(to right, #555, #333, #555);
}

.vbaccarat .virtual-casino-odds {
  margin-top: -40px;
}

.vbaccarat .table-actions,
.vbaccarat .decks-block,
.vbaccarat .decks-mask-block,
.vbaccarat .cards-showing-block {
  width: 130vh !important;
  max-width: 100% !important;
  height: 100%;
  position: relative;
}

.vbaccarat .odds-title {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 75%;
  margin: 0 auto;
}

.vbaccarat.vcasino .playera,
.vbaccarat.vcasino .playerb {
  width: 50%;
}

.baccarat-box {
  position: absolute;
  bottom: 0;
  background-color: #00000096;
  width: 100%;
  padding: 0 10px;
  border-radius: 0;
}

/*.vbaccarat-odds
{
    position: absolute;
    bottom: 120px;
    width: 75%;
    left: 50%;
    transform: translateX(-50%);
}*/

.vbaccarat-odds .baccarat-odds {
  display: flex;
  display: -webkit-flex;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-between;
}

.vbaccarat-odds .baccarat-odd-block {
  width: 18%;
  position: relative;
}

.vbaccarat-odds .baccarat-odd-block .bet-info,
.vbaccarat-odds .baccarat-bets .bet-info {
  position: relative;
  display: block;
  text-align: right;
  margin-bottom: 5px;
}

.vbaccarat-odds .baccarat-odd-block .bet-info i,
.vbaccarat-odds .baccarat-bets .bet-info i {
  color: #fff !important;
}

.vbaccarat-odds .baccarat-odd-block:last-child {
  margin-right: 0;
}

.vbaccarat-odds .baccarat-odd-block .baccarat-odd-name {
  padding: 8px 2px;
  text-align: center;
  color: var(--text-white);
  background-image: linear-gradient(180deg, #f29603 0%, #b4701b 100%);
  cursor: pointer;
  border-radius: 0;
  text-transform: uppercase;
}

.vbaccarat-odds .baccarat-odd-block .baccarat-odd-val {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -25px;
  color: #fff;
}

.vbaccarat-odds .baccarat-bets {
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 0;
  position: relative;
  padding-bottom: 30px;
}

.vbaccarat-odds .player-pair,
.vbaccarat-odds .player,
.vbaccarat-odds .tie,
.vbaccarat-odds .banker,
.vbaccarat-odds .banker-pair {
  width: 18%;
  margin-top: 40px;
  position: relative;
}

.vbaccarat-odds .baccarat-bets-name {
  /* height: 100%; */
  height: auto;
  display: flex;
  display: -webkit-flex;
  justify-content: center;
  flex-direction: column;
  color: var(--text-white);
  padding-left: 0;
  text-align: center;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
}

.vbaccarat-odds .player-pair .baccarat-bets-name {
  background-color: #509bff;
}

.vbaccarat-odds .player .baccarat-bets-name {
  background-color: #509bff;
}

.vbaccarat-odds .tie .baccarat-bets-name {
  background-color: #11b24b;
}

.vbaccarat-odds .banker .baccarat-bets-name {
  background-color: #d3393d;
}

.vbaccarat-odds .banker-pair .baccarat-bets-name {
  background-color: #d3393d;
}

.vbaccarat-odds .baccarat-bets-val {
  color: #fff;
  text-align: center;
}

.baccarat-buttons {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  bottom: unset;
  left: unset;
  transform: unset;
  justify-content: center;
}

.baccarat-buttons.virtual-casino-place-bet .place-bet-box-container {
  margin: 0 10px;
  width: calc(60% - 20px);
  background: transparent;
  border-right: 1px solid #fff;
  border-radius: 0;
  display: flex;
  flex-wrap: wrap;
}

.baccarat-graph {
  text-align: right;
  width: 20%;
  border-right: 1px solid #fff;
  padding: 10px;
}

.baccarat-buttons .baccarat-graph img {
  height: 120px;
}

.baccarat-buttons .place-bet-value input {
  border-color: #fff;
  margin: 0 10px;
  border-radius: 2px;
}

.baccarat-buttons .vcasino-last-results {
  position: relative;
  left: unset;
  top: unset;
  border: 0;
  background: transparent;
  border: 0;
  width: 20%;
  justify-content: flex-start;
  align-items: flex-start;
  align-content: center;
  height: auto;
}

.baccarat-buttons .vcasino-last-results span {
  background: transparent;
  border: 0;
  position: unset;
  height: auto;
}

.baccarat-buttons .place-bet-value {
  justify-content: center;
}

.baccarat-buttons .btn {
  margin: 0 10px;
}

.baccarat-buttons .coin-img {
  position: relative;
  display: inline-block;
  width: 32%;
  margin-bottom: 5px;
}

.baccarat-buttons .coin-img img {
  height: 7vh;
}

.baccarat-buttons .coin-img > div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: #fff;
  font-size: 14px;
}

.baccarat-buttons .place-bet-nation {
  justify-content: center;
}

.baccarat-buttons .place-bet-nation > div {
  margin-right: 20px;
}

.vbaccarat.vcasino .odds-title .playera {
  color: #509bff !important;
}

.vbaccarat.vcasino .odds-title .playerb {
  color: #d3393d !important;
}

.baccarat-buttons .vcasino-last-results span.vresulta {
  color: #509bff !important;
}

.baccarat-buttons .vcasino-last-results span.vresultb {
  color: #d3393d !important;
}

.baccarat-buttons .bet-block {
  width: 60%;
}

.baccarat-buttons .btn-block {
  width: 40%;
}

.vbaccarat.vcasino .tie {
  color: #fff !important;
  font-weight: normal;
}

.vbaccarat.vcasino .playera {
  color: #509bff !important;
}

.vbaccarat.vcasino .playerb {
  color: #d3393d !important;
}

.vbaccarat.vcasino .tie {
  color: #11b24b !important;
}

.vbaccarat .suspended::after {
  border-radius: 0;
}

.vbaccarat .player-pair .suspended::before,
.vbaccarat .player .suspended::before,
.vbaccarat .banker-pair .suspended::before,
.vbaccarat .banker .suspended::before {
  background-position: center;
}

.vbaccarat .l-rotate {
  margin-right: 10px;
}

.vbaccarat .r-rotate {
  margin-left: 10px;
}

/*Virtual Casino Baccarat Ends*/

/*Virtual Casino Trio Starts*/

.vtrio .casino-detail {
  background-image: linear-gradient(to right, #555, #333, #555);
}

.vtrio .casino-detail {
  color: #fff;
}

.vtrio .virtual-casino-odds {
  margin-top: -55px;
}

.vtrio.vcasino .vcasino-cards {
  justify-content: center;
}

.vtrio.vcasino .vcasino-cards img {
  margin-right: 5px;
}

.vtrio .table-actions,
.vtrio .decks-block,
.vtrio .decks-mask-block,
.vtrio .cards-showing-block {
  width: 130vh !important;
  max-width: 100% !important;
}

.vtrio .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 auto;
}

.vtrio .vodds-box {
  width: 32%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  margin-bottom: 2vh;
}

.vtrio .vrt17-odd-name {
  font-size: 14px;
  margin-bottom: 5px;
  position: relative;
  text-align: center;
  width: 100%;
}

.vtrio .vrt17-odd-name i {
  color: #fff !important;
}

.vtrio .vodds-box .casino-bl-box {
  width: 100%;
}

.vtrio .vodds-box .casino-bl-box-item {
  width: calc(50% - 4px);
  margin-top: 0;
  color: #fff;
  height: 40px;
  margin-right: 4px;
}

.vtrio .main-odds .vodds-box .casino-bl-box-item {
  height: 50px;
}

.vtrio .main-odds .casino-bl-box-item > span {
  margin-bottom: 5px;
}

.vtrio .vodds-box .casino-bl-box-item.back {
  background-color: transparent;
  border: 2px solid var(--back);
}

.vtrio .vodds-box .casino-bl-box-item.lay {
  background-color: transparent;
  border: 2px solid var(--lay);
}

.vtrio .vodds-box .casino-bl-box-item .casino-box-odd {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  height: auto;
  margin-bottom: 0;
  color: #fff;
}

.vtrio .odds-book {
  font-size: 14px;
  margin-top: 5px;
}

.vtrio .other-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  margin-top: 1vh;
}

.vtrio .other-odds .vodds-box {
  width: 24%;
}

.vtrio .sub-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  margin-top: 1vh;
}

.vtrio .sub-odds .vodds-box {
  width: 19%;
}

.vtrio .sub-odds .vodds-box .casino-bl-box-item {
  width: 100%;
}

.vtrio .odds-book.book-red,
.vtrio .dt-book.book-red {
  color: #ff3143 !important;
}

.vtrio .odds-book.book-green,
.vtrio .dt-book.book-green {
  color: #18ca18 !important;
}

/*Virtual Casino Trio Ends*/

/* Virtual Casino Trap Starts */

.vtrap .casino-detail {
  color: #fff;
  background-image: linear-gradient(to right, #555, #333, #555);
}

.vtrap.vcasino .vcasino-cards {
  justify-content: center;
}

.vtrap.vcasino .vcasino-cards .player-card div {
  color: #fff;
}

.vtrap.vcasino .player-card img {
  width: 40px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.vtrap .main-odds {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
}

.vtrap-seven {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 24%;
  position: relative;
}

.vtrap .vodds-box {
  width: 24.5%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  font-size: 14px;
  margin-bottom: 0;
}

.vtrap .vrt17-odd-name {
  font-size: 18px;
  margin-bottom: 5px;
  text-transform: uppercase;
  font-weight: bold;
  width: 100%;
  text-align: center;
  position: relative;
}

.vtrap .vrt17-odd-name i {
  color: #fff !important;
}

.vtrap .casino-bl-box {
  width: 100%;
}

.vtrap .main-odds .vtrap-item-box {
  width: 100%;
  position: relative;
}

.vtrap .main-odds .suspended::after {
  border-radius: 0;
}

.vtrap .main-odds .vtrap-jqk .vtrap-item-box {
  margin-bottom: 0;
}

.vtrap .main-odds .vtrap-seven.high-low .vtrap-item-box:first-child {
  margin-bottom: 5px;
}

.vtrap .casino-bl-box-item .casino-box-odd {
  color: #fff;
}

.vtrap .vtrap-seven .casino-bl-box-item {
  height: 50px;
  text-align: left;
  padding-left: 10px;
  width: 100%;
  color: #000;
  margin: 0;
  margin-bottom: 1vh;
  border-radius: 0;
}

.vtrap .vtrap-seven .casino-bl-box-item:last-child {
  margin-bottom: 0;
}

.vtrap-seven .casino-bl-box-item .casino-box-odd {
  color: #fff;
  font-size: 16px;
}

.vtrap-seven .casino-bl-box-item span:nth-child(2n) {
  font-size: 16px;
  margin-top: 5px;
}

.vtrap-seven .casino-bl-box-item .odds-book {
  position: absolute;
  right: 10px;
  text-align: right;
  color: #fff;
}

.vtrap-seven .vtrap-img {
  width: auto;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  height: 50px;
  z-index: 100;
}

.vtrap .vodds-box .casino-bl-box-item {
  width: 100%;
  margin-top: 0;
  height: 50px;
  margin-right: 0;
  color: #000;
}

.vtrap .vodds-box .casino-bl-box-item.back {
  background-color: transparent;
  border: 2px solid var(--back);
  border-radius: 0;
  margin-bottom: 5px;
}

.vtrap .vodds-box .casino-bl-box-item.lay {
  background-color: transparent;
  border: 2px solid var(--lay);
  border-radius: 0;
}

.vtrap .odds-book.book-red,
.vtrap .dt-book.book-red {
  color: #ff3143 !important;
}

.vtrap .odds-book.book-green,
.vtrap .dt-book.book-green {
  color: #18ca18 !important;
}

/* Virtual Casino Trap Ends */

/* Virtual Casino Dragon Tiger Lion Starts */

.vdtl .casino-detail {
  color: #fff;
  background-image: linear-gradient(to right, #555, #333, #555);
}

.vdtl .nav {
  width: 100%;
  margin-top: 0;
}

.vdtl .nav-pills .nav-link {
  background: #00000059;
  background-color: rgba(0, 0, 0, 0.35);
  border: 0;
  margin-right: 5px;
  color: #fff;
}

.vdtl .nav-pills .nav-link.active {
  color: #ffcc00;
  background-color: #00000059;
  border: 0;
}

.vdtl .main-odds {
  color: #fff;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
  margin-top: 0px;
  margin-top: 10px;
}

.vdtl .main-odds .tab-content {
  width: 100%;
}

.vdtl .main-odds-left,
.vdtl .main-odds-right {
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.vdtl .main-odds .v-odd-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  margin-bottom: 5px;
}

.vdtl .v-odd-box {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.vdtl .v-odd-box i {
  color: #fff !important;
}

.vdtl .main-odds-left .v-odd-box {
  width: 17%;
  margin-right: 1%;
  font-size: 11px;
}

.vdtl .main-odds-left .v-odd-box:first-child {
  width: 10%;
  margin-right: 0;
}

.vdtl .main-odds-right .v-odd-box {
  width: 13%;
  margin-right: 0.5%;
}

.vdtl .v-odd-box img {
  height: 30px;
  margin-right: 5px;
}

.vdtl .v-odd-box .casino-bl-box {
  width: 100%;
}

.vdtl .casino-bl-box-item {
  width: 100%;
}

.vdtl .casino-bl-box-item.back {
  background-color: #323b4c !important;
  border: 2px solid var(--back);
  height: 50px;
}

.vdtl .casino-bl-box-item .casino-box-odd {
  font-size: 18px;
  color: #ffcc00;
  line-height: 1;
}

.casino-bl-box-item > span {
  font-size: 12px;
  line-height: 1;
}

.casino-bl-box-item .book-odd {
  color: #fff;
}

.vdtl-odds-heading {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  width: 100%;
  text-align: center;
  margin: 10px 0;
}

.v-dragon-box h5 {
  color: #fc4242;
}

.vdtl.vcasino .playara {
  color: #fc4242 !important;
}

.v-tiger-box h5 {
  color: #ffcc00;
}

.vdtl.vcasino .tie {
  color: #ffcc00 !important;
}

.v-lion-box h5 {
  color: #00a200;
}

.vdtl.vcasino .playerb {
  color: #00a200 !important;
}

.vdtl .icon-range {
  top: 20px;
}

/* Virtual caino Dragon Tiger Lion ends */

/* Virtual Casino 1 Card 1Day Starts */

.v1card1day .casino-detail {
  color: #fff;
  background-image: linear-gradient(to right, #555, #333, #555);
}

.v1card1day .main-odds {
  padding-top: 0;
  color: #fff;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin: 0 auto;
  margin-top: 0;
}

.vtrap-seven {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 24%;
  position: relative;
}

.v1card1day .vrt17-odd-name {
  font-size: 20px;
  margin-bottom: 5px;
  text-transform: uppercase;
  font-weight: bold;
  position: relative;
  width: 100%;
  text-align: center;
}

.v1card1day .vrt17-odd-name i {
  color: #fff !important;
}

.v1card1day .casino-bl-box {
  width: 100%;
}

.v1card1day .vtrap-seven .casino-bl-box-item {
  height: 50px;
  text-align: left;
  padding-left: 10px;
  border-radius: 0;
  width: 100%;
  color: #000;
  margin: 0;
  margin-bottom: 5px;
}

.vtrap-seven .casino-bl-box-item.back {
  background-color: #323b4c !important;
  border: 2px solid var(--back);
}

.vtrap-seven .casino-bl-box-item .casino-box-odd {
  color: #ffcc00;
  font-size: 18px;
}

.vtrap-seven .casino-bl-box-item span:nth-child(2n) {
  font-size: 16px;
  margin-top: 5px;
}

.vtrap-seven .casino-bl-box-item .odds-book {
  position: absolute;
  right: 10px;
  text-align: right;
  color: #fff;
}

.v1card1day .book-green {
  color: #32d74b !important;
  font-size: 14px;
}

.v1card1day .book-red {
  color: #ff453a !important;
  font-size: 14px;
}

.v1card1day .odds-book {
  font-size: 14px;
}

.v1card1day .vodds-box {
  width: 24.5%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  font-size: 22px;
  margin-bottom: 0;
}

.v1card1day .vodds-box .casino-bl-box {
  width: 100%;
  position: relative;
}

.v1card1day .main-odds .vtrap-item-box {
  width: 100%;
  position: relative;
}

.v1card1day .vodds-box .casino-bl-box-item {
  width: 100%;
  margin-top: 0;
  height: 50px;
  margin-right: 0;
  color: #000;
  background-color: #323b4c !important;
}

.v1card1day .vodds-box .casino-bl-box-item.back {
  background-color: transparent;
  border: 2px solid var(--back);
  border-radius: 0;
  margin-bottom: 5px;
}

.v1card1day .vodds-box .casino-bl-box-item.lay {
  background-color: transparent;
  border: 2px solid var(--lay);
  border-radius: 0;
}

.v1card1day.nvcasino .vodd-box-a .casino-bl-box-item {
  background-color: #ffcc001f !important;
}

.v1card1day .vodds-box .casino-bl-box-item .casino-box-odd {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
  height: auto;
  margin-bottom: 0;
  color: #ffcc00;
}

.vcasino.v1card1day .playerb {
  color: #ffcc00 !important;
}

/* Virtual Casino 1 Card 1Day Ends */

/* Virtual Casino 1 Card 20-20 Starts */

.v1card20 .casino-detail {
  color: #fff;
  background-image: linear-gradient(to right, #555, #333, #555);
}

.v1card20 .main-odds {
  padding-top: 0;
  color: #fff;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin: 0 auto;
  margin-top: 10px;
}

.v1card20 .vodds-box {
  width: 24.5%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  font-size: 2.3vh;
  margin-bottom: 0;
}

.v1card20 .vrt17-odd-name {
  font-size: 20px !important;
  margin-bottom: 0.8vh;
  text-transform: uppercase;
  font-weight: bold;
  position: relative;
  width: 100%;
  text-align: center;
}

.v1card20 .vodds-box .casino-bl-box {
  width: 100%;
  position: relative;
}

.v1card20 .vodds-box .casino-bl-box-item {
  width: 100%;
  margin-top: 0;
  height: 7vh;
  margin-right: 0;
  color: #000;
  background-color: #323b4c !important;
}

.v1card20 .vodds-box .casino-bl-box-item.back {
  background-color: transparent;
  border: 2px solid var(--back);
  border-radius: 0;
}

.v1card20.nvcasino .vodd-box-a .casino-bl-box-item {
  background-color: #ffcc001f !important;
}

.v1card20 .vodds-box .casino-bl-box-item .casino-box-odd {
  font-size: 2.5vh;
  font-weight: bold;
  line-height: 1;
  height: auto;
  color: #ffcc00;
}

.v1card20 .vodds-box .casino-bl-box-item.lay {
  background-color: transparent;
  border: 2px solid var(--lay);
  border-radius: 0;
}

.v1card20 .odds-book {
  font-size: 1.5vh;
}

.v1card20 .vodds-box .casino-bl-box-item.player {
  border: 2px solid #ff453a;
  border-radius: 0;
}

.v1card20 .vodds-box .casino-bl-box-item.dealer {
  border: 2px solid #ffcc00;
  border-radius: 0;
}

.v1card20 .vodds-box .casino-bl-box-item.pair {
  border: 2px solid #1586ff;
  border-radius: 0;
}

.v1card20 .vodds-box .casino-bl-box-item.tie {
  background-color: transparent;
  border: 2px solid #00a200;
  border-radius: 0;
}

.v1card20 .vdtl-title {
  position: absolute;
  top: 35px;
  height: calc(100% - 45px);
  flex-direction: column;
  justify-content: space-around;
  width: 40%;
  left: 30%;
  align-items: flex-start;
}

.v1card20 .vdtl-title .title-divider {
  position: absolute;
  top: 50%;
  background-color: #fff;
  height: 2px;
}

.v1card20 .nvtimer.casino-timer {
  top: 100%;
}

.v1card20 .vdtl-trophy {
  position: absolute;
  top: 35px;
  height: calc(100% - 45px);
  flex-direction: column;
  justify-content: space-between;
  width: 40%;
  left: 60%;
  transform: unset;
}

.v1card20 .vdtl-trophy img {
  height: auto;
  width: 130px;
}

.v1card20 .vdtl-trophy .winnera {
  position: absolute;
  top: -50px;
}

.v1card20 .vdtl-trophy .winnerb {
  position: absolute;
  bottom: -10px;
}

.v1card20 .vplayera,
.v1card20 .vplayerb {
  font-size: 2vh;
  font-weight: bold;
}

.v1card20 .vplayera {
  color: #fc4242;
}

.v1card20 .vplayertie {
  color: #00a200;
}

.v1card20 .vplayerpair {
  color: #1586ff;
}

.v1card20 .vplayerb {
  color: #ffcc00;
}

.v1card20 .vrt17-odd-name i {
  color: #fff !important;
}

.vcasino.v1card20 .playerb {
  color: #ffcc00 !important;
}

/* Virtual Casino 1 Card 20-20 Ends */

/*Virtual Casino Design End*/

/*Horse Detail*/

.horse-detail .nation-name label {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.horse-detail .nation-name label img {
  height: 25px;
  margin-right: 5px;
}

.horse-detail .scorecard {
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  width: 100%;
}

.horse-detail .scorecard > div:first-child {
  background: #000c;
  color: #fff;
  padding: 10px;
}

.horse-detail .scorecard > div:last-child {
  font-size: 24px;
}

.horse-detail .scorecard p,
.horse-detail .scorecard h5 {
  margin-bottom: 5px;
}

/*Horse Detai End*/

/**New Design*/

.market-analysis .page-title-box h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.market-analysis .page-title-box h4 a {
  padding-right: 10px;
}

.navbar-header {
  background: var(--bg-primary);
  color: var(--text-primary) !important;
  padding-right: 30px;
}

body[data-sidebar="dark"] .navbar-brand-box {
  background: var(--bg-primary);
  height: 52px;
}
.navbar-brand-box {
  width: auto !important;
}
.vertical-collpsed .navbar-brand-box {
  width: auto !important;
}

body[data-sidebar="dark"] .vertical-menu {
  background-color: #f9f9f9;
}

body[data-sidebar="dark"] #sidebar-menu ul li a,
body[data-sidebar="dark"] #sidebar-menu ul li ul.sub-menu li a,
body[data-sidebar="dark"] #sidebar-menu ul li a i {
  color: #000;
}

body[data-sidebar="dark"] .mm-active .active {
  color: #000 !important;
}

.market-analysis-title {
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
}

.market-analysis-title a {
  color: var(--text-secondary);
}

.market-analysis-container .table thead {
  background-color: rgba(0, 0, 0, 0.05);
}
.market-analysis-container .table thead th {
  font-weight: bold;
  font-size: 14px;
  padding: 0.75rem;
  color: #460bf3;
  text-decoration: underline;
  text-transform: uppercase;
}
.market-analysis-container .table th,
.market-analysis-container .table td {
  border: 1px solid #dee2e6;
}
.market-analysis-container .table td {
  border: 0;
}
.fixture-nav .fixure-title {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.fixture-nav .fixure-title::after {
  border-left: 20px solid var(--bg-primary);
}

.upcoming-fixure {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.detail-page-container .card-header .card-title {
  color: var(--text-secondary);
}

.detail-page-container .card-header {
  background-color: var(--bg-secondary70);
  color: var(--text-secondary);
}

.vertical-collpsed .logo span.logo-lg {
  display: block;
}

.vertical-collpsed .vertical-menu {
  display: none;
}

.vertical-collpsed .main-content {
  margin-left: 0;
}

/*Login*/

.login,
.login .wrapper {
  background-image: linear-gradient(var(--bg-primary), var(--bg-secondary));
  height: 100vh;
}

.login-mn {
  margin: 0 auto;
  width: 400px;
  padding: 100px 0 0 0;
  max-width: 85%;
}

.log-logo {
  width: 100%;
  text-align: center;
}

.log-logo img {
  max-width: 250px;
  max-height: 100px;
}

.log-fld {
  width: 100%;
  padding: 35px 30px 10px;
  box-sizing: border-box;
  margin-top: 15px;
  background: #eee;
  border-radius: 4px;
  box-shadow: 0px 0px 4px #fff;
}

.log-fld h2 {
  color: #000;
  position: relative;
  margin-bottom: 30px;
  font-size: 2rem;
}

.log-fld h2::before,
.log-fld h2::after {
  content: "";
  height: 1px;
  position: absolute;
  top: 16px;
  width: 20%;
  background: #000;
}

.log-fld h2::before {
  left: 0;
}

.log-fld h2::after {
  right: 0;
}

.form-group {
  position: relative;
}

.error {
  color: #ff0000;
  margin-top: 3px;
  margin-bottom: 10px;
}

.btn-submit,
.btn-submit:hover,
.btn-submit:active,
.btn-submit:focus {
  background-color: var(--bg-primary);
  border-color: var(--bg-primary);
  color: var(--text-primary);
}

.btn-login {
  width: 100%;
}

.log-copy p {
  color: #fff;
  text-align: center;
  margin-top: 15px;
}

.btn-submit .fa-sign-in-alt {
  font-size: 12px;
  margin-left: 10px;
}

.log-copy a {
  color: #fff;
  text-align: center;
  margin-top: 15px;
}
/* 
#loader-full {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  position: fixed !important;
  align-items: center;
  z-index: 9999;
  position: relative;
  background-image: linear-gradient(var(--bg-primary), var(--bg-secondary));
} */

#loader-section {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  text-align: center;
  vertical-align: middle;
  background-color: rgba(255, 255, 255, 0.5);
  z-index: 10;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

#load-inner {
  position: relative;
  text-align: center;
}

#load-inner img {
  display: block;
  height: 65px;
}

#load-inner i {
  font-size: 24px;
  color: var(--text-primary);
  margin-top: 40px;
}

#loader-section #load-inner i {
  color: #000;
}

.swal2-toast {
  background-color: var(--bg-secondary) !important;
  color: var(--text-secondary) !important;
}

body[data-sidebar="dark"] .mm-active,
body[data-sidebar="dark"] .mm-active .active,
body[data-sidebar="dark"] .mm-active .active i,
body[data-sidebar="dark"] .mm-active > i {
  color: #000 !important;
}

.main-rules a {
  color: var(--text-primary);
}

.main-rules a .fa-info-circle {
  color: var(--text-primary);
}

/*New Desing*/
.navbar-header .main-menu .nav-item {
  position: relative;
}
.navbar-header .main-menu .nav-link {
  color: var(--text-primary);
  font-weight: bold;
  font-size: 14px;
  padding: 10px;
}
.navbar-header .main-menu .nav-link:hover {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}
.navbar-header .main-menu .dropdown:hover .dropdown-menu {
  display: block;
}
.navbar-header .dropdown-menu {
  background-color: var(--bg-primary);
  min-width: 200px;
}

.navbar-header .dropdown-menu .dropdown-item {
  color: var(--text-primary);
  font-weight: bold;
  font-size: 14px;
  padding: 10px;
}
.navbar-header .dropdown-menu .dropdown-item:hover,
.navbar-header .dropdown-menu .dropdown-item:focus {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}
.vertical-menu {
  position: absolute;
  left: 0;
  top: 52px;
  min-height: 700px;
  width: 300px;
}
.main-content {
  margin-left: 0;
}
.add-account {
  background-color: #f9f9f9;
  padding: 15px;
  margin: 0;
  border-radius: 4px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
}
.add-account h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}
.add-account h4 {
  font-weight: 700;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  padding-top: 5px;
  padding-bottom: 5px;
  font-size: 18px;
  padding-left: 15px;
}
.add-account .table th,
.add-account .table td {
  color: #1e1e1e;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
}
.table-striped tbody tr:nth-of-type(2n + 1) {
  background-color: rgba(0, 0, 0, 0.05);
}
.vertical-collpsed .footer {
  left: 0;
}
#sidebar-menu ul li ul.sub-menu li a {
  padding: 0.4rem 1.5rem 0.4rem 1.5rem;
}
.menu-box > a > span {
  font-size: 2rem;
  font-weight: 500;
}
.wrape-text {
  cursor: pointer;
  background: #444;
  padding: 5px 10px;
  text-decoration: none;
  color: #fff;
  border-radius: 3px;
  margin-right: 3px;
  text-transform: uppercase;
  display: inline-block;
  max-width: unset;
  float: unset;
  white-space: unset;
}
.wrape-text:hover {
  color: #fff;
}
.custom-control-label::after,
.custom-control-label::before {
  width: 20px;
  height: 20px;
  border-radius: 0;
  background-color: #000;
  border: 1px solid #000;
}
.custom-control-input:checked ~ .custom-control-label::before {
  color: #fff;
  border-color: #444;
  background-color: #444;
}
.table thead th {
  font-weight: bold;
  font-size: 14px;
}
.modal-header {
  border-bottom: 0;
}
.modal-header .close {
  background: var(--bg-primary);
  opacity: 1;
  color: #fff;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  width: 35px;
  height: 35px;
  font-size: 22px;
  padding: 0;
  margin: -2px -1rem -1rem auto;
}
.buttons-pdf {
  background-color: #cb0606;
  color: #fff;
  box-shadow: 0px 5px 6px -6px #000;
  border: 1px solid #cb0606;
  cursor: pointer;
  font-size: 1rem;
  height: 34px;
}
.buttons-excel {
  background-color: #217346;
  color: #fff;
  box-shadow: 0px 5px 6px -6px #000;
  border: 1px solid #217346;
  cursor: pointer;
  font-size: 1rem;
  height: 34px;
}
.action-button {
  cursor: pointer;
  background: #444;
  border-color: #444;
  padding: 5px 10px;
  text-decoration: none;
  color: #fff;
  border-radius: 3px !important;
  margin-right: 6px;
  margin-left: 0;
  text-transform: uppercase;
  display: inline-block;
  font-size: 1rem;
  line-height: 1;
}
.action-button:hover,
.action-button:focus {
  color: #fff;
}
.btn-back {
  cursor: pointer;
  background-color: var(--bg-secondary);
  border-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.47rem 0.75rem;
  text-decoration: none;
  border-radius: 3px !important;
  margin-right: 3px;
  margin-left: 0;
  text-transform: uppercase;
  display: inline-block;
  font-size: 12px;
}
.btn-back:hover,
.btn-back:focus {
  background-color: var(--bg-secondary);
  border-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 0.47rem 0.75rem;
}
.master-balance {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  position: relative;
  width: 100%;
  padding: 20px;
  font-size: 14px;
  position: relative;
  left: -25px;
  top: -20px;
  width: calc(100% + 50px);
}

.fa-arrow-alt-circle-down,
.fa-arrow-alt-circle-up {
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
}
#sidebar-menu ul li ul.sub-menu li a {
  padding: 5px 0 5px 12px;
}

#sidebar-menu ul li a {
  padding: 5px 12px;
}
.page-title-box {
  margin-top: 0;
  margin-bottom: 6px;
  padding-bottom: 0;
}
#sidebar-menu .has-arrow::after {
  content: "+";
  display: inline-block;
  float: none;
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;
  font-family: inherit;
}

#sidebar-menu .show > .has-arrow:after {
  content: "-";
}
#sidebar-menu ul li ul.sub-menu li ul.sub-menu li {
  position: relative;
  padding: 5px 0 5px 12px;
}
#sidebar-menu ul li ul.sub-menu li ul.sub-menu li::after {
  border-left: 1px solid #000;
  bottom: 0;
  content: "";
  left: 4px;
  position: absolute;
  top: 0px;
}
#sidebar-menu ul li ul.sub-menu li ul.sub-menu li::before {
  background: var(--bg-primary);
  bottom: auto;
  content: "";
  height: 8px;
  left: 0px;
  margin-top: 2px;
  position: absolute;
  right: auto;
  width: 8px;
  z-index: 1;
  border-radius: 50%;
}
.last-result-title {
  background-color: var(--bg-secondary70);
  color: var(--text-secondary);
  font-size: 14px;
  padding: 4px 8px;
  font-weight: bold;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  width: 100%;
}
.last-result-title h5 {
  margin-bottom: 0;
  font-weight: bold;
  font-size: 14px;
}
.last-result-title a,
.last-result-title h5 {
  color: var(--text-secondary);
}
.detail-page-container.ball-by-ball .bet-table {
  background-color: transparent;
}
.detail-page-container.ball-by-ball .bet-table-row {
  background: #f2f2f2;
  border-bottom: 1px solid #fff !important;
}
.detail-page-container.ball-by-ball .market-6 .nation-name {
  width: calc(100% - 157px);
}
.detail-page-container.ball-by-ball .fancy-min-max {
  font-weight: bold;
  color: #333 !important;
  font-size: 12px;
}
.detail-page-container.ball-by-ball .market-6 .nation-name p {
  color: #333;
}
.detail-page-container.ball-by-ball .bet-table-body {
  box-shadow: none;
  padding: 0 !important;
}
.detail-page-container.ball-by-ball
  .bet-table-body
  .row:first-child
  .bet-table-row {
  background-color: transparent;
}
.master-balance-detail {
  /* display: none; */
}
.master-balance-detail li {
  color: var(--secondary-color);
  margin-bottom: 5px;
}
.fa-arrow-alt-circle-up {
  /* display: none; */
}
.page-title-box h4 {
  text-transform: unset;
  color: #1e1e1e;
  font-size: 1.6rem !important;
  font-weight: 500;
}
.page-title-box h4 i {
  font-size: 14px;
}
.listing-grid {
  background-color: #f9f9f9;
  padding: 10px;
  margin: 0;
  position: relative;
}
.super-over.detail-page-container .banner,
.five-cricket.detail-page-container .banner {
  /* height: 70px; */
  border-radius: 0;
}
.scorecard {
  width: 100%;
  padding: 5px;
  background-image: url("../img/scorecard-bg.png");
  position: relative;
  background-repeat: no-repeat;
  background-size: cover;
  color: #fff;
}
.scorecard::before {
  content: "";
  background-color: rgba(0, 0, 0, 0.55);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.detail-page-container.super-over .market-6 .nation-name p,
.detail-page-container.five-cricket .market-6 .nation-name p {
  color: #333;
}
#page-topbar {
  position: relative;
}
.account-list .card {
  background-color: transparent;
}
.account-list .card .card-body {
  padding: 0;
}
.account-list .table {
  border-collapse: separate;
  border-spacing: 0;
  border: 0;
}
.account-list .table tr {
  background-color: #fff;
}
.account-list .table thead tr {
  background-color: transparent;
}
.account-list .table thead tr th {
  border: 0;
}
.account-list .table th {
  border-bottom: 1px solid #111;
}
.table.b-table > thead > tr > [aria-sort="none"] {
  background: none;
}
.account-list .table td {
  border: 1px solid #dee2e6;
}
.listing-grid .page-title-box .btn-primary {
  padding: 6px 12px;
  font-size: 1rem;
}
.account-list .table th:first-child {
  width: 15%;
}
.account-list .tab-bg-warning {
  border-top: 1px solid #dee2e6 !important;
  background-color: #fff !important;
}
.account-list .nav-link {
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #0056b3;
}
.h1,
.h2,
.h3,
.h4,
.h5,
.h6,
h1,
h2,
h3,
h4,
h5,
h6 {
  color: #1e1e1e;
}
.form-control[readonly] {
  background-color: #ddd;
  cursor: not-allowed;
  border: 1px solid #666;
  border-radius: 0;
}
#modal-status .user-name p {
  font-size: 20px;
}
.vue-js-switch .v-switch-core {
  width: 60px;
  height: 24px;
}
.vue-js-switch .v-switch-label {
  top: 2px !important;
  font-weight: normal !important;
  color: #000 !important;
  font-size: 11px !important;
  text-transform: uppercase !important;
  line-height: 20px !important;
}
.vue-js-switch .v-switch-core .v-switch-button {
  top: 0 !important;
  /* left: unset !important;
  right: 5px !important; */
  /* transform: unset !important; */
  background-color: #444 !important;
}
.market-analysis-modal .modal-header {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: 0;
}
.market-analysis-modal .modal-header .modal-title {
  color: var(--text-secondary);
  font-weight: bold;
}
.market-analysis-modal .modal-header .close {
  margin: 0;
}
.market-analysis-modal .table td,
.market-analysis-modal .table th {
  color: #fff;
}
.detail-page-container.ball-by-ball .bet-table-header {
  background-color: var(--bg-secondary85);
}
.casino-result .modal-dialog {
  max-width: 1000px;
}
.cricket20ballresult.cricket20ballpopup img {
  width: 150px;
}
.race20 .casino-video .video-box-container {
  max-width: 100%;
}
.casino-queen .casino-video .video-box-container {
  max-width: 100%;
}
.casino-queen .casino-detail {
  padding: 0;
  margin-top: 10px;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
}
.casino-queen .queen-box {
  background-color: #eee;
  padding: 10px;
}
.game-heading {
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
}
.super-over .casino-video .video-box,
.five-cricket .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.super-over.detail-page-container .bet-table-header,
.five-cricket.detail-page-container .bet-table-header {
  background-color: var(--bg-secondary85);
}
.super-over.detail-page-container .market-6 .nation-name p,
.five-cricket.detail-page-container .market-6 .nation-name p {
  color: #333 !important;
}
.cmeter .casino-detail {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
  margin-top: 5px;
}
.report-form .form-control {
  height: 33px;
  color: #495057;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #fff;
  border: 1px solid #aaa;
  border-radius: 0.25rem;
}
.report-table .table {
  border-collapse: separate;
  border-spacing: 0;
}
.report-table .table th,
.report-table .table td,
.account-list .table th,
.report-table .table td {
  height: 40px;
  vertical-align: middle;
}
.report-table .table-bordered,
.report-table .table-bordered td,
.report-table .table-bordered th,
.account-list .table-bordered,
.account-list .table-bordered td,
.account-list .table-bordered th {
  border: 1px solid #dee2e6;
}
.account-list .table-bordered.table {
  border: 0;
}
.report-table .table-bordered.table thead th,
.report-table .table-bordered.table thead td,
.account-list .table-bordered.table thead th,
.account-list .table-bordered.table thead td {
  border: 0;
  border-bottom: 1px solid #111;
}
.page-link {
  color: var(--text-primary);
  background-color: var(--bg-primary);
}
.pagination-rounded .page-link {
  border-radius: 3px !important;
}
#divLoading {
  display: none;
  z-index: 99;
}
#divLoading.show {
  display: block;
  position: fixed;
  z-index: 9999;
  background-image: url("../images/loader.gif");
  background-color: #666;
  opacity: 0.4;
  background-repeat: no-repeat;
  background-position: center;
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  background-size: 100px 100px;
}

.modal-chekbox .custom-control-label::after,
.modal-chekbox .custom-control-label::before {
  border: 1px solid #666;
  background-color: transparent;
  height: 14px;
  width: 14px;
  border-radius: 50%;
}
.modal-chekbox .custom-control-input:checked ~ .custom-control-label::before {
  background-color: transparent;
}
.modal-chekbox
  .custom-radio
  .custom-control-input:checked
  ~ .custom-control-label::after {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3E%3Ccircle r='3' fill='%2300f'/%3E%3C/svg%3E");
}
.account-table .table tr th:nth-child(1),
.account-table .table tr th:nth-child(2),
.account-table .table tr th:nth-child(3),
.account-table .table tr th:nth-child(4) {
  width: 10%;
}
.account-table .table tr th:nth-child(6) {
  width: 15%;
}
.casino-result-table .table tr th:nth-child(1) {
  width: 30%;
}
.user-menu .site-searchbox {
  margin-top: 1px !important;
  position: relative;
  width: auto !important;
}
.user-menu .multiselect__tags {
  padding: 10px !important;
  font-family: inherit !important;
  font-size: 14px !important;
  border: 0 !important;
  width: 160px !important;
  height: 38px !important;
  border-radius: 2px !important;
}
.logo {
  line-height: 52px;
}
.user-menu .header-item {
  height: auto;
}

.user-menu .search-icon {
  position: absolute;
  right: 5px;
  top: 7px;
  color: #333;
  font-size: 24px;
}
.user-menu .search-icon i {
  font-size: 24px;
}
.user-menu span,
.user-menu i {
  font-size: 14px;
}
.header-item {
  height: auto;
}
.navbar-header .user-menu .dropdown-menu .dropdown-item {
  padding: 4px 10px;
}
.navbar-header .user-menu .dropdown-menu .dropdown-item:hover,
.navbar-header .user-menu .dropdown-menu .dropdown-item:focus {
  background-color: transparent;
  text-decoration: underline !important;
}
.navbar-header .user-menu .dropdown.show .header-item {
  background-color: transparent;
}
.report-wrapper .btn {
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
}

.mx-input {
  background-color: #e9ecef !important;
  opacity: 1;
}
.add-account .table td input {
  background: #fff;
  border: 0;
  width: 100%;
  padding: 4px;
}
.add-account .btn {
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
}
.market-name-list {
  display: flex;
  justify-content: flex-start;
  align-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
}
.market-name-list a {
  margin-bottom: 10px;
  margin-right: 10px;
  border-radius: 0;
  padding: 7px 10px;
  line-height: normal;
}
.market-name-list a.active {
  background-color: var(--bg-secondary) !important;
  border-color: var(--bg-secondary) !important;
  color: var(--text-secondary) !important;
}
.clock {
  position: absolute !important;
  right: 5px;
  bottom: 5px;
  text-align: right !important;
  top: unset;
  left: unset;
  margin: 0 !important;
  width: auto !important;
}
.flip-clock-wrapper ul {
  width: 36px !important;
  height: 54px !important;
  line-height: 57px !important;
  font-size: 34px !important;
  margin: 2px !important;
}
.flip-clock-wrapper ul li {
  line-height: 57px !important;
}
.flip-clock-wrapper ul li a div div.inn {
  font-size: 50px !important;
}
.flip-clock-wrapper ul li a div div.inn {
  background-color: #333;
  color: #ccc;
}
.flip-clock-wrapper ul.play li.flip-clock-active .down {
  animation: unset;
}
.flip-clock-wrapper ul li a div.up::after {
  top: 26px !important;
}
.baccarat .casino-video .video-box-container {
  max-width: 100%;
}
.baccarat .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.cricket20 .casino-video .video-box-container {
  max-width: 100%;
}
.cricket20 .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.cmeter .casino-video .video-box-container {
  max-width: 100%;
}
.cmeter .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.casino-war .casino-video .video-box-container {
  max-width: 100%;
}
.casino-war .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.worli .casino-video .video-box-container {
  max-width: 100%;
}
.worli .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.threecardj .casino-video .video-box-container {
  max-width: 100%;
}
.threecardj .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.cards32a .casino-video .video-box-container,
.cards32b .casino-video .video-box-container {
  max-width: 100%;
}
.cards32a .casino-video .video-box,
.cards32b .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.teenpatti20 .casino-video .video-box-container {
  max-width: 100%;
}
.teenpatti20 .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.teenpatti20 .casino-video-cards {
  top: 0;
  transform: unset;
}
.teenpatti1day .casino-video .video-box-container {
  max-width: 100%;
}
.teenpatti1day .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.teenpatti1day .casino-video-cards {
  top: 50px;
  transform: unset;
  left: unset;
  right: 0;
}
.teenpatti1day .casino-video-cards {
  padding: 5px;
}
.teenpattitest .casino-video .video-box-container {
  max-width: 100%;
}
.teenpattitest .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.teenpattitest .casino-video-cards {
  top: 0;
  transform: unset;
}
.teenpattiopen .casino-video .video-box-container {
  max-width: 100%;
}
.teenpattiopen .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.teenpattiopen .casino-video-cards {
  top: 0;
  transform: unset;
}
.teenpatti2 .casino-video .video-box-container {
  max-width: 100%;
}
.teenpatti2 .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.teenpatti2 .casino-video-cards {
  top: 0;
  transform: unset;
}
.poker20 .casino-video .video-box-container {
  max-width: 100%;
}
.poker20 .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.poker20 .casino-video-cards {
  top: 50px;
  transform: unset;
  left: unset;
  right: 10px;
}
.poker1day .casino-video .video-box-container {
  max-width: 100%;
}
.poker1day .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.poker1day .casino-video-cards {
  top: 0;
  transform: unset;
}
.poker6player .casino-video .video-box-container {
  max-width: 100%;
}
.poker6player .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.poker6player .casino-video-cards {
  top: 0;
  transform: unset;
}
.andar-bahar2 .casino-video .video-box-container {
  max-width: 100%;
}
.andar-bahar2 .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.andar-bahar2.ab3 .casino-video .video-box {
  padding-bottom: 56.25%;
}
.andar-bahar2 .casino-video-cards {
  top: 0;
  transform: unset;
}
.andar-bahar2.ab3 .casino-video-cards {
  top: 50%;
  transform: translateY(-50%);
}
.andar-bahar .casino-video .video-box-container {
  max-width: 100%;
}
.andar-bahar .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.andar-bahar .casino-video-cards {
  top: 0;
  transform: unset;
}
.lucky7 .casino-video .video-box-container {
  max-width: 100%;
}
.lucky7 .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.lucky7 .casino-video-cards {
  top: 0;
  transform: unset;
}
.dt20 .casino-video .video-box-container {
  max-width: 100%;
}
.dt20 .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.dt20 .casino-video-cards {
  top: 0;
  transform: unset;
}
.dtl20 .casino-video .video-box-container {
  max-width: 100%;
}
.dtl20 .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.dtl20 .casino-video-cards {
  top: 0;
  transform: unset;
}
.dt1day .casino-video .video-box-container {
  max-width: 100%;
}
.dt1day .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.dt1day .casino-video-cards {
  top: 0;
  transform: unset;
}
.aaa .casino-video .video-box-container {
  max-width: 100%;
}
.aaa .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.aaa .casino-video-cards {
  top: 0;
  transform: unset;
}
.aaa .casino-video .video-box-container {
  max-width: 100%;
}
.aaa .casino-video .video-box {
  padding-bottom: 35.25%;
  margin-top: 0;
}
.aaa .casino-video-cards {
  top: 0;
  transform: unset;
}

.blink-message {
  padding: 5px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  color: var(--text-sidebar);
}

.blink-message i {
  font-size: 18px;
}

.blink-message > div {
  width: calc(100% - 30px);
  -moz-animation: blinktext normal 1s infinite ease-in-out;
  -webkit-animation: blinktext normal 1s infinite ease-in-out;
  -ms-animation: blinktext normal 1s infinite ease-in-out;
  animation: blinktext normal 1s infinite ease-in-out;
  text-decoration: underline;
  line-height: 1.5;
  font-size: 18px;
}

@-moz-keyframes blinktext {
  0% {
    opacity: 1;
    color: red;
  }

  50% {
    opacity: 1;
    color: yellow;
  }

  100% {
    opacity: 1;
    color: red;
  }
}

@-webkit-keyframes blinktext {
  0% {
    opacity: 1;
    color: red;
  }

  50% {
    opacity: 1;
    color: yellow;
  }

  100% {
    opacity: 1;
    color: red;
  }
}

@-ms-keyframes blinktext {
  0% {
    opacity: 1;
    color: red;
  }

  50% {
    opacity: 1;
    color: yellow;
  }

  100% {
    opacity: 1;
    color: red;
  }
}

@keyframes blinktext {
  0% {
    opacity: 1;
    color: red;
  }

  50% {
    opacity: 1;
    color: yellow;
  }

  100% {
    opacity: 1;
    color: red;
  }
}
.lottery .casino-video .video-box-container {
  max-width: 100%;
}
.sicbo .casino-video .video-box-container {
  max-width: 100%;
}
.duskadum.casino-video .video-box-container {
  max-width: 100%;
}
.teen1oneday .casino-video .video-box-container,
.teen1t20 .casino-video .video-box-container {
  max-width: 100%;
}
.note .casino-video .video-box-container {
  max-width: 100%;
}
.trap .casino-video .video-box-container {
  max-width: 100%;
}
.rules-section .table td,
.rules-section .table th {
  color: #fff;
}
.casino-vieo-rules img {
  max-width: 400px;
}
.virtual-cricket .scorecard::before {
  background-color: transparent;
}
.right-sidebar .scorecard {
  border-radius: 0;
}
.list-clients tr:first-child td {
  font-weight: bold;
}
.casino-result-desc.vteen20 {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding: 6px;
  box-shadow: 0 0 5px;
  margin-top: 10px;
  width: 100%;
  margin-left: auto;
}
.vminmax {
  position: relative;
}
.vminmax .icon-range {
  top: 20px;
}
.vmuflis .book-red {
  color: #ff0000 !important;
}
.vmuflis .casino-bl-box.suspended::before,
.race20 .casino-yn .casino-bl-box-item.suspended::before,
.casino-war .casino-bl-box.suspended::before,
.sicbo .sicbo-square-box.suspended::before,
.kbc .kbc-btns .btn.suspended::before {
  top: -12px;
}
.market-analysis-modal .market-analysis-content-detail .table td,
.market-analysis-modal .market-analysis-content-detail .table th {
  color: #000;
}
.user-lock-nav .custom-control-label::after,
.user-lock-nav .custom-control-label::before {
  top: -2px;
}
.super-over2 .casino-timer {
  right: unset;
  bottom: unset;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 50%;
}

/*Roulette*/
.roulette-box-container {
  width: 100%;
}
.board-in {
  display: grid;
  grid-template-rows: 105fr 50fr;
  grid-template-columns: 44fr 539fr 44fr;
  grid-template-areas:
    "center center right"
    ".      bottom .    ";
  grid-gap: 0.1328125311rem;
  gap: 0.1328125311rem;
  width: 100%;
  position: relative;
  /* height: 100%; */
  pointer-events: none;
}
.board-right {
  display: grid;
  grid-area: right;
  grid-template-rows: repeat(3, 1fr);
  grid-gap: 0.1328125311rem;
  gap: 0.1328125311rem;
  pointer-events: all;
}
.board-right .board-cell:first-child {
  /* border-top-right-radius: 1.062500249rem; */
}
.board-right .board-cell:last-child {
  /* border-bottom-right-radius: 1.062500249rem; */
}

.board-cell {
  position: relative;
  /* border-radius: 0.2656250623rem; */
  min-height: 50px;
}
.board-cell.active {
  border: 3px solid #000;
  filter: contrast(70%);
}
.board-cell-in {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* border-radius: inherit; */
  transition: background-color 180ms var(--g-ttf);
}
.board-cell-in::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-width: 0.1328125311rem;
  border-style: solid;
  border-color: #000;
  /* border-radius: inherit; */
  box-shadow: 0 0 0 4.2500009961rem rgba(var(--g-white-rgb), 0.15) inset;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}
.board-text,
.board-number {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
}

.board-cell-in .bet-chip-area {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate3d(-50%, -50%, 0);
  z-index: 15;
}
.board-bottom {
  display: grid;
  grid-area: bottom;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(6, 1fr);
  grid-template-areas:
    "first      first second second third third      "
    "first-half even  red    black  odd   second-half";
  grid-gap: 0.1328125311rem;
  gap: 0.1328125311rem;
  pointer-events: all;
}
.board-bottom .board-cell:first-child {
  grid-area: first;
}
.board-bottom .board-cell:nth-child(2) {
  grid-area: second;
}
.board-bottom .board-cell:nth-child(3) {
  grid-area: third;
}
.board-bottom .board-cell:nth-child(4) {
  grid-area: first-half;
  /* border-bottom-left-radius: 1.062500249rem; */
}
.board-bottom .board-cell:nth-child(5) {
  grid-area: even;
}
.board-bottom .board-cell:nth-child(6) {
  grid-area: red;
}
.board-bottom .board-cell:nth-child(7) {
  grid-area: black;
}
.board-bottom .board-cell:nth-child(8) {
  grid-area: odd;
}

.board-bottom .board-cell:last-child {
  grid-area: second-half;
  /* border-bottom-right-radius: 1.062500249rem; */
}
.board-center {
  display: grid;
  grid-area: center;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(13, 1fr);
  grid-template-areas:
    "zero c f i l o r u x aa ad ag aj"
    "zero b e h k n q t w z  ac af ai"
    "zero a d g j m p s v y  ab ae ah";
  grid-gap: 0.1328125311rem;
  gap: 0.1328125311rem;
  pointer-events: all;
}
.board-cell.green {
  background-color: #17732e;
  /* border-radius: 1.062500249rem 0.2656250623rem 0.2656250623rem 1.062500249rem; */
}
.board-cell.green.active {
  background-color: #119933;
  box-shadow: 0 0 0 4.2500009961rem rgba(255, 255, 255, 0.15) inset;
}
.board-center .board-cell:nth-child(1) {
  grid-area: zero;
}
.board-cell.red {
  background-color: #b2121f;
}
.board-cell.red.active {
  background-color: #e40303;
  box-shadow: 0 0 0 4.2500009961rem rgba(255, 255, 255, 0.15) inset;
}
.board-cell.black {
  background-color: #111111;
}
.board-cell.black.active {
  background-color: #404040;
  box-shadow: 0 0 0 4.2500009961rem rgba(255, 255, 255, 0.15) inset;
}

.board-cell.yellow {
  background-color: #fef0a9;
  color: #b2121f;
}
/* .board-cell.yellow:hover,
.board-cell.yellow:focus,
.board-cell.yellow:active,
.board-cell.yellow.active {
  background-color: yellow;
} */
.board-cell.yellow .board-text,
.board-cell.yellow .borad-number {
  color: red;
}
.board-center .bet-chip-area.center-left {
  top: 50%;
  left: 0;
  width: 50%;
  height: 50%;
  transform: translate3d(-50%, -50%, 0);
  z-index: 20;
}
.board-center .bet-chip-area.bottom-left {
  bottom: 0;
  left: 0;
  width: 50%;
  height: 50%;
  transform: translate3d(-50%, 50%, 0);
  z-index: 20;
}
.board-center .bet-chip-area.top-center {
  top: 0;
  left: 50%;
  width: 50%;
  height: 50%;
  /* transform: translate3d(-50%, 50%, 0); */
  z-index: 20;
}

.board-center .board-cell:nth-child(1) {
  grid-area: zero;
}
.board-center .board-cell:nth-child(2) {
  grid-area: a;
}
.board-center .board-cell:nth-child(3) {
  grid-area: b;
}
.board-center .board-cell:nth-child(4) {
  grid-area: c;
}
.board-center .board-cell:nth-child(5) {
  grid-area: d;
}
.board-center .board-cell:nth-child(6) {
  grid-area: e;
}
.board-center .board-cell:nth-child(7) {
  grid-area: f;
}
.board-center .board-cell:nth-child(8) {
  grid-area: g;
}

.board-center .board-cell:nth-child(9) {
  grid-area: h;
}
.board-center .board-cell:nth-child(10) {
  grid-area: i;
}
.board-center .board-cell:nth-child(11) {
  grid-area: j;
}
.board-center .board-cell:nth-child(12) {
  grid-area: k;
}
.board-center .board-cell:nth-child(13) {
  grid-area: l;
}
.board-center .board-cell:nth-child(14) {
  grid-area: m;
}
.board-center .board-cell:nth-child(15) {
  grid-area: n;
}
.board-center .board-cell:nth-child(16) {
  grid-area: o;
}
.board-center .board-cell:nth-child(17) {
  grid-area: p;
}
.board-center .board-cell:nth-child(18) {
  grid-area: q;
}
.board-center .board-cell:nth-child(19) {
  grid-area: r;
}
.board-center .board-cell:nth-child(20) {
  grid-area: s;
}
.board-center .board-cell:nth-child(21) {
  grid-area: t;
}
.board-center .board-cell:nth-child(22) {
  grid-area: u;
}
.board-center .board-cell:nth-child(23) {
  grid-area: v;
}
.board-center .board-cell:nth-child(24) {
  grid-area: w;
}
.board-center .board-cell:nth-child(25) {
  grid-area: x;
}
.board-center .board-cell:nth-child(26) {
  grid-area: y;
}
.board-center .board-cell:nth-child(27) {
  grid-area: z;
}
.board-center .board-cell:nth-child(28) {
  grid-area: aa;
}
.board-center .board-cell:nth-child(29) {
  grid-area: ab;
}
.board-center .board-cell:nth-child(30) {
  grid-area: ac;
}
.board-center .board-cell:nth-child(31) {
  grid-area: ad;
}
.board-center .board-cell:nth-child(32) {
  grid-area: ae;
}
.board-center .board-cell:nth-child(33) {
  grid-area: af;
}
.board-center .board-cell:nth-child(34) {
  grid-area: ag;
}
.board-center .board-cell:nth-child(35) {
  grid-area: ah;
}
.board-center .board-cell:nth-child(36) {
  grid-area: ai;
}
.board-center .board-cell:nth-child(37) {
  grid-area: aj;
}

.roulette .casino-video-cards {
  top: 50%;
  transform: translateY(-50%);
  left: 59px;
  background-color: transparent;
}
.roulette .casino-video-cards img {
  height: 80px;
  width: 102px;
}

.roulette .casino-video-last-results .result.green {
  background-color: #1a9e4a;
}
.roulette .casino-video-last-results .result.red {
  background-color: #db3131;
}
.roulette .casino-video-last-results .result.black {
  background-color: #3f3f3f;
}
.roulette .casino-video-last-results .result.yellow {
  background-color: #fef0a9;
  color: #000;
}
.roulette .suspended::after {
  background-color: #d6dedbd6;
  z-index: 1;
}
.roulette .suspended::before {
  filter: invert(0);
}
.pop-outin {
  animation: 2s anim-popoutin ease infinite;
}

@keyframes anim-popoutin {
  0% {
    color: black;
    transform: scale(0);
    opacity: 0;
    text-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
  25% {
    color: #ffdf00;
    transform: scale(2);
    opacity: 1;
    text-shadow: 3px 10px 5px rgba(0, 0, 0, 0.5);
  }
  50% {
    color: black;
    transform: scale(1);
    opacity: 1;
    text-shadow: 1px 0 0 rgba(0, 0, 0, 0);
  }
  100% {
    /* animate nothing to add pause at the end of animation */
    transform: scale(1);
    opacity: 1;
    text-shadow: 1px 0 0 rgba(0, 0, 0, 0);
  }
}

.booksum-title {
  background: var(--bg-secondary70);
  padding: 6px;
  color: var(--text-secondary);
  cursor: pointer;
}
.booksum-desc {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 5px;
  padding: 5px;
}
.booksum-box {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  flex: 1;
  min-width: calc(33.33% - 5px);
  max-width: calc(50% - 5px);
  box-shadow: 0 0 1px;
  background: #f6f6f6;
}

/*Teenpatti Joker*/
.teenpatti-joker .teen1dayleft {
  align-self: center;
}
.teenpatti-joker .casino-nation-name {
  width: 50%;
  padding-right: 10px;
  position: relative;
}
.teenpatti-joker .casino-bl-box {
  width: 50%;
}
.teenpatti-joker .casino-bl-box-item {
  width: calc(50% - 2px);
}
.teenpatti-joker .joker-other .casino-bl-box-item {
  width: 100%;
  height: 40px;
}
.teenpatti-joker .joker-other .casino-bl-box {
  width: calc(25% - 3px);
  margin-right: 4px;
  position: relative;
}
.teenpatti-joker .joker-other .casino-bl-box:last-child {
  margin-right: 0;
}
.teenpatti-joker .casino-video-cards {
  height: 280px;
}
.teenpatti-joker .casino-card-img img {
  width: 20px;
}
.joker-card {
  justify-content: center;
  flex-wrap: wrap !important;
  flex-direction: column;
  align-items: center;
}
.joker-result .casino-result-content-item:first-child {
  width: 100%;
}
.joker-result .casino-result-cards {
  border: none;
}
/* joker 1 */
.teenpatti-joker.joker1 .teen1dayleft {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
.teenpatti-joker.joker1 .casino-box-row {
  width: 49%;
}
.teenpatti-joker.joker1 .casino-nation-name img {
  height: 30px;
  margin-right: 5px;
}
.teenpatti-joker.joker1 .casino-nation-name {
  min-height: 38px;
}
/*Doli Dana*/
.doli-main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
}
.doli-dana .casino-odds-box {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 0;
  font-weight: bold;
  cursor: pointer;
  min-height: 46px;
}
.doli-dana .casino-nation-name {
  min-height: 38px;
  width: 100%;
  padding-right: 10px;
  position: relative;
}
.doli-main .players-bet {
  width: calc(40% - 5px);
  display: flex;
  flex-wrap: wrap;
}
.doli-main .side-bets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: calc(60% - 5px);
  gap: 10px;
}
.doli-main .side-bets .odd-even-pair {
  width: calc(35% - 7px);
  background: #0000000a;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.doli-main .side-bets .bets-box {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.doli-main .side-bets .odd-even-pair .bets-box .doli-odds-box {
  width: calc(50% - 5px);
}
.doli-main .side-bets .odd-even-pair .bets-box .casino-odds-box {
  width: 100%;
}
.doli-main .side-bets .lucky7-pair {
  width: calc(45% - 7px);
  background: #0000000a;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.doli-main .side-bets .lucky7-pair .bets-box .doli-odds-box {
  width: calc(33.33% - 5px);
}
.doli-main .side-bets .lucky7-pair .bets-box .casino-odds-box {
  width: 100%;
}
.doli-main .casino-table-row {
  width: 100%;
  display: flex;
}
.doli-main .casino-nation-detail {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  padding-left: 5px;
  min-height: 46px;
  width: 60%;
  border-left: 1px solid var(--table-border);
  border-top: 1px solid var(--table-border);
}
.doli-dana .doli-odds-box {
  width: 20%;
  position: relative;
}
.doli-dana .icon-range {
  top: 16px;
}
.doli-main .casino-odds-box {
  width: 100%;
}
.doli-main .any-pair {
  width: calc(20% - 7px);
}
.doli-main .any-pair .doli-odds-box {
  width: 100%;
}
.doli-main .any-pair .casino-odds-box {
  width: 100%;
  border-radius: 4px;
  height: 60px;
}
.doli-dana .casino-volume {
  font-weight: 400;
  /* font-size: 14px; */
}
.doli-dana .casino-odds {
  font-size: 16px;
}
.doli-dana .odd-name {
  font-size: 12px;
  font-weight: bold;
  text-align: center;
}
.doli-other-bets {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
  margin-top: 8px;
}
.doli-other-bets .casino-odds-box,
.doli-main .side-bets .casino-odds-box {
  border-radius: 4px;
}
.doli-other-bets h4,
.doli-main .side-bets h4 {
  /* background: var(--bg-sidebar);
  padding:6px 10px;
  color: var(--text-sidebar); */
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}
.doli-other-bets .bets-box {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.doli-other-bets .particular-pair {
  width: calc(35% - 5px);
  background: #0000000a;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  /* justify-content: center; */
}
.doli-other-bets .particular-pair .bets-box .doli-odds-box {
  width: calc(33.33% - 5px);
}
.doli-other-bets .particular-pair .bets-box .casino-odds-box {
  width: 100%;
}
.doli-other-bets .sum-odds {
  width: calc(65% - 5px);
  background: #0000000a;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  /* justify-content: center; */
}
.doli-other-bets .sum-odds .bets-box .doli-odds-box {
  width: calc(16.66% - 5px);
}
.doli-other-bets .sum-odds .bets-box .casino-odds-box {
  width: 100%;
}
.doli-dana .casino-odds-box.suspended-box::before {
  top: -12px;
}
.doli-dana .seven-box {
  text-align: center;
}
.doli-dana .seven-box img {
  height: 60px;
}
.teenunique .casino-result-cards {
  border-bottom: none;
}
.unique-teen20-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  padding: 0;
  /* width: 100%; */
  margin: 0 auto;
  gap: 10px;
}
.unique-teen20-box .unique-teen20-card {
  text-align: center;
  margin: 5px 0;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.unique-teen20-box .unique-teen20-card img:first-child {
  width: 25px;
  box-shadow: none;
}
.unique-teen20-box .unique-teen20-card img {
  width: 50px;
  height: auto;
  cursor: pointer;
  /* border: 3px solid; */
}

/*Casino Banners*/
.diamond-casino-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.diamond-casino-container .casino-box {
  width: calc(12.5% - 5px);
}

.mogambo.teenpatti2cards .teen1dayright .casino-bl-box-item {
  width: 100%;
}
.mogambo .three-card-total {
  width: 50%;
  margin: 0 auto;
}
.mogambo .three-card-total .casino-bl-box-item {
  width: calc(50% - 4px);
  height: 48px;
}

.matka .matka-tabs {
  margin-bottom: 4px;
  margin-top: 4px;
}

.matka .matka-tabs .nav-pills {
  gap: 0 4px;
  flex-wrap: nowrap;
  overflow: auto;
  white-space: nowrap;
}

.matka .matka-tabs .nav-pills .nav-link {
  background: #374151;
  color: #fff;
  font-size: 14px;
  text-transform: uppercase;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  padding: 4px 8px;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.matka .matka-tabs .nav-pills .nav-link.active,
.matka .matka-tabs .nav-pills .show > .nav-link {
  color: #fff;
  background-color: #125e7b;
  font-weight: bold;
}

.matka .matka-tabs .remaining-time {
  display: flex;
  align-items: center;
  gap: 6px;
}

.matka .matka-tabs .remaining-time span {
  font-weight: bold;
  color: #fdcf13;
  font-size: 12px;
}

.matka .matka-tabs .remaining-time img {
  height: 18px;
}

.matka .game-time {
  margin-top: -3px;
  font-size: 11px;
}

.casino-video-last-results.matka-result span,
.casino-video-last-results.matka-result a {
  min-width: 70px;
  border-radius: 0;
  width: auto;
  color: #fff;
}