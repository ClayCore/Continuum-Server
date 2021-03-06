import * as React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ComponentProps } from '../shared/ComponentProps';
import fetch from '../shared/fetch';

const API_GET = '/api/version';
// const API_PUT = 'api/put';
// const API_UPDATE = 'api/update';
// const API_DELETE = 'api/delete';

// how often should be poll the database, in ms
const DB_POLL = 1000;

type AppState = {
    version: Promise<any> | null;
    interval: number;
    is_loading: boolean;
    error: string;
};

class App extends React.Component<ComponentProps, AppState> {
    constructor(props: ComponentProps) {
        super(props);

        this.state = {
            version: null,
            interval: 0,
            is_loading: true,
            error: '',
        };
    }

    fetchData = (url: string) => {
        fetch(url, undefined, 'GET').then((json: any) => {
            if (json && json.version) {
                this.setState({ version: json.version, is_loading: false });
            }
        });
    };

    getData = () => {
        this.fetchData(API_GET);
    };

    componentDidMount = () => {
        this.getData();

        if (!this.state.interval) {
            let interval = window.setInterval(this.getData, DB_POLL);
            this.setState({ interval: interval });
        }
    };

    componentWillUnmount = () => {
        if (this.state.interval) {
            clearInterval(this.state.interval);
            this.setState({ interval: 0 });
        }
    };

    render() {
        const { version, is_loading, error } = this.state;

        if (error) {
            return (
                <div>
                    <h1>
                        <code>[ERROR]: Unknown</code>
                    </h1>
                    <br />
                    <pre>{error}</pre>
                </div>
            );
        }

        if (is_loading) {
            return (
                <Switch>
                    <Route>
                        <h1>Loading...</h1>
                    </Route>
                </Switch>
            );
        }

        if (!version) {
            return (
                <div>
                    <h1>
                        <code>[ERROR]: Version missing</code>
                    </h1>
                    <br />
                    <pre>Data fetched from server is undefined or null!</pre>
                </div>
            );
        }

        return (
            <Switch>
                <Route exact path="/">
                    <h1>Welcome to admin panel. Version: {version}</h1>
                </Route>
                <Route path="/home">
                    <h1>Welcome to admin panel. Version: {version}</h1>
                </Route>
            </Switch>
        );
    }
}

export default App;
