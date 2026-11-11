
import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import api from '../services/api'
import './QrAttendance.css'

function QrAttendance({ credentials }) {

    const [token, setToken] = useState('')
    const [countdown, setCountdown] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Tạo mã QR mới từ Backend
    const createQr = useCallback(async () => {

        if (!credentials) {
            setError('Không tìm thấy thông tin đăng nhập Admin!')
            return
        }

        setLoading(true)
        setError('')

        try {

            const response = await api.post(
                '/api/qr-attendance/create',
                {},
                {
                    auth: {
                        username: credentials.username,
                        password: credentials.password
                    }
                }
            )

            setToken(response.data.token)

            const expirationTime = new Date(
                response.data.expiresAt
            ).getTime()

            const remainingSeconds = Math.max(
                0,
                Math.ceil((expirationTime - Date.now()) / 1000)
            )

            setCountdown(remainingSeconds)

        } catch (err) {

            console.error('Lỗi tạo mã QR:', err)

            setToken('')
            setError(
                err.response?.data?.message ||
                'Không thể tạo mã QR. Vui lòng kiểm tra Backend!'
            )

        } finally {

            setLoading(false)

        }

    }, [credentials])

    // Tự động tạo mã mới sau mỗi 30 giây
    useEffect(() => {

        if (!credentials) return

        let refreshTimer
        let countdownTimer

        const startQr = async () => {

            await createQr()

            refreshTimer = setTimeout(() => {
                startQr()
            }, 30000)

        }

        startQr()

        countdownTimer = setInterval(() => {

            setCountdown(previous => Math.max(0, previous - 1))

        }, 1000)

        return () => {

            clearTimeout(refreshTimer)
            clearInterval(countdownTimer)

        }

    }, [createQr, credentials])

    return (

        <div className="qr-attendance-page">

            <div className="qr-page-header">

                <div>
                    <h2>Chấm công bằng QR Code</h2>

                    <p>
                        Hiển thị mã QR để nhân viên sử dụng điện thoại
                        quét chấm công tại công ty.
                    </p>
                </div>

                <span className="qr-status">
                    ● Hệ thống QR
                </span>

            </div>

            <div className="qr-main-card">

                <h3>Mã QR chấm công hôm nay</h3>

                <p className="qr-instruction">
                    Nhân viên sử dụng điện thoại để quét mã bên dưới.
                </p>

                <div className="qr-image-container">

                    {loading && !token ? (

                        <p>Đang tạo mã QR...</p>

                    ) : token ? (

                        <QRCodeSVG
                            value={token}
                            size={260}
                            level="H"
                            includeMargin={true}
                        />

                    ) : (

                        <p>Chưa có mã QR</p>

                    )}

                </div>

                {error && (
                    <p className="qr-error">
                        {error}
                    </p>
                )}

                <div className="qr-countdown">

                    <span>Thời gian còn hiệu lực</span>

                    <strong>
                        {countdown} giây
                    </strong>

                </div>

                <p className="qr-note">
                    Mã QR sẽ tự động thay đổi sau mỗi 30 giây.
                </p>

                <button
                    className="qr-refresh-button"
                    onClick={createQr}
                    disabled={loading}
                >
                    {loading ? 'Đang tạo...' : 'Tạo mã QR mới'}
                </button>

            </div>

            <div className="qr-guide-card">

                <h3>Hướng dẫn chấm công</h3>

                <ol>
                    <li>Nhân viên đăng nhập tài khoản trên điện thoại.</li>
                    <li>Mở chức năng quét mã QR.</li>
                    <li>Đưa camera điện thoại hướng vào mã QR trên màn hình.</li>
                    <li>Hệ thống tự động ghi nhận giờ vào hoặc giờ ra.</li>
                </ol>

            </div>

        </div>

    )
}

export default QrAttendance
