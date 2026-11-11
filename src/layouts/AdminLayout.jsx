
import { NavLink, Outlet } from 'react-router-dom'
import './AdminLayout.css'

function AdminLayout({ onLogout }) {

    const menuItems = [
        {
            title: 'Tổng quan',
            path: '/admin',
            icon: '📊'
        },
        {
            title: 'Quản lý nhân viên',
            path: '/admin/employees',
            icon: '👥'
        },
        {
            title: 'Quản lý phòng ban',
            path: '/admin/departments',
            icon: '🏢'
        },
        {
            title: 'Quản lý chấm công',
            path: '/admin/attendance',
            icon: '🕒'
        },
        {
            title: 'Chấm công QR',
            path: '/admin/qr-attendance',
            icon: '📱'
        },
        {
            title: 'Quản lý tài khoản',
            path: '/admin/accounts',
            icon: '🔐'
        }
    ]

    return (
        <div className="admin-layout">

            {/* THANH ĐIỀU HƯỚNG */}
            <aside className="admin-sidebar">

                <div className="sidebar-logo">
                    <h2>EMS</h2>
                    <span>Employee Management</span>
                </div>

                <div className="sidebar-menu">
                    <p className="menu-heading">MENU CHÍNH</p>

                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                isActive ? 'menu-item active' : 'menu-item'
                            }
                        >
                            <span className="menu-icon">
                                {item.icon}
                            </span>

                            <span>{item.title}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-bottom">

                    <button
                        className="admin-logout-button"
                        onClick={onLogout}
                    >
                        <span>🚪</span>
                        Đăng xuất
                    </button>

                    <span>© 2026 EMS</span>

                </div>

            </aside>

            {/* NỘI DUNG CHÍNH */}
            <main className="admin-main">

                <header className="admin-header">

                    <div>
                        <h3>Hệ thống quản trị</h3>
                        <p>Quản lý nhân sự và chấm công</p>
                    </div>

                    <div className="admin-user">
                        <div className="admin-avatar">
                            A
                        </div>

                        <div className="admin-user-info">
                            <strong>Administrator</strong>
                            <span>ADMIN</span>
                        </div>
                    </div>

                </header>

                <section className="admin-content">
                    <Outlet />
                </section>

            </main>

        </div>
    )
}

export default AdminLayout
