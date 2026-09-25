import { useContext } from 'react';
import { StoreContext } from './storeContext';

export function useStore() {
  return useContext(StoreContext);
}
