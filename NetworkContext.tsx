// store/NetworkContext.tsx

import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type NetworkContextType = {
  isOnline: boolean;
  isChecking: boolean;
  refreshConnection: () => Promise<boolean>;
};

const NetworkContext = createContext<NetworkContextType | null>(null);

const getOnlineStatus = (state: NetInfoState) => {
  /**
   * isConnected means the phone has a network connection.
   * isInternetReachable means that connection can actually reach the internet.
   */
  if (state.isConnected === false) return false;

  if (state.isInternetReachable === false) return false;

  /**
   * Sometimes isInternetReachable can be null at first.
   * If isConnected is true and reachable is not false, we allow it.
   */
  return Boolean(state.isConnected);
};

export function NetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  const refreshConnection = useCallback(async () => {
    try {
      setIsChecking(true);

      const state = await NetInfo.fetch();
      const online = getOnlineStatus(state);

      setIsOnline(online);

      return online;
    } catch (error) {
      console.log("NETWORK CHECK ERROR:", error);

      setIsOnline(false);

      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkInitialConnection = async () => {
      try {
        const state = await NetInfo.fetch();

        if (!mounted) return;

        setIsOnline(getOnlineStatus(state));
      } catch (error) {
        console.log("INITIAL NETWORK CHECK ERROR:", error);

        if (mounted) {
          setIsOnline(false);
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    checkInitialConnection();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!mounted) return;

      const online = getOnlineStatus(state);

      setIsOnline(online);
      setIsChecking(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      isOnline,
      isChecking,
      refreshConnection,
    }),
    [isOnline, isChecking, refreshConnection]
  );

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error("useNetwork must be used inside NetworkProvider");
  }

  return context;
}