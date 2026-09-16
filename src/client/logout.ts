import apiClient from "./api";

const logout = async () => {
  let resp = await apiClient.post("v1/tenant/auth/logout");
  return resp.data;
};

export default logout;
