
import { useEffect, useState } from 'react'
import api from '../services/api'
import './AttendanceManagement.css'

function AttendanceManagement({ credentials }) {

    const [attendances, setAttendances] = useState([])
    const [keyword, setKeyword] = useState('')
    const [selectedDate, setSelectedDate] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [selectedAttendance, setSelectedAttendance] = useState(null)

    const authConfig = {
        auth: {
            username: credentials?.username,
            password: credentials?.password
        }
    }

    // Tải toàn bộ dữ liệu chấm công
    const fetchAttendances = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await api.get(
                '/api/attendance',
                authConfig
            )

            setAttendances(
                Array.isArray(response.data) ? response.data : []
            )

            setCurrentPage(1)

        } catch (err) {
            console.error(err)

            setError(
                err.response?.data?.message ||
                'Không thể tải danh sách chấm công.'
            )

        } finally {
            setLoading(false)
        }
    }

    // Lọc chấm công theo ngày
    const handleDateChange = async (date) => {
        setSelectedDate(date)
        setCurrentPage(1)

        if (!date) {
            await fetchAttendances()
            return
        }

        try {
            setLoading(true)
            setError('')

            const response = await api.get(
                '/api/attendance/date',
                {
                    ...authConfig,
                    params: {
                        date: date
                    }
                }
            )

            setAttendances(
                Array.isArray(response.data) ? response.data : []
            )

        } catch (err) {
            console.error(err)

            setError(
                err.response?.data?.message ||
                'Không thể tải dữ liệu chấm công theo ngày.'
            )

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAttendances()
    }, [])

    // Định dạng ngày
    const formatDate = (date) => {
        if (!date) return 'Chưa có dữ liệu'

        return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN')
    }

    // Định dạng giờ
    const formatTime = (dateTime) => {
        if (!dateTime) return 'Chưa chấm công'

        const date = new Date(dateTime)

        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
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

    const getStatusClass = (status) => {
        switch (status) {
            case 'PRESENT':
                return 'attendance-status-present'

            case 'LATE':
                return 'attendance-status-late'

            case 'ABSENT':
                return 'attendance-status-absent'

            default:
                return 'attendance-status-unknown'
        }
    }

    const getCheckoutLabel = (status) => {
        if (!status) return 'Chưa hoàn thành'

        const labels = {
            COMPLETED: 'Đã hoàn thành',
            INCOMPLETE: 'Chưa đủ giờ',
            EARLY_LEAVE: 'Về sớm',
            NOT_CHECKED_OUT: 'Chưa check-out'
        }

        return labels[status] || status
    }

    // Tìm kiếm theo tên nhân viên và phòng ban
    const filteredAttendances = attendances.filter((attendance) => {
        const search = keyword.toLowerCase().trim()

        return (
            (attendance.employeeName || '').toLowerCase().includes(search) ||
            (attendance.departmentName || '').toLowerCase().includes(search) ||
            String(attendance.employeeId || '').includes(search)
        )
    })

    // Thống kê
    const totalRecords = filteredAttendances.length

    const presentCount = filteredAttendances.filter(
        item => item.status === 'PRESENT'
    ).length

    const lateCount = filteredAttendances.filter(
        item => item.status === 'LATE'
    ).length

    const absentCount = filteredAttendances.filter(
        item => item.status === 'ABSENT'
    ).length

    // Phân trang
    const totalPages = Math.max(
        1,
        Math.ceil(filteredAttendances.length / pageSize)
    )

    const safePage = Math.min(currentPage, totalPages)

    const displayedAttendances = filteredAttendances.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    )

    return (
        <div className="attendance-management">

            {/* Tiêu đề */}

            <div className="attendance-page-header">

                <div>
                    <h1>Quản lý chấm công</h1>

                    <p>
                        Theo dõi thời gian làm việc và tình trạng chấm công của nhân viên.
                    </p>
                </div>

                <button
                    className="attendance-refresh-button"
                    onClick={() => {
                        setSelectedDate('')
                        setKeyword('')
                        fetchAttendances()
                    }}
                >
                    Làm mới
                </button>

            </div>

            {/* Thông báo lỗi */}

            {error && (
                <div className="attendance-error">
                    {error}
                </div>
            )}

            {/* Thống kê */}

            <div className="attendance-statistics">

                <div className="attendance-stat-card">
                    <span>Tổng lượt chấm công</span>
                    <strong>{totalRecords}</strong>
                </div>

                <div className="attendance-stat-card">
                    <span>Đúng giờ</span>
                    <strong className="attendance-green">
                        {presentCount}
                    </strong>
                </div>

                <div className="attendance-stat-card">
                    <span>Đi muộn</span>
                    <strong className="attendance-orange">
                        {lateCount}
                    </strong>
                </div>

                <div className="attendance-stat-card">
                    <span>Vắng mặt</span>
                    <strong className="attendance-red">
                        {absentCount}
                    </strong>
                </div>

            </div>

            {/* Bộ lọc */}

            <div className="attendance-filter-area">

                <div className="attendance-filter-group">
                    <label>Tìm kiếm nhân viên</label>

                    <input
                        type="text"
                        placeholder="Nhập tên, mã nhân viên hoặc phòng ban..."
                        value={keyword}
                        onChange={(event) => {
                            setKeyword(event.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>

                <div className="attendance-filter-group">
                    <label>Lọc theo ngày</label>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(event) =>
                            handleDateChange(event.target.value)
                        }
                    />
                </div>

            </div>

            {/* Bảng chấm công */}

            <div className="attendance-table-container">

                <div className="attendance-table-header">

                    <h2>Danh sách chấm công</h2>

                    <span>
                        Tìm thấy {filteredAttendances.length} bản ghi
                    </span>

                </div>

                {loading ? (

                    <div className="attendance-message">
                        Đang tải dữ liệu...
                    </div>

                ) : (

                    <div className="attendance-table-scroll">

                        <table className="attendance-table">

                            <thead>
                                <tr>
                                    <th>Mã NV</th>
                                    <th>Nhân viên</th>
                                    <th>Phòng ban</th>
                                    <th>Ngày</th>
                                    <th>Giờ vào</th>
                                    <th>Giờ ra</th>
                                    <th>Giờ làm</th>
                                    <th>Trạng thái</th>
                                    <th>Chi tiết</th>
                                </tr>
                            </thead>

                            <tbody>

                                {displayedAttendances.length > 0 ? (

                                    displayedAttendances.map((attendance) => (

                                        <tr key={attendance.id}>

                                            <td>#{attendance.employeeId}</td>

                                            <td>
                                                <strong>
                                                    {attendance.employeeName || 'Chưa xác định'}
                                                </strong>
                                            </td>

                                            <td>
                                                {attendance.departmentName || 'Chưa phân phòng ban'}
                                            </td>

                                            <td>
                                                {formatDate(attendance.attendanceDate)}
                                            </td>

                                            <td>
                                                {formatTime(attendance.checkIn)}
                                            </td>

                                            <td>
                                                {formatTime(attendance.checkOut)}
                                            </td>

                                            <td>
                                                {attendance.workedHours ?? 0} giờ
                                            </td>

                                            <td>
                                                <span className={getStatusClass(attendance.status)}>
                                                    {getStatusLabel(attendance.status)}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="attendance-detail-button"
                                                    onClick={() =>
                                                        setSelectedAttendance(attendance)
                                                    }
                                                >
                                                    Chi tiết
                                                </button>
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="attendance-empty"
                                        >
                                            Không tìm thấy dữ liệu chấm công.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

                {/* Phân trang */}

                <div className="attendance-pagination">

                    <div>
                        <span>Số dòng mỗi trang: </span>

                        <select
                            value={pageSize}
                            onChange={(event) => {
                                setPageSize(Number(event.target.value))
                                setCurrentPage(1)
                            }}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                    </div>

                    <div className="attendance-page-controls">

                        <span>
                            Trang {safePage} / {totalPages}
                        </span>

                        <button
                            disabled={safePage <= 1}
                            onClick={() => setCurrentPage(safePage - 1)}
                        >
                            Trước
                        </button>

                        <button
                            disabled={safePage >= totalPages}
                            onClick={() => setCurrentPage(safePage + 1)}
                        >
                            Sau
                        </button>

                    </div>

                </div>

            </div>

            {/* Chi tiết chấm công */}

            {selectedAttendance && (

                <div
                    className="attendance-modal-overlay"
                    onClick={() => setSelectedAttendance(null)}
                >

                    <div
                        className="attendance-modal"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <div className="attendance-modal-header">

                            <h2>Chi tiết chấm công</h2>

                            <button
                                onClick={() => setSelectedAttendance(null)}
                            >
                                ×
                            </button>

                        </div>

                        <div className="attendance-detail-list">

                            <p>
                                <strong>Nhân viên:</strong>
                                {selectedAttendance.employeeName}
                            </p>

                            <p>
                                <strong>Mã nhân viên:</strong>
                                {selectedAttendance.employeeId}
                            </p>

                            <p>
                                <strong>Phòng ban:</strong>
                                {selectedAttendance.departmentName || 'Chưa cập nhật'}
                            </p>

                            <p>
                                <strong>Ngày chấm công:</strong>
                                {formatDate(selectedAttendance.attendanceDate)}
                            </p>

                            <p>
                                <strong>Giờ vào:</strong>
                                {formatTime(selectedAttendance.checkIn)}
                            </p>

                            <p>
                                <strong>Giờ ra:</strong>
                                {formatTime(selectedAttendance.checkOut)}
                            </p>

                            <p>
                                <strong>Trạng thái:</strong>
                                {getStatusLabel(selectedAttendance.status)}
                            </p>

                            <p>
                                <strong>Trạng thái checkout:</strong>
                                {getCheckoutLabel(selectedAttendance.checkoutStatus)}
                            </p>

                            <p>
                                <strong>Tổng giờ làm:</strong>
                                {selectedAttendance.workedHours ?? 0} giờ
                            </p>

                            <p>
                                <strong>Số phút đi muộn:</strong>
                                {selectedAttendance.lateMinutes ?? 0} phút
                            </p>

                            <p>
                                <strong>Số phút về sớm:</strong>
                                {selectedAttendance.earlyLeaveMinutes ?? 0} phút
                            </p>

                            <p>
                                <strong>Thời gian còn thiếu:</strong>
                                {selectedAttendance.remainingMinutes ?? 0} phút
                            </p>

                        </div>

                        <button
                            className="attendance-close-button"
                            onClick={() => setSelectedAttendance(null)}
                        >
                            Đóng
                        </button>

                    </div>

                </div>

            )}

        </div>
    )
}

export default AttendanceManagement
