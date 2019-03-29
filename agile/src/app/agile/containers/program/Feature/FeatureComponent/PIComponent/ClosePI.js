import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Select } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';

const { Sidebar } = Modal;
const { AppState } = stores;
const { Option } = Select;

@observer
class ClosePI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectChose: '0',
    };
  }

  /**
   *完成PI事件
   *
   * @memberof ClosePI
   */
  handleClosePI() {
    const { selectChose } = this.state;
    const {
      store, data: propData, onCancel, refresh,
    } = this.props;
    const data = {
      programId: AppState.currentMenuType.id,
      id: propData.id,
      artId: propData.artId,
      targetPiId: selectChose,
      objectVersionNumber: propData.objectVersionNumber,
    };
    store.closePI(data).then(() => {
      onCancel();
      refresh();
    }).catch(() => {
    });
  }

  render() {
    const {
      data, store, visible, onCancel,
    } = this.props;
    const { selectChose } = this.state;
    const completeMessage = JSON.stringify(store.getPICompleteMessage) === '{}' ? null : store.getPICompleteMessage;
    return visible
      ? (
        <Sidebar
          title="完成PI"
          visible={visible}
          okText="结束"
          cancelText="取消"
          onCancel={onCancel.bind(this)}
          onOk={this.handleClosePI.bind(this)}
        >
          <Content
            style={{
              padding: 0,
              paddingBottom: 20,
            }}
            title={`完成PI“${data.name}”`}
            description="请在下面选择未完成特性的去向，以完成一个PI计划。"
            link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/pi/close-pi/"
          >
            <p className="c7n-closeSprint-message">
              <span>{!_.isNull(completeMessage) ? completeMessage.completedCount : ''}</span>
              {' 个特性 已经完成'}
            </p>
            <p style={{ marginTop: 24 }} className="c7n-closeSprint-message">
              <span>{!_.isNull(completeMessage) ? completeMessage.unCompletedCount : ''}</span>
              {' 个特性 未完成'}
            </p>
            <p style={{ fontSize: 14, marginTop: 36 }}>选择该PI未完成的问题：</p>
            <Select
              label="移动至"
              style={{ marginTop: 12, width: 512 }}
              value={selectChose}
              onChange={(value) => {
                this.setState({
                  selectChose: value,
                });
              }}
            >
              {!_.isNull(completeMessage) ? (
                completeMessage.piTodoDTOList.map(item => (
                  <Option value={item.id}>{`${item.code}-${item.name}`}</Option>
                ))
              ) : ''}
              <Option value="0">待办事项</Option>
            </Select>
          </Content>
        </Sidebar>
      ) : null;
  }
}

export default ClosePI;
