import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import '../styles/ProfilePage.css';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    balance?: number;
}

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showNameModal, setShowNameModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [isSavingEmail, setIsSavingEmail] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isChangingPwd, setIsChangingPwd] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/profile');
                setUser(response.data);
                setNewName(response.data.name);
                setNewEmail(response.data.email);
            } catch (err) {
                const axiosError = err as AxiosError;
                if (axiosError.response && axiosError.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError('Не вдалося завантажити профіль.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        setIsSavingName(true);
        try {
            await api.put('/profile/update-name', { name: newName });
            if (user) setUser({ ...user, name: newName });
            setShowNameModal(false);
            toast.success("Ім'я успішно змінено");
        } catch {
            toast.error("Не вдалося змінити ім'я");
        } finally {
            setIsSavingName(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!newEmail.trim() || !newEmail.includes('@')) {
            return toast.warning("Введіть коректний email");
        }
        if (newEmail === user?.email) {
            return toast.warning("Новий email має відрізнятися від поточного");
        }

        setIsSavingEmail(true);
        try {
            await api.put('/profile/update-email', { email: newEmail });
            if (user) setUser({ ...user, email: newEmail });
            setShowEmailModal(false);
            toast.success("Email успішно змінено");
        } catch {
            toast.error("Не вдалося змінити email. Можливо, він вже використовується.");
        } finally {
            setIsSavingEmail(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!oldPassword) return toast.warning("Введіть старий пароль");

        if (oldPassword === newPassword) {
            return toast.warning("Новий пароль має відрізнятися від старого");
        }

        if (newPassword !== confirmNewPassword) return toast.warning("Нові паролі не співпадають");
        if (newPassword.length < 6) return toast.warning("Мінімум 6 символів для нового паролю");

        setIsChangingPwd(true);
        try {
            await api.put('/profile/change-password', {
                oldPassword: oldPassword,
                newPassword: newPassword
            });

            toast.success("Пароль успішно оновлено");
            setShowPasswordModal(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch {
            toast.error("Помилка! Перевірте правильність старого пароля");
        } finally {
            setIsChangingPwd(false);
        }
    };

    if (loading) return <div className="profile-layout"><div className="profile-message">Завантаження...</div></div>;

    if (error) {
        return (
            <div className="profile-layout">
                <div className="profile-message error">
                    <h3>{error}</h3>
                    <button className="btn-nav" onClick={() => navigate('/')}>На головну</button>
                </div>
            </div>
        );
    }

    const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="profile-layout">
            {/* НОВА ОБГОРТКА */}
            <div className="profile-inner-wrapper">
                <div className="profile-sidebar">
                    <div className="sidebar-user-info">
                        <div className="sidebar-avatar">{avatarLetter}</div>
                        <h2 className="sidebar-name">{user?.name}</h2>
                        <p className="sidebar-email">{user?.email}</p>
                    </div>

                    <div className="sidebar-navigation">
                        <button className="btn-nav active" onClick={() => navigate('/profile')}>
                            Особистий кабінет
                        </button>
                        <button className="btn-nav" onClick={() => navigate('/bets-history')}>
                            Історія ставок
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

                <div className="profile-main-area">
                    <h1 className="page-main-title">Мій профіль</h1>

                    <div className="balance-banner">
                        <div className="balance-info">
                            <span className="balance-text">Ваш баланс</span>
                            <span className="balance-sum">{user?.balance ? user.balance.toFixed(2) : '0.00'} ₴</span>
                        </div>
                    </div>

                    <div className="content-section">
                        <h3 className="section-heading">Особисті дані</h3>
                        <div className="info-cards-container">
                            <div className="info-card">
                                <span className="info-card-label">ID Користувача</span>
                                <span className="info-card-value">#{user?.id}</span>
                            </div>
                            <div className="info-card">
                                <span className="info-card-label">Електронна пошта</span>
                                <span className="info-card-value">{user?.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="content-section">
                        <h3 className="section-heading">Налаштування безпеки та профілю</h3>
                        <div className="settings-cards-container">
                            <div className="setting-card">
                                <div className="setting-info">
                                    <h4>Ім'я користувача</h4>
                                    <p>{user?.name}</p>
                                </div>
                                <button className="btn-change" onClick={() => setShowNameModal(true)}>Змінити</button>
                            </div>

                            <div className="setting-card">
                                <div className="setting-info">
                                    <h4>Електронна пошта</h4>
                                    <p>{user?.email}</p>
                                </div>
                                <button className="btn-change" onClick={() => setShowEmailModal(true)}>Змінити</button>
                            </div>

                            <div className="setting-card">
                                <div className="setting-info">
                                    <h4>Пароль</h4>
                                    <p>••••••••</p>
                                </div>
                                <button className="btn-change" onClick={() => setShowPasswordModal(true)}>Оновити</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* КІНЕЦЬ НОВОЇ ОБГОРТКИ */}

            {showNameModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-title">Зміна імені</h3>
                        <input
                            type="text"
                            className="modal-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Введіть нове ім'я"
                        />
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowNameModal(false)}>Скасувати</button>
                            <button className="btn-confirm" onClick={handleUpdateName} disabled={isSavingName}>
                                {isSavingName ? 'Збереження...' : 'Зберегти'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEmailModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-title">Зміна email</h3>
                        <input
                            type="email"
                            className="modal-input"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Введіть новий email"
                        />
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => {
                                setShowEmailModal(false);
                                setNewEmail(user?.email || '');
                            }}>Скасувати</button>
                            <button className="btn-confirm" onClick={handleUpdateEmail} disabled={isSavingEmail}>
                                {isSavingEmail ? 'Збереження...' : 'Зберегти'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-title">Зміна пароля</h3>
                        <input
                            type="password"
                            className="modal-input mb-space"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Старий пароль"
                        />
                        <input
                            type="password"
                            className="modal-input mb-space"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Новий пароль"
                        />
                        <input
                            type="password"
                            className="modal-input"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Підтвердження нового пароля"
                        />
                        <div className="modal-buttons mt-space">
                            <button className="btn-cancel" onClick={() => {
                                setShowPasswordModal(false);
                                setOldPassword('');
                                setNewPassword('');
                                setConfirmNewPassword('');
                            }}>Скасувати</button>
                            <button className="btn-confirm" onClick={handleUpdatePassword} disabled={isChangingPwd}>
                                {isChangingPwd ? 'Оновлення...' : 'Оновити пароль'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;