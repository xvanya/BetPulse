import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api from '../api/axiosConfig';
import './LoginPage.css';

interface LoginResponse {
    token: string;
    role: string;
    email: string;
    id: number;
}

type ForgotPasswordStep = 'none' | 'email' | 'sent';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('none');
    const [forgotEmail, setForgotEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await api.post<LoginResponse>('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            const { token, role, email } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmail', email);

            toast.success("Вхід успішний! Вітаємо");
            navigate('/');
        } catch (error) {
            console.error(error);
            const err = error as AxiosError;
            let errorMessage = "Невірний логін або пароль";
            if (err.response?.data) {
                errorMessage = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
            }
            toast.error(errorMessage);
        }
    };

    const handleGoogleAuth = async (credentialResponse: { credential?: string }) => {
        try {
            const response = await api.post<LoginResponse>('/auth/google-login', {
                credential: credentialResponse.credential
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);
            localStorage.setItem('userEmail', response.data.email);
            toast.success("Вхід через Google успішний!");
            navigate('/');
        } catch (error) {
            console.error(error);
            const err = error as AxiosError;
            let errorMessage = "Помилка авторизації через Google";
            if (err.response?.data) {
                errorMessage = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
            }
            toast.error(errorMessage);
        }
    };

    const handleSendCode = async () => {
        if (!forgotEmail) {
            toast.warning("Введіть email");
            return;
        }
        setIsProcessing(true);
        try {
            await api.post('/auth/forgot-password', { email: forgotEmail });
            toast.success("Код надіслано! Перевірте пошту");
            setForgotStep('sent');
        } catch (error) {
            console.error(error);
            toast.error("Помилка відправки. Перевірте email.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenEmail = () => {
        if (forgotEmail.includes('@gmail.com')) {
            window.open('https://mail.google.com', '_blank');
        } else if (forgotEmail.includes('@ukr.net')) {
            window.open('https://mail.ukr.net', '_blank');
        } else {
            window.open('https://mail.google.com', '_blank');
        }
    };

    const EyeIcon = ({ show, toggle }: { show: boolean, toggle: () => void }) => (
        <span className="password-eye" onClick={toggle}>
            {show ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5C7.63636 5 4 8.63636 2 12C4 15.3636 7.63636 19 12 19C16.3636 19 20 15.3636 22 12C20 8.63636 16.3636 5 12 5Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94L6.06 6.06" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12C4 15.3636 7.63636 19 12 19C14.757 19 17.214 17.653 19.06 15.775" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 5C14.634 5 16.973 6.136 18.77 7.96" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.9 9.9C9.37 10.45 9 11.2 9 12C9 13.6569 10.3431 15 12 15C12.8 15 13.55 14.63 14.1 14.1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
        </span>
    );

    return (
        <GoogleOAuthProvider clientId="29588120359-ppkbibh856jnf6t5qh5gr4iu7tlu21jq.apps.googleusercontent.com">
            <div className="login-page">
                {forgotStep === 'none' ? (
                    <div className="login-card">
                        <div className="card-top-row">
                            <div className="bp-logo-small">BP</div>
                            <div className="close-icon" onClick={() => navigate('/')}>✕</div>
                        </div>

                        <h2 className="login-title">Увійдіть у аккаунт</h2>

                        <form onSubmit={handleSubmit} className="login-form-full">
                            <div className="input-group">
                                <div className="input-wrapper">
                                    <input type="email" name="email" placeholder="Емейл адреса" className="custom-input" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="input-wrapper">
                                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Пароль" className="custom-input" value={formData.password} onChange={handleChange} required />
                                    <EyeIcon show={showPassword} toggle={() => setShowPassword(!showPassword)} />
                                </div>
                            </div>

                            <div className="forgot-pass-link" onClick={() => setForgotStep('email')}>
                                Забули пароль?
                            </div>

                            <button type="submit" className="btn-login">Увійти</button>
                        </form>

                        <div className="register-link" onClick={() => navigate('/register')}>
                            Не маєте аккаунт? <span>Зареєструйтеся зараз!</span>
                        </div>

                        <div style={{ marginTop: '25px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleAuth}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="login-card">
                        <div className="card-top-row">
                            <div className="bp-logo-small">
                                <span className="logo-white">B</span>
                                <span className="logo-yellow">P</span>
                            </div>
                            <div className="close-icon" onClick={() => setForgotStep('none')}>✕</div>
                        </div>

                        {forgotStep === 'email' && (
                            <div className="modal-body">
                                <h3 className="modal-title">Забули пароль</h3>
                                <p className="modal-subtitle">Будь ласка, вкажіть свою адресу електронної пошти, щоб ми могли скинути ваш пароль</p>
                                <input type="email" className="custom-input modal-input" placeholder="Email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                                <button className="btn-login" onClick={handleSendCode} disabled={isProcessing}>
                                    {isProcessing ? 'Відправка...' : 'Далі'}
                                </button>
                            </div>
                        )}

                        {forgotStep === 'sent' && (
                            <div className="modal-body">
                                <h3 className="modal-title">Код надіслано</h3>
                                <p className="modal-subtitle">Ми надіслали вам лист. Перейдіть за посиланням у ньому, щоб оновити пароль.</p>
                                <button className="btn-login" onClick={handleOpenEmail}>Перейти до пошти</button>
                                <div className="modal-text-link" onClick={() => setForgotStep('email')}>Помилилися поштою?</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;