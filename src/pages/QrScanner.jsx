
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../services/api'
import './QrScanner.css'

function QrScanner({ credentials }) {

    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [restartCount, setRestartCount] = useState(0)

    const scannerRef = useRef(null)
    const scannedRef = useRef(false)

    useEffect(() => {

        if (!credentials) {
            setError('Không tìm thấy thông tin đăng nhập!')
            return
        }

        let isMounted = true

        const scanner = new Html5Qrcode('qr-reader')

        scannerRef.current = scanner
        scannedRef.current = false

        // Xử lý khi quét thành công
        const handleScanSuccess = async (decodedText) => {

            // Tránh gửi nhiều yêu cầu khi camera quét liên tục
            if (scannedRef.current) return

            scannedRef.current = true

            setLoading(true)
            setError('')
            setResult(null)

            console.log('QR: Đã quét được mã')
            console.log('QR: Bắt đầu dừng camera')

            // Dừng camera, tối đa chờ 2 giây
            try {

                if (scanner.isScanning) {

                    await Promise.race([
                        scanner.stop(),
                        new Promise(resolve => setTimeout(resolve, 2000))
                    ])

                }

            } catch (stopError) {

                console.warn('QR: Lỗi dừng camera:', stopError)

            }

            if (!isMounted) return

            console.log('QR: Bắt đầu gửi yêu cầu lên Backend')

            try {

                const response = await api.post(
                    '/api/qr-attendance/scan',
                    {
                        token: decodedText
                    },
                    {
                        auth: {
                            username: credentials.username,
                            password: credentials.password
                        },
                        timeout: 15000
                    }
                )

                if (!isMounted) return

                console.log('QR: Chấm công thành công:', response.data)

                setResult(response.data)

            } catch (err) {

                console.error('QR: Lỗi chấm công:', err)

                if (!isMounted) return

                const data = err.response?.data

                let errorMessage = ''

                if (typeof data === 'string') {

                    errorMessage = data

                } else if (data) {

                    errorMessage =
                        data.message ||
                        data.error ||
                        data.detail ||
                        ''

                }

                if (!errorMessage) {

                    if (err.code === 'ECONNABORTED') {

                        errorMessage =
                            'Backend phản hồi quá lâu. Anh/chị vui lòng thử lại.'

                    } else if (!err.response) {

                        errorMessage =
                            'Không thể kết nối Backend. Vui lòng kiểm tra máy chủ và mạng Wi-Fi.'

                    } else {

                        errorMessage =
                            `Chấm công thất bại (HTTP ${err.response.status}). Vui lòng thử lại.`

                    }

                }

                setError(errorMessage)

            } finally {

                if (isMounted) {
                    setLoading(false)
                }

            }

        }

        // Khởi động camera
        const startScanner = async () => {

            try {

                await scanner.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: {
                            width: 250,
                            height: 250
                        },
                        aspectRatio: 1
                    },
                    handleScanSuccess,
                    () => {}
                )

                console.log('QR: Camera đã khởi động')

            } catch (err) {

                console.error('QR: Lỗi mở camera:', err)

                if (isMounted) {

                    setError(
                        'Không thể mở camera. Anh/chị hãy cấp quyền sử dụng camera cho trình duyệt.'
                    )

                }

            }

        }

        startScanner()

        // Dọn dẹp camera khi rời trang
        return () => {

            isMounted = false

            if (scanner.isScanning) {

                scanner.stop()
                    .then(() => scanner.clear())
                    .catch(err => {
                        console.error('QR: Lỗi đóng camera:', err)
                    })

            } else {

                try {

                    scanner.clear()

                } catch (err) {

                    console.error('QR: Lỗi đóng camera:', err)

                }

            }

        }

    }, [credentials, restartCount])

    // Quét lại mã QR
    const handleScanAgain = () => {

        setResult(null)
        setError('')
        setLoading(false)

        scannedRef.current = false

        setRestartCount(previous => previous + 1)

    }

    return (

        <div className="qr-scanner-page">

            <div className="qr-scanner-card">

                <div className="qr-scanner-icon">
                    📷
                </div>

                <h3>Quét mã QR chấm công</h3>

                <p className="qr-scanner-description">
                    Hướng camera điện thoại vào mã QR đang hiển thị
                    trên màn hình Admin.
                </p>

                {!result && !loading && !error && (

                    <div className="qr-reader-wrapper">
                        <div id="qr-reader"></div>
                    </div>

                )}

                {loading && (

                    <div className="qr-scanner-message">
                        Đang xác nhận thông tin chấm công...
                    </div>

                )}

                {result && (

                    <div className="qr-scan-success">

                        <div className="qr-success-icon">
                            ✓
                        </div>

                        <h3>{result.message}</h3>

                        <p>
                            Nhân viên: <strong>{result.employeeName}</strong>
                        </p>

                        <p>
                            Loại chấm công:
                            <strong>
                                {result.attendanceType === 'CHECK_IN'
                                    ? ' Chấm công vào'
                                    : ' Chấm công ra'}
                            </strong>
                        </p>

                        <span className="qr-success-status">
                            Chấm công thành công
                        </span>

                    </div>

                )}

                {error && (

                    <div className="qr-scan-error">
                        {error}
                    </div>

                )}

                {(result || error) && (

                    <button
                        className="qr-scan-again-button"
                        onClick={handleScanAgain}
                    >
                        Quét mã QR lại
                    </button>

                )}

                <p className="qr-scanner-note">
                    Mỗi nhân viên sử dụng tài khoản cá nhân để chấm công.
                </p>

            </div>

        </div>

    )

}

export default QrScanner
