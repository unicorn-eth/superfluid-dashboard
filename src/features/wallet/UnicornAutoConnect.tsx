/** 
 * Unicorn Integration Code added with love by @cryptowampum and Claude AI
 */

import { useEffect, useState, useCallback } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { detectUnicornConnection, isUnicornConnector } from './unicornIntegration';

interface UnicornAutoConnectProps {
  /**
   * Callback when Unicorn connection is attempted
   */
  onConnectAttempt?: () => void;
  
  /**
   * Callback when Unicorn connection succeeds
   */
  onConnectSuccess?: (address: string) => void;
  
  /**
   * Callback when Unicorn connection fails
   */
  onConnectError?: (error: Error) => void;
  
  /**
   * Whether to clean URL parameters after detection (default: true)
   */
  cleanUrlParams?: boolean;
}

export function UnicornAutoConnect({
  onConnectAttempt,
  onConnectSuccess,
  onConnectError,
  cleanUrlParams = true,
}: UnicornAutoConnectProps = {}) {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();
  const [hasAttemptedConnect, setHasAttemptedConnect] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const attemptUnicornConnection = useCallback(async () => {
    if (hasAttemptedConnect || isConnecting) {
      return;
    }

    const unicornDetection = detectUnicornConnection();
    
    if (!unicornDetection.isFromUnicorn) {
      setHasAttemptedConnect(true);
      return;
    }

    console.log('🦄 Unicorn App Center detected - attempting auto-connection...');
    
    // Find any Unicorn connector (they'll handle network detection automatically)
    const unicornConnector = connectors.find(connector => 
      isUnicornConnector(connector.name)
    );

    if (!unicornConnector) {
      console.warn('🦄 No Unicorn connectors found - check integration setup');
      setHasAttemptedConnect(true);
      onConnectError?.(new Error('No Unicorn connectors available'));
      return;
    }

    try {
      setIsConnecting(true);
      onConnectAttempt?.();
      
      // Attempt connection
      connect({ connector: unicornConnector });
      
      // Clean URL parameters if requested
      if (cleanUrlParams) {
        setTimeout(() => {
          unicornDetection.cleanUrl();
        }, 1000); // Small delay to avoid interfering with connection
      }
      
    } catch (error) {
      console.error('🦄 Unicorn auto-connection failed:', error);
      onConnectError?.(error as Error);
    } finally {
      setIsConnecting(false);
      setHasAttemptedConnect(true);
    }
  }, [connect, connectors, hasAttemptedConnect, isConnecting, onConnectAttempt, onConnectError, cleanUrlParams]);

  // Trigger auto-connection on mount
  useEffect(() => {
    attemptUnicornConnection();
  }, [attemptUnicornConnection]);

  // Handle successful connection
  useEffect(() => {
    if (isConnected && address && isConnecting) {
      console.log('🦄 Unicorn wallet connected successfully:', address);
      onConnectSuccess?.(address);
      setIsConnecting(false);
    }
  }, [isConnected, address, isConnecting, onConnectSuccess]);

  // This component doesn't render anything - it's purely functional
  return null;
}

export default UnicornAutoConnect;