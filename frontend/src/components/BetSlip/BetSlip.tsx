import { useState, type FC } from 'react';
import { useBetSlip } from '../../context/BetSlipContext';
import { toast } from 'react-toastify';
import api from '../../api/axiosConfig';
import './BetSlip.css';

const BetSlip: FC = () => {
    const { bet, setBet } = useBetSlip();

    const [amount, setAmount] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!bet) return null;

    const handleClose = () => {
        setBet(null);
        setAmount('');
    };

    const potentialWin = amount ? (Number(amount) * bet.odds).toFixed(2) : '0.00';

    const addAmount = (val: number) => {
        setAmount(prev => (prev === '' ? val : Number(prev) + val));
    };

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.warning("Введіть суму ставки! 💰");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/bets', {
                matchId: bet.matchId,
                choice: bet.betType,
                amount: Number(amount),
                odd: bet.odds
            });

            toast.success("Ставку успішно прийнято! Нехай щастить! 🍀");
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error("Помилка при оформленні ставки ❌");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bet-slip-overlay">
            <div className="bet-slip-backdrop" onClick={handleClose}></div>

            <div className="bet-slip-sidebar">
                <div className="bet-slip-header">
                    <h2>ВАШ КУПОН</h2>
                    <button className="bet-slip-close" onClick={handleClose}>✕</button>
                </div>

                <div className="bet-slip-content">
                    <div className="bet-slip-match">
                        <div className="match-teams">
                            {bet.team1} <br/> <span className="vs-text">vs</span> <br/> {bet.team2}
                        </div>
                    </div>

                    <div className="bet-slip-selection">
                        <span className="selection-label">Вибір: <span className="selection-choice">{bet.betType}</span></span>
                        <span className="selection-odds">{bet.odds.toFixed(2)}</span>
                    </div>

                    <div className="bet-slip-input-group">
                        <label>Сума ставки (₴):</label>
                        <input
                            type="number"
                            className="bet-slip-input"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            min="1"
                        />
                    </div>

                    <div className="bet-slip-quick-amounts">
                        <button onClick={() => addAmount(100)}>+100</button>
                        <button onClick={() => addAmount(500)}>+500</button>
                        <button onClick={() => addAmount(1000)}>+1000</button>
                        <button onClick={() => addAmount(5000)}>+5000</button>
                    </div>

                    <div className="bet-slip-summary">
                        <span>Можливий виграш:</span>
                        <span className="summary-win">{potentialWin} ₴</span>
                    </div>
                </div>

                <div className="bet-slip-footer">
                    <button
                        className="btn-submit-bet"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !amount}
                    >
                        {isSubmitting ? 'ОБРОБКА...' : 'ЗРОБИТИ СТАВКУ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BetSlip;