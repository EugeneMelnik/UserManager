import { FC, useEffect, useMemo, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridSortModel
} from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { usersSelector } from '../../redux/selectors/users-selector';
import { getUsersThunk } from '../../redux/actions/users-action';
import moment from 'moment';
import { IUser } from '../../types';
import { useSearchParams } from 'react-router-dom';

interface ITable {
  setSelectedRows: (selectedRows: number[]) => void;
}

export const Table: FC<ITable> = ({ setSelectedRows }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterModel, setFilterModel] = useState<GridFilterModel>(() => {
    try {
      return JSON.parse(searchParams.get('filter') || '{"items":[]}');
    } catch (_) {
      return { items: [] };
    }
  });
  const [sortModel, setSortModel] = useState<GridSortModel>(() => {
    try {
      return JSON.parse(searchParams.get('sort') || '[]');
    } catch (_) {
      return [];
    }
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      await dispatch(getUsersThunk());
      setIsFetching(false);
    })();
  }, []);

  const users = useAppSelector(usersSelector);

  const updateUrl = (changes: {
    search?: string;
    filter?: GridFilterModel;
    sort?: GridSortModel;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (key === 'filter' && (value as GridFilterModel).items.length === 0)
      ) {
        nextParams.delete(key);
      } else {
        nextParams.set(
          key,
          typeof value === 'string' ? value : JSON.stringify(value)
        );
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'firstName', headerName: 'First name', flex: 2 },
    { field: 'lastName', headerName: 'Last name', flex: 2 },
    { field: 'sex', headerName: 'sex', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 3 },
    { field: 'createdAt', headerName: 'Registration date', flex: 3 },
    { field: 'updatedAt', headerName: 'Login date', flex: 3 },
    { field: 'state', headerName: 'Status', flex: 2 }
  ];

  function handleSelectRows(e: any) {
    setSelectedRows(e.selection);
  }

  const rows = useMemo(
    () =>
      users
        .map((user: IUser) => ({
          ...user,
          updatedAt: moment(user.updatedAt).format('MMMM Do YYYY, h:mm:ss'),
          createdAt: moment(user.createdAt).format('MMMM Do YYYY, h:mm:ss')
        })),
    [users]
  );

  return (

      <DataGrid
        style={{ height: 'inherit', width: '100%', marginBottom: '10px' }}
        rows={rows}
        columns={columns}
        autoPageSize
        loading={isFetching}
        rowsPerPageOptions={[5]}
        checkboxSelection
        filterModel={filterModel}
        onFilterModelChange={(model) => {
          setFilterModel(model);
          updateUrl({ filter: model });
        }}
        sortModel={sortModel}
        onSortModelChange={(model) => {
          setSortModel(model);
          updateUrl({ sort: model });
        }}
        onStateChange={handleSelectRows}
      />
  );
};
