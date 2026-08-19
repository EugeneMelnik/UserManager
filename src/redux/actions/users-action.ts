import { requestAPI } from '../../api/api';
import { AxiosError } from 'axios';
import { logoutAction } from './root-action';
import { toast } from 'react-toastify';
import { IUser } from '../../types';
import { AppDispatch } from '../store';

export const usersActionType = {
  SET_USERS: 'SET_USERS',
  ADD_USER: 'ADD_USER',
  UPDATE_USER: 'UPDATE_USER',
  BLOCK_USERS: 'BLOCK_USERS',
  UNBLOCK_USERS: 'UNBLOCK_USERS',
  DELETE_USERS: 'DELETE_USERS'
};

const setUsersAction = (payload: IUser[]) => ({
  type: usersActionType.SET_USERS,
  payload
});

export const addUserAction = (payload: IUser) => ({
  type: usersActionType.ADD_USER,
  payload
});

export const updateUserAction = (payload: {
  ids: number[];
  state: IUser['state'];
}) => ({
  type: usersActionType.UPDATE_USER,
  payload
});

const blockUsersAction = (payload: number[]) => ({
  type: usersActionType.BLOCK_USERS,
  payload
});

const unblockUsersAction = (payload: number[]) => ({
  type: usersActionType.UNBLOCK_USERS,
  payload
});

export const deleteUsersAction = (payload: number[]) => ({
  type: usersActionType.DELETE_USERS,
  payload
});
export const getUsersThunk = () => async (dispatch: AppDispatch) => {
  try {
    const users = await requestAPI.getUsers();

    dispatch(setUsersAction(users));
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        dispatch(logoutAction());
      }

      toast.error(error.response?.data, {
        toastId: String(error.response?.data)
      });
    } else {
      throw error;
    }
  }
};

export const blockUsersThunk =
  (ids: number[]) => async (dispatch: AppDispatch) => {
    try {
      await requestAPI.block(ids);

      dispatch(blockUsersAction(ids));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch(logoutAction());
        }

        toast.error(error.response?.data, {
          toastId: String(error.response?.data)
        });
      } else {
        throw error;
      }
    }
  };

export const unblockUsersThunk =
  (ids: number[]) => async (dispatch: AppDispatch) => {
    try {
      await requestAPI.unblock(ids);

      dispatch(unblockUsersAction(ids));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch(logoutAction());
        }

        toast.error(error.response?.data, {
          toastId: String(error.response?.data)
        });
      } else {
        throw error;
      }
    }
  };

export const deleteUsersThunk =
  (ids: number[]) => async (dispatch: AppDispatch) => {
    try {
      await requestAPI.delete(ids);

      dispatch(deleteUsersAction(ids));
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch(logoutAction());
        }

        toast.error(error.response?.data, {
          toastId: String(error.response?.data)
        });
      } else {
        throw error;
      }
    }
  };
