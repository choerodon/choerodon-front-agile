import { observable, action, computed, toJS } from 'mobx';
import axios from 'axios';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('RleaseStore')
class ReleaseStore {
  @observable versionList = [];
  @observable versionDetail = {};
  @observable versionStatusIssues = [];
  @observable publicVersionDetail = {};

  axiosPublicRelease(data) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/release`, data);
  }

  axiosUnPublicRelease(versionId) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/${versionId}/revoke_release`);
  }

  @computed get getPublicVersionDetail() {
    return toJS(this.publicVersionDetail);
  }

  @action setPublicVersionDetail(data) {
    this.publicVersionDetail = data;
  }

  axiosVersionIssueStatistics(id) {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/${id}/names`);
  }

  axiosGetPublicVersionDetail(versionId) {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/${versionId}/plan_names`);
  }

  axiosUpdateVersion(versionId, data) {
    return axios.put(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/${versionId}`, data);
  }

  axiosGetVersionStatusIssues(versionId, statusCode) {
    if (statusCode && statusCode !== '0') {
      return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/${versionId}/issues?statusCode=${statusCode}`);
    } else {
      return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/${versionId}/issues`);
    }
  }

  @computed get getVersionStatusIssues() {
    return toJS(this.versionStatusIssues);
  }

  @action setVersionStatusIssues(data) {
    this.versionStatusIssues = data;
  }

  axiosGetVersionDetail(versionId) {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/${versionId}`);
  }

  @computed get getVersionDetail() {
    return toJS(this.versionDetail);
  }

  @action setVersionDetail(data) {
    this.versionDetail = data;
  }

  @computed get getVersionList() {
    return toJS(this.versionList);
  }

  @action setVersionList(data) {
    this.versionList = data;
  }

  axiosAddRelease(data) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/product_version`, data);
  }

  axiosGetVersionList(pageRequest) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/versions?page=${pageRequest.page}&size=${pageRequest.size}`);
  }

  axiosDeleteVersion(data) {
    return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/product_version/version`, data);
  }
}

const releaseStore = new ReleaseStore();
export default releaseStore;
