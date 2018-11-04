import {
  observable, action, computed, toJS,
} from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';
import { loadIssues } from '../../../../api/NewIssueApi';

const { AppState } = stores;

const filter = {
  advancedSearchArgs: {
    statusCode: [],
    priorityCode: [],
    typeCode: [],
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

  init() {
    this.setOrder({
      orderField: '',
      orderType: '',
    });
    this.setFilter({
      advancedSearchArgs: {},
      searchArgs: {},
    });
    // this.setFilteredInfo({});
    // this.loadIssues();
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

  loadQuickSearch = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/quick_filter`)
    .then((filters) => {
      this.setQuickSearch(filters);
    });

  createIssue(issueObj, projectId = AppState.currentMenuType.id) {
    const issue = {
      projectId: AppState.currentMenuType.id,
      ...issueObj,
    };
    return axios.post(`/agile/v1/projects/${projectId}/issue`, issue);
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

  @action setBarFilters(data) {
    let res = '';
    data.forEach((item) => {
      res += item;
    });
    Object.assign(filter, { content: res });
  }

  @computed get getBackUrl() {
    const urlParams = AppState.currentMenuType;
    if (!this.paramUrl) {
      return undefined;
    } else if (this.paramUrl === 'backlog') {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramIssueId=${this.paramIssueId}&paramOpenIssueId=${this.paramOpenIssueId}`;
    } else {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    }
    // if (!this.paramType) {
    //   return undefined;
    // } else if (this.paramType === 'sprint') {
    //   return `/agile/reporthost/sprintReport?
    // type=${urlParams.type}&id=${urlParams.id}
    // &name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    // } else if (this.paramType === 'component') {
    //   return `/agile/component?type=${urlParams.type}&
    // id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    // } else if (this.paramType === 'version' && this.paramStatus) {
    //   return `/agile/release?type=${urlParams.type}
    // &id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    // } else if (this.paramType === 'versionReport') {
    //   return `/agile/reporthost/versionReport?type=
    // ${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}
    // &organizationId=${urlParams.organizationId}`;
    // }
  }

  @computed get getFilter() {
    const otherArgs = {
      type: this.paramType,
      id: this.paramId ? [this.paramId] : undefined,
      issueIds: this.paramIssueId ? [this.paramIssueId] : undefined,
    };
    return {
      ...filter,
      otherArgs: this.barFilters ? otherArgs : {},
    };
  }

  @computed get getIssueTypes() {
    return this.issueTypes.slice();
  }

  @action setIssueTypes(data) {
    this.issueTypes = data;
  }

  axiosGetIssueTypes() {
    const proId = AppState.currentMenuType.id;
    return axios.get(`/issue/v1/projects/${proId}/schemes/query_issue_types_with_sm_id?scheme_type=agile`).then((data) => {
      if (data && !data.failed) {
        this.setIssueTypes(data);
      } else {
        this.setIssueTypes([]);
      }
    });
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
