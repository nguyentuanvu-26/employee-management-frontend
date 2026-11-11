
import { useState, useEffect } from 'react'
import './EmployeeDashboard.css'
import api from '../services/api'
import QrScanner from './QrScanner'

function EmployeeDashboard({ user, credentials, onLogout }) {

    const [activeTab, setActiveTab] = useState('overview')

    // Dữ liệu lịch sử chấm công
    const [attendanceList, setAttendanceList] = useState([])
    const [loadingAttendance, setLoadingAttendance] = useState(false)
    const [attendanceError, setAttendanceError] = useState('')

    const menuItems = [
        { id: 'overview', icon: '🏠', label: 'Tổng quan' },
        { id: 'profile', icon: '👤', label: 'Thông tin cá nhân' },
        { id: 'attendance', icon: '🕒', label: 'Chấm công' },
        { id: 'history', icon: '📅', label: 'Lịch sử chấm công' }
    ]

    const fullName = user.fullName || user.username || 'Nhân viên'

    // Lấy lịch sử chấm công khi mở mục Lịch sử
    useEffect(() => {

        if (activeTab !== 'history' || !user.id || !credentials) {
            return
        }

        const fetchAttendance = async () => {

            setLoadingAttendance(true)
            setAttendanceError('')

            try {

                const response = await api.get(
                    `/api/attendance/employee/${user.id}`,
                    {
                        auth: {
                            username: credentials.username,
                            password: credentials.password
                        }
                    }
                )

                setAttendanceList(response.data)

            } catch (error) {

                console.error('Lỗi lấy lịch sử chấm công:', error)

                setAttendanceError(
                    error.response?.status === 401
                        ? 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.'
                        : 'Không thể tải lịch sử chấm công.'
                )

            } finally {

                setLoadingAttendance(false)

            }
        }

        fetchAttendance()

    }, [activeTab, user.id, credentials])

    // Định dạng ngày
    const formatDate = (date) => {
        if (!date) return '--'

        const parts = date.split('-')
        return `${parts[2]}/${parts[1]}/${parts[0]}`
    }

    // Định dạng giờ
    const formatTime = (dateTime) => {
        if (!dateTime) return '--:--'
        return dateTime.substring(11, 16)
    }

    // Định dạng số phút
    const formatMinutes = (minutes) => {
        if (minutes === null || minutes === undefined) {
            return '--'
        }

        return `${minutes} phút`
    }

    // Định dạng tổng thời gian làm việc
    const formatWorkedTime = (item) => {

        if (
            item.workedHours === null ||
            item.workedHours === undefined
        ) {
            return '--'
        }

        const hours = item.workedHours
        const minutes = item.remainingMinutes || 0

        return `${hours} giờ ${minutes} phút`
    }

    // Hiển thị trạng thái chấm công
    const getStatusLabel = (status) => {

        switch (status) {
            case 'PRESENT':
                return 'Đúng giờ'
            case 'LATE':
                return 'Đi muộn'
            case 'ABSENT':
                return 'Vắng mặt'
            default:
                return status || 'Chưa xác định'
        }
    }

    // Màu sắc trạng thái chấm công
    const getStatusStyle = (status) => {

        switch (status) {
            case 'PRESENT':
                return {
                    color: '#15803d',
                    backgroundColor: '#dcfce7'
                }

            case 'LATE':
                return {
                    color: '#b91c1c',
                    backgroundColor: '#fee2e2'
                }

            case 'ABSENT':
                return {
                    color: '#b91c1c',
                    backgroundColor: '#fee2e2'
                }

            default:
                return {
                    color: '#475569',
                    backgroundColor: '#f1f5f9'
                }
        }
    }

    const getCheckoutLabel = (status) => {

        switch (status) {
            case 'COMPLETED':
                return 'Đã hoàn thành'
            case 'INCOMPLETE':
                return 'Chưa checkout'
            case 'NOT_APPLICABLE':
                return 'Không áp dụng'
            default:
                return '--'
        }
    }

    return (
        <div className="employee-layout">

            <aside className="employee-sidebar">

                <div className="employee-logo">
                    <h2>EMS</h2>
                    <span>CỔNG THÔNG TIN NHÂN VIÊN</span>
                </div>

                <div className="employee-menu">

                    <p className="employee-menu-heading">
                        KHÔNG GIAN CỦA TÔI
                    </p>

                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={
                                activeTab === item.id
                                    ? 'employee-menu-item active'
                                    : 'employee-menu-item'
                            }
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}

                </div>

                <div className="employee-sidebar-bottom">
                    <button
                        className="employee-logout"
                        onClick={onLogout}
                    >
                        <span>🚪</span>
                        Đăng xuất
                    </button>
                </div>

            </aside>

            <main className="employee-main">

                <header className="employee-header">

                    <div>
                        <h2>
                            {menuItems.find(item => item.id === activeTab)?.label}
                        </h2>
                        <p>Hệ thống quản lý nhân sự EMS</p>
                    </div>

                    <div className="employee-header-user">
                        <div className="employee-avatar">
                            {fullName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{fullName}</strong>
                            <span>Nhân viên</span>
                        </div>
                    </div>

                </header>

                <section className="employee-content">

                    {/* TỔNG QUAN */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="employee-welcome">
                                <h1>Xin chào, {fullName}!</h1>
                                <p>
                                    Chào mừng anh/chị đến với không gian làm việc cá nhân.
                                </p>
                            </div>

                            <div className="employee-info-grid">

                                <div className="employee-info-card">
                                    <span className="info-card-icon">👤</span>
                                    <p>Họ và tên</p>
                                    <h3>{fullName}</h3>
                                </div>

                                <div className="employee-info-card">
                                    <span className="info-card-icon">💼</span>
                                    <p>Chức vụ</p>
                                    <h3>{user.position || 'Chưa cập nhật'}</h3>
                                </div>

                                <div className="employee-info-card">
                                    <span className="info-card-icon">🏢</span>
                                    <p>Phòng ban</p>
                                    <h3>{user.departmentName || 'Chưa cập nhật'}</h3>
                                </div>

                            </div>

                            <div className="employee-section-card">
                                <h3>Chấm công hôm nay</h3>

                                <p>
                                    Sử dụng điện thoại để quét mã QR tại công ty.
                                </p>

                                <button
                                    className="employee-primary-button"
                                    onClick={() => setActiveTab('attendance')}
                                >
                                    Mở chức năng chấm công
                                </button>
                            </div>
                        </>
                    )}

                    {/* THÔNG TIN CÁ NHÂN */}
                    {activeTab === 'profile' && (
                        <div className="employee-section-card">

                            <h3>Thông tin cá nhân</h3>

                            <div className="employee-profile-grid">

                                <div>
                                    <span>Tên đăng nhập</span>
                                    <strong>{user.username || 'Chưa cập nhật'}</strong>
                                </div>

                                <div>
                                    <span>Họ và tên</span>
                                    <strong>{fullName}</strong>
                                </div>

                                <div>
                                    <span>Email</span>
                                    <strong>{user.email || 'Chưa cập nhật'}</strong>
                                </div>

                                <div>
                                    <span>Số điện thoại</span>
                                    <strong>{user.phone || 'Chưa cập nhật'}</strong>
                                </div>

                                <div>
                                    <span>Chức vụ</span>
                                    <strong>{user.position || 'Chưa cập nhật'}</strong>
                                </div>

                                <div>
                                    <span>Phòng ban</span>
                                    <strong>{user.departmentName || 'Chưa cập nhật'}</strong>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* CHẤM CÔNG BẰNG QR CODE */}
                    {activeTab === 'attendance' && (
                        <div className="employee-section-card employee-attendance-card">

                            <QrScanner credentials={credentials} />

                        </div>
                    )}

                    {/* LỊCH SỬ CHẤM CÔNG */}
                    {activeTab === 'history' && (
                        <div className="employee-section-card">

                            <h3>Lịch sử chấm công</h3>

                            <p>
                                Dữ liệu chấm công của tài khoản: {user.username}
                            </p>

                            {loadingAttendance && (
                                <p>Đang tải lịch sử chấm công...</p>
                            )}

                            {attendanceError && (
                                <p style={{ color: 'red' }}>
                                    {attendanceError}
                                </p>
                            )}

                            {!loadingAttendance && !attendanceError && (
                                <>
                                    {attendanceList.length === 0 ? (

                                        <p>Chưa có dữ liệu chấm công.</p>

                                    ) : (

                                        <div style={{
                                            width: '100%',
                                            overflowX: 'auto',
                                            marginTop: '20px'
                                        }}>

                                            <table style={{
                                                width: '100%',
                                                minWidth: '1050px',
                                                tableLayout: 'fixed',
                                                borderCollapse: 'collapse'
                                            }}>

                                                <colgroup>
                                                    <col style={{ width: '12%' }} />
                                                    <col style={{ width: '10%' }} />
                                                    <col style={{ width: '10%' }} />
                                                    <col style={{ width: '14%' }} />
                                                    <col style={{ width: '11%' }} />
                                                    <col style={{ width: '11%' }} />
                                                    <col style={{ width: '16%' }} />
                                                    <col style={{ width: '16%' }} />
                                                </colgroup>

                                                <thead>
                                                    <tr>
                                                        <th style={tableHeaderStyle}>Ngày</th>
                                                        <th style={tableHeaderStyle}>Giờ vào</th>
                                                        <th style={tableHeaderStyle}>Giờ ra</th>
                                                        <th style={tableHeaderStyle}>Trạng thái</th>
                                                        <th style={tableHeaderStyle}>Đi muộn</th>
                                                        <th style={tableHeaderStyle}>Về sớm</th>
                                                        <th style={tableHeaderStyle}>Tổng giờ làm</th>
                                                        <th style={tableHeaderStyle}>Checkout</th>
                                                    </tr>
                                                </thead>

                                                <tbody>

                                                    {attendanceList.map(item => (
                                                        <tr key={item.id}>

                                                            <td style={tableCellStyle}>
                                                                {formatDate(item.attendanceDate)}
                                                            </td>

                                                            <td style={tableCellStyle}>
                                                                {formatTime(item.checkIn)}
                                                            </td>

                                                            <td style={tableCellStyle}>
                                                                {formatTime(item.checkOut)}
                                                            </td>

                                                            <td style={tableCellStyle}>
                                                                <span style={{
                                                                    ...getStatusStyle(item.status),
                                                                    display: 'inline-block',
                                                                    padding: '6px 10px',
                                                                    borderRadius: '6px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {getStatusLabel(item.status)}
                                                                </span>
                                                            </td>

                                                            <td style={{
                                                                ...tableCellStyle,
                                                                color: item.lateMinutes > 0 ? '#dc2626' : '#15803d',
                                                                fontWeight: '600'
                                                            }}>
                                                                {formatMinutes(item.lateMinutes)}
                                                            </td>

                                                            <td style={{
                                                                ...tableCellStyle,
                                                                color: item.earlyLeaveMinutes > 0 ? '#d97706' : '#15803d',
                                                                fontWeight: '600'
                                                            }}>
                                                                {formatMinutes(item.earlyLeaveMinutes)}
                                                            </td>

                                                            <td style={tableCellStyle}>
                                                                {formatWorkedTime(item)}
                                                            </td>

                                                            <td style={tableCellStyle}>
                                                                {getCheckoutLabel(item.checkoutStatus)}
                                                            </td>

                                                        </tr>
                                                    ))}

                                                </tbody>

                                            </table>

                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                    )}

                </section>

            </main>

        </div>
    )
}

// Căn giữa tiêu đề từng cột
const tableHeaderStyle = {
    padding: '14px 8px',
    textAlign: 'center',
    verticalAlign: 'middle',
    backgroundColor: '#f1f5f9',
    borderBottom: '1px solid #ddd',
    whiteSpace: 'nowrap',
    fontWeight: '600'
}

// Căn giữa dữ liệu từng ô
const tableCellStyle = {
    padding: '14px 8px',
    textAlign: 'center',
    verticalAlign: 'middle',
    borderBottom: '1px solid #eee',
    whiteSpace: 'nowrap'
}

export default EmployeeDashboard
