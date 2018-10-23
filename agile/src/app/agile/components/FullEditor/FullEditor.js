import React, { Component } from 'react';
import { Modal } from 'choerodon-ui';
import WYSIWYGEditor from '../WYSIWYGEditor';

class FullEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delta: '',
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
          style={{ height: 368, width: '100%', marginTop: 20 }}
          onChange={(value) => {
            this.setState({ delta: value });
          }}
        />
      </Modal>
    );
  }
}
export default FullEditor;
