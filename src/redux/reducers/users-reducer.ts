import { IUser } from '../../types';
import { AnyAction } from 'redux';
import { usersActionType } from '../actions/users-action';

const initialState: IUser[] = [];

export const usersReducer = (state = initialState, action: AnyAction) => {
  switch (action.type) {
    case usersActionType.SET_USERS: {
      const stateCopy = action.payload;

      return stateCopy;
    }
    case usersActionType.ADD_USER: {
      if (state.some((user) => user.id === action.payload.id)) return state;

      return [...state, action.payload];
    }
    case usersActionType.UPDATE_USER: {
      return state.map((user) =>
        action.payload.ids.includes(user.id)
          ? { ...user, state: action.payload.state }
          : user
      );
    }
    case usersActionType.BLOCK_USERS: {
      const stateCopy = state.map((user) => {
        if (action.payload.includes(user.id)) {
          return {
            ...user,
            state: 'blocked'
          };
        }
        return user;
      });

      return stateCopy;
    }
    case usersActionType.UNBLOCK_USERS: {
      const stateCopy = state.map((user) => {
        if (action.payload.includes(user.id)) {
          return {
            ...user,
            state: 'offline'
          };
        }
        return user;
      });

      return stateCopy;
    }
    case usersActionType.DELETE_USERS: {
      const stateCopy = state.filter(
        (user) => !action.payload.includes(user.id)
      );

      return stateCopy;
    }
    default: {
      return state;
    }
  }
};
