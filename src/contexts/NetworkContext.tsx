import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isOnline: boolean;
}

// Defaults to true so the UI doesn't flash an "offline" state before the
// first NetInfo event arrives.
const NetworkContext = createContext<NetworkContextType>({ isOnline: true });

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected = has a network interface; isInternetReachable = that
      // interface can actually reach the internet (null while undetermined,
      // e.g. right after the listener attaches — treat that as still online).
      setIsOnline(Boolean(state.isConnected) && state.isInternetReachable !== false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetworkContext(): NetworkContextType {
  return useContext(NetworkContext);
}
