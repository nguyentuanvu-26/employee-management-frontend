
import { useEffect, useMemo, useState } from 'react'

import api from '../services/api'

import './EmployeeManagement.css'

function EmployeeManagement({ credentials }) {

    // ========================================
    // DỮ LIỆU VÀ TRẠNG THÁI
    // ========================================

    const [employees, setEmployees] = useState([])
    const [departments, setDepartments] = useState([])

    const [searchKeyword, setSearchKeyword] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('')

    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize, setPageSize] = useState(5)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [reloadKey, setReloadKey] = useState(0)

    // Điều khiển cửa sổ thêm và sửa nhân viên
    const [showModal, setShowModal] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState(null)

    const [saving, setSaving] = useState(false)
    const [formError, setFormError] = useState('')

    // Dữ liệu biểu mẫu
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        departmentId: ''
    })


    // ========================================
    // LẤY DỮ LIỆU TỪ BACKEND
    // ========================================

    useEffect(() => {

        const fetchData = async () => {

            if (!credentials) {
                setLoading(false)
                setError('Không tìm thấy thông tin đăng nhập!')
                return
            }

            try {

                setLoading(true)
                setError('')

                // Lấy danh sách nhân viên
                const employeeResponse = await api.get(
                    '/api/employees',
                    { auth: credentials }
                )

                const employeeData = employeeResponse.data

                setEmployees(
                    Array.isArray(employeeData)
                        ? employeeData
                        : employeeData.content || []
                )

                // Lấy danh sách phòng ban
                const departmentResponse = await api.get(
                    '/api/departments',
                    { auth: credentials }
                )

                const departmentData = departmentResponse.data

                setDepartments(
                    Array.isArray(departmentData)
                        ? departmentData
                        : departmentData.content || []
                )

            } catch (error) {

                console.error('Lỗi lấy dữ liệu:', error)

                if (error.response?.status === 401) {
                    setError('Phiên đăng nhập không hợp lệ!')
                } else if (error.response?.status === 403) {
                    setError('Tài khoản không có quyền truy cập!')
                } else {
                    setError('Không thể tải dữ liệu nhân viên hoặc phòng ban!')
                }

            } finally {

                setLoading(false)

            }
        }

        fetchData()

    }, [credentials, reloadKey])


    // ========================================
    // TÌM KIẾM VÀ LỌC NHÂN VIÊN
    // ========================================

    const filteredEmployees = useMemo(() => {

        return employees.filter((employee) => {

            const keyword = searchKeyword.trim().toLowerCase()

            const matchesKeyword =
                !keyword ||
                employee.fullName?.toLowerCase().includes(keyword) ||
                employee.email?.toLowerCase().includes(keyword) ||
                employee.phone?.toLowerCase().includes(keyword)

            const matchesDepartment =
                !selectedDepartment ||
                String(employee.department?.id) === selectedDepartment

            return matchesKeyword && matchesDepartment

        })

    }, [employees, searchKeyword, selectedDepartment])


    // ========================================
    // PHÂN TRANG
    // ========================================

    const totalPages = Math.ceil(
        filteredEmployees.length / pageSize
    )

    const startIndex = currentPage * pageSize

    const currentEmployees = filteredEmployees.slice(
        startIndex,
        startIndex + pageSize
    )

    useEffect(() => {
        setCurrentPage(0)
    }, [searchKeyword, selectedDepartment, pageSize])


    // ========================================
    // LÀM MỚI DỮ LIỆU
    // ========================================

    const handleRefresh = () => {
        setReloadKey((previous) => previous + 1)
    }


    // ========================================
    // MỞ BIỂU MẪU THÊM NHÂN VIÊN
    // ========================================

    const handleOpenAdd = () => {

        setEditingEmployee(null)

        setFormData({
            fullName: '',
            email: '',
            phone: '',
            position: '',
            departmentId: ''
        })

        setFormError('')
        setShowModal(true)
    }


    // ========================================
    // MỞ BIỂU MẪU SỬA NHÂN VIÊN
    // ========================================

    const handleOpenEdit = (employee) => {

        setEditingEmployee(employee)

        setFormData({
            fullName: employee.fullName || '',
            email: employee.email || '',
            phone: employee.phone || '',
            position: employee.position || '',
            departmentId: employee.department?.id
                ? String(employee.department.id)
                : ''
        })

        setFormError('')
        setShowModal(true)
    }


    // ========================================
    // ĐÓNG BIỂU MẪU
    // ========================================

    const handleCloseModal = () => {

        if (saving) return

        setShowModal(false)
        setEditingEmployee(null)
        setFormError('')

        setFormData({
            fullName: '',
            email: '',
            phone: '',
            position: '',
            departmentId: ''
        })
    }


    // ========================================
    // XỬ LÝ THAY ĐỔI DỮ LIỆU BIỂU MẪU
    // ========================================

    const handleFormChange = (e) => {

        const { name, value } = e.target

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }))
    }


    // ========================================
    // THÊM HOẶC CẬP NHẬT NHÂN VIÊN
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        if (saving) return

        setFormError('')

        // Kiểm tra thông tin bắt buộc
        if (
            !formData.fullName.trim() ||
            !formData.email.trim() ||
            !formData.position.trim() ||
            !formData.departmentId
        ) {
            setFormError('Vui lòng nhập đầy đủ thông tin bắt buộc!')
            return
        }

        // Chuẩn bị dữ liệu gửi đến Backend
        const employeeData = {
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            position: formData.position.trim(),
            active: editingEmployee
                ? editingEmployee.active
                : true,
            department: {
                id: Number(formData.departmentId)
            }
        }

        try {

            setSaving(true)

            if (editingEmployee) {

                // Gửi yêu cầu PUT để cập nhật nhân viên
                await api.put(
                    `/api/employees/${editingEmployee.id}`,
                    employeeData,
                    { auth: credentials }
                )

            } else {

                // Gửi yêu cầu POST để thêm nhân viên
                await api.post(
                    '/api/employees',
                    employeeData,
                    { auth: credentials }
                )

            }

            // Đóng biểu mẫu sau khi lưu thành công
            setShowModal(false)
            setEditingEmployee(null)

            setFormData({
                fullName: '',
                email: '',
                phone: '',
                position: '',
                departmentId: ''
            })

            // Hiển thị thông báo
            setSuccess(
                editingEmployee
                    ? 'Cập nhật thông tin nhân viên thành công!'
                    : 'Thêm nhân viên thành công!'
            )

            // Tải lại danh sách từ Backend
            setReloadKey((previous) => previous + 1)

            setTimeout(() => {
                setSuccess('')
            }, 3000)

        } catch (error) {

            console.error('Lỗi lưu thông tin nhân viên:', error)

            if (error.response?.status === 400) {
                setFormError(
                    error.response.data?.message ||
                    'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!'
                )
            } else if (error.response?.status === 404) {
                setFormError('Không tìm thấy nhân viên cần cập nhật!')
            } else if (error.response?.status === 409) {
                setFormError(
                    error.response.data?.message ||
                    'Email này đã được sử dụng!'
                )
            } else if (error.response?.status === 401) {
                setFormError('Phiên đăng nhập không hợp lệ!')
            } else if (error.response?.status === 403) {
                setFormError('Anh không có quyền thực hiện thao tác này!')
            } else {
                setFormError(
                    error.response?.data?.message ||
                    'Không thể lưu dữ liệu. Vui lòng thử lại!'
                )
            }

        } finally {

            setSaving(false)

        }
    }


    // ========================================
    // GIAO DIỆN CHÍNH
    // ========================================

    return (

        <div className="employee-management">

            {/* TIÊU ĐỀ TRANG */}

            <div className="employee-heading">

                <div>

                    <h2>Quản lý nhân viên</h2>

                    <p>
                        Quản lý thông tin nhân sự trong hệ thống.
                    </p>

                </div>

                <div className="employee-heading-actions">

                    <button
                        className="add-employee-button"
                        onClick={handleOpenAdd}
                    >
                        + Thêm nhân viên
                    </button>

                    <button
                        className="refresh-button"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>

                </div>

            </div>


            {/* THÔNG BÁO */}

            {success && (
                <div className="employee-success">
                    {success}
                </div>
            )}


            {/* THỐNG KÊ */}

            <div className="employee-summary">

                <div className="summary-card">
                    <span>Tổng số nhân viên</span>
                    <h3>{employees.length}</h3>
                </div>

                <div className="summary-card">
                    <span>Đang làm việc</span>
                    <h3>
                        {
                            employees.filter(
                                (employee) => employee.active
                            ).length
                        }
                    </h3>
                </div>

                <div className="summary-card">
                    <span>Số lượng phòng ban</span>
                    <h3>{departments.length}</h3>
                </div>

            </div>


            {/* TÌM KIẾM VÀ LỌC */}

            <div className="employee-filter">

                <div className="search-box">

                    <label>Tìm kiếm nhân viên</label>

                    <input
                        type="text"
                        placeholder="Nhập tên, email hoặc số điện thoại..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />

                </div>

                <div className="department-filter">

                    <label>Lọc theo phòng ban</label>

                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                    >

                        <option value="">Tất cả phòng ban</option>

                        {departments.map((department) => (

                            <option
                                key={department.id}
                                value={department.id}
                            >
                                {department.departmentName}
                            </option>

                        ))}

                    </select>

                </div>

            </div>


            {/* BẢNG NHÂN VIÊN */}

            <div className="employee-table-card">

                <div className="table-heading">

                    <h3>Danh sách nhân viên</h3>

                    <span>
                        Tìm thấy {filteredEmployees.length} nhân viên.
                    </span>

                </div>

                {loading && (
                    <div className="employee-loading">
                        Đang tải dữ liệu nhân viên...
                    </div>
                )}

                {error && (
                    <div className="employee-error">
                        {error}
                    </div>
                )}

                {!loading && !error && (

                    <>

                        <div className="table-wrapper">

                            <table className="employee-table">

                                <thead>

                                    <tr>
                                        <th>Mã nhân viên</th>
                                        <th>Họ và tên</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th>Chức vụ</th>
                                        <th>Phòng ban</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {currentEmployees.length === 0 ? (

                                        <tr>
                                            <td colSpan="8" className="empty-data">
                                                Không tìm thấy nhân viên nào.
                                            </td>
                                        </tr>

                                    ) : (

                                        currentEmployees.map((employee) => (

                                            <tr key={employee.id}>

                                                <td>#{employee.id}</td>

                                                <td className="employee-name">
                                                    {employee.fullName}
                                                </td>

                                                <td>{employee.email}</td>

                                                <td>
                                                    {employee.phone || 'Chưa cập nhật'}
                                                </td>

                                                <td>
                                                    {employee.position || 'Chưa cập nhật'}
                                                </td>

                                                <td>
                                                    {
                                                        employee.department?.departmentName ||
                                                        'Chưa phân phòng ban'
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            employee.active
                                                                ? 'status-active'
                                                                : 'status-inactive'
                                                        }
                                                    >
                                                        {
                                                            employee.active
                                                                ? 'Đang làm việc'
                                                                : 'Đã nghỉ việc'
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        className="edit-employee-button"
                                                        onClick={() => handleOpenEdit(employee)}
                                                    >
                                                        Sửa
                                                    </button>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* PHÂN TRANG */}

                        <div className="employee-pagination">

                            <div className="page-size">

                                <label>Số nhân viên mỗi trang:</label>

                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>

                            </div>

                            <div className="pagination-controls">

                                <button
                                    onClick={() => setCurrentPage(0)}
                                    disabled={currentPage === 0}
                                >
                                    Đầu
                                </button>

                                <button
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                    disabled={currentPage === 0}
                                >
                                    Trước
                                </button>

                                <span>
                                    Trang {totalPages === 0 ? 0 : currentPage + 1}
                                    {' / '}
                                    {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    Tiếp
                                </button>

                                <button
                                    onClick={() => setCurrentPage(totalPages - 1)}
                                    disabled={
                                        totalPages === 0 ||
                                        currentPage >= totalPages - 1
                                    }
                                >
                                    Cuối
                                </button>

                            </div>

                        </div>

                    </>

                )}

            </div>


            {/* CỬA SỔ THÊM VÀ SỬA NHÂN VIÊN */}

            {showModal && (

                <div
                    className="employee-modal-overlay"
                    onClick={handleCloseModal}
                >

                    <div
                        className="employee-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="employee-modal-header">

                            <div>

                                <h3>
                                    {editingEmployee
                                        ? 'Cập nhật thông tin nhân viên'
                                        : 'Thêm nhân viên mới'}
                                </h3>

                                <p>
                                    Vui lòng nhập đầy đủ thông tin bên dưới.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="modal-close-button"
                                onClick={handleCloseModal}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            <div className="employee-modal-body">

                                <div className="modal-form-group">

                                    <label>
                                        Họ và tên <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Nhập họ và tên..."
                                        value={formData.fullName}
                                        onChange={handleFormChange}
                                        required
                                    />

                                </div>


                                <div className="modal-form-group">

                                    <label>
                                        Email <span>*</span>
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Nhập địa chỉ email..."
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        required
                                    />

                                </div>


                                <div className="modal-form-group">

                                    <label>Số điện thoại</label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Nhập số điện thoại..."
                                        value={formData.phone}
                                        onChange={handleFormChange}
                                    />

                                </div>


                                <div className="modal-form-group">

                                    <label>
                                        Chức vụ <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="position"
                                        placeholder="Nhập chức vụ..."
                                        value={formData.position}
                                        onChange={handleFormChange}
                                        required
                                    />

                                </div>


                                <div className="modal-form-group">

                                    <label>
                                        Phòng ban <span>*</span>
                                    </label>

                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleFormChange}
                                        required
                                    >

                                        <option value="">
                                            Chọn phòng ban
                                        </option>

                                        {departments.map((department) => (

                                            <option
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.departmentName}
                                            </option>

                                        ))}

                                    </select>

                                </div>


                                {formError && (
                                    <div className="modal-form-error">
                                        {formError}
                                    </div>
                                )}

                            </div>


                            <div className="employee-modal-footer">

                                <button
                                    type="button"
                                    className="modal-cancel-button"
                                    onClick={handleCloseModal}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="modal-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? 'Đang lưu...'
                                        : editingEmployee
                                            ? 'Lưu thay đổi'
                                            : 'Lưu nhân viên'}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    )
}

export default EmployeeManagement
