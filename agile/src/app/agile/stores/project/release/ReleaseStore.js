import {
  observable, action, computed, toJS, 
} from 'mobx';
import axios from 'axios';
import { store, stores } from 'choerodon-front-boot';
import { Observable } from 'rxjs/Observable';

const { AppState } = stores;

@store('RleaseStore')
class ReleaseStore {
  @observable versionList = [];

  @observable versionDetail = {};

  @observable versionStatusIssues = [];

  @observable publicVersionDetail = {};

  @observable filters = {
    advancedSearchArgs: {},
    searchArgs: {},
    content: '',
  }

  axiosFileVersion(id) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${id}/archived`);
  }

  axiosUnFileVersion(id) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${id}/revoke_archived`);
  }

  axiosMergeVersion(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/merge`, data);
  }

  axiosPublicRelease(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/release`, data);
  }

  axiosUnPublicRelease(versionId) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${versionId}/revoke_release`);
  }

  @computed get getPublicVersionDetail() {
    return toJS(this.publicVersionDetail);
  }

  @action setPublicVersionDetail(data) {
    this.publicVersionDetail = data;
  }

  axiosVersionIssueStatistics(id) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${id}/names`);
  }

  axiosGetPublicVersionDetail(versionId) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${versionId}/plan_names`);
  }

  axiosUpdateVersion(versionId, data) {
    return axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${versionId}`, data);
  }

  axiosGetVersionStatusIssues(versionId, statusCode) {
    const orgId = AppState.currentMenuType.organizationId;
    if (statusCode && statusCode !== '0') {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${versionId}/issues?organizationId=${orgId}&statusCode=${statusCode}`);
    } else {
      return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${versionId}/issues?organizationId=${orgId}`);
    }
  }

  handleDataDrag = (projectId, data) => axios.put(`/agile/v1/projects/${projectId}/product_version/drag`, JSON.stringify(data));

  @computed get getVersionStatusIssues() {
    return toJS(this.versionStatusIssues);
  }

  @action setVersionStatusIssues(data) {
    this.versionStatusIssues = data;
  }

  axiosGetVersionDetail(versionId) {
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${versionId}`);
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

  @action setFilters(data) {
    this.filters = data;
  }

  axiosAddRelease(data) {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version`, data);
  }

  axiosGetVersionList(pageRequest) {
    // return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/versions?page=${pageRequest.page}&size=${pageRequest.size}`);
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/versions?page=${pageRequest.page}&size=${pageRequest.size}`, this.filters);
  }

  axiosDeleteVersion(data) {
    let stringData = '';
    if (data.fixTargetVersionId) {
      stringData += `fixTargetVersionId=${data.fixTargetVersionId}&`;
    }
    if (data.influenceTargetVersionId) {
      stringData += `influenceTargetVersionId=${data.influenceTargetVersionId}`;
    }
    return axios.delete(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/${data.versionId}?${stringData}`);
  }

  axiosGetVersionListWithoutPage() {
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/product_version/names`, []);
  }

  axiosCheckName(proId, name) {
    return axios.get(`/agile/v1/projects/${proId}/product_version/${name}/check`);
  }
}

const releaseStore = new ReleaseStore();
export default releaseStore;
