import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[200],
  marginLeft: theme.spacing(2),
  width: "100%",
  maxWidth: 300,
  display: "flex",
  alignItems: "center",
  padding: "0 10px",
}));

export default function TopBar({ onMenuClick }) {
  return (
    <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar sx={{ bgcolor: '#606b7c'}}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap>
          Server Monitor
        </Typography>
        <Search>
          <SearchIcon />
          <InputBase placeholder="Search…" sx={{ ml: 1, flex: 1 }} />
        </Search>
        <Button color="inherit" sx={{ ml: 2 }}>
          Filters
        </Button>
      </Toolbar>
    </AppBar>
  );
}
