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

type ProfileView = 'profile' | 'deposit' | 'withdraw';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Стан для навігації всередині профілю
    const [activeView, setActiveView] = useState<ProfileView>('profile');

    // Стани модалок (залишив як було)
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

    // Стани для Каси
    const [paymentMethod, setPaymentMethod] = useState('visa');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [amount, setAmount] = useState('');
    const [isProcessingTx, setIsProcessingTx] = useState(false);

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

    // --- ФУНКЦІЇ ДЛЯ КАСИ ---
    const handleTransaction = async () => {
        if (!amount || parseFloat(amount) <= 0) return toast.warning("Введіть коректну суму 💵");
        if (cardNumber.length < 16) return toast.warning("Введіть 16 цифр номера картки 💳");

        if (activeView === 'deposit') {
            if (expiry.length < 5) return toast.warning("Введіть термін дії картки (ММ/РР)");
            if (cvv.length < 3) return toast.warning("Введіть 3 цифри CVV");
        }

        setIsProcessingTx(true);
        try {
            const endpoint = activeView === 'deposit' ? '/profile/deposit' : '/profile/withdraw';
            const response = await api.post(endpoint, { amount: parseFloat(amount) });

            // Оновлюємо баланс без перезавантаження сторінки
            if (user) setUser({ ...user, balance: response.data.newBalance });

            toast.success(response.data.message);

            // Очищаємо форму і повертаємось в профіль
            setAmount('');
            setCardNumber('');
            setExpiry('');
            setCvv('');
            setActiveView('profile');
        } catch (err) {
            const axiosError = err as AxiosError<string>;
            toast.error(axiosError.response?.data || "Помилка транзакції ❌");
        } finally {
            setIsProcessingTx(false);
        }
    };

    // Зручне форматування вводу карти (тільки цифри)
    const handleCardInput = (val: string) => setCardNumber(val.replace(/\D/g, ''));

    // Форматування ММ/РР
    const handleExpiryInput = (val: string) => {
        let formatted = val.replace(/\D/g, '');
        if (formatted.length > 2) formatted = formatted.substring(0, 2) + '/' + formatted.substring(2, 4);
        setExpiry(formatted);
    };

    // --- ФУНКЦІЇ ПРОФІЛЮ (ЗБЕРЕЖЕНІ) ---
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
        if (!newEmail.trim() || !newEmail.includes('@')) return toast.warning("Введіть коректний email");
        if (newEmail === user?.email) return toast.warning("Новий email має відрізнятися від поточного");

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
        if (oldPassword === newPassword) return toast.warning("Новий пароль має відрізнятися від старого");
        if (newPassword !== confirmNewPassword) return toast.warning("Нові паролі не співпадають");
        if (newPassword.length < 6) return toast.warning("Мінімум 6 символів для нового паролю");

        setIsChangingPwd(true);
        try {
            await api.put('/profile/change-password', { oldPassword, newPassword });
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
    if (error) return <div className="profile-layout"><div className="profile-message error"><h3>{error}</h3><button className="btn-nav" onClick={() => navigate('/')}>На головну</button></div></div>;

    const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="profile-layout">
            <div className="profile-inner-wrapper">

                <div className="profile-sidebar">
                    <div className="sidebar-user-info">
                        <div className="sidebar-avatar">{avatarLetter}</div>
                        <h2 className="sidebar-name">{user?.name}</h2>
                        <p className="sidebar-email">{user?.email}</p>
                    </div>

                    <div className="sidebar-navigation">
                        <button className={`btn-nav ${activeView === 'profile' ? 'active' : ''}`} onClick={() => setActiveView('profile')}>
                            Особистий кабінет
                        </button>
                        <button className="btn-nav" onClick={() => navigate('/bets-history')}>Історія ставок</button>
                        <button className="btn-nav" onClick={() => navigate('/favorites')}>Улюблені</button>
                        <button className="btn-nav" onClick={() => navigate('/')}>На головну</button>
                    </div>

                    <div className="sidebar-footer">
                        <button className="btn-logout-full" onClick={handleLogout}>Вийти з акаунту</button>
                    </div>
                </div>

                <div className="profile-main-area">
                    <h1 className="page-main-title">
                        {activeView === 'profile' ? 'Мій профіль' : 'Каса'}
                    </h1>

                    <div className="balance-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="balance-info">
                            <span className="balance-text">Ваш баланс</span>
                            <span className="balance-sum">{user?.balance ? user.balance.toFixed(2) : '0.00'} ₴</span>
                        </div>
                        <div className="balance-buttons">
                            <button className="btn-deposit-action" onClick={() => setActiveView('deposit')}>Депозит</button>
                            <button className="btn-withdraw-action" onClick={() => setActiveView('withdraw')}>Виведення</button>
                        </div>
                    </div>

                    {/* ВІДОБРАЖЕННЯ: ОСОБИСТІ ДАНІ */}
                    {activeView === 'profile' && (
                        <>
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
                                        <div className="setting-info"><h4>Ім'я користувача</h4><p>{user?.name}</p></div>
                                        <button className="btn-change" onClick={() => setShowNameModal(true)}>Змінити</button>
                                    </div>
                                    <div className="setting-card">
                                        <div className="setting-info"><h4>Електронна пошта</h4><p>{user?.email}</p></div>
                                        <button className="btn-change" onClick={() => setShowEmailModal(true)}>Змінити</button>
                                    </div>
                                    <div className="setting-card">
                                        <div className="setting-info"><h4>Пароль</h4><p>••••••••</p></div>
                                        <button className="btn-change" onClick={() => setShowPasswordModal(true)}>Оновити</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ВІДОБРАЖЕННЯ: КАСА (ДЕПОЗИТ АБО ВИВЕДЕННЯ) */}
                    {(activeView === 'deposit' || activeView === 'withdraw') && (
                        <div className="content-section">
                            <div className="cashier-header">
                                <div className="cashier-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                                        <line x1="2" y1="10" x2="22" y2="10"></line>
                                    </svg>
                                </div>
                                <h3>{activeView === 'deposit' ? 'ДЕПОЗИТ' : 'ВИВЕДЕННЯ КОШТІВ'}</h3>
                            </div>

                            <div className="payment-methods">
                                <button className={`pay-method ${paymentMethod === 'visa' ? 'active' : ''}`} onClick={() => setPaymentMethod('visa')}>VISA</button>
                                <button className={`pay-method ${paymentMethod === 'mc' ? 'active' : ''}`} onClick={() => setPaymentMethod('mc')}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{verticalAlign: 'middle'}}><circle cx="7" cy="12" r="7" fill="#EB001B"/><circle cx="17" cy="12" r="7" fill="#F79E1B"/></svg>
                                </button>
                                <button className={`pay-method ${paymentMethod === 'gpay' ? 'active' : ''}`} onClick={() => setPaymentMethod('gpay')}>G Pay</button>
                                <button className={`pay-method ${paymentMethod === 'apple' ? 'active' : ''}`} onClick={() => setPaymentMethod('apple')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <svg width="15" height="18" viewBox="0 0 384 512" fill="currentColor">
                                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                                    </svg>
                                    Pay
                                </button>
                            </div>

                            <div className="cashier-info-row">
                                <span>Баланс</span>
                                <span className="cashier-sum">{user?.balance?.toFixed(2) || '0.00'} грн</span>
                            </div>

                            {activeView === 'deposit' ? (
                                <div className="cashier-info-row">
                                    <span>Ліміт депозиту</span>
                                    <span className="cashier-limit-text">Не встановлений</span>
                                </div>
                            ) : (
                                <>
                                    <div className="cashier-info-row">
                                        <span>Розглядається</span>
                                        <span className="cashier-sum">0.00 грн</span>
                                    </div>
                                    <div className="cashier-info-row">
                                        <span>Доступна сума до виведення</span>
                                        <span className="cashier-sum">{user?.balance?.toFixed(2) || '0.00'} грн</span>
                                    </div>
                                </>
                            )}

                            <div className="cashier-form">
                                <div className="cashier-inputs-row">
                                    <div className="cashier-input-wrap">
                                        <input type="text" className="cashier-input" placeholder="Номер картки" maxLength={16} value={cardNumber} onChange={e => handleCardInput(e.target.value)} />
                                    </div>
                                    {activeView === 'deposit' && (
                                        <>
                                            <div className="cashier-input-wrap small">
                                                <input type="text" className="cashier-input" placeholder="MM/PP" maxLength={5} value={expiry} onChange={e => handleExpiryInput(e.target.value)} />
                                            </div>
                                            <div className="cashier-input-wrap small">
                                                <input type="text" className="cashier-input" placeholder="CVV" maxLength={3} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))} />
                                            </div>
                                        </>
                                    )}
                                    {cardNumber.length === 16 && (
                                        <div className="verified-text">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            Перевірено
                                        </div>
                                    )}
                                </div>

                                <div className="cashier-inputs-row">
                                    <div className="cashier-input-wrap">
                                        <input type="number" className="cashier-input" placeholder="Сума" value={amount} onChange={e => setAmount(e.target.value)} />
                                    </div>
                                </div>

                                <button className="btn-cashier-submit" onClick={handleTransaction} disabled={isProcessingTx}>
                                    {isProcessingTx ? 'Обробка...' : (activeView === 'deposit' ? 'Внести кошти' : 'Вивести')}
                                </button>

                                {activeView === 'withdraw' && (
                                    <div className="withdraw-help-text">
                                        Середній час обробки: 72 год.<br />
                                        Мінімальна сума виведення: 200 грн<br />
                                        Максимальна сума виведення згідно вашого ліміту: 50000 грн
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- МОДАЛКИ (Залишаються без змін) --- */}
            {showNameModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-title">Зміна імені</h3>
                        <input type="text" className="modal-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Введіть нове ім'я" />
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setShowNameModal(false)}>Скасувати</button>
                            <button className="btn-confirm" onClick={handleUpdateName} disabled={isSavingName}>{isSavingName ? 'Збереження...' : 'Зберегти'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showEmailModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-title">Зміна email</h3>
                        <input type="email" className="modal-input" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Введіть новий email" />
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => { setShowEmailModal(false); setNewEmail(user?.email || ''); }}>Скасувати</button>
                            <button className="btn-confirm" onClick={handleUpdateEmail} disabled={isSavingEmail}>{isSavingEmail ? 'Збереження...' : 'Зберегти'}</button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3 className="modal-title">Зміна пароля</h3>
                        <input type="password" className="modal-input mb-space" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Старий пароль" />
                        <input type="password" className="modal-input mb-space" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Новий пароль" />
                        <input type="password" className="modal-input" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Підтвердження нового пароля" />
                        <div className="modal-buttons mt-space">
                            <button className="btn-cancel" onClick={() => { setShowPasswordModal(false); setOldPassword(''); setNewPassword(''); setConfirmNewPassword(''); }}>Скасувати</button>
                            <button className="btn-confirm" onClick={handleUpdatePassword} disabled={isChangingPwd}>{isChangingPwd ? 'Оновлення...' : 'Оновити пароль'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;