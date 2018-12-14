import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import {
  Button, Table, Menu, Dropdown, Icon, Modal, Radio, Select,
} from 'choerodon-ui';
import ReleaseStore from '../../../../stores/project/release/ReleaseStore';

const { Sidebar } = Modal;
const { AppState } = stores;
const RadioGroup = Radio.Group;
const Option = Select.Option;

@observer
class DeleteReleaseWithIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      influenceRadio: 0,
      fixTargetRadio: 0,
      influenceTargetVersionId: '',
      fixTargetVersionId: '',
      planning: [],
    };
  }

  componentWillMount() {
    ReleaseStore.axiosGetVersionListWithoutPage().then((res) => {
      debugger;
      this.setState({
        planning: res,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.versionDelInfo.versionNames) {
      if (nextProps.versionDelInfo.versionNames.length > 0) {
        this.setState({
          influenceTargetVersionId: nextProps.versionDelInfo.versionNames[0].versionId,
          fixTargetVersionId: nextProps.versionDelInfo.versionNames[0].versionId,
        });
      } else {
        this.setState({
          influenceRadio: 1,
          fixTargetRadio: 1,
        });
      }
    }
  }

  handleOk() {
    const data2 = {
      projectId: AppState.currentMenuType.id,
      versionId: this.props.versionDelInfo.versionId,
    };
    if (this.props.versionDelInfo.influenceIssueCount) {
      if (!this.state.influenceRadio) {
        data2.influenceTargetVersionId = this.state.influenceTargetVersionId;
      }
    }
    if (this.props.versionDelInfo.fixIssueCount) {
      if (!this.state.fixTargetRadio) {
        data2.fixTargetVersionId = this.state.fixTargetVersionId;
      }
    }
    ReleaseStore.axiosDeleteVersion(data2).then((data) => {
      this.props.onCancel();
      this.props.refresh();
    }).catch((error) => {
    });
  }

  render() {
    debugger;
    const { planning } = this.state;
    return (
      <Sidebar
        title={`删除版本 ${this.props.versionDelInfo.versionName}`}
        closable={false}
        visible={JSON.stringify(this.props.versionDelInfo) !== '{}'}
        okText="删除"
        cancelText="取消"
        onCancel={this.props.onCancel.bind(this)}
        onOk={this.handleOk.bind(this)}
      >
        <p>您想对分配给此版本的任何问题做什么?</p>
        <div style={{ marginTop: 25 }}>
          {
            this.props.versionDelInfo.influenceIssueCount ? (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ flex: 1 }}>
                  {`此版本影响问题数：${this.props.versionDelInfo.influenceIssueCount}`}
                </p>
                {
                  this.props.versionDelInfo.versionNames.length > 0 ? (
                    <div
                      style={{
                        flex: 4,
                      }}
                    >
                      <RadioGroup
                        defaultValue={0}
                        onChange={(e) => {
                          this.setState({
                            influenceRadio: e.target.value,
                          });
                        }}
                      >
                        <Radio
                          style={{
                            display: 'block',
                            height: '30px',
                            lineHeight: '30px',
                          }}
                          value={0}
                        >
                          {'将它们分配给此版本'}
                          <Select
                            style={{
                              width: 250,
                              marginLeft: 10,
                            }}
                            onChange={(value) => {
                              this.setState({
                                influenceTargetVersionId: value,
                              });
                            }}
                            defaultValue={this.props.versionDelInfo.versionNames
                              ? planning[0].versionId : undefined}
                          >
                            {this.props.versionDelInfo.versionNames ? (
                              planning.map(item => (
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
                          value={1}
                        >
                          {'删除版本'}
                        </Radio>
                      </RadioGroup>
                    </div>
                  ) : ''
                }
              </div>
            ) : ''
          }
          {
            this.props.versionDelInfo.fixIssueCount ? (
              <div>
                <p style={{ flex: 1 }}>
                  {`此版本修复问题数：${this.props.versionDelInfo.fixIssueCount}`}
                </p>
                {
                  this.props.versionDelInfo.versionNames.length > 0 ? (
                    <div style={{ flex: 4 }}>
                      <RadioGroup
                        defaultValue={0}
                        onChange={(e) => {
                          this.setState({
                            fixTargetRadio: e.target.value,
                          });
                        }}
                      >
                        <Radio
                          style={{
                            display: 'block',
                            height: '30px',
                            lineHeight: '30px',
                          }}
                          value={0}
                        >
                          {'将它们分配给此版本'}
                          <Select
                            style={{
                              width: 250,
                              marginLeft: 10,
                            }}
                            onChange={(value) => {
                              this.setState({
                                fixTargetVersionId: value,
                              });
                            }}
                            defaultValue={this.props.versionDelInfo.versionNames
                              ? planning[0].versionId : undefined}
                          >
                            {this.props.versionDelInfo.versionNames ? (
                              planning.map(item => (
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
                          value={1}
                        >
                          {'删除版本'}
                        </Radio>
                      </RadioGroup>
                    </div>
                  ) : ''
                }
              </div>
            ) : ''
          }
        </div>
      </Sidebar>
    );
  }
}

export default DeleteReleaseWithIssue;
