import { ChangeEvent, FC, useState, FormEvent } from 'react';
import { Button, TextField } from '@mui/material';
import classNames from 'classnames';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.scss';
import { useAppDispatch } from '../../redux/store';
import { loginThunk } from '../../redux/actions/profile-action';
import { ROUTES_APP } from '../../constants/routes';

export const LoginPage: FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await dispatch(
      loginThunk({
        login,
        password
      })
    );

    navigate(ROUTES_APP.root);
  };

  const handleChangeLogin = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;

    setLogin(value);
  };

  const handleChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;

    setPassword(value);
  };

  return (
    <div className={classNames(styles.container, 'container')}>
      <div className={styles.wrapper}>
        <h2>Welcome!</h2>
      </div>
      <form action="" className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.fieldset}>
          <legend>Login form</legend>
          <TextField
            required
            onChange={handleChangeLogin}
            label="Login"
            value={login}
            name="login"
            size="small"
            fullWidth
            autoFocus
          />
          <TextField
            required
            label="Password"
            type="password"
            name="password"
            fullWidth
            onChange={handleChangePassword}
            value={password}
            size="small"
            autoComplete="current-password"
          />
          <div className={styles.action}>
            <Button type="submit" variant="contained">
              Sign-In
            </Button>
            <Link className="link" to={'/' + ROUTES_APP.signup}>
              SignUp
            </Link>
          </div>
        </fieldset>
      </form>
    </div>
  );
};
