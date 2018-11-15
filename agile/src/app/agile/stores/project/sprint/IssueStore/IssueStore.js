import {
  observable, action, computed, toJS,
} from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';
import { loadIssues } from '../../../../api/NewIssueApi';

const { AppState } = stores;
const proId = AppState.currentMenuType.id;
const orgId = AppState.currentMenuType.organizationId;

let filter = {
  advancedSearchArgs: {
    statusId: [],
    priorityId: [],
    issueTypeId: [],
  },
  content: '',
  quickFilterIds: [],
  searchArgs: {
    assignee: '',
    component: '',
    epic: '',
    issueNum: '',
    sprint: '',
    summary: '',
    version: '',
    updateStartDate: null,
    updateEndDate: null,
    createStartDate: null,
    createEndDate: null,
  },
};


@store('SprintCommonStore')
class SprintCommonStore {
  @observable issues = [];

  @observable pagination = {};

  @observable filteredInfo = {};

  @observable order = {
    orderField: '',
    orderType: '',
  };

  @observable loading = true;

  @observable paramType = undefined;

  @observable paramId = undefined;

  @observable paramName = undefined;

  @observable paramStatus = undefined;

  @observable paramPriority = undefined;

  @observable paramIssueType = undefined;

  @observable paramIssueId = undefined;

  @observable paramOpenIssueId = undefined;

  @observable paramUrl = undefined;

  @observable barFilters = undefined;

  @observable quickSearch = [];

  @observable issueTypes = [];

  @observable priorities = [];

  @observable defaultPriorityId = false;

  @observable issuePriority = [];

  @observable issueStatus = [];

  @observable tagData = [];

  @observable otherArgs = {};

  @observable resolution = false;

  init() {
    this.setOrder({
      orderField: '',
      orderType: '',
    });
    this.setFilter({
      advancedSearchArgs: {},
      searchArgs: {},
    });
  }

  @action setIssues(data) {
    this.issues = data;
  }

  @computed get getIssues() {
    return toJS(this.issues);
  }

  @action setQuickSearch(data) {
    this.quickSearch = data;
  }

  @computed get getQuickSearch() {
    return toJS(this.quickSearch);
  }

  @action setIssueTypes(data) {
    this.issueTypes = data;
  }

  @computed get getIssueTypes() {
    return this.issueTypes.slice();
  }

  @action setIssueStatus(data) {
    this.issueStatus = data;
  }

  @computed get getIssueStatus() {
    return toJS(this.issueStatus);
  }

  @action setIssuePriority(data) {
    this.issuePriority = data;
  }

  @computed get getIssuePriority() {
    return toJS(this.issuePriority);
  }

  @action setLabel(data) {
    this.tagData = data;
  }

  @computed get getLabel() {
    return toJS(this.tagData);
  }

  @action setSelectedQuickSearch(data) {
    if (data) {
      Object.assign(filter, data);
    }
  }

  @action setPagination(data) {
    this.pagination = data;
  }

  @action setFilter(data) {
    this.filter = data;
  }

  @action setAdvArg(data) {
    if (data) {
      Object.assign(filter.advancedSearchArgs, data);
    }
  }

  @action setOnlyStory(data) {
    filter.advancedSearchArgs.issueTypeId.push(data);
  }

  @action setArg(data) {
    if (data) {
      Object.assign(filter.searchArgs, data);
    }
  }

  @action setOrder(orderField, orderType) {
    this.order.orderField = orderField;
    this.order.orderType = orderType;
  }

  @action setLoading(data) {
    this.loading = data;
  }

  @action setParamType(data) {
    this.paramType = data;
  }

  @action setParamId(data) {
    this.paramId = data;
  }

  @action setParamName(data) {
    this.paramName = data;
  }

  @computed get getParamName() {
    return toJS(this.paramName);
  }

  @action setParamStatus(data) {
    this.paramStatus = data;
  }

  @action setParamPriority(data) {
    this.paramPriority = data;
  }

  @action setParamIssueType(data) {
    this.paramIssueType = data;
  }

  @action setParamIssueId(data) {
    this.paramIssueId = data;
  }

  @action setParamOpenIssueId(data) {
    this.paramOpenIssueId = data;
  }

  @action setParamUrl(data) {
    this.paramUrl = data;
  }

  @action setResolution(data) {
    this.resolution = data;
  }

  @action setBarFilters(data) {
    let res = '';
    data.forEach((item, index) => {
      if (this.paramName) {
        if (!(index === 0)) {
          res += item;
        }
      } else {
        res += item;
      }
    });
    Object.assign(filter, { content: res });
  }

  @action setParamInOtherArgs() {
    if (this.paramType) {
      this.otherArgs[this.paramType] = this.paramId ? [this.paramId] : undefined;
    }
    if (this.paramIssueId) {
      this.otherArgs.issueIds = [this.paramIssueId.toString()];
    }
    this.otherArgs.resolution = this.resolution;
  }

  @action setOtherArgs(data) {
    if (data) {
      Object.assign(this.otherArgs, data);
    }
  }

  @action resetOtherArgs() {
    this.otherArgs = {};
  }

  @action cleanSearchArgs() {
    filter = {
      advancedSearchArgs: {
        statusId: [],
        priorityId: [],
        issueTypeId: [],
      },
      content: '',
      quickFilterIds: [],
      searchArgs: {
        assignee: '',
        component: '',
        epic: '',
        issueNum: '',
        sprint: '',
        summary: '',
        version: '',
        updateStartDate: null,
        updateEndDate: null,
        createStartDate: null,
        createEndDate: null,
      },
    };
  }

  loadIssues(page = 0, size = 10) {
    this.setLoading(true);
    const { orderField = '', orderType = '' } = this.order;
    return loadIssues(page, size, toJS(this.getFilter), orderField, orderType)
      .then((res) => {
        this.setIssues(res.content);
        this.setPagination({
          current: res.number + 1,
          pageSize: res.size,
          total: res.totalElements,
        });
        this.setLoading(false);
        return Promise.resolve(res);
      });
  }

  async loadCurrentSetting() {
    const quickSearch = await this.loadQuickSearch();
    this.setQuickSearch(quickSearch);

    const type = await this.loadType();
    this.setIssueTypes(type);

    const status = await this.loadStatus();
    this.setIssueStatus(status);

    const priorities = await this.loadPriorities();
    this.setIssuePriority(priorities);

    const tag = await this.loadLabel();
    this.setLabel(tag);
  }

  loadQuickSearch = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`);

  loadType = () => axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/schemes/query_issue_types?apply_type=agile`);

  loadStatus = () => axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/schemes/query_status_by_project_id?apply_type=agile`);

  loadPriorities = () => axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/priority/list_by_org`);

  loadLabel = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_labels`);

  createIssue(issueObj, projectId = AppState.currentMenuType.id) {
    const issue = {
      projectId: proId,
      ...issueObj,
    };
    return axios.post(`/agile/v1/projects/${projectId}/issue`, issue);
  }

  @computed get getBackUrl() {
    const urlParams = AppState.currentMenuType;
    if (!this.paramUrl) {
      return undefined;
    } else if (this.paramUrl === 'backlog') {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&paramIssueId=${this.paramIssueId}&paramOpenIssueId=${this.paramOpenIssueId}`;
    } else {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}`;
    }
  }

  @computed get getFilter() {
    return {
      ...filter,
      otherArgs: this.otherArgs,
    };
  }

  @computed get getPriorities() {
    return this.priorities.slice();
  }

  @action setPriorities(data) {
    this.priorities = data;
  }

  @computed get getDefaultPriorityId() {
    return this.defaultPriorityId;
  }

  @action setDefaultPriorityId(data) {
    this.defaultPriorityId = data;
  }
}
const sprintCommonStore = new SprintCommonStore();
export default sprintCommonStore;
