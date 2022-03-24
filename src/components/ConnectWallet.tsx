import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import { FC, ReactElement, ReactNode } from "react";
import Web3Modal from "web3modal";
import { useWalletProviderContext } from "../contexts/WalletProviderContext";

const ConnectWallet: FC<{
  children: (onClick: () => void) => ReactElement<any, any>;
}> = ({ children }) => {
  const walletProviderContext = useWalletProviderContext();

  const onClick = async () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "fa4dab2732ac473b9a61b1d1b3b904fa",
        },
      },
    };

    const web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions, // required
    });

    const web3Provider = await web3Modal.connect();
    const ethersProvider = new ethers.providers.Web3Provider(web3Provider);

    walletProviderContext.setProvider(ethersProvider);
  };

  return children(onClick);
};

export default ConnectWallet;
