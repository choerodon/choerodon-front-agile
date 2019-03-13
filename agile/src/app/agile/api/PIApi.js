import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;
const projectId = AppState.currentMenuType.id;

/**
 * 获取PI列表
 */
export function getPIList() {
  return axios.get(`/agile/v1/projects/${projectId}/pi/list`);
}

/**
 * 获取单个PI的目标列表
 * @param {*} piId 
 */
export function getPIAims(piId) {
  return axios.get(`/agile/v1/projects/${projectId}/pi_objective/list?piId=${piId}`);
}

/**
 * 更新某个PI目标
 *
 * @export
 * @param {*} piObjectiveDTO
 * @returns
 */
export function upDatePIAmix(piObjectiveDTO) {
  return axios.put(`/agile/v1/projects/${projectId}/pi_objective`, piObjectiveDTO);
}


/**
 * 删除PI目标
 *
 * @export
 * @param {*} piId
 * @returns
 */
export function deletePIAims(piId) {
  return axios.delete(`/agile/v1/projects/${projectId}/pi_objective/${piId}`);
}

/**
 * 创建PI目标
 *
 * @export
 * @param {*} piObjectiveDTO
 * @returns
 */
export function createPIAims(piObjectiveDTO) {
  return axios.post(`/agile/v1/projects/${projectId}/pi_objective`, piObjectiveDTO);
}
