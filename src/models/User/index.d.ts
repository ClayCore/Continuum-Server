import { UnifiedModel } from '../UnifiedModel';
import Preferences from '../Preferences';

export default interface User extends UnifiedModel {
    email: string;
    password?: string;
    name: string;
    avatarUrl: string;
    address?: string;
    website?: string;
    preferences: Preferences;
}
