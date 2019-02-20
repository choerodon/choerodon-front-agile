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
const { Option } = Select;

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
    const { versionDelInfo, onCancel, refresh } = this.props;
    const {
      influenceRadio, influenceTargetVersionId, fixTargetRadio, fixTargetVersionId,
    } = this.state;
    const data2 = {
      projectId: AppState.currentMenuType.id,
      versionId: versionDelInfo.versionId,
    };
    if (versionDelInfo.influenceIssueCount) {
      if (!influenceRadio) {
        data2.influenceTargetVersionId = influenceTargetVersionId;
      }
    }
    if (versionDelInfo.fixIssueCount) {
      if (!fixTargetRadio) {
        data2.fixTargetVersionId = fixTargetVersionId;
      }
    }
    ReleaseStore.axiosDeleteVersion(data2).then((data) => {
      onCancel();
      refresh();
    }).catch((error) => {
    });
  }

  render() {
    const { planning } = this.state;
    const { versionDelInfo, onCancel } = this.props;
    const filteredVersion = planning.filter(item => item.versionId !== versionDelInfo.versionId)
    return (
      <Sidebar
        title={`删除版本 ${versionDelInfo.versionName}`}
        closable={false}
        visible={JSON.stringify(versionDelInfo) !== '{}'}
        okText="删除"
        cancelText="取消"
        onCancel={onCancel.bind(this)}
        onOk={this.handleOk.bind(this)}
      >
        <p>您想对分配给此版本的任何问题做什么?</p>
        <div style={{ marginTop: 25 }}>
          {
            versionDelInfo.influenceIssueCount ? (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ flex: 1 }}>
                  {`此版本影响问题数：${versionDelInfo.influenceIssueCount}`}
                </p>
                {
                  versionDelInfo.versionNames.length > 0 ? (
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
                            defaultValue={versionDelInfo.versionNames
                              && filteredVersion.length > 0 ? filteredVersion[0].versionId : undefined}
                          >
                            {versionDelInfo.versionNames ? (
                              filteredVersion
                                .map(item => (
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
            versionDelInfo.fixIssueCount ? (
              <div>
                <p style={{ flex: 1 }}>
                  {`此版本修复问题数：${versionDelInfo.fixIssueCount}`}
                </p>
                {
                  versionDelInfo.versionNames.length > 0 ? (
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
                            defaultValue={versionDelInfo.versionNames
                              && filteredVersion.length > 0 ? filteredVersion[0].versionId : undefined}
                          >
                            {versionDelInfo.versionNames ? (
                              filteredVersion.map(item => (
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
