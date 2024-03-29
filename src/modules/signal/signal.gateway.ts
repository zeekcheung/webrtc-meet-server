import { NotFoundException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ORIGIN } from 'src/common/constant';
import { decryptText } from 'src/utils/crypto';
import { getDatetime } from 'src/utils/date';
import { Meeting } from '../meeting/entities/meeting.entity';
import { MeetingService } from '../meeting/meeting.service';
import { UsersService } from '../user/user.service';
import { ClientSocket, SignalServer } from './types';

@WebSocketGateway({
  /**
   * 配置跨域
   */
  cors: {
    origin: ORIGIN,
    credentials: true,
  },
})
export class SignalGateway {
  /**
   * 信令服务器实例
   */
  @WebSocketServer()
  server: SignalServer;

  constructor(
    private readonly userService: UsersService,
    private readonly meetingService: MeetingService,
  ) {}

  /**
   * 获取房间名为 `roomName` 的房间
   *
   * 每个房间是 `Set<string>` 类型，保存的是房间内所有客户端的 `socket.id`
   * @param roomName 房间名
   */
  private getRoomByName(roomName: string): Set<string> {
    // 从主命名空间的内存适配器上获取所有房间
    const rooms = this.server.of('/').adapter.rooms;
    const room = rooms.get(roomName);
    if (room === undefined) {
      throw new NotFoundException(`room ${roomName} not fount.`);
    }
    return room;
  }

  /**
   * 获取 `roomName` 房间内的所有 `Socket` 实例
   * @param roomName 房间名
   * @returns `roomName` 房间内的所有 `Socket` 实例
   */
  private async getSocketsByRoomName(roomName: string) {
    return await this.server.in(roomName).fetchSockets();
  }

  /**
   * 为客户端对应的 `socket` 实例绑定上 `username`
   * @param client 与客户端连接的 `Socket` 实例
   */
  @SubscribeMessage('bind-username')
  handleBindUsername(
    @MessageBody() username: string,
    @ConnectedSocket() client: ClientSocket,
  ): string {
    // 绑定username
    client.data.username = username;
    return client.data.username;
  }

  /**
   * 处理客户端创建房间 `io.on('create-room', handleCreateRoom)`
   * @param roomName 客户端创建房间的房间名
   * @param client 与客户端连接的 `Socket` 实例
   * @returns 经过序列化的房间
   */
  @SubscribeMessage('create-room')
  async handleCreateRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: ClientSocket,
  ): Promise<string> {
    // 加入一个不存在的房间时，会自动创建新的房间
    client.join(roomName);
    // 返回新建的房间
    const sockets = await this.getSocketsByRoomName(roomName);
    const userList = sockets.map(() => ({
      sid: client.id,
      username: client.data.username,
    }));
    return JSON.stringify(userList);
  }

  /**
   * 处理客户端开始加入房间 `io.on('begin-join-room', handleBeginJoinRoom)`
   * @param roomName 客户端加入房间的房间名
   * @param client 与客户端连接的 `Socket` 实例
   * @returns 经过序列化的房间
   */
  @SubscribeMessage('begin-join-room')
  async handleBeginJoinRoom(
    @MessageBody()
    { roomName, password }: { roomName: Meeting['id']; password: string },
    @ConnectedSocket() client: ClientSocket,
  ) {
    // meeting.id 作为房间名
    const meetingId = roomName;

    // 判断数据库中是否存在会议（静态）
    const meeting = await this.meetingService.findOne(meetingId);
    if (meeting === null) {
      return JSON.stringify(
        new WsException(`Meeting ${meetingId} is not found.`),
      );
    }
    // 判断信令服务器当前是否存在房间（动态）
    const room = this.getRoomByName(roomName);
    if (room === undefined) {
      return JSON.stringify(new WsException(`Room ${roomName} is not found.`));
    }
    // 判断房间是否满人
    if (room.size >= meeting.size) {
      return JSON.stringify(new WsException(`The room is already full.`));
    }
    // 判断密码是否正确
    const decryptedPassword = decryptText(meeting.password);
    if (password !== decryptedPassword) {
      return JSON.stringify(new WsException(`Password is incorrect.`));
    }

    // 将用户加入房间
    client.join(roomName);

    const username = client.data.username;

    const userList = (await this.getSocketsByRoomName(roomName)).map(
      (socket) => ({ username: socket.data.username, sid: socket.id }),
    );

    const response = { username, userList };

    return JSON.stringify(response);
  }

  /**
   * 处理客户端完成加入房间 `io.on('complete-join-room', handleCompleteJoinRoom)`
   * @param roomName 客户端加入房间的房间名
   * @param client 与客户端连接的 `Socket` 实例
   * @returns 经过序列化的房间
   */
  @SubscribeMessage('complete-join-room')
  async handleCompleteJoinRoom(
    @MessageBody()
    roomName: Meeting['id'],
    @ConnectedSocket() client: ClientSocket,
  ) {
    // meeting.id 作为房间名
    const meetingId = roomName;
    const meeting = await this.meetingService.findOne(meetingId);

    const username = client.data.username;
    const user = await this.userService.findOne(username);
    const attendees = [...meeting.attendees, user];

    // 更新会议参与者数据
    await this.meetingService.update(meetingId, {
      attendees,
    });

    const userList = (await this.getSocketsByRoomName(roomName)).map(
      (socket) => ({ username: socket.data.username, sid: socket.id }),
    );
    const updatedMeeting = { ...meeting, attendees };
    const response = { username, userList, updatedMeeting };

    // 通知其他用户有用户加入房间
    client.to(roomName).emit('other-join', JSON.stringify(response));

    return JSON.stringify(response);
  }

  /**
   * 处理客户端离开房间 `io.on('leave', handleJoin)`
   * @param roomName 客户端离开房间的房间名
   * @param client 与客户端连接的 `Socket` 实例
   * @returns
   */
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @MessageBody() roomName: Meeting['id'],
    @ConnectedSocket() client: ClientSocket,
  ): Promise<string> {
    const username = client.data.username;
    const room = this.getRoomByName(roomName);

    // 离开房间
    client.leave(roomName);

    const response = { username, userList: [] };
    /**
     * 如果房间内还有其他用户，则通知其他用户该用户已经离开
     * 如果房间内已经没有其他用户了，Socket.IO 会自动删除该房间
     */
    if (room.size >= 1) {
      const sockets = await this.getSocketsByRoomName(roomName);
      response.userList = sockets.map((socket) => ({
        username: socket.data.username,
        sid: socket.id,
      }));

      client.to(roomName).emit('other-leave', JSON.stringify(response));
      return JSON.stringify(response);
    }
    return JSON.stringify(response);
  }

  /**
   * 处理客户端关闭房间 `io.on('send-message', handleMessage)`
   * @param message 客户端发送的消息
   * @param client 与客户端连接的 `Socket` 实例
   * @returns
   */
  @SubscribeMessage('close-room')
  async handleCloseRoom(@MessageBody() roomName: string): Promise<string> {
    const meetingId = roomName;
    const meetingEndTime = getDatetime();

    // 更新数据库中会议的结束时间
    const updatedMeeting = await this.meetingService.update(meetingId, {
      end_time: meetingEndTime,
    });

    // 通知房间内的所有客户端房间将要关闭
    this.server
      .to(roomName)
      .emit('room-closed', JSON.stringify(updatedMeeting));

    // 让房间内的所有客户端都离开房间
    const sockets = await this.getSocketsByRoomName(roomName);
    sockets.forEach((socket) => socket.leave(roomName));

    // 返回更新后的会议
    return JSON.stringify(updatedMeeting);
  }

  /**
   * 处理客户端广播消息 `io.on('broadcast-message', handleBroadcastMessage)`
   * @param message 客户端广播的消息
   * @param client 与客户端连接的 `Socket` 实例
   * @returns
   */
  @SubscribeMessage('broadcast-message')
  handleBroadcastMessage(
    @MessageBody() { roomName, message }: { roomName: string; message: string },
    @ConnectedSocket() client: ClientSocket,
  ) {
    const username = client.data.username;

    const response = { username, message };

    // 将消息广播给房间内其他用户
    this.server.to(roomName).emit('receive-message', JSON.stringify(response));

    return JSON.stringify(response);
  }

  /**
   * 处理客户端发送消息 `io.on('send-message', handleMessage)`
   * @param sid 接收消息用户的 `socket.id`
   * @param client 与客户端连接的 `Socket` 实例
   * @returns
   */
  @SubscribeMessage('send-message')
  handleSendMessage(
    @MessageBody() { sid, message }: { sid: string; message: string },
    @ConnectedSocket() client: ClientSocket,
  ) {
    const username = client.data.username;

    const response = { username, message, sid: client.id };

    // 将消息发送给 sid 对应的用户
    client.to(sid).emit('receive-message', JSON.stringify(response));

    return JSON.stringify(response);
  }
}
