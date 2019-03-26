import { axios } from 'choerodon-front-boot';
import { getProjectId, getOrganizationId } from '../common/utils';

export function loadBoardData(boardId, quickSearchObj = {}) {
  const {
    onlyMe, onlyStory, quickSearchArray, assigneeFilterIds,
  } = quickSearchObj;
  return axios.get(`/agile/v1/projects/${getProjectId()}/board/${boardId}/all_data_program/${getOrganizationId()}?quickFilterIds=${quickSearchArray || []}`);
}
