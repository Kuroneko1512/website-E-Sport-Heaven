import { useEffect, useState, useRef } from 'react';
import Echo from 'laravel-echo';
import io from 'socket.io-client';

// Định nghĩa kiểu dữ liệu cho trạng thái kết nối
interface ConnectionState {
    connected: boolean;
    error: string | null;
    socketId: string | null;
    isSubscribed: boolean;
}

// Định nghĩa kiểu dữ liệu cho window với Echo instance
declare global {
    interface Window {
        io: typeof io;
        echoInstance: any; // Sử dụng any để tránh lỗi namespace
    }
}

/**
 * Custom hook để quản lý kết nối Laravel Echo và đăng ký kênh
 * @param {string} channelName - Tên kênh cần đăng ký (ví dụ: 'orders.1')
 * @param {string} eventName - Tên sự kiện cần lắng nghe (ví dụ: '.order-status-updated')
 * @param {function} callback - Hàm callback khi nhận được sự kiện
 * @returns {object} - Trạng thái kết nối và các phương thức
 */
const useEchoChannel = (
    channelName: string,
    eventName: string,
    callback: (event: any) => void
) => {
    // Trạng thái kết nối
    const [connectionState, setConnectionState] = useState<ConnectionState>({
        connected: false,
        error: null,
        socketId: null,
        isSubscribed: false
    });

    // Sử dụng useRef để lưu trữ instance Echo và tránh tạo mới mỗi lần render
    const echoRef = useRef<any>(null);
    const channelRef = useRef<any>(null);
    const callbackRef = useRef(callback);
    
    // Cập nhật callbackRef khi callback thay đổi
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Khởi tạo Echo instance nếu chưa có - CHỈ CHẠY MỘT LẦN
    useEffect(() => {
        // Chỉ khởi tạo Echo một lần
        if (!window.echoInstance) {
            window.io = io;

            // Khởi tạo Echo instance
            window.echoInstance = new Echo({
                broadcaster: 'socket.io',
                host: '127.0.0.1:6001',
                transports: ['polling', 'websocket'],
                forceTLS: false,
                // Cấu hình Socket.io
                options: {
                    pingTimeout: 60000,
                    pingInterval: 25000,
                    reconnection: true,
                    reconnectionAttempts: Infinity,
                    reconnectionDelay: 1000
                }
            });

            console.log('✅ Đã khởi tạo Echo instance mới');
        }

        // Lưu Echo instance vào ref
        echoRef.current = window.echoInstance;

        // Xử lý các sự kiện kết nối
        const socket = echoRef.current.connector.socket;

        const onConnect = () => {
            setConnectionState(prev => ({
                ...prev,
                connected: true,
                error: null,
                socketId: socket.id
            }));
            console.log('✅ Kết nối thành công đến Echo Server', socket.id);
        };

        const onConnectError = (error: any) => {
            setConnectionState(prev => ({
                ...prev,
                connected: false,
                error: error.message,
                socketId: null
            }));
            console.error('❌ Lỗi kết nối:', error.message);
        };

        const onDisconnect = (reason: string) => {
            setConnectionState(prev => ({
                ...prev,
                connected: false,
                error: reason,
                socketId: null
            }));
            console.log('❌ Đã ngắt kết nối từ Echo Server:', reason);
        };

        const onReconnect = (attemptNumber: number) => {
            console.log(`✅ Đã kết nối lại sau ${attemptNumber} lần thử`);
        };

        // Đăng ký các sự kiện kết nối
        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('disconnect', onDisconnect);
        socket.on('reconnect', onReconnect);

        // Nếu đã kết nối, cập nhật trạng thái
        if (socket.connected) {
            setConnectionState(prev => ({
                ...prev,
                connected: true,
                error: null,
                socketId: socket.id
            }));
        }

        // Cleanup khi unmount
        return () => {
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('disconnect', onDisconnect);
            socket.off('reconnect', onReconnect);
        };
    }, []); // Empty dependency array ensures this runs only once

    // Đăng ký kênh và sự kiện - CHỈ CHẠY KHI CHANNEL NAME HOẶC EVENT NAME THAY ĐỔI
    useEffect(() => {
        // Nếu không có Echo instance, channelName hoặc eventName, không làm gì cả
        if (!echoRef.current || !channelName || !eventName) {
            return;
        }

        // Nếu đã đăng ký kênh này rồi, không làm gì cả
        if (channelRef.current && channelRef.current.name === channelName) {
            console.log(`✅ Đã đăng ký kênh ${channelName} rồi, không cần đăng ký lại`);
            return;
        }

        // Hủy đăng ký kênh cũ nếu có
        if (channelRef.current) {
            console.log(`🔄 Hủy đăng ký kênh cũ: ${channelRef.current.name}`);
            echoRef.current.leave(channelRef.current.name);
            channelRef.current = null;
            setConnectionState(prev => ({ ...prev, isSubscribed: false }));
        }

        console.log(`🔄 Đang đăng ký kênh: ${channelName}, sự kiện: ${eventName}`);

        // Đăng ký kênh mới
        const channel = echoRef.current.channel(channelName);
        channelRef.current = { name: channelName, channel };

        // Xử lý sự kiện đăng ký thành công
        channel.subscribed(() => {
            console.log(`✅ Đã đăng ký kênh: ${channelName}`);
            setConnectionState(prev => ({ ...prev, isSubscribed: true }));
        });

        // Xử lý lỗi đăng ký
        channel.error((error: any) => {
            console.error(`❌ Lỗi khi đăng ký kênh ${channelName}:`, error);
            setConnectionState(prev => ({
                ...prev,
                isSubscribed: false,
                error: `Lỗi khi đăng ký kênh: ${error}`
            }));
        });

        // Lắng nghe sự kiện
        const eventHandler = (event: any) => {
            console.log(`✅ Nhận được sự kiện ${eventName} từ kênh ${channelName}:`, event);
            // Sử dụng callbackRef.current để đảm bảo luôn gọi phiên bản mới nhất của callback
            if (callbackRef.current && typeof callbackRef.current === 'function') {
                callbackRef.current(event);
            }
        };

        channel.listen(eventName, eventHandler);

        // Cleanup khi unmount hoặc khi channelName/eventName thay đổi
        return () => {
            // Không hủy đăng ký kênh ở đây để tránh vấn đề liên tục đăng ký/hủy đăng ký
            // Chúng ta sẽ chỉ hủy đăng ký khi thực sự cần thiết (khi channelName thay đổi)
        };
    }, [channelName, eventName]); // Chỉ phụ thuộc vào channelName và eventName

    // Phương thức để thay đổi kênh
    const changeChannel = (newChannelName: string) => {
        if (newChannelName === channelRef.current?.name) {
            return; // Không làm gì nếu kênh không thay đổi
        }

        // Hủy đăng ký kênh cũ
        if (channelRef.current && echoRef.current) {
            console.log(`🔄 Thay đổi kênh từ ${channelRef.current.name} sang ${newChannelName}`);
            echoRef.current.leave(channelRef.current.name);
            channelRef.current = null;
            setConnectionState(prev => ({ ...prev, isSubscribed: false }));
        }
    };

    // Phương thức để ngắt kết nối
    const disconnect = () => {
        if (channelRef.current && echoRef.current) {
            echoRef.current.leave(channelRef.current.name);
            channelRef.current = null;
            setConnectionState(prev => ({ ...prev, isSubscribed: false }));
        }
    };

    // Trả về trạng thái kết nối và các phương thức
    return {
        ...connectionState,
        changeChannel,
        disconnect,
        echo: echoRef.current
    };
};

export default useEchoChannel;
