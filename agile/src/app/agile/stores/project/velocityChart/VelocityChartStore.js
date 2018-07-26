import { observable, action, computed, toJS } from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';

const { AppState } = stores;
const A = {
  issue_count: {
    committed: 'committedIssueCount',
    completed: 'completedIssueCount',
  },
  story_point: {
    committed: 'committedStoryPoints',
    completed: 'completedStoryPoints',
  },
  remain_time: {
    committed: 'committedRemainTime',
    completed: 'completedRemainTime',
  },
};
const UNIT = {
  story_point: '故事点',
  issue_count: '问题计数',
  remain_time: '剩余时间',
};

@store('VelocityChartStore')
class VelocityChartStore {
  @observable tableLoading = false;
  @observable tableData = [];
  @observable chartLoading = false;
  @observable chartData = [];
  @observable currentUnit = 'story_point';
  @observable chartDataX = [];
  @observable chartDataYCommitted = [];
  @observable chartDataYCompleted = [];
  @observable chartYAxisName = '故事点';

  loadChartAndTableData() {
    this.loadChartData();
    this.loadTableData();
  }

  loadChartData(unit = this.currentUnit) {
    this.setChartLoading(true);
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/velocity_chart?type=${unit}`)
      .then((res) => {
        this.setChartData(res);
        this.splitData(res);
        this.setChartLoading(false);
      });
  }

  loadTableData() {
    this.setTableLoading(true);
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/velocity_chart?type=remain_time`)
      .then((res) => {
        this.setTableData(res);
        this.setTableLoading(false);
      });
  }

  splitData(data) {
    this.setChartDataX(this.getChartDataX(data));
    this.setChartDataYCommitted(this.getChartDataYCommitted(data));
    this.setChartDataYCompleted(this.getChartDataYCompleted(data));
    this.setChartYAxisName(this.getChartYAxisName());
  }

  @action setTableLoading(data) {
    this.tableLoading = data;
  }

  @action setTableData(data) {
    this.tableData = data;
  }

  @action setChartLoading(data) {
    this.chartLoading = data;
  }

  @action setChartData(data) {
    this.chartData = data;
  }

  @action setCurrentUnit(data) {
    this.currentUnit = data;
  }

  @action setChartDataX(data) {
    this.chartDataX = data;
  }

  @action setChartDataYCommitted(data) {
    this.chartDataYCommitted = data;
  }

  @action setChartDataYCompleted(data) {
    this.chartDataYCompleted = data;
  }

  @action setChartYAxisName(data) {
    this.chartYAxisName = data;
  }

  getChartDataX(chartData) {
    const sprints = _.map(chartData, 'sprintName');
    return sprints;
  }

  getChartDataYCommitted(chartData) {
    const prop = A[this.currentUnit].committed;
    window.console.log(prop);
    const committed = _.map(chartData, prop);
    window.console.log(committed);
    return committed;
  }

  getChartDataYCompleted(chartData) {
    const prop = A[this.currentUnit].completed;
    const completed = _.map(chartData, prop);
    return completed;
  }

  getChartYAxisName() {
    const name = UNIT[this.currentUnit];
    return name;
  }
}

const velocityChartStore = new VelocityChartStore();
export default velocityChartStore;
