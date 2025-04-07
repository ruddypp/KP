import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function sendNotification({
  userId,
  title,
  message,
}: {
  userId: string;
  title: string;
  message: string;
}) {
  try {
    // Simpan notifikasi ke database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });

    // Kirim notifikasi real-time melalui Pusher
    await pusherServer.trigger(
      `user-${userId}`,
      "notification",
      notification
    );

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}

export async function sendNotificationToAdmin({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  try {
    // Cari semua admin
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    });

    // Kirim notifikasi ke semua admin
    const notifications = await Promise.all(
      admins.map((admin) =>
        sendNotification({
          userId: admin.id,
          title,
          message,
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error("Error sending notification to admin:", error);
    throw error;
  }
} 