// src/modules/register/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { setWindowClass } from '@app/utils/helpers';
import { Form, InputGroup } from 'react-bootstrap';
import { Checkbox } from '@profabric/react-components';
import { Button } from '@app/styles/common';
import { AuthService } from '@app/services/auth.service';
import { setCurrentUser } from '@app/store/reducers/auth';
import { useAppDispatch } from '@app/store/store';
import { api } from '@app/api/adminApi';
import { API_ENDPOINTS } from '@app/api/endpoints';

const Register = () => {
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [isGoogleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [isFacebookAuthLoading, setFacebookAuthLoading] = useState(false);
  const [t] = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleRegister = async (identifier: string, password: string) => {
    try {
      setAuthLoading(true);
      const response = await AuthService.register({
        identifier,
        password,
        name: identifier.split('@')[0],
        phone: ''
      });
      dispatch(setCurrentUser(response.user));
      toast.success('Registration successful');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleAuthLoading(true);
      await AuthService.signInWithGoogle();
      const response = await api.get(API_ENDPOINTS.USER.PROFILE);
      dispatch(setCurrentUser(response.data.user));
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
      setGoogleAuthLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setFacebookAuthLoading(true);
      await AuthService.signInWithFacebook();
      const response = await api.get(API_ENDPOINTS.USER.PROFILE);
      dispatch(setCurrentUser(response.data.user));
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Facebook login failed');
      setFacebookAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      email: '',
      password: '',
      passwordRetype: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string()
        .min(5, 'Must be 5 characters or more')
        .max(30, 'Must be 30 characters or less')
        .required('Required'),
      passwordRetype: Yup.string()
        .min(5, 'Must be 5 characters or more')
        .max(30, 'Must be 30 characters or less')
        .required('Required')
        .oneOf([Yup.ref('password')], 'Passwords must match')
    }),
    onSubmit: (values) => {
      if (values.password !== values.passwordRetype) {
        toast.error('Passwords do not match');
        return;
      }
      handleRegister(values.email, values.password);
    }
  });

  setWindowClass('hold-transition register-page');

  return (
    <div className="register-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h1">
            <b>Admin</b>
            <span>LTE</span>
          </Link>
        </div>
        <div className="card-body">
          <p className="login-box-msg">{t('register.registerNew')}</p>
          <form onSubmit={handleSubmit}>
            {/* ... form fields ... */}
            <div className="row">
              <div className="col-7">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox checked={false} />
                  <label style={{ margin: 0, padding: 0, paddingLeft: '4px' }}>
                    <span>I agree to the </span>
                    <Link to="/">terms</Link>{' '}
                  </label>
                </div>
              </div>
              <div className="col-5">
                <Button
                  onClick={() => handleSubmit()}
                  loading={isAuthLoading}
                  disabled={isGoogleAuthLoading || isFacebookAuthLoading}
                >
                  {t('register.label')}
                </Button>
              </div>
            </div>
          </form>
          <div className="social-auth-links text-center">
            <Button
              className="mb-2"
              onClick={handleFacebookLogin}
              loading={isFacebookAuthLoading}
              disabled={isAuthLoading || isGoogleAuthLoading}
            >
              <i className="fab fa-facebook mr-2" />
              {t('login.button.signIn.social', { what: 'Facebook' })}
            </Button>
            <Button
              variant="danger"
              onClick={handleGoogleLogin}
              loading={isGoogleAuthLoading}
              disabled={isAuthLoading || isFacebookAuthLoading}
            >
              <i className="fab fa-google mr-2" />
              {t('login.button.signUp.social', { what: 'Google' })}
            </Button>
          </div>
          <Link to="/login" className="text-center">
            {t('register.alreadyHave')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;