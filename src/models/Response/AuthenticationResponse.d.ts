import User from '../User';
import Notification from '../Notification';

export default interface AuthenticationResponse {
    user: User;
    accessToken?: string;
    notifications: Notification[];
    others: User[];
}
