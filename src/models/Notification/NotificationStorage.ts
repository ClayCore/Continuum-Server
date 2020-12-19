import NotificationDocument from './NotificationDocument';
import NotificationCollection from './NotificationCollection';

export const findByOwner = (ownerId: string, unacknowledgedOnly: boolean): Promise<NotificationDocument[]> => {
    const condition: any = { owner: ownerId };
    if (unacknowledgedOnly) {
        condition.acknowledged = false;
    }

    return NotificationCollection.find(condition).sort({ createdAt: 'desc' }).exec();
};
