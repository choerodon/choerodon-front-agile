import { observable, action, computed } from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';
import { loadIssues } from '../../../../api/NewIssueApi';

const { AppState } = stores;

@store('SprintCommonStore')
class SprintCommonStore {
  @observable issues = [];
  @observable pagination = {};
  @observable filter = {
    advancedSearchArgs: {},
    searchArgs: {},
  };
  @observable order = {
    orderField: '',
    orderType: '',
  };
  @observable loading = true;
  @observable paramType = undefined;
  @observable paramId = undefined;
  @observable paramName = undefined;
  @observable barFilters = undefined;

  init() {
    this.setOrder({
      orderField: '',
      orderType: '',
    });
    this.setFilter({
      advancedSearchArgs: {},
      searchArgs: {},
    });
    this.loadIssues();
  }

  loadIssues(page = 0, size = 10) {
    this.setLoading(true);
    const { orderField, orderType } = this.order;
    loadIssues(page, size, this.getFilter, orderField, orderType)
      .then((res) => {
        this.setIssues(res.content);
        this.setPagination({
          current: res.number + 1,
          pageSize: res.size,
          total: res.totalElements,
        });
        this.setLoading(false);
      });
  }

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

  @action setPagination(data) {
    this.pagination = data;
  }

  @action setFilter(data) {
    this.filter = data;
  }

  @action setOrder(data) {
    this.order = data;
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

  @action setBarFilters(data) {
    this.barFilters = data;
  }

  @computed get getBackUrl() {
    const urlParams = AppState.currentMenuType;
    if (!this.paramType) {
      return undefined;
    } else if (this.paramType === 'sprint') {
      return `/agile/reporthost/sprintReport?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    } else if (this.paramType === 'component') {
      return `/agile/component?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    } else if (this.paramType === 'version') {
      return `/agile/release/detail/${this.paramId}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    }
  }

  @computed get getFilter() {
    const filter = this.filter;
    const otherArgs = {
      type: this.paramType,
      id: [this.paramId],
    };
    return {
      ...filter,
      otherArgs: this.barFilters ? otherArgs : undefined,
    };
  }
}
const sprintCommonStore = new SprintCommonStore();
export default sprintCommonStore;
