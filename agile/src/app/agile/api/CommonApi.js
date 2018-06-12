import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

export function getCurrentOrg() {
  const organizationId = AppState.currentMenuType.organizationId;
  return axios.get(`/iam/v1/organizations/${organizationId}`);
}

export function getSelf() {
  return axios.get('/iam/v1/users/self');
}

export function getUsers(param) {
  const projectId = AppState.currentMenuType.id;
  if (param) {
    return axios.get(`/iam/v1/projects/${projectId}/users?param=${param}`);
  }
  return axios.get(`/iam/v1/projects/${projectId}/users`);
}

export function getUser(userId) {
  const organizationId = AppState.currentMenuType.organizationId;
  return axios.get(`/iam/v1/organizations/${organizationId}/users/${userId}`);
}
