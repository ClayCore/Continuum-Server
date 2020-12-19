import mongoose, { Model, Schema } from 'mongoose';
import NotificationDocument from './NotificationDocument';

export const notificationSchema: Schema = new mongoose.Schema(
    {
        owner: String,
        acknowledged: Boolean,
        subject: String,
        event: String,
        objectType: String,
        object: String,
        link: String,
        objectText: String,
    },
    { timestamps: true }
);

const NotificationCollection: Model<NotificationDocument> = mongoose.model('Notification', notificationSchema);

export default NotificationCollection;
