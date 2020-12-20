// import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { $, _, initFontLibrary } from './utils';
import { BrowserRouter as Router } from 'react-router-dom';
import { initStorage } from './shared/storage';
import { initToast } from './shared/toast';
import { Provider } from 'react-redux';
import { SET_LOCALE } from './actions/common';
import { setHostUrl } from './shared/fetch';
import * as serviceWorker from './serviceWorker';
import App from './website/App';
import ConnectedIntlProvider from './shared/intl';
import moment from 'moment';
import storageWrapper from './website/components/StorageWrapper';
import store from './shared/store';
import ToastWrapper from './website/components/ToastWrapper';

(function () {
    if (typeof document === 'undefined') {
        Promise = require('bluebird');
    }

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        setHostUrl('https://127.0.0.1:3000/');
    } else {
        setHostUrl('https://continuum-server.herokuapp.com');
    }

    store.dispatch({
        type: SET_LOCALE,
        locale: navigator.language,
    });
    moment.locale(navigator.language);

    initToast(new ToastWrapper(store));

    initStorage(storageWrapper);

    // Determines the padding for loading times, while the DOM is initializing.
    const LOAD_PADDING = 1000;

    // Resolves when the webpage DOM is done loading.
    let onReady = function (callback: Function) {
        let interval_id = window.setInterval(function () {
            if ($('body') !== undefined) {
                window.clearInterval(interval_id);
                callback.call(onReady);
            }
        }, LOAD_PADDING);
    };

    let init = function () {
        window.addEventListener('load', function () {
            let entry_point = $('#root');

            // Initialize font library and master stylesheet
            initFontLibrary();

            // TODO: add mobile stylesheet.
            require('./website/styles/master.scss');

            // Enable the loader while the webpage is still *loading*.
            onReady(function () {
                $('body')!.classList.add('loaded');
            });

            // Render the app in strict mode.
            ReactDOM.render(
                <Provider store={store}>
                    <ConnectedIntlProvider>
                        <Router basename="admin">
                            <App />
                        </Router>
                    </ConnectedIntlProvider>
                </Provider>,
                entry_point
            );

            serviceWorker.unregister();
        });
    };

    init();
})();
