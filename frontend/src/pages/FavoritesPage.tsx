import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import '../styles/ProfilePage.css';
import './FavoritesPage.css';

interface FavoriteItem {
    id: number;
    competitionId: number;
    competitionName: string;
    country: string;
}

const FavoritesPage = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);

    const userName = localStorage.getItem('userEmail')?.split('@')[0] || 'Користувач';
    const userEmail = localStorage.getItem('userEmail') || '';
    const avatarLetter = userName.charAt(0).toUpperCase();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await api.get<FavoriteItem[]>('/profile/favorites');
                setFavorites(response.data);
            } catch (err) {
                console.error("Помилка завантаження:", err);
                toast.error("Не вдалося завантажити улюблені турніри ");
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const removeFavorite = async (id: number) => {
        try {
            await api.delete(`/profile/favorites/${id}`);
            setFavorites(prevFavorites => prevFavorites.filter(item => item.id !== id));
            toast.success("Турнір видалено з улюблених ");
        } catch (err) {
            console.error("Помилка видалення:", err);
            toast.error("Помилка видалення ");
        }
    };

    return (
        <div className="profile-layout">
            <div className="profile-inner-wrapper">

                {/* --- САЙДБАР --- */}
                <div className="profile-sidebar">
                    <div className="sidebar-user-info">
                        <div className="sidebar-avatar">{avatarLetter}</div>
                        <h2 className="sidebar-name">{userName}</h2>
                        <p className="sidebar-email">{userEmail}</p>
                    </div>

                    <div className="sidebar-navigation">
                        <button className="btn-nav" onClick={() => navigate('/profile')}>
                            Особистий кабінет
                        </button>
                        <button className="btn-nav" onClick={() => navigate('/bets-history')}>
                            Історія ставок
                        </button>
                        <button className="btn-nav active" onClick={() => navigate('/favorites')}>
                            Улюблені
                        </button>
                        <button className="btn-nav" onClick={() => navigate('/')}>
                            На головну
                        </button>
                    </div>

                    <div className="sidebar-footer">
                        <button className="btn-logout-full" onClick={handleLogout}>
                            Вийти з акаунту
                        </button>
                    </div>
                </div>

                {/* --- ГОЛОВНА ЗОНА --- */}
                <div className="profile-main-area">
                    <h1 className="page-main-title">Мої улюблені турніри</h1>

                    <div className="content-section">
                        {loading ? (
                            <div className="profile-message">Завантаження...</div>
                        ) : favorites.length > 0 ? (
                            <div className="card-pulse">
                                <Table className="table-pulse" responsive hover>
                                    <thead>
                                    <tr>
                                        <th className="ps-4">Турнір / Змагання</th>
                                        <th>Країна</th>
                                        <th className="pe-4 text-end">Дії</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {favorites.map(item => (
                                        <tr
                                            key={item.id}

                                            onClick={() => navigate(`/competition/${item.competitionId}`)}
                                        >
                                            <td className="ps-4">
                                                <span className="match-teams">
                                                    {item.competitionName}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="custom-badge date-badge">{item.country || 'Міжнародний'}</span>
                                            </td>
                                            <td className="pe-4 text-end">
                                                <button
                                                    className="btn-delete-icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Зупиняє клік, щоб не відбувся перехід на сторінку
                                                        removeFavorite(item.id);
                                                    }}
                                                    title="Видалити з улюблених"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            <div className="info-card" style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
                                <h3 style={{ color: '#aeb5bc' }}>У вас поки немає улюблених турнірів 💔</h3>
                                <p style={{ marginTop: '10px' }}>Додавайте змагання до улюблених, щоб швидко знаходити їх тут.</p>
                                <button className="btn-nav" style={{ marginTop: '20px', display: 'inline-block' }} onClick={() => navigate('/')}>
                                    Перейти до подій
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FavoritesPage;