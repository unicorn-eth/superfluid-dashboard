// Based on Superfluid's network architecture
// src/features/wallet/unicornIntegration.ts

import { createThirdwebClient, defineChain } from "thirdweb";
import { inAppWalletConnector } from '@thirdweb-dev/wagmi-adapter';
import { allNetworks } from "../network/networks";

// Unicorn configuration
const thirdwebClient = createThirdwebClient({
  clientId: "4e8c81182c3709ee441e30d776223354"
});

const UNICORN_FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

/**
 * Creates a Unicorn connector for a specific Superfluid network
 * @param network - Superfluid network configuration
 * @returns Wagmi connector for Unicorn wallets
 */
export const createUnicornConnector = (network: typeof allNetworks[0]) => {
  return inAppWalletConnector({
    client: thirdwebClient,
    smartAccount: {
      sponsorGas: true, // Gasless transactions - perfect for Superfluid UX
      chain: defineChain(network.id), // Convert Superfluid network to Thirdweb format
      factoryAddress: UNICORN_FACTORY_ADDRESS,
    },
    metadata: {
      name: `Unicorn.eth (${network.name})`, // Show which network
      icon: '/unicorn-icon.png',
      image: {
        src: '/unicorn-icon.png',
        alt: 'Unicorn.eth Smart Wallet',
        height: 64,
        width: 64,
      },
    },
  });
};

/**
 * Creates Unicorn connectors for all Superfluid-supported networks
 * Only creates connectors for networks that actually support streams
 */
export const createUnicornConnectors = () => {
  return allNetworks
    .filter(network => {
      // Only create Unicorn connectors for networks where streaming makes sense
      // You might want to filter based on your business logic
      return network.isTestNetwork === false || process.env.NODE_ENV === 'development';
    })
    .map(createUnicornConnector);
};

// Usage in your WagmiManager or config:
export function useUnicornIntegration() {
  const unicornConnectors = createUnicornConnectors();
  
  return {
    connectors: unicornConnectors,
    isUnicornConnector: (connectorName: string) => connectorName.includes('Unicorn.eth'),
    supportedNetworkCount: unicornConnectors.length
  };
}

// Example: Integration with your existing wallet detection
export const detectUnicornConnection = () => {
  // Check URL parameters that Unicorn App Centers pass
  const urlParams = new URLSearchParams(window.location.search);
  const walletId = urlParams.get('walletId');
  const authCookie = urlParams.get('authCookie');
  
  return {
    isFromUnicorn: walletId === 'inApp' && !!authCookie,
    authCookie,
    shouldAutoConnect: walletId === 'inApp' && !!authCookie
  };
};

// Helper for your existing network switching logic
export const getUnicornSupportedNetworks = () => {
  return allNetworks.filter(network => {
    // Unicorn factory exists on most EVM chains, but you might want to be selective
    // based on your dApp's specific requirements
    return network.id !== 1337; // Exclude local hardhat, etc.
  });
};

// For debugging - logs all created connectors
export const debugUnicornConnectors = () => {
  const connectors = createUnicornConnectors();
  console.log('🦄 Created Unicorn connectors for networks:');
  connectors.forEach((connector, index) => {
    console.log(`  ${index + 1}. ${connector.name}`);
  });
  return connectors;
};