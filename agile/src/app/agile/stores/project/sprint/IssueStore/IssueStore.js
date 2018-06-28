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
    loadIssues(page, size, this.filter, orderField, orderType)
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
}
const sprintCommonStore = new SprintCommonStore();
export default sprintCommonStore;
