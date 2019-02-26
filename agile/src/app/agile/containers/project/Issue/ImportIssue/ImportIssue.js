import React, { Component } from 'react';
import { Content, stores, WSHandler } from 'choerodon-front-boot';
import {
  Modal, Button, Icon,
} from 'choerodon-ui';
import _ from 'lodash';
import moment from 'moment';
import FileSaver from 'file-saver';
import { exportExcelTmpl } from '../../../../api/NewIssueApi';
import './ImportIssue.scss';


const { Sidebar } = Modal;
const { AppState } = stores;

class ImportIssue extends Component {
  state = {
    loading: true,
    visible: false,
    step: 1,
  };

  open = () => {
    this.setState({
      visible: true,
      loading: true,
    });
  };

  onCancel = () => {
    this.setState({
      visible: false,
    });
  };

  exportExcelTmpl = () => {
    exportExcelTmpl().then((excel) => {
      const blob = new Blob([excel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = '敏捷导入模板.xlsx';
      FileSaver.saveAs(blob, fileName);
    });
  };

  changeStep = (value) => {
    const { step } = this.state;
    this.setState({
      step: step + value,
    });
  };

  footer = () => {
    const { step } = this.state;
    if (step === 1) {
      return [
        <Button type="primary" funcType="raised" onClick={() => this.changeStep(-1)}>下一步</Button>,
        <Button funcType="raised" onClick={this.onCancel}>取消</Button>,
      ];
    } else if (step === 2) {
      return [
        <Button type="primary" funcType="raised" onClick={() => this.changeStep(1)}>上一步</Button>,
        <Button funcType="raised" onClick={this.onCancel}>取消</Button>,
      ];
    } else {
      return [
        <Button type="primary" funcType="raised" onClick={this.finish}>完成</Button>,
        <Button funcType="raised" onClick={this.onCancel}>取消</Button>,
      ];
    }
  };

  render() {
    const { visible, loading } = this.state;
    return (
      <Sidebar
        className="c7n-importIssue"
        title="导入问题"
        visible={visible}
        onCancel={this.onCancel}
        confirmLoading={loading}
        footer={this.footer()}
      >
        <Content
          title={`在项目“${AppState.currentMenuType.name}”中导入问题`}
          description="您可以在此将文件中的问题导入问题管理中。导入前，请先下载我们提供的模板，在模板中填写对应的信息后，再将模板上传。注：若导入失败，我们会及时将失败信息进行反馈。"
          link="http://v0-13.choerodon.io/zh/docs/user-guide/agile/issue/create-issue/"
        >
          <Button type="primary" funcType="flat" onClick={() => this.exportExcelTmpl()}>
            <Icon type="get_app icon" />
            <span>下载模板</span>
          </Button>
        </Content>
      </Sidebar>
    );
  }
}


export default ImportIssue;
