
import { useEffect, useState } from 'react'
import api from '../services/api'
import './DepartmentManagement.css'

function DepartmentManagement({ credentials }) {

    const [departments, setDepartments] = useState([])
    const [keyword, setKeyword] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [editingDepartment, setEditingDepartment] = useState(null)

    const [departmentName, setDepartmentName] = useState('')

    const authConfig = {
        auth: {
            username: credentials?.username,
            password: credentials?.password
        }
    }

    // Tải danh sách phòng ban
    const fetchDepartments = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await api.get(
                '/api/departments',
                authConfig
            )

            const data = response.data

            setDepartments(
                Array.isArray(data)
                    ? data
                    : data.content || []
            )

        } catch (err) {
            console.error(err)

            setError(
                err.response?.data?.message ||
                'Không thể tải danh sách phòng ban.'
            )

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDepartments()
    }, [])

    // Hiển thị thông báo thành công
    const showSuccess = (message) => {
        setSuccess(message)

        setTimeout(() => {
            setSuccess('')
        }, 3000)
    }

    // Mở biểu mẫu thêm phòng ban
    const handleOpenAdd = () => {
        setEditingDepartment(null)
        setDepartmentName('')
        setError('')
        setShowModal(true)
    }

    // Mở biểu mẫu sửa phòng ban
    const handleOpenEdit = (department) => {
        setEditingDepartment(department)
        setDepartmentName(department.departmentName || '')
        setError('')
        setShowModal(true)
    }

    // Đóng biểu mẫu
    const handleCloseModal = () => {
        setShowModal(false)
        setEditingDepartment(null)
        setDepartmentName('')
    }

    // Thêm mới hoặc cập nhật phòng ban
    const handleSubmit = async (event) => {
        event.preventDefault()

        const trimmedName = departmentName.trim()

        if (!trimmedName) {
            setError('Tên phòng ban không được để trống.')
            return
        }

        try {
            setError('')

            const payload = {
                departmentName: trimmedName
            }

            if (editingDepartment) {

                await api.put(
                    `/api/departments/${editingDepartment.id}`,
                    payload,
                    authConfig
                )

                showSuccess('Cập nhật phòng ban thành công!')

            } else {

                await api.post(
                    '/api/departments',
                    payload,
                    authConfig
                )

                showSuccess('Thêm phòng ban mới thành công!')
            }

            handleCloseModal()
            await fetchDepartments()

        } catch (err) {
            console.error(err)

            setError(
                err.response?.data?.message ||
                'Không thể lưu thông tin phòng ban.'
            )
        }
    }

    // Xóa phòng ban
    const handleDelete = async (department) => {

        const confirmed = window.confirm(
            `Anh có chắc chắn muốn xóa phòng ban "${department.departmentName}" không?`
        )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await api.delete(
                `/api/departments/${department.id}`,
                authConfig
            )

            showSuccess(
                `Đã xóa phòng ban "${department.departmentName}" thành công!`
            )

            await fetchDepartments()

        } catch (err) {
            console.error(err)

            setError(
                err.response?.data?.message ||
                'Không thể xóa phòng ban. Có thể phòng ban đang có nhân viên liên kết.'
            )
        }
    }

    // Tìm kiếm phòng ban
    const filteredDepartments = departments.filter((department) =>
        (department.departmentName || '')
            .toLowerCase()
            .includes(keyword.toLowerCase().trim())
    )

    return (
        <div className="department-management">

            {/* Tiêu đề trang */}

            <div className="department-page-header">

                <div>
                    <h1>Quản lý phòng ban</h1>

                    <p>
                        Quản lý danh sách các phòng ban trong hệ thống.
                    </p>
                </div>

                <div className="department-header-actions">

                    <button
                        className="department-add-button"
                        onClick={handleOpenAdd}
                    >
                        + Thêm phòng ban
                    </button>

                    <button
                        className="department-refresh-button"
                        onClick={fetchDepartments}
                    >
                        Làm mới
                    </button>

                </div>

            </div>

            {/* Thông báo */}

            {success && (
                <div className="department-success">
                    {success}
                </div>
            )}

            {error && !showModal && (
                <div className="department-error">
                    {error}
                </div>
            )}

            {/* Thống kê */}

            <div className="department-statistics">

                <div className="department-stat-card">
                    <span>Tổng số phòng ban</span>
                    <strong>{departments.length}</strong>
                </div>

                <div className="department-stat-card">
                    <span>Kết quả tìm kiếm</span>
                    <strong>{filteredDepartments.length}</strong>
                </div>

                <div className="department-stat-card">
                    <span>Trạng thái dữ liệu</span>

                    <strong className="department-data-status">
                        {loading ? 'Đang tải' : 'Đã tải'}
                    </strong>
                </div>

            </div>

            {/* Tìm kiếm */}

            <div className="department-search-area">

                <div>
                    <label>Tìm kiếm phòng ban</label>

                    <input
                        type="text"
                        placeholder="Nhập tên phòng ban..."
                        value={keyword}
                        onChange={(event) =>
                            setKeyword(event.target.value)
                        }
                    />
                </div>

            </div>

            {/* Danh sách phòng ban */}

            <div className="department-table-container">

                <div className="department-table-header">

                    <h2>Danh sách phòng ban</h2>

                    <span>
                        Tìm thấy {filteredDepartments.length} phòng ban
                    </span>

                </div>

                {loading ? (

                    <div className="department-message">
                        Đang tải dữ liệu...
                    </div>

                ) : (

                    <div className="department-table-scroll">

                        <table className="department-table">

                            <thead>
                                <tr>
                                    <th>Mã phòng ban</th>
                                    <th>Tên phòng ban</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredDepartments.length > 0 ? (

                                    filteredDepartments.map((department) => (

                                        <tr key={department.id}>

                                            <td>
                                                #{department.id}
                                            </td>

                                            <td>
                                                <strong>
                                                    {department.departmentName}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="department-action-buttons">

                                                    <button
                                                        className="department-edit-button"
                                                        onClick={() =>
                                                            handleOpenEdit(department)
                                                        }
                                                    >
                                                        Sửa
                                                    </button>

                                                    <button
                                                        className="department-delete-button"
                                                        onClick={() =>
                                                            handleDelete(department)
                                                        }
                                                    >
                                                        Xóa
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="department-empty"
                                        >
                                            Không tìm thấy phòng ban nào.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* Biểu mẫu thêm và sửa phòng ban */}

            {showModal && (

                <div
                    className="department-modal-overlay"
                    onClick={handleCloseModal}
                >

                    <div
                        className="department-modal"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <div className="department-modal-header">

                            <h2>
                                {editingDepartment
                                    ? 'Cập nhật phòng ban'
                                    : 'Thêm phòng ban mới'}
                            </h2>

                            <button
                                type="button"
                                className="department-modal-close"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="department-form-group">

                                <label>Tên phòng ban</label>

                                <input
                                    type="text"
                                    placeholder="Nhập tên phòng ban..."
                                    value={departmentName}
                                    onChange={(event) =>
                                        setDepartmentName(event.target.value)
                                    }
                                    required
                                />

                            </div>

                            {error && (
                                <div className="department-error">
                                    {error}
                                </div>
                            )}

                            <div className="department-modal-actions">

                                <button
                                    type="button"
                                    className="department-cancel-button"
                                    onClick={handleCloseModal}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="department-save-button"
                                >
                                    {editingDepartment
                                        ? 'Lưu thay đổi'
                                        : 'Thêm phòng ban'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    )
}

export default DepartmentManagement
