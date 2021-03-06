import { toast, ToastContainerProps } from 'react-toastify';
import { Store, AnyAction } from 'redux';
import AppState from '../../models/AppState';

export default class ToastWrapper {
    private store: Store<AppState, AnyAction>;

    constructor(store: Store<AppState, AnyAction>) {
        this.store = store;

        toast.configure({
            position: 'bottom-right',
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
        } as ToastContainerProps);
    }

    success(message: string): void {
        let displayText = message;

        toast.success(displayText);
    }

    error(message: string): void {
        let displayText = message;

        toast.error(displayText);
    }
}
