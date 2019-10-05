import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import '@styles/variables.scss';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#0073b6',
    },
    secondary: {
      main: '#85ab1b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  overrides: {
    MuiPaper: {
      root: {
        color: '#222',
      },
    },
  },
});

export default theme;
