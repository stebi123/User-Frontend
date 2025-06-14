import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

// Add withCredentials configuration to axios calls
axios.defaults.withCredentials = true;

// const register = (username, email, password, roles = ["user"]) => {
//   return axios.post(API_URL + 'signup', {
//     username,
//     email,
//     password,
//     roles
//   });
// };

const login = (username, password) => {
  return axios
    .post(API_URL + 'signin', {
      username,
      password,
    })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  // Call signout endpoint to clear the cookie
  return axios.post(API_URL + 'signout').finally(() => {
    localStorage.removeItem('user');
  });
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const AuthService = {
  // register,
  login,
  logout,
  getCurrentUser
};

export default AuthService;