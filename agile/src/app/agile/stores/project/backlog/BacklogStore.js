import axios from 'axios';
import {
  observable, action, computed, toJS, reaction,
} from 'mobx';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('BacklogStore')
class BacklogStore {
  @observable sprintData = {};

  @observable versionData = [];

  @observable epicData = [];

  @observable chosenVersion = 'all';

  @observable chosenEpic = 'all';

  @observable onlyMe = false;

  @observable recent = false;

  @observable isDragging = false;

  @observable isLeaveSprint = false;

  @observable clickIssueDetail = {};

  @observable sprintCompleteMessage = {};

  @observable openSprintDetail = {};

  @observable sprintWidth;

  @observable colorLookupValue = [];

  @observable quickFilters = [];

  @observable projectInfo = {};

  @observable quickSearchList = [];

  @observable selectIssues = [];

  @observable more = false;

  @observable workSetting = {
    saturdayWork: false,
    sundayWork: false,
    useHoliday: false,
    timeZoneWorkCalendarDTOS: [],
    workHolidayCalendarDTOS: [],
  };


  @computed get asJson() {
    return {
      sprintData: this.sprintData,
      versionData: this.versionData,
      epicData: this.epicData,
      chosenVersion: this.chosenVersion,
      chosenEpic: this.chosenEpic,
      onlyMe: this.onlyMe,
      recent: this.recent,
      isDragging: this.isDragging,
      isLeaveSprint: this.isLeaveSprint,
      clickIssueDetail: this.clickIssueDetail,
      sprintCompleteMessage: this.sprintCompleteMessage,
      openSprintDetail: this.openSprintDetail,
      sprintWidth: this.sprintWidth,
      colorLookupValue: this.colorLookupValue,
      quickFilters: this.quickFilters,
      projectInfo: this.projectInfo,
      quickSearchList: this.quickSearchList,
      selectIssues: this.selectIssues,
    };
  }

  saveHandler = reaction(
    // 观察在 JSON 中使用了的任何东西:
    () => this.asJson,
    // 如何 autoSave 为 true, 把 json 发送到服务端
    (json, reactions) => {
      reactions.dispose();
    },
  );

  dispose() {
    // 清理观察者
    this.saveHandler();
  }

  @computed get getSelectIssue() {
    return this.selectIssues;
  }

  @action setSelectIssue(data) {
    this.selectIssues = data;
  }

  @computed get getProjectInfo() {
    return toJS(this.projectInfo);
  }

  @action setProjectInfo(data) {
    this.projectInfo = data;
  }

  axiosGetProjectInfo() {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`);
  }

  @computed get getQuickFilters() {
    return toJS(this.quickFilters);
  }

  @action setQuickFilters(data) {
    this.quickFilters = data;
  }

  getSprintFilter() {
    const data = {
      advancedSearchArgs: {},
    };
    if (this.chosenEpic !== 'all') {
      if (this.chosenEpic === 'unset') {
        data.advancedSearchArgs.noEpic = 'true';
      } else {
        data.advancedSearchArgs.epicId = this.chosenEpic;
      }
    }
    if (this.chosenVersion !== 'all') {
      if (this.chosenVersion === 'unset') {
        data.advancedSearchArgs.noVersion = 'true';
      } else {
        data.advancedSearchArgs.versionId = this.chosenVersion;
      }
    }
    if (this.onlyMe) {
      data.advancedSearchArgs.ownIssue = 'true';
    }
    if (this.recent) {
      data.advancedSearchArgs.onlyStory = 'true';
    }
    return data;
  }

  @action clearSprintFilter() {
    this.chosenEpic = 'all';
    this.chosenVersion = 'all';
    this.onlyMe = false;
    this.recent = false;
    this.quickFilters = [];
  }

  axiosDeleteSprint(id) {
    return axios.delete(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/${id}`);
  }

  axiosGetColorLookupValue() {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/epic_color`);
  }

  @computed get getColorLookupValue() {
    return toJS(this.colorLookupValue);
  }

  @action setColorLookupValue(data) {
    this.colorLookupValue = data;
  }

  @computed get getSprintWidth() {
    return this.sprintWidth;
  }

  @action setSprintWidth() {
    this.sprintWidth = document.getElementsByClassName('c7n-backlog-sprint')[0].offsetWidth;
  }

  axiosGetIssueDetail(issueId) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/${issueId}`);
  }

  @computed get getOpenSprintDetail() {
    return toJS(this.openSprintDetail);
  }

  @action setOpenSprintDetail(data) {
    this.openSprintDetail = data;
  }

  axiosGetOpenSprintDetail(sprintId) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/${sprintId}`);
  }

  axiosStartSprint(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/start`, data);
  }

  axiosCloseSprint(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/complete`, data);
  }

  @computed get getSprintCompleteMessage() {
    return toJS(this.sprintCompleteMessage);
  }

  @action setSprintCompleteMessage(data) {
    this.sprintCompleteMessage = data;
  }

  axiosGetSprintCompleteMessage(sprintId) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/${sprintId}/names`);
  }

  axiosEasyCreateIssue(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issues`, data);
  }

  @computed get getOnlyMe() {
    return this.onlyMe;
  }

  @action setOnlyMe(data) {
    this.onlyMe = data;
  }

  @computed get getRecent() {
    return this.recent;
  }

  @action setRecent(data) {
    this.recent = data;
  }

  axiosUpdateSprint(data) {
    return axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint`, data);
  }

  axiosUpdateVerison(versionId, data) {
    return axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${versionId}`, data);
  }

  @computed get getClickIssueDetail() {
    return toJS(this.clickIssueDetail);
  }

  @action setClickIssueDetail(data) {
    this.clickIssueDetail = data;
  }

  axiosUpdateIssuesToVersion(versionId, ids) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/to_version/${versionId}`, ids);
  }

  axiosUpdateIssuesToEpic(epicId, ids) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/to_epic/${epicId}`, ids);
  }

  @computed get getIsLeaveSprint() {
    return this.isLeaveSprint;
  }

  @action setIsLeaveSprint(data) {
    this.isLeaveSprint = data;
  }

  @computed get getIsDragging() {
    return this.isDragging;
  }

  @action setIsDragging(data) {
    this.isDragging = data;
  }

  axiosCreateSprint(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint`, data);
  }

  axiosUpdateIssuesToSprint(sprintId, data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/to_sprint/${sprintId}`, data);
  }

  axiosUpdateIssue(data) {
    return axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/issues`, data);
  }

  @computed get getChosenVersion() {
    return toJS(this.chosenVersion);
  }

  @action setChosenVersion(data) {
    this.chosenVersion = data;
  }

  @computed get getChosenEpic() {
    return toJS(this.chosenEpic);
  }

  @action setChosenEpic(data) {
    this.chosenEpic = data;
  }

  @computed get getEpicData() {
    return toJS(this.epicData);
  }

  @action setEpicData(data) {
    this.epicData = data;
  }

  axiosGetEpic() {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epics`);
  }

  @computed get getVersionData() {
    return toJS(this.versionData);
  }

  @action setVersionData(data) {
    this.versionData = data;
  }

  axiosGetVersion() {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version`);
  }

  @computed get getSprintData() {
    return toJS(this.sprintData);
  }

  @action setSprintData(data) {
    let data1 = this.getSprintData;
    data1 = null;
    this.sprintData = data;
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

  axiosGetSprint(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/issues?quickFilterIds=${this.quickFilters}`, data);
  }

  handleEpicDrap = data => axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epic_drag`, data);


  handleVersionDrap = data => axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/drag`, data);

  @action setWorkSetting(data) {
    this.workSetting = data;
  }

  @computed get getWorkSetting() {
    return this.workSetting;
  }

  axiosGetWorkSetting(year) {
    const proId = AppState.currentMenuType.id;
    const orgId = AppState.currentMenuType.organizationId;
    axios.get(`/agile/v1/projects/${proId}/sprint/time_zone_detail/${orgId}?year=${year}`).then((data) => {
      if (data) {
        this.setWorkSetting(data);
      }
    });
  }

  @computed get getMore() {
    return this.more;
  }

  @action setMore() {
    this.more = !this.more;
  }
}

const backlogStore = new BacklogStore();
export default backlogStore;
