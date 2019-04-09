import axios from 'axios';
import { observable, action, computed } from 'mobx';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('ObjectSchemeStore')
class ObjectSchemeStore {
  @observable objectScheme = [];

  @observable schemeDetail = {
    content: [],
  };

  @observable fieldType = [];

  @observable fieldContext = [];

  @observable field = {};

  @action setField(data) {
    this.field = data;
  }

  @computed get getField() {
    return this.field;
  }

  @computed get getFieldType() {
    return this.fieldType.slice();
  }

  @computed get getFieldContext() {
    return this.fieldContext.slice();
  }

  @action initLookupValue(fieldType = {}, fieldContext = {}) {
    this.fieldType = fieldType.lookupValues || [];
    this.fieldContext = fieldContext.lookupValues || [];
  }

  @computed get getObjectScheme() {
    return this.objectScheme.slice();
  }

  @action setObjectScheme(data) {
    this.objectScheme = data;
  }

  @computed get getSchemeDetail() {
    return this.schemeDetail;
  }

  @action setSchemeDetail(data) {
    this.schemeDetail = data;
  }

  @action updateSchemeDetail(field) {
    this.schemeDetail.content = this.schemeDetail.content.map((item) => {
      if (field.fieldId === item.fieldId) {
        return {
          ...item,
          objectVersionNumber: field.objectVersionNumber,
          required: field.required,
        };
      } else {
        return item;
      }
    });
  }

  loadObjectScheme = (page, size, filter) => {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.post(`/foundation/v1/organizations/${orgId}/object_scheme?page=${page}&size=${size}`, filter).then((data) => {
      if (data && !data.failed) {
        this.setObjectScheme(data.content);
      } else {
        Choerodon.prompt(data.message);
      }
    });
  };

  loadSchemeDetail = (code) => {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.get(`/foundation/v1/organizations/${orgId}/object_scheme_field/list?schemeCode=${code}`).then((data) => {
      if (data && !data.failed) {
        this.setSchemeDetail(data);
      } else {
        Choerodon.prompt(data.message);
      }
    });
  };

  loadFieldDetail = (orgId, fieldId) => axios.get(`/foundation/v1/organizations/${orgId}/object_scheme_field/${fieldId}`).then((data) => {
    if (data) {
      this.setField(data);
    }
    return data;
  });

  loadLookupValue = (code) => {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.get(`/foundation/v1/organizations/${orgId}/lookup_values/${code}`);
  };

  createField = (orgId, field) => axios.post(`/foundation/v1/organizations/${orgId}/object_scheme_field`, field);

  deleteField = (orgId, fieldId) => axios.delete(`/foundation/v1/organizations/${orgId}/object_scheme_field/${fieldId}`);

  checkName = (orgId, name) => axios.get(`/foundation/v1/organizations/${orgId}/object_scheme_field/check_name?name=${name}`);

  checkCode = (orgId, code) => axios.get(`/foundation/v1/organizations/${orgId}/object_scheme_field/check_code?name=${code}`);

  updateField = (fieldId, field) => {
    const orgId = AppState.currentMenuType.organizationId;
    return axios.put(`/foundation/v1/organizations/${orgId}/object_scheme_field/${fieldId}`, field).then((data) => {
      if (data && !data.failed) {
        this.updateSchemeDetail(data);
      } else {
        Choerodon.prompt(data.message);
      }
    });
  };
}

const objectSchemeStore = new ObjectSchemeStore();
export default objectSchemeStore;
