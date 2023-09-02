
import type { AppProps } from 'next/app';
import * as theming from "custom_theme";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { baseGoerli } from 'wagmi/chains';
import { Box, Experimental_CssVarsProvider, Stack } from '@mui/material';
import "styles/globals.scss";
import Image from 'next/image';
import Layout from 'components/Layout';
const chains = [baseGoerli];
const projectId = '83fde4ab80cf5b97cff4927c19d25825';

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

export default function App({ Component, pageProps }: any) {
  return (
    <>
      <Experimental_CssVarsProvider
        theme={theming.customTheme}
        defaultMode="dark"
      >
        <WagmiConfig config={wagmiConfig}>
          <Box sx={{ bgcolor: "darkPurple.main" }} height="100%" width="100%">
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Box>
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </Experimental_CssVarsProvider>
    </>
  );
}
