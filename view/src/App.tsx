import * as React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// const API_ADDR = 'https://lunarium-api.herokuapp.com/';
const API_ADDR = 'https://continuum-server.herokuapp.com:8000/';
const API_GET = API_ADDR + 'api/get';
const API_PUT = API_ADDR + 'api/put';
const API_UPDATE = API_ADDR + 'api/update';
const API_DELETE = API_ADDR + 'api/delete';

// how often should be poll the database, in ms
const DB_POLL = 1000;

type AppState = {
    data: Promise<any> | null;
    interval: number;
    is_loading: boolean;
    error: string;
};

type AppProps = {};

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state = {
            data: null,
            interval: 0,
            is_loading: true,
            error: '',
        };
    }

    fetchData = (url: string) => {
        fetch(url)
            .then((data) => data.json())
            .then((response) => {
                this.setState({ data: response.data, is_loading: false });
            })
            .catch((error) => this.setState({ error: error }));
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
        const { data, is_loading, error } = this.state;

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
                <Router basename="admin">
                    <Switch>
                        <h1>Loading...</h1>
                    </Switch>
                </Router>
            );
        }

        if (!data) {
            return (
                <div>
                    <h1>
                        <code>[ERROR]: Data: {data}</code>
                    </h1>
                    <br />
                    <pre>Data fetched from server is undefined or null!</pre>
                </div>
            );
        }

        return (
            <Router basename="admin">
                <Switch>
                    <Route exact path="/">
                        <h1>Welcome to admin panel.</h1>
                    </Route>
                    <Route path="/home">
                        <h1>Welcome to admin panel.</h1>
                    </Route>
                </Switch>
            </Router>
        );
    }
}

export default App;
