import { useState } from "react";
import "./Slot1.css";

import imm1 from "../assets/icons/imm1.png";
import imm2 from "../assets/icons/imm2.png";
import imm3 from "../assets/icons/imm3.png";
import imm4 from "../assets/icons/imm4.png";
import imm5 from "../assets/icons/imm5.png";
import imm6 from "../assets/icons/imm6.png";

const symbols = [imm1, imm2, imm3, imm4, imm5, imm6];

const randomSymbol = () => {
    const index = Math.floor(Math.random() * symbols.length);
    return symbols[index];
};

const BoxOfRaPage = () => {
    const [reels, setReels] = useState([
        randomSymbol(),
        randomSymbol(),
        randomSymbol(),
    ]);

    const [balance, setBalance] = useState(1000);
    const [bet, setBet] = useState(50);
    const [message, setMessage] = useState("Натисни Крутити");

    const spin = () => {
        if (balance < bet) {
            setMessage("Недостатньо коштів");
            return;
        }

        const newReels = [randomSymbol(), randomSymbol(), randomSymbol()];
        setReels(newReels);

        let win = 0;

        if (newReels[0] === newReels[1] && newReels[1] === newReels[2]) {
            win = bet * 5;
            setMessage(`ДЖЕКПОТ +${win}`);
        } else if (
            newReels[0] === newReels[1] ||
            newReels[1] === newReels[2] ||
            newReels[0] === newReels[2]
        ) {
            win = bet * 2;
            setMessage(`Виграш +${win}`);
        } else {
            setMessage("Без виграшу");
        }

        setBalance((prev) => prev - bet + win);
    };

    return (
        <div className="boxra-page">
            <div className="boxra-card">
                <h1 className="boxra-title">BOX OF RA</h1>

                <div className="boxra-balance">Баланс: {balance}</div>

                <div className="boxra-reels">
                    {reels.map((symbol, i) => (
                        <div key={i} className="boxra-reel">
                            <img src={symbol} alt="symbol" className="boxra-img" />
                        </div>
                    ))}
                </div>

                <div className="boxra-controls">
                    <input
                        type="number"
                        value={bet}
                        min={10}
                        step={10}
                        onChange={(e) => setBet(Number(e.target.value))}
                        className="boxra-input"
                    />

                    <button className="boxra-spin" onClick={spin}>
                        Крутити
                    </button>
                </div>

                <div className="boxra-message">{message}</div>
            </div>
        </div>
    );
};

export default BoxOfRaPage;