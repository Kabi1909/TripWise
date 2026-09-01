const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    let messages = await Message.find();
    if (messages.length === 0) {
      messages = await Message.insertMany([
        { senderName: 'Clark Kent', senderInitials: 'CK', message: 'Is the flight to Colombo confirmed? The portal still says pending.', time: '10:42 AM', unread: true },
        { senderName: 'Alice Smith', senderInitials: 'AS', message: "Thank you for the recommendations! We'll go with option B for Kandy.", time: 'Yesterday', unread: false },
        { senderName: 'John Doe', senderInitials: 'JD', message: 'Can we add an extra night in Mirissa beach resort?', time: 'Mon', unread: false }
      ]);
    }
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages }; 
