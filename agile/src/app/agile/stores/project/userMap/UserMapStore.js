import {
  observable, action, computed, toJS, 
} from 'mobx';
import axios from 'axios';
import _ from 'lodash';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('UserMapStore')
class UserMapStore {
  @observable
  epics = [];

  @observable
  showDoneEpic=false;

  @observable
  isApplyToEpic=false;

  @observable
  filters = [];

  @observable
  currentFilters = [];

  // @observable
  // currentBacklogFilters = [[], []];
  @observable
  sprints = [];

  @observable
  versions = [];

  @observable
  issues = [];

  @observable
  backlogIssues = [];

  @observable
  mode = 'none';

  @observable
  createEpic = false;

  @observable
  backlogExpand = [];

  @observable
  createVOS = false;

  @observable
  createVOSType='';

  @observable selectIssueIds = [];

  @observable currentDraggableId = null;

  @action
  setSelectIssueIds(data) {
    this.selectIssueIds = data;
  }

  @action
  setCurrentDraggableId(data) {
    this.currentDraggableId = data;
  }

  @action
  setEpics(data) {
    this.epics = data;
  }

  @observable currentBacklogFilters = [];

  @computed
  get getEpics() {
    return this.epics;
  }

  @action setShowDoneEpic(data) {
    this.showDoneEpic = data;
  }

  @computed get getShowDoneEpic() {
    return this.showDoneEpic;
  }

  @action setIsApplyToEpic(data) {
    this.isApplyToEpic = data;
  }

  @computed get getIsApplyToEpic() {
    return this.isApplyToEpic;
  }

  @action
  setFilters(data) {
    this.filters = data;
  }

  @computed
  get getFilters() {
    return this.filters;
  }
  

  @action
  setCurrentFilter(data) {
    this.currentFilters = data;
  }

  @computed
  get getCurrentFilter() {
    return this.currentFilters;
  }

  @action
  setSprints(data) {
    this.sprints = data;
  }

  @computed
  get getSprints() {
    return this.sprints;
  }

  @action
  setVersions(data) {
    this.versions = data;
  }

  @computed
  get getVersion() {
    return this.versions;
  }

  @action
  setIssues(data) {
    this.issues = data;
  }

  @computed
  get getIssues() {
    return this.issues;
  }

  @action
  setMode(data) {
    this.mode = data;
  }

  @computed
  get getMode() {
    return this.mode;
  }

  @action
  setCreateEpic(data) {
    this.createEpic = data;
  }

  @computed
  get getCreateEpic() {
    return this.createEpic;
  }

  @action
  setCreateVOS(data) {
    this.createVOS = data;
  }

  @computed
  get getCreateVOS() {
    return this.createVOS;
  }

  @action
  setCreateVOSType(data) {
    this.createVOSType = data;
  }

  @computed
  get getCreateVOSType() {
    return this.createVOSType;
  }
  
  @action
  setBacklogIssues(data) {
    this.backlogIssues = data;
  }

  @action
  setBacklogExpand(data) {
    this.backlogExpand = data;
  }

  @action
  setCurrentBacklogFilters(type, data) {
    this.currentBacklogFilters[type] = data;
  }

  @action setCurrentBacklogFilter(data) {
    this.currentBacklogFilters = data;
  }

  loadEpic = () => {
    let url = '';
    if (this.currentFilters.includes('mine')) {
      url += `&assigneeId=${AppState.getUserId}`;
    } 
    if (this.currentFilters.includes('userStory')) {
      url += '&onlyStory=true';
    }
    url += `&quickFilterIds=${this.currentFilters.filter(item => item !== 'mine' && item !== 'userStory')}`;
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/storymap/epics?showDoneEpic=${this.showDoneEpic}${this.isApplyToEpic ? url : ''}`)
      .then((epics) => {
        this.setEpics(epics);
      })
      .catch((error) => {
        Choerodon.handleResponseError(error);
      });
  };

  loadFilters = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`)
    .then((filters) => {
      this.setFilters(filters);
    });

  loadIssues = (pageType) => {
    // const url = `/agile/v1/projects/${AppState.currentMenuType.id}/issues/storymap/issues?type=${this.mode}&pageType=${pageType}&assigneeId=${this.currentFilters.includes('mime') ? AppState.getUserId : null}&onlyStory=${this.currentFilters.includes('userStory')}&quickFilterIds=${this.currentFilters.filter(item => item !== 'mime' || item !== 'userStory')}`;
    let url = '';
    if (this.currentFilters.includes('mine')) {
      url += `&assigneeId=${AppState.getUserId}`;
    } 
    if (this.currentFilters.includes('userStory')) {
      url += '&onlyStory=true';
    }
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/storymap/issues?type=${this.mode}&pageType=${pageType}&quickFilterIds=${this.currentFilters.filter(item => item !== 'mine' && item !== 'userStory')}${url}`)
      .then((issues) => {
        this.setIssues(issues);
      });
  }

  loadSprints = (data = []) => axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/sprint/names`, data)
    .then((sprints) => {
      this.setSprints(_.filter(sprints, item => !item.endDate));
    });

  loadVersions = () => axios
    .get(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version`)
    .then((versions) => {
      this.setVersions(versions);
    });

  initData = (pageType = 'usermap') => axios
    .all([
      axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/storymap/epics?showDoneEpic=${this.showDoneEpic}`),
      axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`),
      axios.get(
        `/agile/v1/projects/${
          AppState.currentMenuType.id
        }/issues/storymap/issues?type=${this.mode}&pageType=${pageType}`,
      ),
    ])
    .then(
      axios.spread((epics, filters, issues) => {
        this.setFilters(filters);
        this.setEpics(epics);
        this.setIssues(issues);
        // 两个请求现在都执行完成
      }),
    );

  getFiltersObj = (type = 'currentBacklogFilters') => {
    const filters = this[type];
    let [userId, onlyStory, filterIds] = [null, null, []];
    if (filters.includes('mine')) {
      userId = AppState.getUserId;
    }
    if (filters.includes('story')) {
      onlyStory = true;
    }
    filterIds = filters.filter(v => v !== 'mine' && v !== 'story');
    return {
      userId,
      onlyStory,
      filterIds,
    };
  };

  getQueryString = (filterObj) => {
    let query = '';
    if (filterObj.onlyStory) {
      query += '&onlyStory=true';
    }
    if (filterObj.userId) {
      query += `&assigneeId=${filterObj.userId}`;
    }
    if (Array.isArray(filterObj.filterIds) && filterObj.filterIds.length) {
      query += `&&quickFilterIds=${filterObj.filterIds.join(',')}`;
    }
    return query;
  };

  // loadBacklogIssues = () => {
  //   const projectId = AppState.currentMenuType.id;
  //   const type = this.mode;
  //   const userId = AppState.getUserId;
  //   const cFilter = this.currentBacklogFilters[1].join(',');
  //   const onlyStory = this.currentBacklogFilters[0].lastIndexOf('仅用户故事') > -1;
  //   const assigneeId = this.currentBacklogFilters[0].lastIndexOf('仅我的问题') > -1 ? userId : null;
  //   axios
  //     .get(
  //       `/agile/v1/projects/${projectId}/issues/storymap/issues?type=${type}&pageType=backlog${
  //         cFilter ? `&${`quickFilterIds=${cFilter}`}` : ''
  //       }${assigneeId ? `&assigneeId=${assigneeId}` : ''}${onlyStory ? '&onlyStory=true' : ''}`,
  //     )
  //     .then((res) => {
  //       this.setBacklogIssues(res);
  //       this.setBacklogExpand([]);
  //     });
  // };

  loadBacklogIssues = () => {
    const projectId = AppState.currentMenuType.id;
    const type = this.mode;
    const filters = this.getFiltersObj('currentBacklogFilters');
    const query = this.getQueryString(filters);
    axios.get(`/agile/v1/projects/${projectId}/issues/storymap/issues?type=${type}&pageType=backlog${query}`)
      .then((res) => {
        this.setBacklogIssues(res);
        this.setBacklogExpand([]);
      });
  };

  modifyEpic(issueId, objectVersionNumber) {
    const index = this.epics.findIndex(epic => epic.issueId === issueId);
    this.epics[index].objectVersionNumber = objectVersionNumber;
  }

  freshIssue = (issueId, objectVersionNumber) => {
    const index = this.issues.findIndex(issue => issue.issueId === issueId);
    if (index === -1) return;
    this.issues[index].objectVersionNumber = objectVersionNumber;
  }

  handleEpicDrap = data => axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epic_drag`, data)
    .then((res) => {
      this.loadEpic();
    })
    .catch((error) => {
      this.loadEpic();
    });

  handleMoveIssue = data => axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/storymap/move`, data)
    .then((res) => {
      this.initData();
    })
    .catch(error => this.initData())
}

const userMapStore = new UserMapStore();
export default userMapStore;
