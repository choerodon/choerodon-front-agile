import {
  observable, action, computed, toJS,
} from 'mobx';
import axios from 'axios';
import _ from 'lodash';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('ScrumBoardStore')
class ScrumBoardStore {
  @observable dragStartItem = {};

  @observable boardData = [];

  @observable parentIds = [];

  @observable statusCategory = {};

  @observable boardList = [];

  @observable selectedBoard = '';

  @observable unParentIds = [];

  @observable lookupValue = {
    constraint: [],
  }

  @observable currentConstraint = '';

  @observable currentSprint = {};

  @observable clickIssueDetail = {};

  @observable IssueNumberCount = {};

  @observable assigneer = [];

  @observable swimlaneBasedCode = '';

  @observable quickSearchList = [];

  @observable epicData = [];

  @observable allEpicData = [];

  @observable statusList = [];

  @observable workSetting = {
    saturdayWork: false,
    sundayWork: false,
    useHoliday: false,
    timeZoneWorkCalendarDTOS: [],
    workHolidayCalendarDTOS: [],
  };

  @observable workDate = false;

  @observable issueTypes = [];

  @observable canAddStatus = true;

  @computed get getCanAddStatus() {
    return this.canAddStatus;
  }

  @action setCanAddStatus(data) {
    this.canAddStatus = data;
  }

  axiosCanAddStatus() {
    axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/schemes/check_create_status_for_agile`)
      .then((data) => {
        this.setCanAddStatus(data);
      })
      .catch((e) => {
        Choerodon.prompt(e.message);
      });
  }

  @computed get getStatusList() {
    return this.statusList.slice();
  }

  @action setStatusList(data) {
    this.statusList = data;
  }

  @computed get getAllEpicData() {
    return toJS(this.allEpicData);
  }

  @action setAllEpicData(data) {
    this.allEpicData = data;
  }

  axiosGetAllEpicData() {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epics?organizationId=${orgId}`);
  }

  @computed get getEpicData() {
    return toJS(this.epicData);
  }

  @action setEpicData(data) {
    this.epicData = data;
  }

  @computed get getQuickSearchList() {
    return toJS(this.quickSearchList);
  }

  @action setQuickSearchList(data) {
    this.quickSearchList = data;
  }

  axiosGetQuickSearchList() {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`);
  }

  @computed get getSwimLaneCode() {
    return this.swimlaneBasedCode;
  }

  @action setSwimLaneCode(data) {
    this.swimlaneBasedCode = data;
  }

  @computed get getAssigneer() {
    return toJS(this.assigneer);
  }

  @action setAssigneer(data) {
    this.assigneer = data;
  }

  judgeMoveParentToDone(parentCategoryCode, parentId) {
    if (parentCategoryCode !== 'done') {
      const data = this.boardData;
      let subTasks = [];
      for (let index = 0, len = data.length; index < len; index += 1) {
        for (let index2 = 0, len2 = data[index].subStatuses.length; index2 < len2; index2 += 1) {
          for (
            let index3 = 0, len3 = data[index].subStatuses[index2].issues.length;
            index3 < len3;
            index3 += 1
          ) {
            if (data[index].subStatuses[index2].issues[index3].parentIssueId === parentId) {
              subTasks.push({
                categoryCode: data[index].subStatuses[index2].categoryCode,
                ...data[index].subStatuses[index2].issues[index3],
              });
            }
          }
        }
      }
      subTasks = _.uniqBy(subTasks, 'issueId');
      const end = _.remove(subTasks, n => n.categoryCode !== 'done');
      if (end.length === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  axiosUpdateIssueStatus(id, data) {
    return axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/${id}`, data);
  }

  axiosCheckRepeatName(name) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/board_column/check?statusName=${name}`);
  }

  axiosUpdateMaxMinNum(columnId, data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/board_column/${columnId}/column_contraint`, data);
  }

  @computed get getIssueNumberCount() {
    return toJS(this.IssueNumberCount);
  }

  @action setIssueNumberCount(data) {
    this.IssueNumberCount = data;
  }

  @computed get getClickIssueDetail() {
    return toJS(this.clickIssueDetail);
  }

  @action setClickIssueDetail(data) {
    this.clickIssueDetail = data;
  }

  @computed get getCurrentSprint() {
    return toJS(this.currentSprint);
  }

  @action setCurrentSprint(data) {
    this.currentSprint = data;
  }

  axiosCreateBoard(name) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/board?boardName=${name}`);
  }

  axiosDeleteBoard() {
    return axios.delete(`/agile/v1/projects/${AppState.currentMenuType.id}/board/${this.selectedBoard}`);
  }

  axiosUpdateBoardDefault(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/board/user_setting/${data.boardId}?swimlaneBasedCode=${data.swimlaneBasedCode}`, {});
  }

  axiosUpdateBoard(data) {
    return axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/board/${this.selectedBoard}`, data);
  }

  @computed get getCurrentConstraint() {
    return this.currentConstraint;
  }

  @action setCurrentConstraint(data) {
    this.currentConstraint = data;
  }

  axiosGetLookupValue(code) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/${code}`);
  }

  @computed get getLookupValue() {
    return toJS(this.lookupValue);
  }

  @action setLookupValue(data) {
    this.lookupValue = data;
  }

  @computed get getUnParentIds() {
    return toJS(this.unParentIds);
  }

  @action setUnParentIds(data) {
    this.unParentIds = data;
  }

  axiosUpdateColumn(columnId, data, boardId) {
    return axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/board_column/${columnId}?boardId=${boardId}`, data);
  }

  @computed get getSelectedBoard() {
    return this.selectedBoard;
  }

  @action setSelectedBoard(data) {
    this.selectedBoard = data;
  }

  @computed get getBoardList() {
    return toJS(this.boardList);
  }

  @action setBoardList(data) {
    this.boardList = data;
  }

  axiosGetBoardList() {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/board`);
  }

  @computed get getStatusCategory() {
    return toJS(this.statusCategory);
  }

  @action setStatusCategory(data) {
    this.statusCategory = data;
  }

  axiosGetStatusCategory() {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/status_category`);
  }

  @computed get getParentIds() {
    return toJS(this.parentIds);
  }

  @action setParentIds(data) {
    this.parentIds = data;
  }

  @computed get getBoardData() {
    return toJS(this.boardData);
  }

  @action setBoardData(data) {
    this.boardData = data;
  }

  axiosUpdateColumnSequence(boardId, data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/board_column/column_sort`, data);
  }

  axiosDeleteColumn(columnId) {
    return axios.delete(`/agile/v1/projects/${AppState.currentMenuType.id}/board_column/${columnId}`);
  }

  axiosAddColumn(categoryCode, data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/board_column?categoryCode=${categoryCode}`, data);
  }

  axiosAddStatus(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status`, data);
  }

  axiosGetBoardDataBySetting(boardId) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/board/${boardId}/all_data/${AppState.currentMenuType.organizationId}`);
  }

  axiosGetBoardData(boardId, assign, recent, filter) {
    if (assign === 0) {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/board/${boardId}/all_data/${AppState.currentMenuType.organizationId}?onlyStory=${recent}&quickFilterIds=${filter}`);
    } else {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/board/${boardId}/all_data/${AppState.currentMenuType.organizationId}?assigneeId=${assign}&onlyStory=${recent}&quickFilterIds=${filter}`);
    }
  }

  axiosFilterBoardData(boardId, assign, recent) {
    if (assign === 0) {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/board/${boardId}/all_data/${AppState.currentMenuType.organizationId}?onlyStory=${recent}`);
    } else {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/board/${boardId}/all_data/${AppState.currentMenuType.organizationId}?assigneeId=${assign}&onlyStory=${recent}`);
    }
  }

  axiosGetUnsetData(boardId) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/list_by_options?boardId=${boardId}`);
  }

  axiosDeleteStatus(code) {
    return axios.delete(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/${code}`);
  }

  updateIssue(
    issueId, objectVersionNumber, endStatusId, boardId, originColumnId, columnId, transformId,
  ) {
    const proId = AppState.currentMenuType.id;
    const data = {
      issueId,
      objectVersionNumber,
      statusId: endStatusId,
      boardId,
      originColumnId,
      columnId,
    };
    return axios.post(`/agile/v1/projects/${proId}/board/issue/${issueId}/move?transformId=${transformId}`, data);
  }

  moveStatusToUnset(code, data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/${code}/move_to_uncorrespond`, data);
  }

  moveStatusToColumn(code, data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/${code}/move_to_column`, data);
  }

  @computed get getDragStartItem() {
    return this.dragStartItem;
  }

  @action setDragStartItem(data) {
    this.dragStartItem = data;
  }

  @action setWorkSetting(data) {
    this.workSetting = data;
  }

  @computed get getWorkSetting() {
    return this.workSetting;
  }

  // 查询组织层工作日历设置
  axiosGetWorkSetting(year) {
    const proId = AppState.currentMenuType.id;
    const orgId = AppState.currentMenuType.organizationId;
    return axios.get(`/agile/v1/projects/${proId}/sprint/time_zone_detail/${orgId}?year=${year}`).then((data) => {
      if (data) {
        this.setWorkSetting(data);
      }
    });
  }

  axiosDeleteCalendarData(calendarId) {
    const proId = AppState.currentMenuType.id;
    return axios.delete(`/agile/v1/projects/${proId}/sprint/work_calendar/${calendarId}`);
  }

  axiosCreateCalendarData(sprintId, data) {
    const proId = AppState.currentMenuType.id;
    return axios.post(`/agile/v1/projects/${proId}/sprint/work_calendar_create/${sprintId}`, data);
  }

  @action setWorkDate(data) {
    this.workDate = data;
  }

  @computed get getWorkDate() {
    return this.workDate;
  }

  // 获取项目层工作日历
  axiosGetCalendarData = (year) => {
    const proId = AppState.currentMenuType.id;
    return axios.get(`/agile/v1/projects/${proId}/sprint/work_calendar?year=${year}`).then((data) => {
      if (data) {
        this.setWorkDate(data);
      } else {
        this.setWorkDate(false);
      }
    }).catch(() => {
      this.setWorkDate(false);
    });
  };

  @computed get getIssueTypes() {
    return this.issueTypes.slice();
  }

  @action setIssueTypes(data) {
    this.issueTypes = data;
  }

  axiosGetIssueTypes() {
    const proId = AppState.currentMenuType.id;
    return axios.get(`/issue/v1/projects/${proId}/schemes/query_issue_types_with_sm_id?apply_type=agile`).then((data) => {
      if (data && !data.failed) {
        this.setIssueTypes(data);
      } else {
        this.setIssueTypes([]);
      }
    });
  }

  loadTransforms(statusId, issueId, typeId) {
    const projectId = AppState.currentMenuType.id;
    return axios.get(
      `/issue/v1/projects/${projectId}/schemes/query_transforms?current_status_id=${statusId}&issue_id=${issueId}&issue_type_id=${typeId}&apply_type=agile`,
    );
  }

  loadStatus = () => {
    const projectId = AppState.currentMenuType.id;
    axios.get(`/issue/v1/projects/${projectId}/schemes/query_status_by_project_id?apply_type=agile`).then((data) => {
      if (data && !data.failed) {
        this.setStatusList(data);
      } else {
        this.setStatusList([]);
      }
    }).catch(() => {
      this.setStatusList([]);
    });
  };

  axiosUpdateIssue(data) {
    const proId = AppState.currentMenuType.id;
    const { issueId, objectVersionNumber, transformId } = data;
    return axios.put(`/agile/v1/projects/${proId}/issues/update_status?applyType=agile&transformId=${transformId}&issueId=${issueId}&objectVersionNumber=${objectVersionNumber}`);
  }
}

const scrumBoardStore = new ScrumBoardStore();
export default scrumBoardStore;
