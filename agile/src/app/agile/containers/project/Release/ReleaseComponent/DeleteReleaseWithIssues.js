import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Button, Table, Menu, Dropdown, Icon, Modal, Radio, Select } from 'choerodon-ui';
import ReleaseStore from '../../../../stores/project/release/ReleaseStore';

const { Sidebar } = Modal;
const { AppState } = stores;
const RadioGroup = Radio.Group;
const Option = Select.Option;

@observer
class DeleteReleaseWithIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleOk() {
    const data2 = {
      projectId: AppState.currentMenuType.id,
      versionId: this.props.versionDelInfo.versionId,
    };
    if (this.props.radioChose) {
      if (this.props.radioChose === 1) {
        data2.targetVersionId = this.props.selectChose ? 
          this.props.selectChose : this.props.versionDelInfo.versionNames[0].versionId;
      }
    } else {
      data2.targetVersionId = this.props.selectChose ? 
        this.props.selectChose : this.props.versionDelInfo.versionNames[0].versionId;
    }
    ReleaseStore.axiosDeleteVersion(data2).then((data) => {
      this.props.onCancel();
      this.props.refresh();
    }).catch((error) => {
      window.console.log(error);
    });
  }
  render() {
    return (
      <Sidebar
        title={`删除版本 V${this.props.versionDelInfo.versionName}`}
        closable={false}
        visible={JSON.stringify(this.props.versionDelInfo) !== '{}'}
        okText="删除"
        cancelText="取消"
        onCancel={() => {
          this.setState({
            versionDelInfo: {},
            radioChose: null,
            selectChose: null,
          });
        }}
        onOk={this.handleOk.bind(this)}
      >
        <p>您想对分配给此版本的任何问题做什么?</p>
        <div style={{ display: 'flex', marginTop: 25 }}>
          <p>此版本有{this.props.versionDelInfo.issueCount}个问题</p>
          <RadioGroup
            style={{ marginLeft: 25 }}
            defaultValue={1}
            onChange={(e) => {
              this.props.changeState('radioChose', e.target.value);
            }}
          >
            <Radio
              style={{
                display: 'block',
                height: '30px',
                lineHeight: '30px',
              }}
              value={1}
            >
              将它们分配给此版本
              <Select
                style={{
                  width: 250,
                  marginLeft: 10,
                }}
                onChange={(value) => {
                  this.props.changeState('selectChose', value);
                }}
                defaultValue={this.props.versionDelInfo.versionNames ? 
                  this.props.versionDelInfo.versionNames[0].versionId : undefined}
              >
                {this.props.versionDelInfo.versionNames ? (
                  this.props.versionDelInfo.versionNames.map(item => (
                    <Option value={item.versionId}>{item.name}</Option>
                  ))
                ) : ''}
              </Select>
            </Radio>
            <Radio
              style={{ 
                display: 'block',
                height: '30px',
                lineHeight: '30px',
              }}
              value={2}
            >
              删除版本
            </Radio>
          </RadioGroup>
        </div>
      </Sidebar>
    );
  }
}

export default DeleteReleaseWithIssue;

