const initialState = {
  user: null,
  legalCharacters: /^[0-9a-zA-Z&\såäöÅÄÖé\-,.:;_]*$/,
};

export default function session(state = initialState, action) {
  switch (action.type) {
    case 'LOGIN_STATE':
      return {
        ...state,
        user: action.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
      };
    default:
      return state;
  }
}
