import { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import styles from './MainPage.module.scss';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { loginThunk, logoutThunk } from '../../redux/actions/profile-action';
import {
  profileFirstNameSelector,
  profileIdSelector,
  profileLastNameSelector
} from '../../redux/selectors/profile-selector';
import { Button, Tooltip } from '@mui/material';
import { shareIsLoadingSelector } from '../../redux/selectors/share-selector';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/Table/Table';
import { ToolBar } from '../../components/ToolBar/ToolBar';
import { ROUTES_APP } from '../../constants/routes';
import {
  blockMeThunk,
  deleteMeThunk
} from '../../redux/actions/profile-action';
import { socket } from '../../socket';
import { Socket } from 'socket.io-client';
import {
  addUserAction,
  deleteUsersAction,
  updateUserAction
} from '../../redux/actions/users-action';
import { IUser } from '../../types';

export const MainPage: FC = () => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutThunk());

    navigate('./' + ROUTES_APP.login);
  };

  const firstName = useAppSelector(profileFirstNameSelector);
  const lastName = useAppSelector(profileLastNameSelector);
  const id = useAppSelector(profileIdSelector);

  useEffect(() => {
    try {
      if (!id) dispatch(loginThunk(undefined, false));

      const handleUserCreated = (user: IUser) => {
        if (user.id !== id) dispatch(addUserAction(user));
      };
      const handleUserUpdated = (payload: {
        ids: number[];
        state: IUser['state'];
      }) => dispatch(updateUserAction(payload));
      const handleUserDeleted = ({ ids }: { ids: number[] }) =>
        dispatch(deleteUsersAction(ids));

      socket.instance.on('user_created', handleUserCreated);
      socket.instance.on('user_updated', handleUserUpdated);
      socket.instance.on('user_deleted', handleUserDeleted);

      const handleRestrictedUser = () => {
        window.addEventListener('click', handleLogout);
      };

      socket.instance.on('delete_response', handleRestrictedUser);

      socket.instance.on('block_response', handleRestrictedUser);

      return () => {
        socket.instance.off('user_created', handleUserCreated);
        socket.instance.off('user_updated', handleUserUpdated);
        socket.instance.off('user_deleted', handleUserDeleted);
        socket.instance.off('delete_response', handleRestrictedUser);
        socket.instance.off('block_response', handleRestrictedUser);
        socket.instance.disconnect();
        // @ts-ignore
        socket.instance = null as Socket;

        window.removeEventListener('click', handleLogout);
      };
    } catch (_) {
      navigate('./' + ROUTES_APP.login);
    }
  }, []);

  const isLoading = useAppSelector(shareIsLoadingSelector);

  const handleBlockMe = async () => {
    await dispatch(blockMeThunk([id]));

    navigate('./' + ROUTES_APP.login);
  };

  const handleDeleteMe = async () => {
    await dispatch(deleteMeThunk([id]));

    navigate('./' + ROUTES_APP.login);
  };

  return (
    <div className={styles.wrapper}>
      <header>
        <div className={classNames(styles.container, 'container')}>
          <div className={styles.profile}>
            <AccountCircleIcon fontSize="large" />
            <strong>{`${firstName} ${lastName}`}</strong>
          </div>
          <div>
            <Tooltip title="Block my account" arrow>
              <Button
                sx={{ marginRight: 4 }}
                variant="contained"
                onClick={handleBlockMe}
                disabled={isLoading}
              >
                Block me
              </Button>
            </Tooltip>
            <Tooltip title="Remove my account" arrow>
              <Button
                sx={{ marginRight: 4 }}
                variant="contained"
                onClick={handleDeleteMe}
                disabled={isLoading}
              >
                Remove me
              </Button>
            </Tooltip>
          </div>
          <div>
            <Button
              onClick={handleLogout}
              color="secondary"
              disabled={isLoading}
            >
              LogOut
            </Button>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <div className={classNames(styles.container, 'container')}>
          <ToolBar selectedRows={selectedRows} />
          <Table setSelectedRows={setSelectedRows} />
        </div>
      </main>
    </div>
  );
};
