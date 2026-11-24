/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import RefreshToken from '@/components/refresh-token';
import MessageSocketHandler from '@/components/message-socket-handler';
import ReminderSocketHandler from '@/components/reminder-socket-handler';
import { create } from 'zustand';
import {
  generateSocketIo,
  getAccessTokenFormLocalStorage,
  removeTokensFormLocalStorage,
} from '@/lib/utils';
import type { Socket } from 'socket.io-client';
import { RoleType } from '@/types/jwt.types';
import { set } from 'zod';
import { decode } from '@/lib/jwt';
import ListenLogoutSocket from '@/components/listen-logout-socket';
import NewOrderSound from '@/components/newOrderSound';

const ReactQueryDevtoolsLazy = dynamic(
  () => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
  { ssr: false },
);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Không tự động refetch khi người dùng quay lại tab (giảm gọi API không cần thiết)
      refetchOnWindowFocus: false,
      // Không refetch lại mỗi khi component mount (nếu đã có cache)
    },
  },
});

// const AppContext = createContext({
//   isAuth: false,
//   role: undefined as RoleType | undefined,
//   setRole: (role?: RoleType | undefined) => {},
//   socket: undefined as Socket | undefined,
//   setSocket: (socket?: Socket | undefined) => {},
//   disconnectSocket: () => {},
// });
type AppStoreType = {
  isAuth: boolean;
  role: RoleType | undefined;
  setRole: (role?: RoleType | undefined) => void;
  socket: Socket | undefined;
  setSocket: (socket?: Socket | undefined) => void;
  disconnectSocket: () => void;
};
export const useAppStore = create<AppStoreType>((set) => ({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {
    set({ role, isAuth: Boolean(role) });
    if (!role) {
      removeTokensFormLocalStorage();
    }
  },
  socket: undefined as Socket | undefined,
  setSocket: (socket?: Socket | undefined) => set({ socket }),
  disconnectSocket: () =>
    set((state) => {
      state.socket?.disconnect();
      return { socket: undefined };
    }),
}));

// export const useAppContext = () => {
//   return useContext(AppContext);
// };

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setRole = useAppStore((state) => state.setRole);
  const setSocket = useAppStore((state) => state.setSocket);
  //gọi sau khi component render lần đầu tiên. Mảng rỗng [] nghĩa là chỉ chạy một lần duy nhất khi component mount.
  //Nếu accessToken tồn tại (nghĩa là người dùng đã đăng nhập trước đó), thì gọi setIsAuthState(true) để cập nhật trạng thái đăng nhập của người dùng là true (đã xác thực).

  const count = useRef(0);
  useEffect(() => {
    //Neu ma co access token thi sao ?
    if (count.current === 0) {
      const accessToken = getAccessTokenFormLocalStorage();
      console.log(
        '🔐 Access token from localStorage:',
        accessToken ? 'Present' : 'Missing',
      );
      console.log('🔐 Access token value:', accessToken);

      if (accessToken && accessToken !== undefined && accessToken !== '') {
        const payload = decode(accessToken);
        console.log('🔐 Decoded payload:', payload);

        if (payload && payload.roleName) {
          console.log(
            '🔐 Setting role and initializing socket...',
            payload.roleName,
          );
          setRole(payload.roleName);
          const newSocket = generateSocketIo(accessToken);
          console.log('🔌 Generated socket:', newSocket);
          setSocket(newSocket);

          // Connect socket một lần duy nhất
          if (!newSocket.connected) {
            console.log('🔌 Connecting socket...');
            newSocket.connect();
          }
        } else {
          console.warn('AccessToken không hợp lệ hoặc thiếu roleName', payload);
          //(X)
          removeTokensFormLocalStorage();
        }
      } else {
        console.log('🔐 No access token found');
      }

      count.current++;
    }
  }, [setRole, setSocket]);

  // const disconnectSocket = useCallback(() => {
  //   socket?.disconnect();
  //   setSocket(undefined);
  // }, [socket, setSocket]);

  //useCallback là một React Hook dùng để ghi nhớ (memoize) một hàm, giúp tránh việc hàm bị tạo lại mỗi lần component re-render.
  //Nói cách khác: nếu bạn không dùng useCallback, thì mỗi lần component render lại, một phiên bản setIsAuth mới sẽ được tạo ra.

  //Tạo sao không dùng setIsAuthState để set Trạng thái lại
  //=> Vì cần custom để xóa cặp tokens đó hiểu hommm
  // const setRole = useCallback((role?: RoleType | undefined) => {
  //   if (role) {
  //     setRoleState(role);
  //   } else {
  //     removeTokensFormLocalStorage();
  //   }
  // }, []);

  // const isAuth = Boolean(role);
  return (
    // <AppContext.Provider
    //   value={{ role, isAuth, setRole, setSocket, socket, disconnectSocket }}
    // >
    <QueryClientProvider client={queryClient}>
      {children}
      <RefreshToken />
      <ListenLogoutSocket />
      <NewOrderSound />
      <MessageSocketHandler />
      <ReminderSocketHandler />
      {/* Devtools chỉ tải ở môi trường dev và tách chunk riêng */}
      {process.env.NODE_ENV === 'development' ? <ReactQueryDevtoolsLazy /> : null}
    </QueryClientProvider>
    // </AppContext.Provider>
  );
}
