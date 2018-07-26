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
    @observable pieData = [
      { name: '112@hand-china.com', value: 12, pic: 'http://minio.staging.saas.hand-china.com/iam-service/file_16672131bdf144888ba616034934f401_a.gif', loginName: '12456 admin' },
      { name: '112fnnn@hand-china.com', value: 12, pic: 'http://minio.staging.saas.hand-china.com/iam-service/file_16672131bdf144888ba616034934f401_a.gif', loginName: '12456 admin' },
      { name: '112vv@hand-china.com', value: 12, pic: 'http://minio.staging.saas.hand-china.com/iam-service/file_16672131bdf144888ba616034934f401_a.gif', loginName: '12456 admin' }];
    @observable reportData = {};
    @observable colors = [];
    @observable pieLoading = false;


  @action changePieLoading(flag) {
      this.pieLoading = flag;
    }
  @action setPieData(data) {
      this.pieData = data;
    }
  @action setColors(data) {
      this.colors = data;
    }
  @computed get getPieData() {
      return this.pieData;
    }

  @computed get getColors() {
      return this.colors;
    }

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

    axiosGetIssues(versionId, data, util) {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/reports/${versionId}/issues?status=${data.status}&type=${util}&page=${data.page}&size=${data.size}`);
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

    getPieDatas = (projectId, type) => {
      this.changePieLoading(true);
      // axios.get('')
      //   .then(() => {
      //
      //   })
      //   .catch((error) => {});
      if (type === 'assignee') {
        this.setPieData([
          {
            name: '112@hand-china.com',
            value: 12,
            pic: 'http://minio.staging.saas.hand-china.com/iam-service/file_16672131bdf144888ba616034934f401_a.gif',
            loginName: '12456 admin'
          },
          {
            name: '112f@hand-china.com',
            value: 12,
            pic: 'http://minio.staging.saas.hand-china.com/iam-service/file_16672131bdf144888ba616034934f401_a.gif',
            loginName: '12456 admin'
          },
          {
            name: '112vv@hand-china.com',
            value: 12,
            pic: 'http://minio.staging.saas.hand-china.com/iam-service/file_16672131bdf144888ba616034934f401_a.gif',
            loginName: '12456 admin'
          }]);
      } else if (type === 'issueType') {
        this.setPieData([{
          name: '故事',
          value: 23,
        },
          {name: '任务', value: 23},
          {name: '子任务', value: 34},
          {name: '史诗', value: 23},
          {name: '故障', value: 34},
        ])
      } else if (type === 'epic') {
        this.setPieData([
          {name: '问题管理', value: 12},
          {name: 'issue相关', value: 34},
          {name: '报告相关', value: 36},
        ])
      } else if (type === 'fixVersion') {
        this.setPieData([
          {name: '0.8.0', value: 12},
          {name: '0.9.0', value: 34},
          {name: '0.4.0', value: 36},
        ])
      } else if (type === 'status') {
        this.setPieData([
          {name: '处理中', value: 12},
          {name: '已完成', value: 34},
          {name: '待处理', value: 36},
          {name: '联测中', value: 56},
        ])
      } else if (type === 'sprint') {
        this.setPieData([
          {name: '0.8.0', value: 12},
          {name: '0.9.0', value: 34},
          {name: '0.4.0', value: 36},
        ])
      } else if (type === 'priority') {
        this.setPieData([
          {name: '低', value: 12},
          {name: '高', value: 34},
          {name: '中', value: 36},
        ])
      }else if (type === 'component') {
        this.setPieData([
          {name: 'aa', value: 12},
          {name: 'bb', value: 34},
          {name: 'cc', value: 36},
        ])
      } else if (type === 'resolution') {
        this.setPieData([
          {name: '完成', value: 12},
          {name: '未解决', value: 34},
        ])
      }
      const data = this.pieData;
      const colors = [];
      data.map((item) => {
        colors.push('#'+('00000'+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6));
        return colors;
      });
      this.setColors(colors);
      this.changePieLoading(false);
    }
}

const versionReportStore = new VersionReportStore();
export default versionReportStore;
