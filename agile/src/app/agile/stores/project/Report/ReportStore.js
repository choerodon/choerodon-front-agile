import { observable, action, computed } from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

@store('ReportStore')
class ReportStore {
  @observable loading = false;
  @observable todo = false;
  @observable done = false;
  @observable remove = false;
  @observable sprints = [
    {
      id: 1,
      name: 'sprint1',
    },
    {
      id: 2,
      name: 'sprint2',
    },
  ];
  @observable currentSprintId = undefined;
  @observable activeKey = 'done';

  @observable doneIssues = [];

  @observable todoIssues = [];

  @observable removeIssues = [];

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

  loadDoneIssues() {
    this.setLoading(true);
    // loadIssues(page, size, this.filter, orderField, orderType)
    //   .then((res) => {
    this.setDoneIssues([
      {
        issueNum: 'AG-101',
        summary: '模拟数据模拟数据模拟数据',
        typeCode: 'story',
        priorityCode: 'medium',
        priorityName: '中',
        statusCode: 'done',
        storyPoints: '3',
        statusColor: '#fab614',
        statusName: '已完成',
      },
    ]);
    this.setLoading(false);
    this.setDone(false);
    // });
  }

  loadTodoIssues() {
    this.setLoading(true);
    // loadIssues(page, size, this.filter, orderField, orderType)
    //   .then((res) => {
    this.setTodoIssues([
      {
        issueNum: 'AG-101',
        summary: '模拟数据模拟数据模拟数据',
        typeCode: 'story',
        priorityCode: 'high',
        priorityName: '高',
        statusCode: 'todo',
        storyPoints: '3',
        statusColor: '#fab614',
        statusName: '未开始',
      },
      {
        issueNum: 'AG-101',
        summary: '模拟数据模拟数据模拟数据',
        typeCode: 'story',
        priorityCode: 'high',
        priorityName: '高',
        statusCode: 'todo',
        storyPoints: '3',
        statusColor: '#fab614',
        statusName: '未开始',
      },
      {
        issueNum: 'AG-101',
        summary: '模拟数据模拟数据模拟数据',
        typeCode: 'story',
        priorityCode: 'high',
        priorityName: '高',
        statusCode: 'todo',
        storyPoints: '3',
        statusColor: '#fab614',
        statusName: '未开始',
      },
    ]);
    this.setLoading(false);
    this.setTodo(false);
    // });
  }

  loadRemoveIssues() {
    this.setLoading(true);
    // loadIssues(page, size, this.filter, orderField, orderType)
    //   .then((res) => {
    this.setRemoveIssues([
      {
        issueNum: 'AG-101',
        summary: '模拟数据模拟数据模拟数据',
        typeCode: 'story',
        priorityCode: 'low',
        priorityName: '低',
        statusCode: 'done',
        storyPoints: '3',
        statusColor: '#fab614',
        statusName: '已完成',
      },
      {
        issueNum: 'AG-101',
        summary: '模拟数据模拟数据模拟数据',
        typeCode: 'story',
        priorityCode: 'low',
        priorityName: '低',
        statusCode: 'done',
        storyPoints: '3',
        statusColor: '#fab614',
        statusName: '已完成',
      },
    ]);
    this.setLoading(false);
    this.setTodo(false);
    // });
  }

  @action setSprints(data) {
    this.sprints = data;
  }

  @action setCurrentSprintId(data) {
    this.currentSprintId = data;
  }

  @action setActiveKey(data) {
    this.activeKey = data;
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

  @action setDone(data) {
    this.done = data;
  }

  @action setTodo(data) {
    this.todo = data;
  }

  @action setRemove(data) {
    this.remove = data;
  }

  @action setDoneIssues(data) {
    this.doneIssues = data;
  }

  @action setTodoIssues(data) {
    this.todoIssues = data;
  }

  @action setRemoveIssues(data) {
    this.removeIssues = data;
  }

  @action setDonePagination(data) {
    this.donePagination = data;
  }

  @action setTodoPagination(data) {
    this.todoPagination = data;
  }

  @action setRemovePagination(data) {
    this.removePagination = data;
  }

  @action setDoneFilter(data) {
    this.doneFilter = data;
  }

  @action setTodoFilter(data) {
    this.todoFilter = data;
  }

  @action setRemoveFilter(data) {
    this.removeFilter = data;
  }

  @action setDoneOrder(data) {
    this.doneOrder = data;
  }

  @action setTodoOrder(data) {
    this.todoOrder = data;
  }

  @action setRemoveOrder(data) {
    this.removeOrder = data;
  } 
}
const reportStore = new ReportStore();
export default reportStore;
