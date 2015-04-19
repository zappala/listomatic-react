// test
var Router = ReactRouter;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var Redirect = Router.Redirect;
var App = React.createClass({
    getInitialState: function() {
        return {
            loggedIn: auth.loggedIn()
        };
    },

    setStateOnAuth: function(loggedIn) {
        this.state.loggedIn = loggedIn;
    },

    componentWillMount: function() {
        auth.onChange = this.setStateOnAuth;
    },

    render: function() {
        return (
            <div>
            <nav className="navbar navbar-default" role="navigation">
            <div className="container">
            <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="/">List-o-matic</a>
            </div>
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            {this.state.loggedIn ? (
                <ul className="nav navbar-nav">
                <li><a href="#/list">All</a></li>
                <li><a href="#/list/active">Active</a></li>
                <li><a href="#/list/completed">Completed</a></li>
                <li><Link to="logout">Logout</Link></li>
                </ul>
                ) : (<div></div>)}
            </div>
            </div>
            </nav>
            <div className="container">
            <RouteHandler/>
            </div>
            </div>
            );
}
});

var Home = React.createClass({
    render: function() {
        return(
            <p>
            <Link className="btn btn-default" to="login">Login</Link> or <Link className="btn btn-default" to="register">Register</Link>
            </p>
            );
    }
});

var Login = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState: function() {
        return {
            error: false
        };

    },
    handleSubmit: function(event) {
        console.log("made it");
        // prevent default browser submit
        event.preventDefault();
        // router context
        // var router = this.context.router;
        // get data from form
        var username = this.refs.username.getDOMNode().value;
        var password = this.refs.password.getDOMNode().value;
        if (!username || !password) {
            return;
        }
        auth.login(username,password, function(loggedIn) {
            if (!loggedIn)
                return this.setState({ error: true });
            this.context.router.replaceWith('/list');
        }.bind(this));
    },

    render: function() {
        return(
            <div>
            <h2>Login</h2>
            <form className="form-vertical" onSubmit={this.handleSubmit}>
            <input type="text" placeholder="Username" ref="username"/>
            <input type="password" placeholder="Password" ref="password"/>
            <input className="btn" type="submit" value="Login" />
            <div ng-if="loginFailed" className="alert">Invalid username or password.</div>
            </form>
            </div>
            );
    }
});

var Register = React.createClass({
    render:function(){

    }
});

var List = React.createClass({
    render: function() {
        return (
            <div>Hello</div>
            );
    }
});

var Logout = React.createClass({
    render: function() {
        return (
            <div></div>
            );
    }
});

var auth = {
    login: function(username, password, cb) {
        // submit login request to server
        cb = arguments[arguments.length - 1];
        // check if token in local storage
        if (localStorage.token) {
            if (cb)
                cb(true);
            this.onChange(true);
            return;
        }
        console.log('submit');
        // submit request to server
        var url = "/api/users/login";
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'POST',
            data: {username: username, password: password},
            success: function(res) {
                console.log(res);
                localStorage.token = res.token;
                if (cb)
                    cb(true);
                this.onChange(true);
            }.bind(this),
            error: function(xhr, status, err) {
                if (cb)
                    cb(false);
                this.onChange(false);
                console.error(url, status, err.toString());
            }.bind(this)
        });
    },
    getToken: function() {
        return localStorage.token;
    },
    logout: function(cb) {
        delete localStorage.token;
        if (cb) cb();
        this.onChange(false);
    },
    loggedIn: function() {
        return !!localStorage.token;
    },
    onChange: function() {
    },
};

var routes = (
    <Route name="app" path="/" handler={App}>
    <Route name="list" handler={List}/>
    <Route name="login" handler={Login}/>
    <Route name="register" handler={Register}/>
    <Route name="logout" handler={Logout}/>
    <DefaultRoute handler={Home}/>
    </Route>
    );

Router.run(routes, function (Handler) {
    React.render(<Handler/>, document.body);
});
