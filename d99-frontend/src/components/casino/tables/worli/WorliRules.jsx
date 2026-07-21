export default function WorliRules() {
  return (
    <div className="rules-section worli-rules">
      <h5>Worli Matka — Rules</h5>
      <p>
        Matka is a popular Indian numbers game where results are decided by
        calculating the total of cards. Cards used: A, 2, 3, 4, 5, 6, 7, 8, 9, 10
        in all four suits (♠ Spade, ♥ Heart, ♣ Club, ♦ Diamond).
      </p>

      <h6>Card Value</h6>
      <ul>
        <li>A (Ace) = 1, and 2–9 keep their face value.</li>
        <li><b>10 is counted as 0</b> — important in Matka calculation.</li>
      </ul>

      <h6>1) Single Digit (Ocada)</h6>
      <ul>
        <li>Any number from 0–9 you bet on.</li>
        <li>It is the <b>last digit of the sum of the three cards</b>.</li>
        <li>Example: Pana 2-3-9 → 2 + 3 + 9 = 14 → last digit <b>4</b> → Single = 4.</li>
        <li>Line 1 = 1,2,3,4,5 · Line 2 = 6,7,8,9,0 · ODD = 1,3,5,7,9 · EVEN = 2,4,6,8,0 (on the Single).</li>
      </ul>

      <h6>2) Pana</h6>
      <ul>
        <li>A group of three cards (0–9). The Single is the last digit of their total.</li>
        <li>Example: 1, 2, 5 → sum 8 → Single = 8, Pana = 125.</li>
      </ul>

      <h6>4) Single Pana (SP)</h6>
      <p>All three digits are different (no repeat). Written in ascending order. 120 combinations. e.g. 123, 459, 027.</p>

      <h6>5) Double Pana (DP)</h6>
      <p>Exactly two of the three digits are the same. e.g. 112, 559, 400. The Single is still the last digit of the sum.</p>

      <h6>6) Trio</h6>
      <p>All three digits the same: 111, 222, 333, 444, 555, 666, 777, 888, 999, 000.</p>

      <h6>7) Cycle (CP)</h6>
      <p>Choose two digits; you win if <b>both</b> chosen digits appear in the result Pana. e.g. Cycle 1-2 → 123, 124, 125, 126, 127, 128, 129, 120 all win.</p>

      <h6>8) Motor SP</h6>
      <p>Choose 4 to 9 numbers; all possible 3-digit Single Panas from them form a set. If any one appears in the result you win. e.g. 1,2,3,4 → 123, 124, 134, 234.</p>

      <h6>9) 56 Chart</h6>
      <p>A structured chart of <b>56</b> combinations, generally formed from digits 2–9 (excluding 0 and 1).</p>

      <h6>10) 64 Chart</h6>
      <p>A structured chart of <b>64</b> combinations, generally including the digits 0 and 1.</p>

      <h6>11) ABR (A / B / R)</h6>
      <ul>
        <li><b>A — Aki</b>: Odd numbers (1, 3, 5, 7, 9).</li>
        <li><b>B — Beki</b>: Even numbers (2, 4, 6, 8, 0).</li>
        <li><b>R — Ron</b>: A sequence Pana (three consecutive cards), e.g. 123, 234, 456, 789, 890, 120.</li>
      </ul>

      <h6>12) Common SP</h6>
      <p>Choose one digit (0–9). You win if the chosen digit appears (once, not as a repeated pair) in the three-digit result Pana.</p>

      <h6>13) Common DP</h6>
      <p>Choose one digit. You win when the result contains a pair (two identical digits) <b>and</b> your chosen digit is included in that set. A Trio (three identical) is not valid for this bet.</p>

      <h6>14) Color DP</h6>
      <ul>
        <li>Win is based on an odd/even colour sequence plus a pair.</li>
        <li>All three numbers must be the same colour — all odd (1,3,5,7,9) or all even (0,2,4,6,8).</li>
        <li>The set must contain a pair, and your chosen digit must be present.</li>
      </ul>

      <h6>General</h6>
      <ul>
        <li>If any issue arises, the company's decision based on the situation is final.</li>
        <li>If a draw does not start within 30 minutes, that draw is cancelled.</li>
      </ul>
    </div>
  );
}
