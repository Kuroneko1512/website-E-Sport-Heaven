import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { setCurrentUser } from "@store/reducers/auth";
import { setWindowClass } from "@app/utils/helpers";
import { Checkbox } from "@profabric/react-components";
import * as Yup from "yup";

import { Form, InputGroup } from "react-bootstrap";
import { Button } from "@app/styles/common";
import { useAppDispatch } from "@app/store/store";
import { AuthService } from "@app/services/auth.service";

const Login = () => {
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [isGoogleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [isFacebookAuthLoading, setFacebookAuthLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [t] = useTranslation();

  const handleLogin = async (identifier: string, password: string) => {
    try {
      setAuthLoading(true);
      setIdentifierError(null);
      setPasswordError(null);

      console.log("Attempting to login with:", { identifier, password });
      const response = await AuthService.login({ identifier, password });
      console.log("Login response:", response);

      // Kiểm tra dữ liệu user
      if (!response.user) {
        console.error("No user data in response");
        throw new Error("No user data in response");
      }

      // Kiểm tra dữ liệu user trước khi dispatch
      console.log("User data:", response.user);
      dispatch(setCurrentUser(response.user));

      toast.success("Đăng nhập thành công!");
      navigate("/");
      // Kiểm tra token sau khi login
      console.log(
        "Access token after login:",
        localStorage.getItem("access_token")
      );
    } catch (error: any) {
      console.error("Login error:", error.response?.data);
      // Xử lý lỗi cho từng trường
      if (error.response?.data?.errors?.identifier) {
        setIdentifierError(error.response?.data.errors.identifier[0]);
      }
      if (error.response?.data?.errors?.password) {
        setPasswordError(error.response?.data.errors.password[0]);
      }
      // Nếu không có lỗi cụ thể, hiển thị thông báo chung
      else {
        toast.error(error.response?.data?.message || "Đăng nhập thất bại");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleAuthLoading(true);
      // TODO: Implement Google login API
      toast.info("Google login is not implemented yet");
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    } finally {
      setGoogleAuthLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setFacebookAuthLoading(true);
      // TODO: Implement Facebook login API
      toast.info("Facebook login is not implemented yet");
    } catch (error: any) {
      toast.error(error.message || "Facebook login failed");
    } finally {
      setFacebookAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      identifier: "",
      password: "",
    },
    validationSchema: Yup.object({
      identifier: Yup.string()
        .test(
          "is-valid-identifier",
          "Please enter a valid email or phone number",
          (value) => {
            if (!value) return false;
            // Kiểm tra nếu là email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(value)) return true;

            // Kiểm tra nếu là phone (ví dụ: bắt đầu bằng số và có độ dài tối thiểu 10 số)
            const phoneRegex = /^\d{10,}$/;
            return phoneRegex.test(value);
          }
        )
        .required("Required"),
      password: Yup.string()
        .min(5, "Must be 5 characters or more")
        .max(30, "Must be 30 characters or less")
        .required("Required"),
    }),
    onSubmit: (values) => {
      handleLogin(values.identifier, values.password);
    },
  });

  const [isShowPassword, setIsShowPassword] = useState(false);

  setWindowClass("hold-transition login-page");
  return (
    <div className="login-box">
      <div className="card card-outline card-primary">
        <div className="card-header text-center">
          <Link to="/" className="h2">
            <b>Quản trị viên</b>
            <br />
            <span>SPORT HEAVEN</span>
          </Link>
        </div>
        <div className="card-body">
          <p className="login-box-msg">
            Đăng nhập để bắt đầu phiên làm việc của bạn.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="Email hoặc số điện thoại"
                  onChange={handleChange}
                  value={values.identifier || ""}
                  isValid={touched.identifier && !errors.identifier}
                  isInvalid={touched.identifier && !!errors.identifier}
                />
                {touched.identifier && errors.identifier ? (
                  <Form.Control.Feedback type="invalid">
                    {identifierError}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text>
                      <i className="fas fa-user" />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>
            <div className="mb-3">
              <InputGroup className="mb-3">
                <Form.Control
                  id="password"
                  name="password"
                  type={isShowPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  onChange={handleChange}
                  value={values.password}
                  isValid={touched.password && !errors.password}
                  isInvalid={touched.password && !!errors.password}
                />
                {touched.password && errors.password ? (
                  <Form.Control.Feedback type="invalid">
                    {passwordError}
                  </Form.Control.Feedback>
                ) : (
                  <InputGroup.Append>
                    <InputGroup.Text onClick={() => setIsShowPassword(!isShowPassword)}>
                      <i className={isShowPassword ? "fas fa-lock-open" : "fas fa-lock"} />
                    </InputGroup.Text>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </div>

            <div className="row">
              <div className="col-6">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Checkbox checked={false} />
                  <label
                    style={{
                      margin: 0,
                      padding: 0,
                      paddingLeft: "4px",
                    }}
                  >
                    Ghi nhớ tài khoản
                  </label>
                </div>
              </div>
              <div className="col-6">
                <Button
                  loading={isAuthLoading}
                  disabled={isFacebookAuthLoading || isGoogleAuthLoading}
                  onClick={handleSubmit as any}
                >
                  Đăng nhập
                </Button>
              </div>
            </div>
          </form>
          <div className="social-auth-links text-center mt-2 mb-3">
            <Button
              className="mb-2"
              onClick={handleFacebookLogin}
              loading={isFacebookAuthLoading}
              disabled={true || isAuthLoading || isGoogleAuthLoading}
            >
              <i className="fab fa-facebook mr-2" />
              Đăng nhập với Facebook
            </Button>
            <Button
              variant="danger"
              onClick={handleGoogleLogin}
              loading={isGoogleAuthLoading}
              disabled={isAuthLoading || isFacebookAuthLoading}
            >
              <i className="fab fa-google mr-2" />
              Đăng nhập với Google
            </Button>
          </div>
          <p className="mb-1">
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </p>
          <p className="mb-0">
            <Link
            to="#" 
            className="text-center">
              Đăng ký thành viên
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
