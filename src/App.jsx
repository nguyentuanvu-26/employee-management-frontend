
import { useState } from 'react'

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from 'react-router-dom'

import './App.css'

import api from './services/api'

import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/Dashboard'
import EmployeeManagement from './pages/EmployeeManagement'
import DepartmentManagement from './pages/DepartmentManagement'
import AttendanceManagement from './pages/AttendanceManagement'
import AccountManagement from './pages/AccountManagement'
import QrAttendance from './pages/QrAttendance'

// Giao diện nhân viên
import EmployeeDashboard from './pages/EmployeeDashboard'


// ========================================
// TRANG ĐĂNG NHẬP
// ========================================

function Login({ onLogin }) {

    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Xử lý đăng nhập
    const handleLogin = async (e) => {

        e.preventDefault()

        if (loading) return

        setLoading(true)
        setError('')

        try {

            const response = await api.get('/api/me', {
                auth: {
                    username,
                    password
                }
            })

            const user = response.data

            if (
                user.role !== 'ADMIN' &&
                user.role !== 'EMPLOYEE'
            ) {
                setError('Tài khoản không có quyền truy cập!')
                return
            }

            onLogin(user, username, password)

            if (user.role === 'ADMIN') {
                navigate('/admin')
            } else {
                navigate('/employee')
            }

        } catch (error) {

            console.error('Lỗi đăng nhập:', error)

            if (error.response?.status === 401) {
                setError('Sai tên đăng nhập hoặc mật khẩu!')
            } else if (error.response?.status === 403) {
                setError('Tài khoản không có quyền truy cập!')
            } else {
                setError('Không thể kết nối đến máy chủ!')
            }

        } finally {

            setLoading(false)

        }
    }

    return (

        <div className="login-page">

            <div className="login-container">

                <div className="login-header">

                    <h1>EMS</h1>

                    <h2>Đăng nhập hệ thống</h2>

                    <p>Hệ thống quản lý nhân sự và chấm công</p>

                </div>

                <form onSubmit={handleLogin}>

                    <div className="form-group">

                        <label>Tên đăng nhập</label>

                        <input
                            type="text"
                            placeholder="Nhập tên đăng nhập"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>Mật khẩu</label>

                        <input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                    </div>

                    {error && (

                        <p className="login-error">
                            {error}
                        </p>

                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>

                </form>

                <div className="login-footer">

                    <p>© 2026 Hệ thống quản lý nhân sự EMS</p>

                </div>

            </div>

        </div>
    )
}


// ========================================
// BẢO VỆ TRANG QUẢN TRỊ
// ========================================

function AdminRoute({ user, children }) {

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'ADMIN') {
        return <Navigate to="/employee" replace />
    }

    return children
}


// ========================================
// BẢO VỆ TRANG NHÂN VIÊN
// ========================================

function EmployeeRoute({ user, children }) {

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'EMPLOYEE') {
        return <Navigate to="/admin" replace />
    }

    return children
}


// ========================================
// ỨNG DỤNG CHÍNH
// ========================================

function App() {

    const [user, setUser] = useState(null)

    const [credentials, setCredentials] = useState(null)

    // Lưu thông tin sau khi đăng nhập thành công
    const handleLogin = (userData, username, password) => {

        setUser(userData)

        setCredentials({
            username,
            password
        })
    }

    // Xử lý đăng xuất
    const handleLogout = () => {

        setUser(null)

        setCredentials(null)
    }

    return (

        <BrowserRouter>

            <Routes>

                {/* TRANG ĐĂNG NHẬP */}

                <Route
                    path="/login"
                    element={
                        user ? (

                            <Navigate
                                to={
                                    user.role === 'ADMIN'
                                        ? '/admin'
                                        : '/employee'
                                }
                                replace
                            />

                        ) : (

                            <Login onLogin={handleLogin} />

                        )
                    }
                />

                {/* KHU VỰC QUẢN TRỊ */}

                <Route
                    path="/admin"
                    element={
                        <AdminRoute user={user}>
                            <AdminLayout
                                onLogout={handleLogout}
                            />
                        </AdminRoute>
                    }
                >

                    {/* Trang tổng quan */}

                    <Route
                        index
                        element={
                            <Dashboard credentials={credentials} />
                        }
                    />

                    {/* Quản lý nhân viên */}

                    <Route
                        path="employees"
                        element={
                            <EmployeeManagement
                                credentials={credentials}
                            />
                        }
                    />

                    {/* Quản lý phòng ban */}

                    <Route
                        path="departments"
                        element={
                            <DepartmentManagement
                                credentials={credentials}
                            />
                        }
                    />

                    {/* Quản lý chấm công */}

                    <Route
                        path="attendance"
                        element={
                            <AttendanceManagement
                                credentials={credentials}
                            />
                        }
                    />

                    {/* Chấm công bằng QR Code */}

                    <Route
                        path="qr-attendance"
                        element={
                            <QrAttendance credentials={credentials} />
                        }
                    />

                    {/* Quản lý tài khoản */}

                    <Route
                        path="accounts"
                        element={
                            <AccountManagement
                                credentials={credentials}
                            />
                        }
                    />

                </Route>

                {/* KHU VỰC NHÂN VIÊN */}

                <Route
                    path="/employee"
                    element={
                        <EmployeeRoute user={user}>
                            <EmployeeDashboard
                                user={user}
                                credentials={credentials}
                                onLogout={handleLogout}
                            />
                        </EmployeeRoute>
                    }
                />

                {/* ĐƯỜNG DẪN KHÔNG HỢP LỆ */}

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />

            </Routes>

        </BrowserRouter>
    )
}

export default App
