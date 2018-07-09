import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Page, Header, Content, stores, Permission } from 'choerodon-front-boot';
import { Button, Table, Menu, Dropdown, Icon, Modal, Radio, Select, Spin } from 'choerodon-ui';
import { Action } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import AddRelease from '../ReleaseComponent/AddRelease';
import '../../../main.scss';
import ReleaseStore from '../../../../stores/project/release/ReleaseStore';
import './ReleaseHome.scss';
import EditRelease from '../ReleaseComponent/EditRelease';
import PublicRelease from '../ReleaseComponent/PublicRelease';
import emptyVersion from '../../../../assets/image/emptyVersion.png';
import DeleteReleaseWithIssues from '../ReleaseComponent/DeleteReleaseWithIssues';
import CombineRelease from '../ReleaseComponent/CombineRelease';

const confirm = Modal.confirm;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const { Sidebar } = Modal;
const { AppState } = stores;

@observer
class ReleaseHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editRelease: false,
      addRelease: false,
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
      },
      selectItem: {},
      versionDelete: {},
      versionDelInfo: {},
      publicVersion: false,
      radioChose: null,
      selectChose: null,
      combineVisible: false,
      loading: false,
      sourceList: [],
    };
  }
  componentWillMount() {
    this.refresh(this.state.pagination);
  }
  refresh(pagination) {
    this.setState({
      loading: true,
    });
    ReleaseStore.axiosGetVersionList({
      page: pagination.current - 1,
      size: pagination.pageSize,
    }).then((data) => {
      ReleaseStore.setVersionList(data.content);
      this.setState({
        loading: false,
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data.totalElements,
        },
      });
    }).catch((error) => {
      window.console.error(error);
    });
  }
  handleClickMenu(record, e) {
    const that = this;
    if (e.key.indexOf('0') !== -1) {
      if (record.statusCode === 'version_planning') {
        ReleaseStore.axiosGetPublicVersionDetail(record.versionId)
          .then((res) => {
            ReleaseStore.setPublicVersionDetail(res);
            ReleaseStore.setVersionDetail(record);
            this.setState({ publicVersion: true }); 
          }).catch((error) => {
            window.console.error(error);
          });
      } else {
        ReleaseStore.axiosUnPublicRelease(
          record.versionId).then((res2) => {
          this.refresh(this.state.pagination);
        }).catch((error) => {
          window.console.error(error);
        });
      }
    }
    if (e.key.indexOf('2') !== -1) {
      if (ReleaseStore.getVersionList.length > 1) {
        ReleaseStore.axiosVersionIssueStatistics(record.versionId).then((res) => {
          if (res.fixIssueCount > 0 || res.influenceIssueCount > 0) {
            this.setState({
              versionDelInfo: {
                versionName: record.name,
                versionId: record.versionId,
                ...res,
              },
            });
          } else {
            this.setState({
              versionDelete: record,
            });
          }
        }).catch((error) => {
          window.console.error(error);
        });
      } else {
        this.setState({
          versionDelete: record,
        });
      }
    }
    if (e.key.indexOf('3') !== -1) {
      ReleaseStore.axiosGetVersionDetail(record.versionId).then((res) => {
        ReleaseStore.setVersionDetail(res);
        this.setState({
          selectItem: record,
          editRelease: true,
        });
      }).catch((error) => {
        window.console.error(error);
      });
    }
    if (e.key.indexOf('1') !== -1) {
      if (record.statusCode === 'archived') {
        // 撤销归档
        ReleaseStore.axiosUnFileVersion(record.versionId).then((res) => {
          this.refresh(this.state.pagination);
        }).catch((error) => {
          window.console.error(error);
        });
      } else {
        // 归档
        ReleaseStore.axiosFileVersion(record.versionId).then((res) => {
          this.refresh(this.state.pagination);
        }).catch((error) => {
          window.console.error(error);
        });
      }
    }
  }
  handleChangeTable(pagination, filters, sorter) {
    this.refresh({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  }
  handleCombineRelease() {
    ReleaseStore.axiosGetVersionListWithoutPage().then((res) => {
      this.setState({
        combineVisible: true,
        sourceList: res,
      });
    }).catch((error) => {
      window.console.error(error);
    });
  }
  render() {
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    const versionData = ReleaseStore.getVersionList.length > 0 ? ReleaseStore.getVersionList : [];
    const getMenu = record => (
      <Menu onClick={this.handleClickMenu.bind(this, record)}>
        {
          record.statusCode === 'archived' ? '' : (
            <Permission type={type} projectId={projectId} organizationId={orgId} service={record.statusCode === 'version_planning' ? ['agile-service.product-version.releaseVersion'] : ['agile-service.product-version.revokeReleaseVersion']}>
              <Menu.Item key="0">
                {record.statusCode === 'version_planning' ? '发布' : '撤销发布'}
              </Menu.Item>
            </Permission>
          )
        }
        <Permission type={type} projectId={projectId} organizationId={orgId} service={record.statusCode === 'archived' ? ['agile-service.product-version.revokeArchivedVersion'] : ['agile-service.product-version.archivedVersion']}>
          <Menu.Item key="3">
            {record.statusCode === 'archived' ? '撤销归档' : '归档'}
          </Menu.Item>
        </Permission>
        {
          record.statusCode === 'archived' ? '' : (
            <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.product-version.deleteVersion']}>
              <Menu.Item key="4">
          删除
              </Menu.Item>
            </Permission>
          )
        }
        <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.product-version.updateVersion']}>
          <Menu.Item key="5">
          编辑
          </Menu.Item>
        </Permission>
      </Menu>
    );
    const versionColumn = [{
      title: '版本',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <span
          className="c7n-release-name"
          role="none"
          onClick={() => {
            const { history } = this.props;
            const urlParams = AppState.currentMenuType;
            history.push(`/agile/release/detail/${record.versionId}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`);
          }}
        >{text}</span>
      ),
    }, {
      title: '版本状态',
      dataIndex: 'status',
      key: 'key',
      render: text => <p><span style={{ color: '#00BFA5', background: ' rgba(0,191,165,0.08)', padding: '1px 10px' }}>{text}</span></p>,
    }, {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: text => (text ? <p>{text.split(' ')[0]}</p> : ''),
    }, {
      title: '结束日期',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: text => (text ? <p>{text.split(' ')[0]}</p> : ''),
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    }, {
      title: '',
      dataIndex: 'option',
      key: 'option',
      render: (text, record) => (
        <Dropdown overlay={getMenu(record)} trigger="click">
          <Button shape="circle" icon="more_vert" />
        </Dropdown>
      ),
    }];
    return (
      <Page
        service={[
          'agile-service.product-version.releaseVersion',
          'agile-service.product-version.revokeReleaseVersion',
          'agile-service.product-version.revokeArchivedVersion',
          'agile-service.product-version.archivedVersion',
          'agile-service.product-version.deleteVersion',
          'agile-service.product-version.updateVersion',
          'agile-service.product-version.createVersion',
          'agile-service.product-version.mergeVersion',
        ]}
      >
        <Header title="发布版本">
          <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.product-version.createVersion']}>
            <Button
              onClick={() => {
                this.setState({
                  addRelease: true,
                });
              }}
              className="leftBtn"
              funcTyp="flat"
            >
              <Icon type="playlist_add" />创建发布版本
            </Button>
          </Permission>
          <Permission service={['agile-service.product-version.mergeVersion']} type={type} projectId={projectId} organizationId={orgId}>
            <Button 
              className="leftBtn2" 
              funcTyp="flat"
              onClick={this.handleCombineRelease.bind(this)}
            >
              <Icon type="device_hub" />版本合并
            </Button>
          </Permission>
          <Button className="leftBtn2" funcTyp="flat" onClick={this.refresh.bind(this, this.state.pagination)}>
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title={`项目"${AppState.currentMenuType.name}"的发布版本`}
          description="根据项目周期，可以对软件项目追踪不同的版本，同时可以将对应的问题分配到版本中。例如：v1.0.0、v0.5.0等。"
          link="http://v0-7.choerodon.io/zh/docs/user-guide/agile/release/"
        >
          <Spin spinning={this.state.loading}>
            {
              versionData.length > 0 ? (
                <Table
                  columns={versionColumn}
                  dataSource={versionData}
                  pagination={this.state.pagination}
                  onChange={this.handleChangeTable.bind(this)}
                />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: 800,
                      height: 280,
                      border: '1px dashed rgba(0,0,0,0.54)',
                      justifyContent: 'center',
                    }}
                  >
                    <img style={{ width: 237, height: 200 }} src={emptyVersion} alt="emptyVersion" />
                    <div style={{ marginLeft: 50 }}>
                      <p style={{ color: 'rgba(0,0,0,0.65)' }}>您还没有为此项目添加任何版本</p>
                      <p style={{ fontSize: '20px', lineHeight: '34px' }}>版本是一个项目的时间点，并帮助<br />您组织和安排工作</p>
                    </div>
                  </div>
                </div>
              )
            }
          </Spin>
          <AddRelease
            visible={this.state.addRelease}
            onCancel={() => {
              this.setState({
                addRelease: false,
              });
            }}
            refresh={this.refresh.bind(this, this.state.pagination)}
          />
          <Modal
            title={`删除版本 V${this.state.versionDelete.name}`}
            visible={JSON.stringify(this.state.versionDelete) !== '{}'}
            closable={false}
            okText="删除"
            onOk={() => {
              const data2 = {
                projectId: AppState.currentMenuType.id,
                versionId: this.state.versionDelete.versionId,
              };
              ReleaseStore.axiosDeleteVersion(data2).then((data) => {
                this.refresh(this.state.pagination);
                this.setState({
                  versionDelete: {},
                });
              }).catch((error) => {
                window.console.error(error);
              });
            }}
            onCancel={() => {
              this.setState({
                versionDelete: {},
              });
            }}
          >
            <div style={{ marginTop: 20 }}>
              {`确定要删除 V${this.state.versionDelete.name}?`}
            </div>
          </Modal>
          <CombineRelease
            onRef={(ref) => {
              this.combineRelease = ref;
            }}
            sourceList={this.state.sourceList}
            visible={this.state.combineVisible}
            onCancel={() => {
              this.setState({
                combineVisible: false,
              });
            }}
            refresh={this.refresh.bind(this, this.state.pagination)}
          />
          <DeleteReleaseWithIssues
            versionDelInfo={this.state.versionDelInfo}
            onCancel={() => {
              this.setState({
                versionDelInfo: {},
                versionDelete: {},
              });
            }}
            refresh={this.refresh.bind(this, this.state.pagination)}
            changeState={(k, v) => {
              this.setState({
                [k]: v,
              });
            }}
          />
          {this.state.editRelease ? (
            <EditRelease
              visible={this.state.editRelease}
              onCancel={() => {
                this.setState({
                  editRelease: false,
                  selectItem: {},
                });
              }}
              refresh={this.refresh.bind(this, this.state.pagination)}
              data={this.state.selectItem}
            />
          ) : ''}
          <PublicRelease
            visible={this.state.publicVersion}
            onCancel={() => {
              this.setState({
                publicVersion: false,
              });
            }}
            refresh={this.refresh.bind(this, this.state.pagination)}
          />
        </Content>
      </Page>
    );
  }
}

export default withRouter(ReleaseHome);

