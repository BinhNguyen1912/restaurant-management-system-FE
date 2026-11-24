'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/components/app-provider';
import { Role } from '@/app/constants/type';

/**
 * Component để xử lý socket events cho messaging
 * - Admin: Join manager room để nhận messages
 * - Guest: Listen for message confirmations
 */
export default function MessageSocketHandler() {
  const socket = useAppStore((state) => state.socket);
  const role = useAppStore((state) => state.role);

  useEffect(() => {
    if (!socket?.connected) {
      return;
    }


    // Admin joins manager room to receive messages
    if (role === Role.ADMIN || role === Role.STAFF) {
      socket.emit('join-manager-room');
    }

    // Listen for message sent confirmation
    function onMessageSent(data: any) {
    }

    // Listen for message errors
    function onMessageError(error: any) {
      console.error('❌ Message error:', error);
    }

    socket.on('message-sent', onMessageSent);
    socket.on('message-error', onMessageError);

    return () => {
      socket.off('message-sent', onMessageSent);
      socket.off('message-error', onMessageError);
    };
  }, [socket, role]);

  return null;
}
