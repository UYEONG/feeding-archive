import React, { Component, createContext } from 'react';
import { Container } from 'flux/utils';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import moment from 'moment';
import actions from './flux/actions';
import store from './flux/store';
import Header from './components/Header';
import Preparing from './components/Preparing';
import Login from './containers/Login';
import Editor from './containers/FeedingEditor';
import Feedings from "./containers/FeedingList";
import './App.scss';

export const AppContext = createContext(store.getInitialState());

class App extends Component {
  static getStores() {
    return [store];
  }

  static calculateState() {
    return store.getState();
  }

  componentDidMount() {
    actions.listenUser();
  }

  render() {
    const { user } = this.state;
    const isAuthenticated = !!user;
    const today = moment().format('YYYY-MM-DD');
    return (
      <AppContext.Provider value={this.state}>
        <ReactCSSTransitionGroup
          transitionName="preparing"
          transitionEnterTimeout={0}
          transitionLeaveTimeout={800}
        >
          {user === undefined ? <Preparing /> : null}
        </ReactCSSTransitionGroup>
        {user !== undefined && (
          <Router basename={process.env.PUBLIC_URL}>
            <Header useLogoutBtn={isAuthenticated} />
            <Route path={"/login"} component={Login} />
            <Switch>
              <Redirect
                exact
                from='/'
                to={`/feedings/${today}`}
              />
              <Redirect
                exact
                from='/feedings/'
                to={`/feedings/${today}`}
              />
              <PrivateRoute
                path={"/feedings/:current/(write|edit)/:id?"}
                component={Editor}
                authenticated={isAuthenticated}
              />
              <PrivateRoute
                path={"/feedings/:current?"}
                component={Feedings}
                authenticated={isAuthenticated}
              />
            </Switch>
          </Router>
        )}
      </AppContext.Provider>
    )
  }
}

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
}

export default Container.create(App);
