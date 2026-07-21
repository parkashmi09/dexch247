export default function Worli3Rules() {
  return (
    <>
      {/* Hindi Section */}
      <div className="rules-section" style={{ fontFamily: '"Noto Sans Devanagari", sans-serif', fontSize: "16px" }}>
        <h5 className="rules-highlight">मटका एक भारतीय आँकड़ा खेल है, जिसमें परिणाम अंक गणना (Calculation) के आधार पर निकाले जाते हैं।</h5>
        <ul className="pl-4 pr-4 list-style">
          <li>कार्ड और उनकी वैल्यू</li>
          <li>इस खेल में ताश (Cards) का उपयोग किया जाता है।</li>
          <li>उपयोग होने वाले कार्ड: A, 2, 3, 4, 5, 6, 7, 8, 9, 10</li>
          <li>चारों सूट में: ♠ Spade, ♥ Heart, ♣ Club, ♦ Diamond</li>
        </ul>
        <h6 className="rules-highlight">कार्ड वैल्यू (Card Value):</h6>
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th>कार्ड</th><th>वैल्यू</th></tr></thead>
            <tbody>
              {[["A (Ace)","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"],["9","9"],["10","0"]].map(([c,v])=>(
                <tr key={c}><td>{c}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>⚠️ नोट: इस प्रणाली में 10 को 0 माना जाता है, जो मटका की अंक-गणना में बहुत महत्वपूर्ण होता है।</p>
        <p><b>आंकड़ा कैसे बनता है?</b> आंकड़ा हमेशा पाना (Patti) के जोड़ से पैदा होता है।</p>
        <ul className="pl-4 pr-4 list-style">
          <li>मान लीजिए पाना खुला: 2-3-9</li>
          <li>इनका जोड़ करें: 2 + 3 + 9 = 14</li>
          <li>जोड़ का आखिरी अंक: 4</li>
          <li>तो इस खेल का 'सिंगल आंकड़ा' 4 कहलाएगा।</li>
        </ul>

        <h6 className="rules-highlight">जोड़ी (Jodi)</h6>
        <p>दो अंकों को मिलाकर दांव लगाया जाता है (00 से 99)।</p>
        <ul className="pl-4 pr-4 list-style">
          <li><b>ओपन (Open):</b> खेल की शुरुआत में निकलने वाला पहला आंकड़ा।</li>
          <li><b>क्लोज (Close):</b> खेल के अंत में निकलने वाला आंकड़ा।</li>
          <li>फाइनल जोड़ी = ओपन + क्लोज (जैसे 4 + 7 = 47)</li>
        </ul>

        <h6 className="rules-highlight">सिंगल पाना (SP)</h6>
        <p>तीनों अंक अलग-अलग होते हैं। कुल 120 कॉम्बिनेशन। हमेशा छोटे से बड़े क्रम में लिखा जाता है।</p>

        <h6 className="rules-highlight">डबल पाना (DP)</h6>
        <p>तीन अंकों में से दो अंक एक जैसे होते हैं। उदाहरण: 112, 559, 400</p>

        <h6 className="rules-highlight">TRIO (ट्रायो)</h6>
        <p>तीनों अंक एक जैसे: 111, 222, 333, 444, 555, 666, 777, 888, 999, 000</p>

        <h6 className="rules-highlight">Cycle (साइकिल)</h6>
        <p>दो अंक चुनें। अगर दोनों अंक रिजल्ट पाना में आ जाएं तो जीत।</p>

        <h6 className="rules-highlight">Motor SP (मोटर SP)</h6>
        <p>कम से कम 4, ज़्यादा से ज़्यादा 9 कार्ड चुनें। सभी संभव SP कॉम्बिनेशन बनते हैं।</p>

        <h6 className="rules-highlight">56 Chart / 64 Chart</h6>
        <p>56 चार्ट में 0 और 1 को छोड़कर 2 से 9 के संयोजन। 64 चार्ट में 0 और 1 शामिल।</p>

        <h6 className="rules-highlight">ABR (A/B/R)</h6>
        <ul className="pl-4 pr-4 list-style">
          <li><b>अकी (Aki):</b> विषम अंक — 1, 3, 5, 7, 9</li>
          <li><b>बेकी (Beki):</b> सम अंक — 2, 4, 6, 8, 0</li>
          <li><b>रोन (Ron):</b> सीक्वेंस — 123, 234, 456, 789, 890, 120</li>
        </ul>

        <h6 className="rules-highlight">कॉमन SP / कॉमन DP / Color DP</h6>
        <ul className="pl-4 pr-4 list-style">
          <li><b>Common SP:</b> चुना हुआ अंक पाना में एक बार मौजूद हो।</li>
          <li><b>Common DP:</b> चुना हुआ अंक पेयर में शामिल हो।</li>
          <li><b>Color DP:</b> तीनों अंक सम या विषम + पेयर + चुना हुआ अंक शामिल।</li>
        </ul>

        <p>मटका मार्केट में कंपनी का अंतिम निर्णय मान्य होगा। 30 मिनट के अंदर ड्रॉ शुरू नहीं होने पर रद्द।</p>
      </div>

      <p className="border-bottom border-warning my-3"></p>

      {/* English Section */}
      <div className="rules-section">
        <h5 className="rules-highlight">Matka is a popular Indian game based on numbers, where results are decided by calculating the total of numbers.</h5>
        <ul className="pl-4 pr-4 list-style">
          <li>Cards used: A, 2, 3, 4, 5, 6, 7, 8, 9, 10</li>
          <li>Suits: ♠ Spade, ♥ Heart, ♣ Club, ♦ Diamond</li>
        </ul>
        <h6 className="rules-highlight">Card Value:</h6>
        <div className="table-responsive">
          <table className="table">
            <thead><tr><th>Card</th><th>Value</th></tr></thead>
            <tbody>
              {[["A (Ace)","1"],["2","2"],["3","3"],["4","4"],["5","5"],["6","6"],["7","7"],["8","8"],["9","9"],["10","0"]].map(([c,v])=>(
                <tr key={c}><td>{c}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>⚠️ Note: 10 is considered 0 in Matka calculation.</p>

        <h6 className="rules-highlight">1) Single Digit (Ocada)</h6>
        <p>Any number from 0 to 9. Last digit of sum of three cards.</p>
        <ul className="pl-4 pr-4 list-style">
          <li>Pana: 2-3-9 → Sum: 14 → Single Digit = 4</li>
        </ul>

        <h6 className="rules-highlight">2) Jodi (Pair)</h6>
        <p>Two-digit number (00 to 99). Open digit + Close digit.</p>
        <ul className="pl-4 pr-4 list-style">
          <li>Open = 4, Close = 7 → Jodi = 47</li>
        </ul>

        <h6 className="rules-highlight">3) Pana</h6>
        <p>Three-digit set from 0-9. Single digit = last digit of sum.</p>
        <p>Example: 1+2+5 = 8 → Single = 8, Pana = 125</p>

        <h6 className="rules-highlight">4) Single Pana (SP)</h6>
        <p>All three digits different. Written in ascending order. Total 120 combinations.</p>

        <h6 className="rules-highlight">5) Double Pana (DP)</h6>
        <p>Two out of three digits are same. Example: 112, 559, 400</p>

        <h6 className="rules-highlight">6) Trio</h6>
        <p>All three digits same: 111, 222, 333, 444, 555, 666, 777, 888, 999, 000</p>

        <h6 className="rules-highlight">7) Cycle (CP)</h6>
        <p>Choose 2 digits. Win if both appear in drawn Pana.</p>
        <p>Example: Cycle 1-2 → Pana 123, 124... → Win</p>

        <h6 className="rules-highlight">8) Motor SP</h6>
        <p>Select 4-9 numbers. All possible SP combinations formed. Any match = Win.</p>

        <h6 className="rules-highlight">9) 56 Chart</h6>
        <p>56 combinations excluding 0 and 1 (digits 2-9).</p>

        <h6 className="rules-highlight">10) 64 Chart</h6>
        <p>64 combinations including 0 and 1.</p>

        <h6 className="rules-highlight">11) ABR (A/B/R)</h6>
        <ul className="pl-4 pr-4 list-style">
          <li><b>Aki:</b> Odd — 1, 3, 5, 7, 9</li>
          <li><b>Beki:</b> Even — 2, 4, 6, 8, 0</li>
          <li><b>Ron:</b> Sequence — 123, 234, 456, 789, 890, 120</li>
        </ul>

        <h6 className="rules-highlight">12) Common SP</h6>
        <p>Choose 1 digit. Win if it appears once in result Pana.</p>

        <h6 className="rules-highlight">13) Common DP</h6>
        <p>Choose 1 digit. Win if result has a pair and your digit is included. Trio not valid.</p>

        <h6 className="rules-highlight">14) Color DP</h6>
        <p>All three must be odd or all even + pair + chosen digit present.</p>

        <p>Company's decision is final. Draw cancelled if not started within 30 minutes. Jodi follows opening draw if closing doesn't start.</p>
      </div>
    </>
  );
}
