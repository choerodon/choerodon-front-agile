import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

export function createIssue(issueObj, projectId = AppState.currentMenuType.id) {
  const issue = {
    projectId,
    ...issueObj,
  };
  return axios.post(`/agile/v1/project/${projectId}/issues`, issue);
}

export function loadLabels() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/project/${projectId}/issue_labels`,
  );
}

export function loadVersions() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/agile/v1/project/${projectId}/product_version/names`);
}

export function createCommit(commitObj, projectId = AppState.currentMenuType.id) {
  return axios.post(`/agile/v1/project/${projectId}/issue_comment`, commitObj);
}

export function updateCommit(commitObj, projectId = AppState.currentMenuType.id) {
  return axios.post(`/agile/v1/project/${projectId}/issue_comment/update`, commitObj);
}

export function deleteCommit(commitId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`/agile/v1/project/${projectId}/issue_comment/${commitId}`);
}

export function loadComponents() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/project/${projectId}/component`,
  );
}

export function loadEpics() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/project/${projectId}/issues/epics/select_data`,
  );
}

export function loadSprints() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/project/${projectId}/sprint/names `,
  );
}

export function loadStatus() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/project/${projectId}/issue_status/list`,
  );
}

export function loadPriorities() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(
    `/agile/v1/project/${projectId}/lookup_values/priority`,
  );
}

export function loadIssue(issueId, projectId = AppState.currentMenuType.id) {
  return axios.get(`/agile/v1/project/${projectId}/issues/${issueId}`);
}

export function loadSubtask(issueId, projectId = AppState.currentMenuType.id) {
  return axios.get(`agile/v1/project/${projectId}/issues/sub_issue/${issueId}`);
}

export function updateIssue(data, projectId = AppState.currentMenuType.id) {
  // if (type === 'sub_task') {
  //   return axios.put(`agile/v1/project/${projectId}/issues/sub_issue`, data);
  // }
  return axios.put(`/agile/v1/project/${projectId}/issues`, data);
}

export function createSubIssue(issueId, obj, projectId = AppState.currentMenuType.id) {
  const subIssueObj = {
    ...obj,
    parentIssueId: issueId,
  };
  return axios.post(`/agile/v1/project/${projectId}/issues/sub_issue`, subIssueObj);
}

export function deleteIssue(issueId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`/agile/v1/project/${projectId}/issues/${issueId}`);
}

export function createWorklog(data, projectId = AppState.currentMenuType.id) {
  return axios.post(`/agile/v1/project/${projectId}/work_log`, data);
}

export function loadWorklogs(issueId, projectId = AppState.currentMenuType.id) {
  return axios.get(`agile/v1/project/${projectId}/work_log/issue/${issueId}`);
}

export function updateWorklog(logId, worklog, projectId = AppState.currentMenuType.id) {
  return axios.patch(`agile/v1/project/${projectId}/work_log/${logId}`, worklog);
}

export function deleteWorklog(logId, projectId = AppState.currentMenuType.id) {
  return axios.delete(`agile/v1/project/${projectId}/work_log/${logId}`);
}

export function updateIssueType(data, projectId = AppState.currentMenuType.id) {
  const issueUpdateTypeDTO = {
    projectId,
    ...data,
  };
  return axios.post(`/agile/v1/project/${projectId}/issues/update_type`, issueUpdateTypeDTO);
}

export function loadIssues(page = 0, size = 10, searchDTO, orderField, orderType) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/agile/v1/project/${projectId}/issues/no_sub?page=${page}&size=${size}`, searchDTO, {
    params: {
      sort: `${orderField && orderType ? `${orderField},${orderType}` : ''}`,
    },
  });
}
