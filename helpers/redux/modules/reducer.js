import {combineReducers} from 'redux';
import {routeReducer} from 'react-router-redux';
import customReducers from '../../../reducers';

export default combineReducers({...customReducers, routing: routeReducer});
