import { observable, action, computed, toJS } from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

@store('VelocityChartStore')
class VelocityChartStore {
  @observable tableLoading = false;
  @observable tableData = [];
  @observable chartLoading = false;
  @observable chartData = [];
  @observable currentUnit = 'storyPoint';

  loadChartAndTableData() {
    this.loadChartData();
    this.loadTableData();
  }

  loadChartData() {
    this.setChartData([]);
  }

  loadTableData() {
    this.setTableData([]);
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
}

const velocityChartStore = new VelocityChartStore();
export default velocityChartStore;
