import { observable, action, computed } from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { loadSprints, loadSprint, loadSprintIssues, loadChartData } from '../../../api/NewIssueApi';

const { AppState } = stores;

@store('ReportStore')
class ReportStore {
  @observable loading = false;
  @observable todo = false;
  @observable done = false;
  @observable remove = false;
  @observable sprints = [];
  @observable currentSprint = {};
  @observable activeKey = 'done';

  @observable doneIssues = [];

  @observable todoIssues = [];

  @observable removeIssues = [];

  @observable chartData = {
    xAxis: [],
    yAxis: [],
  };

  init() {
    loadSprints(['started', 'closed'])
      .then((res) => {
        this.setSprints(res || []);
        if (res && res.length) {
          this.changeCurrentSprint(res[0].sprintId);
        } else {
          this.setCurrentSprint({});
        }
      })
      .catch((error) => {
        this.setSprints([]);
        window.console.error('some thing wrong, get sprints failed');
      });
  }

  changeCurrentSprint(sprintId) {
    if (sprintId) {
      loadSprint(sprintId)
        .then((res) => {
          this.setCurrentSprint(res || {});
          // ready to load when activeKey change
          this.setTodo(false);
          this.setDone(false);
          this.setRemove(false);
          this.getChartData();
          this.loadCurrentTab();
        })
        .catch((error) => {
          window.console.error('some thing wrong, get currentSprint failed');
        });
    } else {
      this.init();
    }
  }

  loadCurrentTab() {
    const ARRAY = {
      done: 'loadDoneIssues',
      todo: 'loadTodoIssues',
      remove: 'loadRemoveIssues',
    };
    if (!this.currentSprint.sprintId) {
      return;
    }
    this[ARRAY[this.activeKey]]();
  }

  getChartData() {
    loadChartData(this.currentSprint.sprintId, 'storyPoints').then((res) => {
      const data = res;
      const newData = [];
      _.forEach(data, (item) => {
        if (!_.some(newData, { date: item.date })) {
          newData.push({
            date: item.date,
            issues: [{
              issueId: item.issueId,
              issueNum: item.issueNum,
              newValue: item.newValue,
              oldValue: item.oldValue,
              statistical: item.statistical,
            }],
            type: item.type,
          });
        } else {
          let index;
          _.forEach(newData, (item2, i) => {
            if (item2.date === item.date) {
              index = i;
            }
          });
          newData[index].issues = [...newData[index].issues, {
            issueId: item.issueId,
            issueNum: item.issueNum,
            newValue: item.newValue,
            oldValue: item.oldValue,
            statistical: item.statistical,
          }];
        }
      });
      _.forEach(newData, (item, index) => {
        let rest = 0;
        if (item.type !== 'endSprint') {
          if (index > 0) {
            rest = newData[index - 1].rest;
          }
        }
        _.forEach(item.issues, (is) => {
          if (is.statistical) {
            rest += is.newValue - is.oldValue;
          }
        });
        newData[index].rest = rest;
      });
      this.setChartData({
        xAxis: _.map(newData, 'date'),
        yAxis: _.map(newData, 'rest'),
      });
    }).catch((error) => {
      window.console.error(error);
    });
  }

  loadDoneIssues() {
    this.setLoading(true);
    loadSprintIssues(this.currentSprint.sprintId, 'done')
      .then((res) => {
        this.setDoneIssues(res.content);
        this.setLoading(false);
        this.setDone(true);
      });
  }

  loadTodoIssues() {
    this.setLoading(true);
    loadSprintIssues(this.currentSprint.sprintId, 'unfinished')
      .then((res) => {
        this.setTodoIssues(res.content);
        this.setLoading(false);
        this.setTodo(true);
      });
  }

  loadRemoveIssues() {
    this.setLoading(true);
    loadSprintIssues(this.currentSprint.sprintId, 'remove')
      .then((res) => {
        this.setRemoveIssues(res.content);
        this.setLoading(false);
        this.setRemove(true);
      });
  }

  @action setSprints(data) {
    this.sprints = data;
  }

  @action setCurrentSprint(data) {
    this.currentSprint = data;
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

  @action setChartData(data) {
    this.chartData = data;
  }

  @computed get getCurrentSprintStatus() {
    const STATUS_TIP = {
      closed: {
        status: '已关闭',
        action: '结束',
      },
      started: {
        status: '进行中',
        action: '开启',
      },
    };
    if (!this.currentSprint.statusCode) {
      return ({
        status: '',
        action: '',
      });
    } else {
      return STATUS_TIP[this.currentSprint.statusCode]; 
    }
  }
}
const reportStore = new ReportStore();
export default reportStore;
