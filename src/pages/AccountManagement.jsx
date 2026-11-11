
import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import './AccountManagement.css'

function AccountManagement({ credentials }) {
    const [employees, setEmployees] = useState([])
    const [accounts, setAccounts] = useState([])

    const [employeeId, setEmployeeId] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [loadingEmployees, setLoadingEmployees] = useState(true)
    const [loadingAccounts, setLoadingAccounts] = useState(true)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Tai danh sach tai khoan tu Database
    const fetchAccounts = useCallback(async () => {
        try {
            const response = await api.get('/api/users', {
                auth: credentials
            })

            setAccounts(response.data)
        } catch (err) {
            console.error('Loi tai danh sach tai khoan:', err)
            setError('Khong the tai danh sach tai khoan.')
        } finally {
            setLoadingAccounts(false)
        }
    }, [credentials])

    // Tai danh sach nhan vien
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await api.get('/api/employees', {
                    auth: credentials
                })

                const data = response.data

                setEmployees(
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data.content)
                            ? data.content
                            : []
                )
            } catch (err) {
                console.error('Loi tai danh sach nhan vien:', err)
                setError('Khong the tai danh sach nhan vien.')
            } finally {
                setLoadingEmployees(false)
            }
        }

        if (credentials) {
            fetchEmployees()
            fetchAccounts()
        } else {
            setLoadingEmployees(false)
            setLoadingAccounts(false)
            setError('Vui long dang nhap lai.')
        }
    }, [credentials, fetchAccounts])

    // Tao tai khoan nhan vien
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (loading) return

        setError('')
        setSuccess('')

        if (!employeeId || !username.trim() || !password) {
            setError('Vui long nhap day du thong tin.')
            return
        }

        if (password.length < 8) {
            setError('Mat khau phai co it nhat 8 ky tu.')
            return
        }

        setLoading(true)

        try {
            await api.post(
                '/api/users/employee',
                {
                    employeeId: Number(employeeId),
                    username: username.trim(),
                    password
                },
                {
                    auth: credentials
                }
            )

            setSuccess('Tao tai khoan nhan vien thanh cong!')

            setEmployeeId('')
            setUsername('')
            setPassword('')

            // Tai lai danh sach tu Database
            setLoadingAccounts(true)
            await fetchAccounts()

        } catch (err) {
            console.error('Loi tao tai khoan:', err)

            if (err.response?.status === 409) {
                setError('Ten dang nhap da ton tai hoac nhan vien da co tai khoan.')
            } else if (err.response?.status === 404) {
                setError('Khong tim thay nhan vien.')
            } else if (err.response?.status === 401) {
                setError('Phien dang nhap khong hop le.')
            } else if (err.response?.status === 403) {
                setError('Anh khong co quyen thuc hien chuc nang nay.')
            } else {
                setError('Khong the tao tai khoan. Vui long thu lai.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="account-management">

            <div className="account-page-header">
                <div>
                    <h2>Quản lý tài khoản</h2>
                    <p>Quản lý tài khoản đăng nhập của nhân viên trong hệ thống.</p>
                </div>
            </div>

            <div className="account-summary">
                <div className="account-summary-card">
                    <span className="account-summary-icon">🔐</span>
                    <div>
                        <p>Tổng số tài khoản</p>
                        <h3>{accounts.length}</h3>
                    </div>
                </div>

                <div className="account-summary-card">
                    <span className="account-summary-icon">👥</span>
                    <div>
                        <p>Nhân viên hiện có</p>
                        <h3>{employees.length}</h3>
                    </div>
                </div>
            </div>

            <div className="account-form-card">
                <div className="account-section-header">
                    <div>
                        <h3>Cấp tài khoản nhân viên</h3>
                        <p>Nhập thông tin để tạo tài khoản đăng nhập mới.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="account-form-grid">

                        <div className="account-form-group">
                            <label>Nhân viên <span>*</span></label>

                            {employees.length > 0 ? (
                                <select
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn nhân viên --</option>

                                    {employees.map(employee => (
                                        <option key={employee.id} value={employee.id}>
                                            #{employee.id} - {employee.fullName}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Nhập mã nhân viên"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    required
                                />
                            )}

                            {loadingEmployees && (
                                <small>Đang tải danh sách nhân viên...</small>
                            )}
                        </div>

                        <div className="account-form-group">
                            <label>Tên đăng nhập <span>*</span></label>
                            <input
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                maxLength={50}
                                required
                            />
                        </div>

                        <div className="account-form-group">
                            <label>Mật khẩu <span>*</span></label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu tối thiểu 8 ký tự"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                maxLength={72}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="account-message account-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="account-message account-success">
                            {success}
                        </div>
                    )}

                    <div className="account-form-actions">
                        <button
                            type="button"
                            className="account-reset-button"
                            onClick={() => {
                                setEmployeeId('')
                                setUsername('')
                                setPassword('')
                                setError('')
                                setSuccess('')
                            }}
                            disabled={loading}
                        >
                            Làm mới
                        </button>

                        <button
                            type="submit"
                            className="account-submit-button"
                            disabled={loading || !credentials}
                        >
                            {loading ? 'Đang tạo tài khoản...' : '+ Tạo tài khoản'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="account-table-card">
                <div className="account-section-header">
                    <div>
                        <h3>Danh sách tài khoản</h3>
                        <p>Dữ liệu được tải trực tiếp từ cơ sở dữ liệu.</p>
                    </div>
                </div>

                <div className="account-table-wrapper">
                    <table className="account-table">
                        <thead>
                            <tr>
                                <th>Mã tài khoản</th>
                                <th>Tên đăng nhập</th>
                                <th>Nhân viên</th>
                                <th>Vai trò</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loadingAccounts ? (
                                <tr>
                                    <td colSpan="4" className="account-empty">
                                        Đang tải danh sách tài khoản...
                                    </td>
                                </tr>
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="account-empty">
                                        Chưa có tài khoản nào.
                                    </td>
                                </tr>
                            ) : (
                                accounts.map(account => (
                                    <tr key={account.id}>
                                        <td>#{account.id}</td>
                                        <td className="account-username">
                                            {account.username}
                                        </td>
                                        <td>
                                            {account.employeeName || 'Quản trị viên'}
                                        </td>
                                        <td>
                                            <span className="account-role">
                                                {account.role}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default AccountManagement
