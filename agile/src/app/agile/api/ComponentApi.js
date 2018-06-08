import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

export function loadComponents(componentId) {
  if (componentId) {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/component?componentId=${componentId}`);
  }
  return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/component`);
}

export function createComponent(obj) {
  const projectId = AppState.currentMenuType.id;
  const component = {
    projectId,
    ...obj,
  };
  return axios.post(
    `/agile/v1/project/${projectId}/component`,
    component,
  );
}

/**
 * ok
 * @param {*} componentId 
 * @param {*} obj 
 */
export function updateComponent(componentId, obj) {
  const projectId = AppState.currentMenuType.id;
  const component = {
    projectId,
    ...obj,
  };
  return axios.put(
    `/agile/v1/project/${projectId}/component/${componentId}`,
    component,
  );
}

export function loadComponent(componentId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`agile/v1/project/${projectId}/component/${componentId}`);
}

export function deleteComponent(componentId, relateComponentId) {
  const projectId = AppState.currentMenuType.id;
  if (relateComponentId === 0) {
    return axios.delete(`/agile/v1/project/${projectId}/component/${componentId}`);
  }
  return axios.delete(`/agile/v1/project/${projectId}/component/${componentId}?relateComponentId=${relateComponentId}`);
}
