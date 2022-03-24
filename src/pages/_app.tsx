import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider as ThemeProviderMui } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  Stack,
  Theme,
  Toolbar,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import Image from "next/image";
import ConnectWallet from "../components/ConnectWallet";
import { ethers } from "ethers";
import WalletProviderContext from "../contexts/WalletProviderContext";
import { FC, ReactNode, useEffect, useState } from "react";
import { createSuperfluidMuiTheme } from "../theme";
import { ThemeProvider as ThemeProviderNextThemes } from "next-themes";
import { useTheme as useThemeNextThemes } from 'next-themes'
import ThemeChanger from "../components/ThemeChanger";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const drawerWidth = 240;

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const [walletProvider, setWalletProvider] =
    useState<ethers.providers.Provider | null>(null);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProviderNextThemes>
        <Mui>
          {(muiTheme) => (
            <WalletProviderContext.Provider
              value={{
                provider: walletProvider,
                setProvider: (provider: ethers.providers.Provider) =>
                  setWalletProvider(provider),
              }}
            >
              <Box sx={{ display: "flex" }}>
                <AppBar
                  position="fixed"
                  sx={{
                    color: "text.primary",
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    background: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <Stack
                    component={Toolbar}
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    spacing={2}
                  >
                    {walletProvider ? (
                      <Chip label="Connected"></Chip>
                    ) : (
                      <ConnectWallet>
                        {(onClick) => (
                          <Button variant="outlined" onClick={onClick}>
                            Connect
                          </Button>
                        )}
                      </ConnectWallet>
                    )}
                    <ThemeChanger></ThemeChanger>
                  </Stack>
                </AppBar>
                <Drawer
                  sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                      width: drawerWidth,
                      boxSizing: "border-box",
                    },
                  }}
                  variant="permanent"
                  anchor="left"
                >
                  <Toolbar sx={{ height: "100px" }}>
                    <Image
                      src={
                        muiTheme.palette.mode === "dark"
                          ? "/superfluid-logo-light.svg"
                          : "/superfluid-logo-dark.svg"
                      }
                      width={167}
                      height={40}
                      layout="fixed"
                      alt="Superfluid logo"
                    />
                  </Toolbar>
                  <Divider />
                  <List>
                    <ListItem button>
                      <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button>
                      <ListItemText primary="Wrap" />
                    </ListItem>
                  </List>
                </Drawer>
                <Box
                  component="main"
                  sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
                >
                  <Toolbar />
                  <Component {...pageProps} />
                </Box>
              </Box>
            </WalletProviderContext.Provider>
          )}
        </Mui>
      </ThemeProviderNextThemes>
    </CacheProvider>
  );
}

const Mui: FC<{ children: (muiTheme: Theme) => ReactNode }> = ({
  children,
}) => {
  const { theme } = useThemeNextThemes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const muiTheme = createSuperfluidMuiTheme(theme);

  return (
    <ThemeProviderMui theme={muiTheme}>
      <CssBaseline />
      {children(muiTheme)}
    </ThemeProviderMui>
  );
};
