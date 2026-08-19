import { FC } from 'react';
import { Button, ButtonGroup, IconButton } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch } from '../../redux/store';
import {
  blockUsersThunk,
  deleteUsersThunk,
  unblockUsersThunk
} from '../../redux/actions/users-action';
import { socket } from '../../socket';

interface IToolBar {
  selectedRows: number[];
}

export const ToolBar: FC<IToolBar> = ({ selectedRows }) => {
  const dispatch = useAppDispatch();

  const handleBlockUsers = async () => {
    await dispatch(blockUsersThunk(selectedRows));

    socket.instance.emit('block', {
      receiverIds: selectedRows
    });
  };

  const handleUnblockUsers = async () => {
    await dispatch(unblockUsersThunk(selectedRows));

    socket.instance.emit('unblock', {
      receiverIds: selectedRows
    });
  };

  const handleDeleteUsers = async () => {
    await dispatch(deleteUsersThunk(selectedRows));

    socket.instance.emit('delete', {
      receiverIds: selectedRows
    });
  };

  return (
    <ButtonGroup
      sx={{
        display: 'flex',
        gap: '7px',
        alignItems: 'center',
        height: '40px'
      }}
      aria-label="text button group"
    >
      {selectedRows.length && (
        <>
          <Button color="secondary" onClick={handleBlockUsers}>
            Block
          </Button>
          <IconButton onClick={handleUnblockUsers} aria-label="Unblock">
            <LockOpenIcon />
          </IconButton>
          <IconButton onClick={handleDeleteUsers} aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </>
      )}
    </ButtonGroup>
  );
};
