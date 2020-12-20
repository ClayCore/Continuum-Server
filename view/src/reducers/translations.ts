import _ from 'lodash';
import { SET_LOCALE } from '../actions/common';
import EnUS from '../shared/translations/en-us';
import Translation from '../models/Translation';

const initialState: Translation = EnUS;

const translations = (state: Translation = initialState, action: any): Translation => {
    switch (action.type) {
        case SET_LOCALE:
            switch (_.toLower(action.locale)) {
                case 'en-us':
                default:
                    return EnUS;
            }
        default:
            return state;
    }
};

export default translations;
