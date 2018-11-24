const initialState = {
  isSignedIn: false,
  user: null,
  legalCharacters: /^[0-9a-zA-Z&\såäöÅÄÖé\-,.:;_]*$/,
};

export default function session(state = initialState, action) {
  switch (action.type) {
    case 'LOGIN_STATE':
      return {
        ...state,
        isSignedIn: action.isSignedIn,
        user: action.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        isSignedIn: false,
        user: null,
      };
    default:
      return state;
  }
}
