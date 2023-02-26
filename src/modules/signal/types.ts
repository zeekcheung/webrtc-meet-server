import { Server, Socket } from 'socket.io';
import { Meeting } from '../meeting/entities/meeting.entity';

/**
 * 服务端发送给客户端的所有事件
 */
export interface ServerToClientEvents {
  // key：事件名；value：箭头函数，参数为触发事件时携带的参数
  ['other-join']: (res: string) => void;
  ['other-leave']: (res: string) => void;
  ['room-closed']: (res: string) => void;
  ['receive-message']: (res: string) => void;
}

/**
 * 客户端发送给服务端的所有事件
 */
export interface ClientToServerEvents {
  ['bind-username']: (
    username: string,
    acknowledge: (res: string) => void,
  ) => void;
  ['create-room']: (
    roomName: string,
    acknowledge: (res: string) => void,
  ) => void;
  ['begin-join-room']: (
    body: { roomName: Meeting['id']; password: string },
    acknowledge: (res: string) => void,
  ) => void;
  ['complete-join-room']: (
    body: { roomName: Meeting['id'] },
    acknowledge: (res: string) => void,
  ) => void;
  ['leave-room']: (
    roomName: string,
    acknowledge: (res: string) => void,
  ) => void;
  ['close-room']: (
    roomName: string,
    acknowledge: (res: string) => void,
  ) => void;
  ['broadcast-message']: (
    body: { roomName: string; message: unknown },
    acknowledge: (res: string) => void,
  ) => void;
  ['send-message']: (
    body: { sid: string; message: Message },
    acknowledge: (res: string) => void,
  ) => void;
}

type Message = { type: RTCSdpType | 'candidate' } & Record<PropertyKey, any>;

/**
 * Socket.IO 的内置事件
 */
export interface InterServerEvents {
  ping: () => void;
}

/**
 * socket.data 的类型
 */
export interface SocketData {
  /**
   * 客户端连接对应的用户名
   */
  username: string;
}

/**
 * 信令服务器
 */
export type SignalServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type ClientSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
