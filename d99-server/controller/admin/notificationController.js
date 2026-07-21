import Notification from '../../model/Notification.js';

const notificationController = {
    getOwnerNotifications: async (req, res) => {
        try {
            const notifications = await Notification.find();
            res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    createNotification: async (req, res) => {
        try {
            const newNotification = new Notification(req.body);
            await newNotification.save();
            res.status(201).json(newNotification);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default notificationController;