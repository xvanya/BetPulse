import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './BetsHistoryPage.css';

type Bet = {
    id: number;
    matchId: number;
    choice: string;
    amount: number;
    odd: number;
    potentialWin: number;
    status: string;
    betDate: string;
};

const BetsHistoryPage: FC = () => {
    const navigate = useNavigate();
    const [bets, setBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBets = async () => {
            try {
                const response = await api.get('/bets');

                if (Array.isArray(response.data)) {
                    const sortedBets = response.data.sort((a, b) =>
                        new Date(a.betDate).getTime() - new Date(b.betDate).getTime()
                    );
                    setBets(sortedBets);
                } else {
                    setBets([]);
                }
            } catch (error) {
                console.error('Помилка завантаження ставок:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBets();
    }, []);

    return (
        <div className="history-page-container">
            <div className="history-header">
                <button className="btn-back-profile" onClick={() => navigate('/profile')}>
                    Назад до профілю
                </button>
                <h2 className="history-title">Моя історія ставок</h2>
            </div>

            <div className="history-content">
                {loading ? (
                    <div className="history-loading">Завантаження...</div>
                ) : bets.length === 0 ? (
                    <div className="history-empty">У вас ще немає ставок. Час зробити першу!</div>
                ) : (
                    <div className="history-table-wrapper">
                        <table className="history-table">
                            <thead>
                            <tr>
                                <th>№</th>
                                <th>Дата та час</th>
                                <th>Вибір</th>
                                <th>Коефіцієнт</th>
                                <th>Ставка</th>
                                <th>Можливий виграш</th>
                                <th>Статус</th>
                            </tr>
                            </thead>
                            <tbody>
                            {bets.map((b, index) => (
                                <tr key={b.id}>
                                    <td className="history-td-id">{index + 1}</td>
                                    <td className="history-td-date">
                                        {b.betDate ? new Date(b.betDate).toLocaleString("uk-UA") : '—'}
                                    </td>
                                    <td className="history-choice">{b.choice}</td>
                                    <td>{b.odd?.toFixed(2)}</td>
                                    <td>{b.amount} ₴</td>
                                    <td className="history-win">{b.potentialWin} ₴</td>
                                    <td>
                                            <span className={`history-status history-status-${b.status?.toLowerCase() || 'pending'}`}>
                                                {b.status}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BetsHistoryPage;