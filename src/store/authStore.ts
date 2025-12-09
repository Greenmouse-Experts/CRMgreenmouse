import { atomWithStorage } from "jotai/utils";
import { useAtom, useStore } from "jotai/react";
import { getDefaultStore } from "jotai/vanilla";
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  countryId: number;
  phone: string;
  address: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  access_token: string;
  refresh_token: string;
}
const stored = localStorage.getItem("user");
export const user_atom = atomWithStorage<User | null>(
  "user",
  stored ? JSON.parse(stored) : null,
);
export const useAuth = () => {
  const [user, setUser] = useAtom(user_atom);
  return [user, setUser] as const;
};

export const get_user_value = () => {
  const store = getDefaultStore();
  return store.get(user_atom);
};

export const clear_user = () => {
  const store = getDefaultStore();
  store.set(user_atom, null);
};

export const set_user_value = (user: User) => {
  const store = getDefaultStore();
  store.set(user_atom, user);
};
