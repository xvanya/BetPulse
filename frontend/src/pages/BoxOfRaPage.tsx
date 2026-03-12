import { useMemo, useState } from "react";
import "./Slot1.css";

import imm1 from "../assets/icons/imm1.png";
import imm2 from "../assets/icons/imm2.png";
import imm3 from "../assets/icons/imm3.png";
import imm4 from "../assets/icons/imm4.png";
import imm5 from "../assets/icons/imm5.png";
import imm6 from "../assets/icons/imm6.png";

type SymbolItem = {
    image: string;
    name: string;
    multiplier: number;
};

const symbols: SymbolItem[] = [
    { image: imm1, name: "imm1", multiplier: 2 },
    { image: imm2, name: "imm2", multiplier: 3 },
    { image: imm3, name: "imm3", multiplier: 4 },
    { image: imm4, name: "imm4", multiplier: 5 },
    { image: imm5, name: "imm5", multiplier: 6 },
    { image: imm6, name: "imm6", multiplier: 8 },
];

const getRandomSymbol = () => {
    const index = Math.floor(Math.random() * symbols.length);
    return symbols[index];
};

const BoxOfRaPage = () => {
    const [reels, setReels] = useState<SymbolItem[]>([
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol(),
    ]);

    const [balance, setBalance] = useState(1000);
    const [bet, setBet] = useState(50);
    const [message, setMessage] = useState("Натисни «Крутити», щоб почати");
    const [isSpinning, setIsSpinning] = useState(false);

    const canSpin = useMemo(() => {
        return !isSpinning && bet > 0 && balance >= bet;
    }, [isSpinning, bet, balance]);

    const resolveWin = (nextReels: SymbolItem[]) => {
        const [a, b, c] = nextReels;

        if (a.name === b.name && b.name === c.name) {
            return bet * a.multiplier;
        }

        if (a.name === b.name || b.name === c.name || a.name === c.name) {
            const matched =
                a.name === b.name ? a : b.name === c.name ? b : a;
            return Math.floor(bet * (matched.multiplier / 2));
        }

        return 0;
    };

    const handleSpin = () => {
        if (!canSpin) {
            setMessage("Недостатньо коштів або слот уже крутиться");
            return;
        }

        setIsSpinning(true);
        setMessage("Барабани крутяться...");

        setBalance((prev) => prev - bet);

        const spinInterval = setInterval(() => {
            setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
        }, 100);

        setTimeout(() => {
            clearInterval(spinInterval);

            const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
            setReels(finalReels);

            const win = resolveWin(finalReels);

            if (win > 0) {
                setBalance((prev) => prev + win);
                setMessage(`Виграш: +${win}`);
            } else {
                setMessage("Без виграшу. Спробуй ще");
            }

            setIsSpinning(false);
        }, 1400);
    };

    const increaseBet = () => {
        setBet((prev) => prev + 10);
    };

    const decreaseBet = () => {
        setBet((prev) => Math.max(10, prev - 10));
    };

    return (
        <div className="boxra-page">
            <div className="boxra-card">
                <div className="boxra-top">
                    <div>
                        <h1 className="boxra-title">BOX OF RA</h1>
                        <p className="boxra-subtitle">Слот у стилі стародавніх скарбів</p>
                    </div>

                    <div className="boxra-balance">
                        Баланс: <span>{balance}</span>
                    </div>
                </div>

                <div className="boxra-slot-frame">
                    <div className="boxra-reels">
                        {reels.map((symbol, index) => (
                            <div
                                key={index}
                                className={`boxra-reel ${isSpinning ? "boxra-reel--spinning" : ""}`}
                            >
                                <img src={symbol.image} alt={symbol.name} className="boxra-img" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="boxra-controls">
                    <div className="boxra-bet-panel">
                        <span className="boxra-label">Ставка</span>

                        <div className="boxra-bet-controls">
                            <button
                                type="button"
                                className="boxra-small-btn"
                                onClick={decreaseBet}
                                disabled={isSpinning}
                            >
                                −
                            </button>

                            <div className="boxra-bet-value">{bet}</div>

                            <button
                                type="button"
                                className="boxra-small-btn"
                                onClick={increaseBet}
                                disabled={isSpinning}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="boxra-spin-btn"
                        onClick={handleSpin}
                        disabled={!canSpin}
                    >
                        {isSpinning ? "Крутиться..." : "Крутити"}
                    </button>
                </div>

                <div className={`boxra-message ${message.includes("Виграш") ? "boxra-message--win" : ""}`}>
                    {message}
                </div>

                <div className="boxra-rules">
                    <h3>Правила</h3>
                    <p>3 однакові символи = множник символу × ставка</p>
                    <p>2 однакові символи = половина множника символу × ставка</p>
                </div>
            </div>
        </div>
    );
};

export default BoxOfRaPage;