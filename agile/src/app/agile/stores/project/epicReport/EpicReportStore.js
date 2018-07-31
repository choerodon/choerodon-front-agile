import { observable, action, computed, toJS } from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';

const { AppState } = stores;
const UNIT_STATUS = {
  issue_count: {
    committed: undefined,
    completed: undefined,
  },
  story_point: {
    committed: 'allStoryPoints',
    completed: 'completedStoryPoints',
  },
  remain_time: {
    committed: 'allRemainTimes',
    completed: 'completedRemainTimes',
  },
};
const UNIT2NAME = {
  story_point: '故事点',
  issue_count: '问题计数',
  remain_time: '剩余时间',
};

@store('EpicReportStore')
class EpicReportStore {
  @observable tableLoading = false;
  @observable tableData = [];
  @observable chartLoading = false;
  @observable chartData = [];
  @observable beforeCurrentUnit = 'story_point';
  @observable currentUnit = 'story_point';
  @observable epics = [];
  @observable epicFinishLoading = false;
  @observable currentEpicId = undefined;

  loadEpicAndChartAndTableData() {
    this.loadEpics()
      .then(() => {
        if (this.epics.length) {
          this.loadChartData();
          this.loadTableData();
        }
      });
  }

  loadEpics() {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epics`)
      .then((res) => {
        this.setEpicFinishLoading(true);
        this.setEpics(res);
        this.setCurrentEpic(res.length ? res[0].issueId : undefined);
      });
  }

  loadChartData(epicId = this.currentEpicId, unit = this.currentUnit) {
    this.setChartLoading(true);
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/epic_chart?epicId=${epicId}&type=${unit}`)
      .then((res) => {
        this.setBeforeCurrentUnit(unit);
        this.setChartData(res);
        this.setChartLoading(false);
      });
  }

  loadTableData(epicId = this.currentEpicId) {
    this.setTableLoading(true);
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/epic_issue_list?epicId=${epicId}`)
      .then((res) => {
        this.setTableData(res);
        this.setTableLoading(false);
      });
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

  @action setBeforeCurrentUnit(data) {
    this.beforeCurrentUnit = data;
  }

  @action setCurrentUnit(data) {
    this.currentUnit = data;
  }

  @action setEpics(data) {
    this.epics = data;
  }

  @action setEpicFinishLoading(data) {
    this.epicFinishLoading = data;
  }

  @action setCurrentEpic(data) {
    this.currentEpicId = data;
  }

  @computed get getChartDataX() {
    const groupDays = _.map(this.chartData, 'groupDay');
    return groupDays;
  }

  @computed get getChartDataYAll() {
    const prop = UNIT_STATUS[this.beforeCurrentUnit].committed;
    if (!prop) {
      return [];
    }
    const all = _.map(this.chartData, prop);
    return all;
  }

  @computed get getChartDataYCompleted() {
    const prop = UNIT_STATUS[this.beforeCurrentUnit].completed;
    if (!prop) {
      return [];
    }
    const completed = _.map(this.chartData, prop);
    return completed;
  }

  @computed get getChartDataYIssueCountAll() {
    const all = _.map(this.chartData, 'issueCount');
    return all;
  }

  @computed get getChartDataYIssueCountUnEstimate() {
    const all = _.map(this.chartData, 'unEstimateIssueCount');
    return all;
  }

  @computed get getChartYAxisName() {
    const name = UNIT2NAME[this.beforeCurrentUnit];
    return name;
  }

  @computed get getLatest() {
    const chartData = this.chartData.slice();
    if (chartData && chartData.length) {
      return chartData[chartData.length - 1];
    }
    return {};
  }
}

const epicReportStore = new EpicReportStore();
export default epicReportStore;
