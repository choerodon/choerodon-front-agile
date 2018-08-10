import { observable, action, computed, toJS } from 'mobx';
import axios from 'axios';
import _ from 'lodash';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('UserMapStore')
class UserMapStore {
  @observable epics= [];
  @observable filters= [];
  @observable currentFilters = [];
  @observable sprints = [];
  @observable versions = [];
  @observable issues = [];
  @observable mode = 'none';
  @observable createEpic = false;


  @action setEpics(data) {
    this.epics = data;
  }

  @computed get getEpics() {
    return this.epics;
  }

  @action setFilters(data) {
    this.filters = data;
  }

  @computed get getFilters() {
    return this.filters;
  }

  @action setCurrentFilter(data) {
    this.currentFilters = data;
  }

  @computed get getCurrentFilter() {
    return this.currentFilters;
  }

  @action setSprints(data) {
    this.sprints = data;
  }

  @computed get getSprints() {
    return this.sprints;
  }
  @action setVersions(data) {
    this.versions = data;
  }

  @computed get getVersion() {
    return this.versions;
  }

  @action setIssues(data) {
    this.issues = data;
  }

  @computed get getIssues() {
    return this.issues;
  }

  @action setMode(data) {
    this.mode = data;
  }

  @computed get getMode() {
    return this.mode;
  }

  @action setCreateEpic(data) {
    this.createEpic = data;
  }

  @computed get getCreateEpic() {
    return this.createEpic;
  }


  loadEpic = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epics`)
    .then((epics) => {
      this.setEpics(epics);
    });

  loadFilters = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`)
    .then((filters) => {
      this.setFilters(filters);
    });
  loadIssues = (type, pageType) => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/user_map/issues?type=${type}&pageType=${pageType}`)
    .then((issues) => {
      this.setIssues(issues);
    });

  initData = (type = 'none', pageType = 'usermap') => axios.all([axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epics`), axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`), axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/user_map/issues?type=${type}&pageType=${pageType}`)])
    .then(axios.spread((epics, filters, issues) => {
      this.setFilters(filters);
      this.setEpics(epics);
      this.setIssues(issues);
      // 两个请求现在都执行完成
    }));
}

const userMapStore = new UserMapStore();
export default userMapStore;
