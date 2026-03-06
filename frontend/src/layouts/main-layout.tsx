import { Button } from 'react-bootstrap';
import Frame3 from "../assets/Frame3.svg";
import Sidebar from '../components/sidebar/SideBar.tsx';
import '../styles/main_layout.css'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuth = !!localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const [searchValue, setSearchValue] = useState('');

    useEffect(() => {
        console.log('Перехід на сторінку:', location.pathname);
    }, [location]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchValue.trim()) {
            navigate(`/catalog?q=${encodeURIComponent(searchValue.trim())}`);
        } else {
            navigate('/catalog');
        }
    };

    return (
        <div className="main_container">
            <div className="navbar">
                <div className="logo">
                    <Link to="/">
                        <img src={Frame3} alt="Frame" />
                    </Link>
                </div>
                {/*тут пошук*/}
                <form className="header-search-form" onSubmit={handleSearch}>
                    <span className="header-search-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20.9999 21L16.6499 16.65" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        className="header-search-input"
                        placeholder="Пошук"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </form>

                <div className="auth_buttons">
                    {!isAuth ? (
                        <>
                            <Link to="/login">
                                <Button variant="custom">Увійти</Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="warning">Зареєструватись</Button>
                            </Link>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {userRole === 'Admin' && (
                                <Link to="/admin">
                                    <Button variant="custom">
                                        Адмін Панель
                                    </Button>
                                </Link>
                            )}
                            <Link to="/profile">
                                <Button className="btn-profile">Мій профіль</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="content">
                <main className="home-page-container">
                    <Sidebar />
                    <div style={{ width: '100%' }}>
                        <Outlet />
                    </div>
                </main>
            </div>

            <footer className="text-center py-3" style={{ backgroundColor: '#1b1b1b', borderTop: '1px solid #2a2a2a', color: '#aeb5bc' }}>
                <p className="mb-0">© 2026 BetPulse Diploma Project</p>
            </footer>
        </div>
    );
};

export default MainLayout;