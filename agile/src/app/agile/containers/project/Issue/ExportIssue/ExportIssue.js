import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import { Modal, Radio } from 'choerodon-ui';
import FileSaver from 'file-saver';
import IssueStore from '../../../../stores/project/sprint/IssueStore/IssueStore';

const RadioGroup = Radio.Group;
const { AppState } = stores;
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};
@observer
class ExportIssue extends Component {
  state={
    mode: 'all',
  }

  handleExportChange=(e) => {
    this.setState({
      mode: e.target.value,
    });
  }

  handleCancel=() => {
    IssueStore.setExportModalVisible(false);
  }

  /**
   * 输出 excel
   */
  exportExcel = () => {
    const projectId = AppState.currentMenuType.id;
    const orgId = AppState.currentMenuType.organizationId;
    const searchParam = IssueStore.getFilterMap.get('userFilter');
    axios.post(`/zuul/agile/v1/projects/${projectId}/issues/export?organizationId=${orgId}`, searchParam, { responseType: 'arraybuffer' })
      .then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `${AppState.currentMenuType.name}.xlsx`;
        FileSaver.saveAs(blob, fileName);
      });
  };

  render() {
    const { mode } = this.state;
    const visible = IssueStore.exportModalVisible;
    return (
      <Modal
        title="问题列表导出确认"
        visible={visible}
        onOk={this.exportExcel}
        onCancel={this.handleCancel}
      >
        <RadioGroup onChange={this.handleExportChange} value={mode}>
          <Radio style={radioStyle} value="show">当前页面显示字段</Radio>
          <Radio style={radioStyle} value="all">全部字段</Radio>        
        </RadioGroup>

      </Modal>
    );
  }
}

ExportIssue.propTypes = {

};

export default ExportIssue;
