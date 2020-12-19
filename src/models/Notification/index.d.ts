import { UnifiedModel } from '../UnifiedModel';
import InteractionType from '../InteractionType';
import PostType from '../PostType';

export default interface Notification extends UnifiedModel {
    owner: string;
    acknowledged: boolean;
    subject: string;
    event: InteractionType;
    objectType: PostType;
    object: string;
    link: string;
    objectText: string;
}
