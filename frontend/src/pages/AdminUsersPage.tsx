import { useEffect, useState } from 'react';
import { Table, Spinner, Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import type { User } from '../types';
import './AdminUsersPage.css';

type AdminUser = User & {
    isBanned?: boolean;
    banEndDate?: string | null;
};

const AdminUsersPage = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        banType: 'none',
        banDays: 1
    });

    const fetchUsers = () => {
        api.get('/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user: AdminUser) => {
        setEditId(user.id);

        let initialBanType = 'none';
        let initialBanDays = 1;

        if (user.isBanned) {
            if (!user.banEndDate) {
                initialBanType = 'permanent';
            } else {
                const endDate = new Date(user.banEndDate);
                if (endDate > new Date()) {
                    initialBanType = 'days';
                    const diffTime = Math.abs(endDate.getTime() - new Date().getTime());
                    initialBanDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }
            }
        }

        setFormData({
            name: user.name,
            email: user.email,
            role: user.role ?? 'User',
            banType: initialBanType,
            banDays: initialBanDays
        });
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditId(null);
        setFormData({ name: '', email: '', role: '', banType: 'none', banDays: 1 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        let isBanned = false;
        let banEndDate: string | null = null;

        if (formData.banType === 'permanent') {
            isBanned = true;
        } else if (formData.banType === 'days') {
            isBanned = true;
            const end = new Date();
            end.setDate(end.getDate() + Number(formData.banDays));
            banEndDate = end.toISOString();
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            isBanned,
            banEndDate
        };

        try {
            await api.put(`/users/${editId}`, payload);
            toast.success("Дані користувача успішно оновлено!");
            fetchUsers();
            handleClose();
        } catch (err) {
            console.error(err);
            const error = err as { response?: { data?: string } };
            toast.error(error.response?.data || "Помилка оновлення даних");
        }
    };

    if (loading) {
        return (
            <div className="spinner-container">
                <Spinner animation="border" className="custom-spinner" />
            </div>
        );
    }

    return (
        <div>
            <h2 className="users-page-title">Користувачі системи</h2>
            <div className="card-pulse">
                <div className="card-body p-0">
                    <Table className="table-pulse" responsive hover>
                        <thead>
                        <tr>
                            <th className="ps-4">ID</th>
                            <th>Ім'я</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Статус</th>
                            <th className="pe-4">Дії</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => {
                            let statusText = "Активний";
                            let badgeClass = "active";

                            if (user.isBanned) {
                                badgeClass = "banned";
                                if (user.banEndDate) {
                                    const endDate = new Date(user.banEndDate);
                                    if (endDate > new Date()) {
                                        statusText = `Бан до ${endDate.toLocaleDateString('uk-UA')}`;
                                    } else {
                                        statusText = "Активний";
                                        badgeClass = "active";
                                    }
                                } else {
                                    statusText = "Бан назавжди";
                                }
                            }

                            return (
                                <tr key={user.id}>
                                    <td className="ps-4 user-id-cell">#{user.id}</td>
                                    <td className="user-name-cell">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`custom-badge ${user.role === 'Admin' ? 'admin' : 'user'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td><span className={`custom-badge ${badgeClass}`}>{statusText}</span></td>
                                    <td className="pe-4">
                                        <button className="btn-edit-link" onClick={() => handleEditClick(user)}>Ред.</button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                </div>
            </div>

            <Modal show={showModal} onHide={handleClose} centered contentClassName="modal-content">
                <Modal.Header closeButton>
                    <Modal.Title>Редагувати користувача</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="admin-form-label">Ім'я</Form.Label>
                            <Form.Control
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                type="text"
                                className="admin-form-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="admin-form-label">Email</Form.Label>
                            <Form.Control
                                name="email"
                                value={formData.email || ''}
                                onChange={handleChange}
                                type="email"
                                className="admin-form-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="admin-form-label">Роль</Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role || ''}
                                onChange={handleChange}
                                className="admin-form-input"
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="admin-form-label" style={{ color: '#f87171' }}>Статус акаунту</Form.Label>
                            <Form.Select
                                name="banType"
                                value={formData.banType}
                                onChange={handleChange}
                                className="admin-form-input"
                                style={formData.banType !== 'none' ? { borderColor: '#dc3545', color: '#ff6b6b' } : {}}
                            >
                                <option value="none">Активний</option>
                                <option value="days">Заблокувати на час</option>
                                <option value="permanent">Заблокувати назавжди</option>
                            </Form.Select>
                        </Form.Group>

                        {formData.banType === 'days' && (
                            <Form.Group className="mb-3">
                                <Form.Label className="admin-form-label">Кількість днів блокування</Form.Label>
                                <Form.Control
                                    name="banDays"
                                    value={formData.banDays}
                                    onChange={handleChange}
                                    type="number"
                                    min="1"
                                    className="admin-form-input"
                                />
                            </Form.Group>
                        )}

                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} className="btn-secondary-dark">Скасувати</Button>
                    <Button onClick={handleSave} className="btn-save-user">Зберегти</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminUsersPage;