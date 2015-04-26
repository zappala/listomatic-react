var app = app || {};
app.ALL_TODOS = 'all';
app.ACTIVE_TODOS = 'active';
app.COMPLETED_TODOS = 'completed';

var Router = ReactRouter;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var Redirect = Router.Redirect;
var App = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

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

    logout: function(event) {
        auth.logout();
        this.context.router.replaceWith('/');

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
                <li><a href="#" onClick={this.logout}>Logout</a></li>
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
        return (
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
    login: function(event) {
        // prevent default browser submit
        event.preventDefault();
        // get data from form
        var username = this.refs.username.getDOMNode().value;
        var password = this.refs.password.getDOMNode().value;
        if (!username || !password) {
            return;
        }
        auth.login(username, password, function(loggedIn) {
            if (!loggedIn)
                return this.setState({
                    error: true
                });
            this.context.router.transitionTo('/list');
        }.bind(this));
    },

    render: function() {
        return (
            <div>
            <h2>Login</h2>
            <form className="form-vertical" onSubmit={this.login}>
            <input type="text" placeholder="Username" ref="username" autoFocus={true} />
            <input type="password" placeholder="Password" ref="password"/>
            <input className="btn" type="submit" value="Login" />
            {this.state.error ? (
                <div className="alert">Invalid username or password.</div>
                ) : null}
            </form>
            </div>
            );
    }
});

var Register = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState: function() {
        return {
            error: false
        };

    },
    register: function(event) {
        // prevent default browser submit
        event.preventDefault();
        // get data from form
        var name = this.refs.name.getDOMNode().value;
        var username = this.refs.username.getDOMNode().value;
        var password = this.refs.password.getDOMNode().value;
        if (!name || !username || !password) {
            return;
        }
        auth.register(name, username, password, function(loggedIn) {
            if (!loggedIn)
                return this.setState({
                    error: true
                });
            this.context.router.replaceWith('/list');
        }.bind(this));
    },
    render: function() {
        return (
            <div>
            <h2>Register</h2>
            <form className="form-vertical" onSubmit={this.register}>
            <input type="text" placeholder="Name" ref="name" autoFocus={true} />
            <input type="text" placeholder="Username" ref="username"/>
            <input type="password" placeholder="Password" ref="password"/>
            <input className="btn" type="submit" value="Register" />
            {this.state.error ? (
                <div className="alert">Invalid username or password.</div>
                ) : null }
            </form>
            </div>
            );
    }
});

var List = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    getInitialState: function() {
        return {
            items: [],
        };
    },
    componentDidMount: function() {
        api.getItems(this.listSet);
    },
    reload: function() {
        api.getItems(this.listSet);
    },
    listSet: function(status, data) {
        if (status) {
            this.setState({
                items: data.items
            });
        } else {
            this.context.router.transitionTo('/login');
        }
    },
    render: function() {
        var name = auth.getName();
        return (
            <section id="todoapp">
            <ListHeader name={name} items={this.state.items} reload={this.reload} />
            <section id="main">
            <ListEntry reload={this.reload}/>
            <ListItems items={this.state.items} nowShowing={app.ALL_TODOS} reload={this.reload}/>
            </section>
            </section>
            );
    }
});

var ListHeader = React.createClass({
    clearCompleted: function (event) {
        forEach(this.props.items, function(item) {
            if (item.completed) {
                api.deleteItem(item, null);
            }
        });
        this.props.reload();
    },
    render: function() {
        var completed = this.props.items.filter(function(item) {
            return item.completed;
        })
        return (
            <header id="header">
            <div className="row">
            <div className="col-md-6">
            <p><i>Lovingly created for {this.props.name}</i></p>
            <p>
            <span id="list-count" className="label label-default">
            <strong>{this.props.items.length}</strong> item(s)
            </span>
            </p>
            <p><i>Double-click to edit an item</i></p>
            </div>
            {completed.length > 0 ? (
                <div className="col-md-6 right">
                <button className="btn btn-warning btn-md" id="clear-completed" onClick={this.clearCompleted}>Clear completed ({completed.length})

                </button>
                </div>
                ) : null }
            </div>
            </header>
            );
    }
});

var ListEntry = React.createClass({
    addItem: function(event) {
        // prevent default browser submit
        event.preventDefault();
        // get data from form
        var title = this.refs.title.getDOMNode().value;
        if (!title) {
            return;
        }
        api.addItem(title, this.props.reload);
        this.refs.title.getDOMNode().value = '';
    },
    render: function() {
        return (
            <header id="input">
            <form id="item-form" name="itemForm" onSubmit={this.addItem}>
            <input type="text" id="new-item" ref="title" placeholder="Enter a new item" ng-disabled="saving" autoFocus={true} />
            </form>
            </header>
            );

    }
});

var ListItems = React.createClass({
    contextTypes: {
        router: React.PropTypes.func
    },

    render: function() {
        var shown = this.props.items.filter(function(item) {
            switch (this.context.router.getCurrentPathname()) {
                case '/list/active':
                return !item.completed;
                case '/list/completed':
                return item.completed;
                default:
                return true;
            }
        }, this);
        var list = shown.map(function(item) {
            return (
                <Item item={item} reload={this.props.reload}/>
                );
        }.bind(this));
        return (
            <ul id="todo-list">
            {list}
            </ul>
            );
    }
});

var Item = React.createClass({
    toggleCompleted: function(item) {
        item.completed = !item.completed;
        api.updateItem(item, this.props.reload);
    },
    deleteItem: function(item) {
        api.deleteItem(item, this.props.reload);
    },
    editItem: function(item) {

    },
    saveEdits: function(item) {

    },
    render: function() {
        return (
            <li className={this.props.item.completed ? 'completed' : ''}>
            <div className="view">
            <input className="toggle" type="checkbox" onChange={this.toggleCompleted.bind(this,this.props.item)} checked={this.props.item.completed} />
            <label onDoubleClick={this.editItem(this.props.item)}>{this.props.item.title}</label>
            <button className="destroy" onClick={this.deleteItem.bind(this,this.props.item)}></button>
            </div>
            <form onSubmit={this.saveEdits(this.props.item, 'submit')}>
            <input className="edit" ng-keypress="revertEdits(item)" item-escape="revertEdits(item)" item-focus="item == editedItem" />
            </form>
            </li>
            );
    }
});

var api = {
    getItems: function(cb) {
        var url = "/api/items";
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'GET',
            headers: {'Authorization': localStorage.token},
            success: function(res) {
                if (cb)
                    cb(true, res);
            },
            error: function(xhr, status, err) {
                // remove any token
                delete localStorage.token;
                console.log(err);
                if (cb)
                    cb(false, status);
            }
        });
    },
    addItem: function(title, cb) {
        var url = "/api/items";
        $.ajax({
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                item: {
                    'title': title
                }
            }),
            type: 'POST',
            headers: {'Authorization': localStorage.token},
            success: function(res) {
                if (cb)
                    cb(true, res);
            },
            error: function(xhr, status, err) {
                // remove any token
                delete localStorage.token;
                if (cb)
                    cb(false, status);
            }
        });

    },
    updateItem: function(item, cb) {
        var url = "/api/items/" + item.id;
        $.ajax({
            url: url,
            contentType: 'application/json',
            data: JSON.stringify({
                item: {
                    title: item.title,
                    completed: item.completed
                }
            }),
            type: 'PUT',
            headers: {'Authorization': localStorage.token},
            success: function(res) {
                if (cb)
                    cb(true, res);
            },
            error: function(xhr, status, err) {
                // remove any token
                delete localStorage.token;
                if (cb)
                    cb(false, status);
            }
        });
    },
    deleteItem: function(item, cb) {
        var url = "/api/items/" + item.id;
        $.ajax({
            url: url,
            type: 'DELETE',
            headers: {'Authorization': localStorage.token},
            success: function(res) {
                if (cb)
                    cb(true, res);
            },
            error: function(xhr, status, err) {
                // remove any token
                delete localStorage.token;
                if (cb)
                    cb(false, status);
            }
        });
    }

};

var auth = {
    register: function(name, username, password, cb) {
        // submit request to server
        var url = "/api/users/register";
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'POST',
            data: {
                name: name,
                username: username,
                password: password
            },
            success: function(res) {
                localStorage.token = res.token;
                localStorage.name = res.name;
                if (cb)
                    cb(true);
                this.onChange(true);
            }.bind(this),
            error: function(xhr, status, err) {
                // remove any token
                delete localStorage.token;
                if (cb)
                    cb(false);
                this.onChange(false);
                console.error(url, status, err.toString());
            }.bind(this)
        });
    },
    login: function(username, password, cb) {
        // submit login request to server
        cb = arguments[arguments.length - 1];
        // check if token in local storage
        if (localStorage.token) {
            console.log("token present");
            if (cb)
                cb(true);
            this.onChange(true);
            return;
        }

        // submit request to server
        var url = "/api/users/login";
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            success: function(res) {
                console.log("success");
                localStorage.token = res.token;
                localStorage.name = res.name;
                if (cb)
                    cb(true);
                this.onChange(true);
            }.bind(this),
            error: function(xhr, status, err) {
                // remove any token
                delete localStorage.token;
                console.log("failure");
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
    getName: function() {
        return localStorage.name;
    },
    logout: function(cb) {
        delete localStorage.token;
        if (cb) cb();
        this.onChange(false);
    },
    loggedIn: function() {
        return !!localStorage.token;
    },
    onChange: function() {},
};

var routes = (
    <Route name="app" path="/" handler={App}>
    <Route name="list" path ="/list" handler={List}/>
    <Route name="active" path = "/list/active" handler={List}/>
    <Route name="completed" path = "/list/completed" handler={List}/>
    <Route name="login" handler={Login}/>
    <Route name="register" handler={Register}/>
    <DefaultRoute handler={Home}/>
    </Route>
    );

Router.run(routes, function(Handler) {
    React.render(<Handler/>, document.body);
});
