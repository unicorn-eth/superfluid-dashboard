// src/features/wallet/unicornIntegration.ts
/** 
 * Coded with love by @cryptowampum and Claude AI
 */
import { createThirdwebClient, defineChain } from "thirdweb";
import { inAppWalletConnector } from '@thirdweb-dev/wagmi-adapter';
import { allNetworks } from "../network/networks";
import { Network } from "../network/networks";

// Unicorn.eth official configuration
const UNICORN_CLIENT_ID = "4e8c81182c3709ee441e30d776223354";
const UNICORN_FACTORY_ADDRESS = "0xD771615c873ba5a2149D5312448cE01D677Ee48A";

// Create Thirdweb client (reused across all connectors)
const thirdwebClient = createThirdwebClient({
  clientId: UNICORN_CLIENT_ID,
});

export const unicornConfig = {
  clientId: UNICORN_CLIENT_ID,
  factoryAddress: UNICORN_FACTORY_ADDRESS,
  isEnabled: process.env.NEXT_PUBLIC_UNICORN_ENABLED !== 'false',
  debugMode: process.env.NEXT_PUBLIC_UNICORN_DEBUG === 'true',
  iconUrl: process.env.NEXT_PUBLIC_UNICORN_ICON_URL || '/unicorn-icon.png',
  priorityNetworks: process.env.NEXT_PUBLIC_UNICORN_PRIORITY_NETWORKS 
    ? process.env.NEXT_PUBLIC_UNICORN_PRIORITY_NETWORKS.split(',').map(Number)
    : UNICORN_PRIORITY_NETWORKS,
} as const;

/**
 * Priority networks for Unicorn integration
 * Mainnet first (high-value streams), then other major networks
 */
const UNICORN_PRIORITY_NETWORKS = [
  1,    // Ethereum Mainnet - highest priority for big streams
  137,  // Polygon - lowest gas, high adoption
  10,   // Optimism - L2 scaling
  42161, // Arbitrum One - L2 scaling
  8453, // Base - growing ecosystem
  100,  // Gnosis - stable ecosystem
  // Add other Superfluid networks as needed
];

/**
 * Creates a Unicorn connector for a specific Superfluid network
 */
export const createUnicornConnector = (network: Network) => {
  return inAppWalletConnector({
    client: thirdwebClient,
    smartAccount: {
      sponsorGas: true, // This is HUGE for mainnet where gas is expensive!
      chain: defineChain(network.id),
      factoryAddress: UNICORN_FACTORY_ADDRESS,
    },
    metadata: {
      name: `Unicorn.eth${network.isTestNetwork ? ' (Testnet)' : ''}`,
      description: `Smart Account Wallet on ${network.displayName}`,
      icon: '/unicorn-icon.svg', // You'll need to add this
      image: {
        src: '/unicorn-icon.svg',
        alt: `Unicorn.eth on ${network.displayName}`,
        height: 64,
        width: 64,
      },
    },
  });
};

/**
 * Creates Unicorn connectors for Superfluid networks
 * Prioritizes mainnet and major networks, includes testnets in dev
 */
export const createUnicornConnectors = () => {
  // Check if Unicorn integration is enabled
  if (!unicornConfig.isEnabled) {
    console.log('🦄 Unicorn integration is disabled via environment variable');
    return [];
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  return allNetworks
    .filter(network => {
      if (isProduction) {
        return !network.isTestNetwork && unicornConfig.priorityNetworks.includes(network.id);
      }
      return true;
    })
    .sort((a, b) => {
      const aPriority = unicornConfig.priorityNetworks.indexOf(a.id);
      const bPriority = unicornConfig.priorityNetworks.indexOf(b.id);
      
      if (aPriority === -1 && bPriority === -1) return 0;
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      return aPriority - bPriority;
    })
    .map(network => 
      inAppWalletConnector({
        client: thirdwebClient,
        smartAccount: {
          sponsorGas: true,
          chain: defineChain(network.id),
          factoryAddress: unicornConfig.factoryAddress,
        },
        metadata: {
          name: `Unicorn.eth${network.isTestNetwork ? ' (Testnet)' : ''}`,
          description: `Smart Account Wallet on ${network.displayName}`,
          icon: unicornConfig.iconUrl,
          image: {
            src: unicornConfig.iconUrl,
            alt: `Unicorn.eth on ${network.displayName}`,
            height: 64,
            width: 64,
          },
        },
      })
    );
};

/**
 * Detects if user is coming from Unicorn App Center
 */
export const detectUnicornConnection = () => {
  if (typeof window === 'undefined') return { isFromUnicorn: false };
  
  const urlParams = new URLSearchParams(window.location.search);
  const walletId = urlParams.get('walletId');
  const authCookie = urlParams.get('authCookie');
  
  return {
    isFromUnicorn: walletId === 'inApp' && !!authCookie,
    authCookie,
    shouldAutoConnect: walletId === 'inApp' && !!authCookie,
    // Clean URL after detection (optional)
    cleanUrl: () => {
      if (walletId || authCookie) {
        const url = new URL(window.location.href);
        url.searchParams.delete('walletId');
        url.searchParams.delete('authCookie');
        window.history.replaceState({}, '', url.toString());
      }
    }
  };
};

/**
 * Helper to check if a connector is a Unicorn connector
 */
export const isUnicornConnector = (connectorName?: string) => {
  return connectorName?.includes('Unicorn.eth') || false;
};

/**
 * Get networks supported by Unicorn integration
 */
export const getUnicornSupportedNetworks = (): Network[] => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return allNetworks.filter(network => {
    if (isProduction) {
      return !network.isTestNetwork && UNICORN_PRIORITY_NETWORKS.includes(network.id);
    }
    return true;
  });
};

/**
 * Debug helper - logs all created Unicorn connectors
 */
export const debugUnicornSetup = () => {
  const connectors = createUnicornConnectors();
  const supportedNetworks = getUnicornSupportedNetworks();
  
  console.log('🦄 Unicorn Integration Setup:');
  console.log(`  Environment: ${process.env.NODE_ENV}`);
  console.log(`  Enabled: ${unicornConfig.isEnabled}`);
  console.log(`  Debug Mode: ${unicornConfig.debugMode}`);
  console.log(`  Client ID: ${unicornConfig.clientId} (${process.env.NEXT_PUBLIC_UNICORN_CLIENT_ID ? 'custom' : 'default'})`);
  console.log(`  Factory Address: ${unicornConfig.factoryAddress} (${process.env.NEXT_PUBLIC_UNICORN_FACTORY_ADDRESS ? 'custom' : 'default'})`);
  console.log(`  Icon URL: ${unicornConfig.iconUrl}`);
  console.log(`  Priority Networks: [${unicornConfig.priorityNetworks.join(', ')}]`);
  console.log(`  Supported Networks: ${supportedNetworks.length}`);
  console.log(`  Created Connectors: ${connectors.length}`);
  
  if (unicornConfig.debugMode) {
    supportedNetworks.forEach((network, index) => {
      const priority = unicornConfig.priorityNetworks.indexOf(network.id);
      console.log(`    ${index + 1}. ${network.displayName} (ID: ${network.id}, Priority: ${priority >= 0 ? priority + 1 : 'N/A'})`);
    });
  }
  
  return { connectors, supportedNetworks, config: unicornConfig };
};
export function createConnectorsWithUnicorn() {
  const connectors = [];
  
  // Add your existing connectors
  // connectors.push(...existingConnectors);
  
  // Conditionally add Unicorn connectors
  if (unicornConfig.isEnabled) {
    const unicornConnectors = createUnicornConnectors();
    
    if (unicornConfig.debugMode) {
      console.log(`🦄 Adding ${unicornConnectors.length} Unicorn connectors`);
    }
    
    // Add at beginning for priority
    connectors.unshift(...unicornConnectors);
  } else if (unicornConfig.debugMode) {
    console.log('🦄 Unicorn integration disabled via environment variable');
  }
  
  return connectors;
}

// Export the client for advanced usage
export { thirdwebClient };