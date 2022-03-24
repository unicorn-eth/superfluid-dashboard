import { ethers } from "ethers";
import { createContext, useContext } from "react";

const WalletProviderContext = createContext<{
    provider: ethers.providers.Provider | null,
    setProvider: (provider: ethers.providers.Provider) => void 
}>({
    provider: null,
    setProvider: () => {}
});

export default WalletProviderContext;

export const useWalletProviderContext = () => useContext(WalletProviderContext);