// import 'regenerator-runtime/runtime';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { $, _, initFontLibrary } from './utils';
import { setHostUrl } from './shared/fetch';
import * as serviceWorker from './serviceWorker';
import App from './App';

(function () {
    // Determines the padding for loading times, while the DOM is initializing.
    const LOAD_PADDING = 1000;

    // Host server url.
    const HOST_URL = 'https://continuum-server.herokuapp.com';

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
            setHostUrl(HOST_URL);

            let entry_point = $('#root');

            // Initialize font library and master stylesheet
            initFontLibrary();

            // TODO: add mobile stylesheet.
            require('./styles/master.scss');

            // Enable the loader while the webpage is still *loading*.
            onReady(function () {
                $('body')!.classList.add('loaded');
            });

            // Render the app in strict mode.
            ReactDOM.render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>,
                entry_point
            );

            serviceWorker.unregister();
        });
    };

    init();
})();
