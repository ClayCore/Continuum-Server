import { RouteComponentProps } from 'react-router';
import { WrappedComponentProps as IntlProps } from 'react-intl';
import ActionCreator from '../models/ActionCreator';
import AppState from '../models/AppState';

export interface ComponentProps extends IntlProps, RouteComponentProps<any> {
    state: AppState;
    actions: ActionCreator;
}
