import axios from 'axios';
import { store, stores } from 'choerodon-front-boot';
import { observable, action, computed, toJS } from 'mobx';

const { AppState } = stores;

@store('BurndownChartStore')
class BurndownChartStore {
  @observable burndownList = [];
  @observable sprintList = [];

  @computed get getSprintList() {
    return toJS(this.sprintList);
  }

  @action setSprintList(data) {
    this.sprintList = data;
  }
    
  @computed get getBurndownList() {
    return toJS(this.burndownList);
  }

  @action setBurndownList(data) {
    this.burndownList = data;
  }

  axiosGetSprintList() {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/sprint/names`, ['started', 'closed']);
  }

  axiosGetBurndownChartData(id, type) {
    return axios.get(`/agile/v1/project/29/reports/${id}/burn_down_coordinate?type=${type}`);
  }
  axiosGetBurndownChartReport(id, type) {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/reports/${id}/burn_down_report?type=${type}`);
  }
}

const burndownChartStore = new BurndownChartStore();
export default burndownChartStore;
