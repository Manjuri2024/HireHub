import { Notification } from "../models";
import { emitToUser } from "../socket";

export async function notify(userId: unknown, title: string, body = "") {
  const n = await Notification.create({ user: userId, title, body });
  emitToUser(String(userId), "notification", n);
  return n;
}
