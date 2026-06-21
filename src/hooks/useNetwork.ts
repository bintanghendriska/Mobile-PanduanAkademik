import { useNetworkContext } from '../contexts/NetworkContext';

export function useNetwork() {
  return useNetworkContext();
}
