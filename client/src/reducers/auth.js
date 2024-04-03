import { AUTH, LOG_OUT } from "../actions/actionTypes";
const initialState = {
  user: JSON.parse(localStorage.getItem("user")),
};
export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH:
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { ...state, user: action.payload };
    case LOG_OUT:
      return { ...state, user: null };
    default:
      return state;
  }
};
