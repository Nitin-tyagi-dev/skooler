import User from "../models/User.js";
import Message from "../models/Message.js";

// Fetch contacts allowed for messaging based on roles and count their unread messages
export const getContacts = async (req, res) => {
  try {
    const { role, id: userId, schoolId } = req.user;

    let targetRole;
    if (role === "teacher") {
      targetRole = "school_admin";
    } else if (role === "school_admin") {
      targetRole = "teacher";
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const contacts = await User.find({
      schoolId,
      role: targetRole,
      active: true,
      _id: { $ne: userId }
    }).select("-password");

    const contactsWithUnread = await Promise.all(
      contacts.map(async (contact) => {
        const unreadCount = await Message.countDocuments({
          schoolId,
          sender: contact._id,
          receiver: userId,
          read: false,
        });

        const lastMessage = await Message.findOne({
          schoolId,
          $or: [
            { sender: userId, receiver: contact._id },
            { sender: contact._id, receiver: userId },
          ],
        }).sort({ createdAt: -1 });

        return {
          ...contact.toObject(),
          unreadCount,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
          } : null,
        };
      })
    );

    // Sort contacts by last message time (most recent first)
    contactsWithUnread.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    res.json(contactsWithUnread);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch chat logs with a contact and mark them as read
export const getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { id: userId, schoolId } = req.user;

    const messages = await Message.find({
      schoolId,
      $or: [
        { sender: userId, receiver: contactId },
        { sender: contactId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages from contact to current user as read
    await Message.updateMany(
      {
        schoolId,
        sender: contactId,
        receiver: userId,
        read: false,
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Send a message and emit real-time updates over websockets
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const { id: userId, schoolId } = req.user;

    const receiverUser = await User.findById(receiverId);
    if (!receiverUser || receiverUser.schoolId.toString() !== schoolId.toString()) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    const senderRole = req.user.role;
    const receiverRole = receiverUser.role;
    if (
      (senderRole === "teacher" && receiverRole !== "school_admin") ||
      (senderRole === "school_admin" && receiverRole !== "teacher")
    ) {
      return res.status(400).json({ message: "Messages are only allowed between teachers and administrators." });
    }

    const message = await Message.create({
      schoolId,
      sender: userId,
      receiver: receiverId,
      content,
    });

    const io = req.app.get("socketio");
    if (io) {
      io.to(receiverId.toString()).emit("new_message", message);
      io.to(userId.toString()).emit("new_message", message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Mark incoming messages from a contact as read
export const markRead = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { id: userId, schoolId } = req.user;

    await Message.updateMany(
      {
        schoolId,
        sender: contactId,
        receiver: userId,
        read: false,
      },
      { read: true }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
