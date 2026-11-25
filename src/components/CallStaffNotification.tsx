'use client';
import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/components/app-provider';
import { toast } from 'react-toastify';
import { Bell, User, MapPin, Clock } from 'lucide-react';
import { T } from '@/components/t';

interface CallStaffData {
  guestId: number;
  guestName: string;
  tableNode: {
    id: number;
    name: string;
  };
  timestamp?: string;
}

// Global singleton để đảm bảo chỉ có một listener duy nhất
let globalCallStaffListener: ((data: CallStaffData) => void) | null = null;
let globalSocket: any = null;
let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

export default function CallStaffNotification() {
  const socket = useAppStore((state) => state.socket);
  const [mounted, setMounted] = useState(false);

  // Tạo audio object cho âm thanh chuông
  const playBellSound = () => {
    try {
      console.log('🔔 Attempting to play bell sound...');

      // Dừng audio hiện tại nếu đang phát
      if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Nếu đang phát thì không phát lại
      if (isPlaying) {
        console.log('🔔 Audio already playing, skipping...');
        return;
      }

      // Reset flag nếu audio đã kết thúc
      if (currentAudio && currentAudio.ended) {
        isPlaying = false;
        currentAudio = null;
      }

      isPlaying = true;

      // Tạo audio element mới
      console.log('🔔 Creating new audio...');
      currentAudio = new Audio('/callStaff.mp3');
      currentAudio.volume = 0.8; // Tăng volume
      currentAudio.preload = 'auto';

      // Event listeners
      currentAudio.addEventListener('canplaythrough', () => {
        console.log('🔔 Audio can play through');
        currentAudio?.play().catch((error) => {
          console.warn('🔔 Could not play bell sound:', error);
          isPlaying = false;
          currentAudio = null;
        });
      });

      currentAudio.addEventListener('ended', () => {
        console.log('🔔 Audio ended');
        isPlaying = false;
        currentAudio = null;
      });

      currentAudio.addEventListener('error', (e) => {
        console.error('🔔 Audio error:', e);
        isPlaying = false;
        currentAudio = null;
      });

      // Load audio
      currentAudio.load();
    } catch (error) {
      console.log('🔔 Lỗi tạo audio:', error);
      isPlaying = false;
      currentAudio = null;
    }
  };

  useEffect(() => {
    setMounted(true);

    // Cleanup khi component unmount
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      isPlaying = false;
    };
  }, []);

  useEffect(() => {
    if (!socket || !mounted) {
      console.log('🔌 Call Staff socket not available');
      return;
    }

    // Nếu đã có listener global và cùng socket, không làm gì
    if (globalCallStaffListener && globalSocket === socket) {
      console.log('🔌 Call Staff listener already exists globally');
      return;
    }

    console.log('🔌 Call Staff socket status:', {
      connected: socket.connected,
      id: socket.id,
      transport: socket.io?.engine?.transport?.name,
    });

    function onConnect() {
      console.log(
        '🎧 Manager socket connected, setting up call-staff listener...',
      );

      function onCallStaff(data: CallStaffData) {
        console.log('🔔 Manager received call-staff event:', data);
        console.log('🔔 Current audio state:', { currentAudio, isPlaying });

        // Phát âm thanh chuông
        playBellSound();

        // Hiển thị toast thông báo với thông tin chi tiết
        toast.warning(
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                <T>Khách hàng gọi nhân viên</T>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>{data.guestName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>{data.tableNode.name}</span>
                </div>
                {data.timestamp && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(data.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>,
          {
            hideProgressBar: true,
            autoClose: 3000,
            icon: false,
            theme: 'light',
          },
        );
      }

      // Chỉ đăng ký listener nếu chưa có
      if (!globalCallStaffListener) {
        socket?.on('call-staff', onCallStaff);
        globalCallStaffListener = onCallStaff;
        globalSocket = socket;
        console.log('✅ Manager call-staff listener registered globally');
      }

      // Cleanup function
      return () => {
        if (globalCallStaffListener === onCallStaff) {
          socket?.off('call-staff', onCallStaff);
          globalCallStaffListener = null;
          globalSocket = null;
          console.log('🗑️ Manager call-staff listener removed globally');
        }
      };
    }

    function onDisconnect() {
      console.log('🔌 Manager socket disconnected');
      globalCallStaffListener = null;
      globalSocket = null;
    }

    // Nếu socket đã kết nối, setup listener ngay
    if (socket.connected) {
      console.log(
        '🔌 Socket already connected, setting up listener immediately',
      );
      const cleanup = onConnect();
      return cleanup;
    }

    // Nếu chưa kết nối, đợi sự kiện connect
    console.log('🔌 Socket not connected, waiting for connect event');
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket, mounted]);

  return null; // Component này chỉ lắng nghe socket, không render gì
}
