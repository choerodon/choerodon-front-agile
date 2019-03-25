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

  handleOk = () => {
    const { onOk } = this.props;
    const { delta } = this.state;
    onOk(delta);
  }

  initValue() {
    const { initValue } = this.state;
    this.setState({
      delta: initValue,
    });
  }


  render() {
    const { visible, onCancel } = this.props;
    const { delta } = this.state;
    return (
      <Modal
        title="编辑任务描述"
        visible={visible || false}
        maskClosable={false}
        width={1200}
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        <WYSIWYGEditor
          value={delta}
          style={{ height: 368, width: '100%', marginTop: 20 }}
          onChange={(value) => {
            this.setState({ delta: value });
          }}
          {...this.props}
        />
      </Modal>
    );
  }
}
export default FullEditor;
