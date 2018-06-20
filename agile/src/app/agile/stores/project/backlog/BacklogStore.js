import axios from 'axios';
import { observable, action, computed, toJS } from 'mobx';
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

  axiosDeleteSprint(id) {
    return axios.delete(`/agile/v1/project/${AppState.currentMenuType.id}/sprint/${id}`);
  }

  axiosGetColorLookupValue() {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/lookup_values/epic_color`);
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
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/issues/${issueId}`);
  }

  @computed get getOpenSprintDetail() {
    return toJS(this.openSprintDetail);
  }

  @action setOpenSprintDetail(data) {
    this.openSprintDetail = data;
  }

  axiosGetOpenSprintDetail(sprintId) {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/sprint/${sprintId}`);
  }

  axiosStartSprint(data) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/sprint/start`, data);
  }

  axiosCloseSprint(data) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/sprint/complete`, data);
  }

  @computed get getSprintCompleteMessage() {
    return toJS(this.sprintCompleteMessage);
  }

  @action setSprintCompleteMessage(data) {
    this.sprintCompleteMessage = data;
  }

  axiosGetSprintCompleteMessage(sprintId) {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/sprint/${sprintId}/names`);
  }

  axiosEasyCreateIssue(data) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/issues`, data);
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
    return axios.put(`/agile/v1/project/${AppState.currentMenuType.id}/sprint`, data);
  }

  axiosUpdateVerison(versionId, data) {
    return axios.put(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/${versionId}`, data);
  }

  @computed get getClickIssueDetail() {
    return toJS(this.clickIssueDetail);
  }

  @action setClickIssueDetail(data) {
    this.clickIssueDetail = data;
  }

  axiosUpdateIssuesToVersion(versionId, ids) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/issues/to_version/${versionId}`, ids);
  }

  axiosUpdateIssuesToEpic(epicId, ids) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/issues/to_epic/${epicId}`, ids);
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
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/sprint`, data);
  }

  axiosUpdateIssuesToSprint(sprintId, data) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/issues/to_sprint/${sprintId}`, data);
  }

  axiosUpdateIssue(data) {
    return axios.put(`/agile/v1/project/${AppState.currentMenuType.id}/issues`, data);
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
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/issues/epics`);
  }

  @computed get getVersionData() {
    return toJS(this.versionData);
  }
  
  @action setVersionData(data) {
    this.versionData = data;
  }

  axiosGetVersion() {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/product_version`);
  }

  @computed get getSprintData() {
    return toJS(this.sprintData);
  }

  @action setSprintData(data) {
    this.sprintData = data;
  }

  axiosGetSprint(data) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/sprint/issues`, data);
  }
}

const backlogStore = new BacklogStore();
export default backlogStore;
