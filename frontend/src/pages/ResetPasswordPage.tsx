import { useState, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import './ResetPasswordPage.css';

const ResetPasswordPage: FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Дістаємо токен і email з посилання, яке прийшло на пошту
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = async () => {
        if (!token || !email) return alert("Недійсне посилання для відновлення!");
        if (newPassword !== confirmPassword) return alert("Паролі не співпадають!");
        if (newPassword.length < 6) return alert("Мінімум 6 символів");

        setIsProcessing(true);
        try {
            await api.post('/auth/reset-password', {
                email: email,
                token: token,
                newPassword: newPassword
            });
            setIsSuccess(true);
        } catch (error) {
            console.error(error); // 👈 Вирішує проблему з ESLint
            alert("Помилка зміни паролю. Можливо, посилання застаріло.");
        } finally {
            setIsProcessing(false);
        }
    };

    const EyeIcon = ({ show, toggle }: { show: boolean, toggle: () => void }) => (
        <span className="reset-password-eye" onClick={toggle}>
            {show ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5C7.63636 5 4 8.63636 2 12C4 15.3636 7.63636 19 12 19C16.3636 19 20 15.3636 22 12C20 8.63636 16.3636 5 12 5Z"/><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/></svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94L6.06 6.06"/><path d="M2 12C4 15.3636 7.63636 19 12 19C14.757 19 17.214 17.653 19.06 15.775"/><path d="M12 5C14.634 5 16.973 6.136 18.77 7.96"/><path d="M9.9 9.9C9.37 10.45 9 11.2 9 12C9 13.6569 10.3431 15 12 15C12.8 15 13.55 14.63 14.1 14.1"/></svg>
            )}
        </span>
    );

    return (
        <div className="reset-page-container">
            <div className="reset-card">
                <div className="reset-top-row">
                    <div className="reset-logo">
                        <span className="reset-logo-white">B</span>
                        <span className="reset-logo-yellow">P</span>
                    </div>
                    <div className="reset-close-icon" onClick={() => navigate('/login')}>✕</div>
                </div>

                {!isSuccess ? (
                    <div className="reset-body">
                        <h3 className="reset-title">Створити новий пароль</h3>
                        <p className="reset-subtitle">Ваша особистість підтверджена!<br/>Введіть новий пароль.</p>

                        <div className="reset-input-wrapper reset-input-group">
                            <input type={showNewPassword ? "text" : "password"} className="reset-custom-input" placeholder="Новий пароль" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <EyeIcon show={showNewPassword} toggle={() => setShowNewPassword(!showNewPassword)} />
                        </div>

                        <div className="reset-input-wrapper">
                            <input type={showConfirmPassword ? "text" : "password"} className="reset-custom-input" placeholder="Підтвердження паролю" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            <EyeIcon show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                        </div>

                        <button className="reset-btn-submit" onClick={handleResetPassword} disabled={isProcessing}>
                            {isProcessing ? 'Збереження...' : 'Оновити пароль'}
                        </button>
                    </div>
                ) : (
                    <div className="reset-body reset-success-body">
                        <h3 className="reset-title">Пароль оновлено</h3>
                        <div className="reset-success-circle">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <p className="reset-subtitle reset-success-text">Ваш пароль оновлено!</p>
                        <button className="reset-btn-submit" onClick={() => navigate('/login')}>Увійти</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;