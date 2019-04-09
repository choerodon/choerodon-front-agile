import axios from 'axios';
import { observable, action, computed } from 'mobx';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('PageStore')
class PageStore {
  @observable page = [];

  @observable pageDetail = {
    content: [],
  };

  @computed get getPage() {
    return this.page.slice();
  }

  @action setPage(data) {
    this.page = data;
  }

  @computed get getPageDetail() {
    return this.pageDetail;
  }

  @action setPageDetail(data) {
    this.pageDetail = data;
  }

  @action updatePageDetail(field) {
    this.pageDetail.content = this.pageDetail.content.map((item) => {
      if (field.fieldId === item.fieldId) {
        return {
          ...item,
          objectVersionNumber: field.objectVersionNumber,
          display: field.display,
        };
      } else {
        return item;
      }
    });
  }

  loadPage = (page, size, filter) => {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.post(`/foundation/v1/organizations/${orgId}/page?page=${page}&size=${size}`, filter).then((data) => {
      if (data && !data.failed) {
        this.setPage(data.content);
      } else {
        Choerodon.prompt(data.message);
      }
    });
  };

  loadPageDetail = (code) => {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.get(`/foundation/v1/organizations/${orgId}/page_field/list?pageCode=${code}`).then((data) => {
      if (data && !data.failed) {
        this.setPageDetail(data);
      } else {
        Choerodon.prompt(data.message);
      }
    });
  };

  updateField = (fieldId, code, field) => {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.put(`/foundation/v1/organizations/${orgId}/page_field/${fieldId}?pageCode=${code}`, field).then((data) => {
      if (data && !data.failed) {
        this.updatePageDetail(data);
      } else {
        Choerodon.prompt(data.message);
      }
    });
  };

  updateFieldOrder = (code, order) => {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.post(`/foundation/v1/organizations/${orgId}/page_field/adjust_order?pageCode=${code}`, order).then((data) => {
      if (data && !data.failed) {
        return data;
      } else {
        Choerodon.prompt(data.message);
        return null;
      }
    });
  };
}

const pageStore = new PageStore();
export default pageStore;
