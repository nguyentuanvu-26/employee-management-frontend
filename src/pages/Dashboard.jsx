
import { useEffect, useState } from 'react'
import api from '../services/api'
import './Dashboard.css'

function Dashboard({ credentials }) {

    const [statistics, setStatistics] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        lateToday: 0,
        absentToday: 0
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {

        const fetchDashboard = async () => {
            try {
                const response = await api.get('/api/dashboard', {
                    auth: credentials
                })

                setStatistics(response.data)
                setError('')

            } catch (error) {
                console.error('Loi lay du lieu Dashboard:', error)
                setError('Không thể tải dữ liệu thống kê.')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()

    }, [credentials])

    const cards = [
        {
            title: 'Tổng nhân viên',
            value: statistics.totalEmployees,
            icon: '👥',
            color: 'blue',
            description: 'Tổng số nhân viên trong hệ thống'
        },
        {
            title: 'Đang làm việc',
            value: statistics.activeEmployees,
            icon: '🟢',
            color: 'green',
            description: 'Nhân viên đang hoạt động'
        },
        {
            title: 'Đi muộn hôm nay',
            value: statistics.lateToday,
            icon: '⏰',
            color: 'orange',
            description: 'Nhân viên đi làm muộn'
        },
        {
            title: 'Vắng mặt hôm nay',
            value: statistics.absentToday,
            icon: '📅',
            color: 'red',
            description: 'Nhân viên vắng mặt'
        }
    ]

    return (
        <div className="dashboard">

            <div className="dashboard-heading">
                <div>
                    <h2>Tổng quan hệ thống</h2>
                    <p>
                        Chào mừng anh đến với hệ thống quản lý nhân sự EMS.
                    </p>
                </div>
            </div>

            {error && (
                <p style={{ color: 'red' }}>{error}</p>
            )}

            <div className="statistics-grid">

                {cards.map((item) => (
                    <div
                        className={`stat-card ${item.color}`}
                        key={item.title}
                    >
                        <div className="stat-top">
                            <div>
                                <p className="stat-title">
                                    {item.title}
                                </p>

                                <h3 className="stat-value">
                                    {loading ? '...' : item.value}
                                </h3>
                            </div>

                            <div className="stat-icon">
                                {item.icon}
                            </div>
                        </div>

                        <p className="stat-description">
                            {item.description}
                        </p>
                    </div>
                ))}

            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h3>Hoạt động gần đây</h3>
                    <span>Hôm nay</span>
                </div>

                <div className="empty-activity">
                    <div className="empty-icon">📋</div>
                    <h4>Chưa có dữ liệu hoạt động</h4>
                    <p>
                        Các hoạt động của hệ thống sẽ được hiển thị tại đây.
                    </p>
                </div>
            </div>

        </div>
    )
}

export default Dashboard
