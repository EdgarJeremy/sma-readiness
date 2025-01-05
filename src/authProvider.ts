import { Application } from "@feathersjs/feathers";
import { AuthBindings } from "@refinedev/core";

export const TOKEN_KEY = "feathers-jwt";

export const getAuthProvider = (feathers: Application): AuthBindings => ({
  login: async ({ email, password }) => {
    try {
      const res = await feathers.authenticate({ strategy: 'local', username: email, password: password });
      return {
        success: true,
        redirectTo: "/",
      };
    } catch(e) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid username or password",
        },
      };
    }
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return { authenticated: false }
    try {
      await feathers.reAuthenticate();
      return { authenticated: true };
    } catch(e) { return { authenticated: false, redirectTo: '/login' } }
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    try {
      const data = await feathers.reAuthenticate();
      return {
        ...data.user,
        avatar: "https://ui-avatars.com/api/?name=" + data.user.name,
      };
    } catch(e) { return null }
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
})