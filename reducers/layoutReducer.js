const initialState = {
  menuOpen: false,
  editing: false,
  fullScreenStepsOpen: false,
  fullScreenStepsData: [],
  fullScreenStepsIndex: 0,
  touchShift: 0,
  friendlyNames: {
    amount: '1',
    unit: 'dl',
    what: 'Mango',
  },
};
export default function layout(state = initialState, action) {
  switch (action.type) {
    case 'MENU_TOGGLE':
      return { ...state, menuOpen: action.menuOpen };
    case 'MENU_OPEN':
      return { ...state, menuOpen: true };
    case 'MENU_CLOSE':
      return { ...state, menuOpen: false };
    case 'UPDATE_EDITING':
      return { ...state, editing: action.editing };
    case 'TOUCH_SHIFT':
      return { ...state, touchShift: action.touchShift };
    case 'TOUCH_SHIFT_RESET':
      return { ...state, touchShift: 0 };
    case 'FULLSCREEN_STEPS_OPEN':
      return {
        ...state,
        fullScreenStepsOpen: true,
        fullScreenStepsData: action.steps,
      };
    case 'FULLSCREEN_STEPS_CLOSE':
      return {
        ...state,
        fullScreenStepsOpen: false,
        fullScreenStepsData: [],
        fullScreenStepsIndex: 0,
      };
    case 'FULLSCREEN_STEPS_CHANGE_INDEX':
      return { ...state, fullScreenStepsIndex: action.index };
    default:
      return state;
  }
}
