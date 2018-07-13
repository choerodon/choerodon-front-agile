import { observable, action, computed, toJS } from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;

@store('VersionReportStore')
class VersionReportStore {
    @observable versionList = [];
    @observable issues = {
      done: {
        data: [],
        pagination: {
          current: 1,
          total: 0,
          pageSize: 10,
        },
      },
      unfinished: {
        data: [],
        pagination: {
          current: 1,
          total: 0,
          pageSize: 10,
        },
      },
      unfinishedUnestimated: {
        data: [],
        pagination: {
          current: 1,
          total: 0,
          pageSize: 10,
        },
      },
    }
    @observable reportData = {};

  @computed get getReportData() {
      return toJS(this.reportData);
    }

  @action setReportData(data) {
      this.reportData = data;
    }

    axiosGetReportData(versionId, type) {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/${versionId}?type=${type}`);
    }

  @computed get getIssues() {
      return toJS(this.issues);
    }

  @action setIssues(type, type2, data) {
      this.issues[type][type2] = data;
    }

    axiosGetIssues(versionId, data) {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/${versionId}/issues?status=${data.status}&page=${data.page}&size=${data.size}`);
    }

  @computed get getVersionList() {
      return toJS(this.versionList);
    }

  @action setVersionList(data) {
      this.versionList = data;
    }

    axiosGetVersionList() {
      return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/names`, ['version_planning', 'released']);
    }
}

const versionReportStore = new VersionReportStore();
export default versionReportStore;
