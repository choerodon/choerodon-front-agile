import { stores, axios } from 'choerodon-front-boot';
import { getProjectId, getOrganizationId } from '../common/utils';

const { AppState } = stores;

export function getSelf() {
  return axios.get('/iam/v1/users/self');
}

export function getUsers(param) {
  const projectId = AppState.currentMenuType.id;
  if (param) {
    return axios.get(`/iam/v1/projects/${projectId}/users?param=${param}`);
  }
  return axios.get(`/iam/v1/projects/${projectId}/users?size=40`);
}

export function getUser(userId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`iam/v1/projects/${projectId}/users?id=${userId}`);
}
export function getProjectsInProgram() {
  return axios.get(`iam/v1/organizations/${getOrganizationId()}/project_relations/${getProjectId()}`);
}
