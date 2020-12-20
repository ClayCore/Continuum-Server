import FabAction from './FabAction';
import Translation from './Translation';

export default interface AppState {
    translations: Translation;
    fabActions: FabAction[];
}
