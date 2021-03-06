import account from '../remotes/account.js';
import feedings from '../remotes/feedings';
import { dispatch } from './dispatcher';
import actionTypes from './actionTypes';

let unsubscribe;

export default {
  listenUser() {
    account.listen((user) => {
      dispatch({ type: actionTypes.UPDATE_USER, user });
    });
  },

  listenFeedings(userId, date) {
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = feedings.listen(userId, date, (feedings) => {
      dispatch({ type: actionTypes.UPDATE_FEEDINGS, feedings });
    });
  },

  async login(email, password) {
    dispatch({ type: actionTypes.LOGIN_START });
    try {
      await account.login(email, password);
      dispatch({ type: actionTypes.LOGIN_SUCCESS });
    } catch(error) {
      dispatch({ type: actionTypes.LOGIN_FAIL });
      throw error;
    }
  },

  async logout() {
    await account.logout();
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = undefined;
    }
    dispatch({ type: actionTypes.LOGOUT });
  },

  async saveFeeding(userId, values) {
    dispatch({ type: actionTypes.UPDATE_FEEDING_START });
    try {
      await feedings.create(userId, values);
      dispatch({ type: actionTypes.UPDATE_FEEDING_SUCCESS });
    } catch (error) {
      dispatch({ type: actionTypes.UPDATE_FEEDING_FAIL });
      throw error;
    }
  },

  async updateFeeding(userId, feedingId, values) {
    dispatch({ type: actionTypes.UPDATE_FEEDING_START });
    try {
      await feedings.update(userId, feedingId, values);
      dispatch({ type: actionTypes.UPDATE_FEEDING_SUCCESS });
    } catch (error) {
      dispatch({ type: actionTypes.UPDATE_FEEDING_FAIL });
      throw error;
    }
  },

  async removeFeeding(userId, feeding) {
    await feedings.remove(userId, feeding);
  }
};
