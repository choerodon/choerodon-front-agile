import {
  observable, action, computed, toJS,
} from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;
const proId = AppState.currentMenuType.id;
const orgId = AppState.currentMenuType.organizationId;

let filter = {
  advancedSearchArgs: {
    statusId: [],
    priorityId: [],
    issueTypeId: [],
  },
  otherArgs: {
    component: [],
    epic: [],
    issueIds: [],
    label: [],
    reporter: [],
    summary: [],
    version: [],
  },
  content: '',
  quickFilterIds: [],
  assigneeFilterIds: null,
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

let paramIssueSelected = false;


@store('SprintCommonStore')
class SprintCommonStore {
  @observable issues = [];

  @observable pagination = {
    total: 0,
  };

  @observable filteredInfo = {};

  @observable order = {
    orderField: '',
    orderType: '',
  };

  @observable paramObj = {};

  @observable paramFilter = '';

  @observable barFilter = [];

  @observable createFlag = false;

  @observable loading = true;

  @observable paramName = '';

  @observable issuePriority = [];

  @observable issueStatus = [];

  @observable issueTypes = [];

  @observable columnFilter = new Map();

  @observable barFilters = '';

  @observable paramId = '';

  @observable quickSearch = [];

  @observable issueTypes = [];

  @observable priorities = [];

  @observable defaultPriorityId = false;

  @observable otherArgs = {};

  @observable resolution = false;

  @observable selectedIssue = {};

  @observable expand = false;

  @action initPram(data) {
    if (data.paramType) {
      filter.otherArgs[data.paramType] = data.paramId ? [data.paramId] : undefined;
    }
    if (data.paramIssueId) {
      filter.otherArgs.issueIds = [data.paramIssueId.toString()];
      paramIssueSelected = true;
    }
    filter.otherArgs.resolution = data.resolution;
    this.paramObj = data;
  }

  @computed get getParamFilter() {
    return toJS(this.paramFilter);
  }

  @computed get getParam() {
    return toJS(this.paramObj);
  }

  @computed get getColumnFilter() {
    return toJS(this.columnFilter);
  }

  @action init() {
    this.order = {
      orderField: '',
      orderType: '',
    };
    this.filter = {
      advancedSearchArgs: {},
      searchArgs: {},
    };
  }

  @action updateFiltedIssue(pagination, data, barFilters) {
    this.pagination = pagination;
    this.issues = data;
    this.barFilter = barFilters;
    this.loading = false;
  }

  @computed get getBarFilter() {
    return toJS(this.barFilter);
  }

  @action setIssues(data) {
    this.loading = false;
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
    return toJS(this.issueTypes);
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

  setAdvArg(data) {
    if (data) {
      Object.assign(filter.advancedSearchArgs, data);
    }
  }

  @action setOnlyStory(data) {
    filter.advancedSearchArgs.issueTypeId.push(data);
  }

  setArg(data) {
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

  @computed get getLoading() {
    return toJS(this.loading);
  }

  @action setBarFilters(data) {
    Object.assign(filter, { content: data });
  }

  @action createQuestion(data) {
    this.createFlag = data;
  }

  @computed get getCreateQuestion() {
    return this.createFlag;
  }


  setOtherArgs(data) {
    if (data) {
      Object.assign(filter.otherArgs, data);
    }
  }

  resetOtherArgs() {
    Object.assign(filter.otherArgs, {
      component: [],
      epic: [],
      issueIds: [],
      label: [],
      reporter: [],
      summary: [],
      version: [],
    });
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
      assigneeFilterIds: null,
      otherArgs: {
        component: [],
        epic: [],
        issueIds: [],
        label: [],
        reporter: [],
        summary: [],
        version: [],
      },
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

  @observable assigneeProps = [];

  @computed get getAssigneeProps() {
    return this.assigneeProps;
  }

  @action setAssigneeProps(data) {
    this.assigneeProps = data;
  }

  @action setClickedRow(data) {
    this.selectedIssue = data.selectedIssue;
    this.expand = data.expand;
  }

  @computed get getSelectedIssue() {
    return toJS(this.selectedIssue);
  }

  @computed get getExpand() {
    return toJS(this.expand);
  }

  loadIssues(page = 0, size = 10, orderDTO = {}, barFilters) {
    const { column } = orderDTO;
    let { order = '' } = orderDTO;
    if (order) {
      order = order === 'ascend' ? 'asc' : 'desc';
    }
    if (this.paramFilter && barFilters[0] !== this.paramFilter) {
      this.resetOtherArgs();
    }
    return axios.post(
      `/agile/v1/projects/${AppState.currentMenuType.id}/issues/include_sub?organizationId=${AppState.currentMenuType.organizationId}&page=${page}&size=${size}`, filter, {
        params: {
          sort: `${column && order ? `${column.sorterId},${order}` : ''}`,
        },
      },
    );
  }

  @computed get getPagination() {
    return toJS(this.pagination);
  }

  loadCurrentSetting() {
    const loadType = axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/schemes/query_issue_types_with_sm_id?apply_type=agile`);
    const loadStatus = axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/schemes/query_status_by_project_id?apply_type=agile`);
    const loadPriorities = axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/priority/list_by_org`);
    const loadLabel = axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_labels`);
    const loadIssue = axios.post(
      `/agile/v1/projects/${AppState.currentMenuType.id}/issues/include_sub?organizationId=${AppState.currentMenuType.organizationId}&page=${0}&size=${10}`, filter,
    );
    return Promise.all([loadType, loadStatus, loadPriorities, loadLabel, loadIssue]);
  }

  @action setCurrentSetting(res) {
    /* eslint-disable */
    this.issueTypes = res[0];
    this.issueStatus = res[1];
    this.issuePriority = res[2];
    this.tagData = res[3];
    this.columnFilter = new Map([
      ['issueNum', []],
      [
        'typeId', this.issueTypes.map(item => ({
        text: item.name,
        value: item.id.toString(),
      })),
      ],
      ['summary', []],
      [
        'statusId', this.issueStatus.map(item => ({
        text: item.name,
        value: item.id.toString(),
      })),
      ],
      [
        'priorityId', this.issuePriority.map(item => ({
        text: item.name,
        value: item.id.toString(),
      })),
      ],
      ['reporterName', []],
      ['assigneeName', []],
      ['version', []],
      ['sprint', []],
      ['component', []],
      ['epic', []],
      ['issueId', []],
      ['label', this.tagData.map(item => ({
        text: item.labelName,
        value: item.labelId.toString(),
      }))],
    ]);

    this.issues = res[4].content;
    this.pagination.total = res[4].totalElements;
    if (paramIssueSelected === true) {
      this.selectedIssue = this.issues[0];
      this.expand = true;
      paramIssueSelected = false;
    }
    this.paramUrl = this.paramObj.paramUrl;
    this.paramFilter = this.paramObj.paramName ? decodeURI(this.paramObj.paramName) : null;
    this.barFilter = this.paramFilter ? [this.paramFilter] : [];
    this.loading = false;
    /* eslint-enable */
  }

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

  @computed get getDefaultPriorityId() {
    return this.defaultPriorityId;
  }

  @action setDefaultPriorityId(data) {
    this.defaultPriorityId = data;
  }
}
const sprintCommonStore = new SprintCommonStore();
export default sprintCommonStore;
