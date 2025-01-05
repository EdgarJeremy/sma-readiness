import { AuthPage } from "@refinedev/antd";
import { useEffect } from "react";

export const Login = () => {
  useEffect(() => { document.title = 'Login | SMA Inventory Readiness Dashboard' }, []);
  return (
    <AuthPage
      title=""
      type="login"
      forgotPasswordLink=""
      registerLink=""
      rememberMe=""
    />
  );
};
