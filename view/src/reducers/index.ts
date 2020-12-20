import { combineReducers } from 'redux';
import fabActions from './fabActions';
import translations from './translations';

const reducer = combineReducers({
    translations,
    fabActions,
});

export default reducer;
