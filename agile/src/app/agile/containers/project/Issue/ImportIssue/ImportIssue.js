import React, { Component } from 'react';
import { Content, stores, WSHandler } from 'choerodon-front-boot';
import {
  Modal, Button, Icon, Tag, Progress, Input, Tooltip,
} from 'choerodon-ui';
import _ from 'lodash';
import moment from 'moment';
import FileSaver from 'file-saver';
import { exportExcelTmpl, importIssue } from '../../../../api/NewIssueApi';
import './ImportIssue.scss';


const { Sidebar } = Modal;
const { AppState } = stores;

class ImportIssue extends Component {
  state = {
    loading: true,
    visible: false,
    step: 1,
    file: '',
    importVisible: false,
    wsData: {},
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

  importExcel = () => {
    this.setState({
      importVisible: true,
    });
  };

  handleClose = () => {
    this.setState({
      importVisible: false,
    });
  };

  beforeUpload = (e) => {
    if (e.target.files[0]) {
      this.setState({
        file: e.target.files[0],
      });
    }
  };

  upload = () => {
    const { file } = this.state;
    if (!file) {
      Choerodon.prompt('请选择文件');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    this.setState({
      uploading: true,
    });
    this.changeStep(1);
    importIssue(formData).then(() => {
      this.uploadInput.value = '';
      this.setState({
        file: null,
        uploading: false,
        importVisible: false,
      });
    }).catch(() => {
      this.setState({
        uploading: false,
        importVisible: false,
      });
      Choerodon.prompt('网络错误');
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
        <Button type="primary" funcType="raised" onClick={() => this.changeStep(1)}>下一步</Button>,
        <Button funcType="raised" onClick={this.onCancel}>取消</Button>,
      ];
    } else if (step === 2) {
      return [
        <Button type="primary" funcType="raised" onClick={() => this.changeStep(-1)}>上一步</Button>,
        <Button funcType="raised" onClick={this.onCancel}>取消</Button>,
      ];
    } else {
      return [
        <Button type="primary" funcType="raised" onClick={this.finish}>完成</Button>,
        <Button funcType="raised" onClick={this.onCancel}>取消</Button>,
      ];
    }
  };

  handleMessage = (data) => {
    this.setState({
      wsData: data,
    });
  };

  renderProgress = () => {
    const { wsData } = this.state;
    const {
      process = 0,
      status,
      failCount,
      successCount,
    } = wsData;
    if (status === 'doing') {
      return (
        <div style={{ width: 512 }}>
          <Progress
            percent={(process * 100).toFixed(0)}
            size="small"
            status="active"
          />
        </div>
      );
    } else if (status === 'failed') {
      return (
        <div>
          导入失败
          <span style={{ color: '#FF0000' }}>{failCount}</span>
          问题
        </div>
      );
    } else {
      return (
        <div>
          导入成功
          <span style={{ color: '#0000FF' }}>{successCount}</span>
          问题
        </div>
      );
    }
  };

  renderForm = () => {
    const { step, file } = this.state;
    if (step === 1) {
      return (
        <Button type="primary" funcType="flat" onClick={() => this.exportExcelTmpl()}>
          <Icon type="get_app icon" />
          <span>下载模板</span>
        </Button>
      );
    } else if (step === 2) {
      return (
        <Button type="primary" funcType="flat" onClick={() => this.importExcel()}>
          <Icon type="archive icon" />
          <span>导入问题</span>
        </Button>
      );
    } else {
      return (
        <WSHandler
          messageKey={`choerodon:msg:agile-import-issues:${AppState.userInfo.id}`}
          onMessage={this.handleMessage}
        >
          {this.renderProgress()}
        </WSHandler>
      );
    }
  };

  render() {
    const {
      visible, loading,
      file, importVisible,
    } = this.state;
    return (
      <Sidebar
        className="c7n-importIssue"
        title="导入问题"
        visible={visible}
        onCancel={this.onCancel}
        confirmLoading={loading}
        footer={this.footer()}
        destroyOnClose
      >
        <Content
          title={`在项目“${AppState.currentMenuType.name}”中导入问题`}
          description="您可以在此将文件中的问题导入问题管理中。导入前，请先下载我们提供的模板，在模板中填写对应的信息后，再将模板上传。注：若导入失败，我们会及时将失败信息进行反馈。"
          link="http://v0-13.choerodon.io/zh/docs/user-guide/agile/issue/create-issue/"
        >
          {this.renderForm()}
        </Content>
        <Modal
          title="导入用例"
          visible={importVisible}
          onOk={this.upload}
          onCancel={this.handleClose}
        >
          <div className="c7ntest-center" style={{ marginBottom: 20 }}>
            <Input
              style={{ width: 400, margin: '17px 0 0 18px' }}
              value={file && file.name}
              prefix={<Icon type="attach_file" style={{ color: 'black', fontSize: '14px' }} />}
              suffix={<Tooltip title="选择文件"><Icon type="create_new_folder" style={{ color: 'black', cursor: 'pointer' }} onClick={() => { this.uploadInput.click(); }} /></Tooltip>}
            />
          </div>
          <input
            ref={
              (uploadInput) => { this.uploadInput = uploadInput; }
            }
            type="file"
            onChange={this.beforeUpload}
            style={{ display: 'none' }}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
        </Modal>
      </Sidebar>
    );
  }
}


export default ImportIssue;
