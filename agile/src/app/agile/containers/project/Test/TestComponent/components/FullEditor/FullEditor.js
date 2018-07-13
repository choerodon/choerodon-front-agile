import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { Select, Form, Input, DatePicker, Button, Modal, Tabs, Tooltip } from 'choerodon-ui';

// import './CreateIssue.scss';
import '../../assets/main.scss';
import { UploadButton, NumericInput } from '../CommonComponent';
import WYSIWYGEditor from '../WYSIWYGEditor';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const TYPE = {
  story: '#00bfa5',
  bug: '#f44336',
  task: '#4d90fe',
};

class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveLoading: false,
      releasePlans: [],
      selectedIssue: {},
      rollup: false,
      delta: '',
      edit: false,
    };
  }

  componentDidMount() {
    this.initValue();
  }

  initValue() {
    this.setState({
      delta: this.props.initValue,
    });
  }

  handleOk = () => {
    this.props.onOk(this.state.delta);
  }

  render() {
    const { visible, onCancel, onOk } = this.props;

    return (
      <Modal
        title="编辑任务描述"
        visible={visible || false}
        maskClosable={false}
        width={1200}
        onCancel={this.props.onCancel}
        onOk={this.handleOk}
      >
        <WYSIWYGEditor
          value={this.state.delta}
          style={{ height: 500, width: '100%', marginTop: 20 }}
          onChange={(value) => {
            this.setState({ delta: value });
          }}
        />
      </Modal>
    );
  }
}
export default Form.create({})(withRouter(CreateSprint));
