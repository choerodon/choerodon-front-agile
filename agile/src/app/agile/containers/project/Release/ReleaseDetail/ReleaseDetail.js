import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import {
  Page, Header, Content, stores, Permission, 
} from 'choerodon-front-boot';

import {
  Button, Tabs, Table, Popover, Form, Icon, Spin, Avatar, Tooltip, 
} from 'choerodon-ui';
import ReleaseStore from '../../../../stores/project/release/ReleaseStore';
import './ReleaseDetail.scss';
import PublicRelease from '../ReleaseComponent/PublicRelease';
import ReportStore from '../../../../stores/project/Report';
import { STATUS } from '../../../../common/Constant';

const TabPane = Tabs.TabPane;
const { AppState } = stores;

@observer
class ReleaseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIssue: {},
      publicVersion: false,
    };
  }

  componentWillMount() {
    document.getElementById('autoRouter').style.overflow = 'scroll';
    this.refresh();
  }

  componentWillUnmount() {
    document.getElementById('autoRouter').style.overflow = 'unset';
  }

  refresh() {
    this.setState({
      loading: true,
    });
    ReleaseStore.axiosGetVersionDetail(this.props.match.params.id).then((res) => {
      ReleaseStore.setVersionDetail(res);
      this.setState({
        loading: false,
      });
    }).catch((error) => {
    });
    ReleaseStore.axiosGetVersionStatusIssues(this.props.match.params.id).then((res2) => {
      ReleaseStore.setVersionStatusIssues(res2);
      this.setState({
        loading: false,
      });
    }).catch((error2) => {
    });
  }

  handleChangeTab(key) {
    ReleaseStore.axiosGetVersionStatusIssues(this.props.match.params.id, key).then((res2) => {
      this.setState({
        selectedIssue: {},
      });
      ReleaseStore.setVersionStatusIssues(res2);
    }).catch((error2) => {
    });
  }

  renderTypecode(item, type) {
    if (item.typeCode === 'issue_epic') {
      if (type === 'background') {
        return '#743BE7';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="priority" />
        );
      }
    }
    if (item.typeCode === 'story') {
      if (type === 'background') {
        return '#00BFA5';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="turned_in" />
        );
      }
    }
    if (item.typeCode === 'task') {
      if (type === 'background') {
        return '#4D90FE';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
        );
      }
    }
    if (item.typeCode === 'sub_task') {
      if (type === 'background') {
        return '#4D90FE';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="relation" />
        );
      }
    }
    if (item.typeCode === 'bug') {
      if (type === 'background') {
        return '#F44336';
      } else {
        return (
          <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
        );
      }
    }
    return '';
  }

  renderBorderRadius(position) {
    let radius = {};
    if (position === 'done') {
      if (ReleaseStore.getVersionDetail.doneIssueCount) {
        radius = {
          borderTopLeftRadius: '10px',
          borderBottomLeftRadius: '10px',
        };
      }
      if (!(ReleaseStore.getVersionDetail.doingIssueCount
          || ReleaseStore.getVersionDetail.todoIssueCount)) {
        radius = {
          ...radius,
          borderTopRightRadius: '10px',
          borderBottomRightRadius: '10px',
        };
      }
    } else if (position === 'doing') {
      if (!ReleaseStore.getVersionDetail.doneIssueCount) {
        radius = {
          borderTopLeftRadius: '10px',
          borderBottomLeftRadius: '10px',
        };
      }
      if (!ReleaseStore.getVersionDetail.todoIssueCount) {
        radius = {
          ...radius,
          borderTopRightRadius: '10px',
          borderBottomRightRadius: '10px',
        };
      }
    } else {
      if (!(ReleaseStore.getVersionDetail.doneIssueCount
          || ReleaseStore.getVersionDetail.doingIssueCount)) {
        radius = {
          borderTopLeftRadius: '10px',
          borderBottomLeftRadius: '10px',
        };
      }
      if (ReleaseStore.getVersionDetail.todoIssueCount) {
        radius = {
          ...radius,
          borderTopRightRadius: '10px',
          borderBottomRightRadius: '10px',
        };
      }
    }
    return radius;
  }

  renderStatusBackground(record) {
    if (record.categoryCode === 'done' || record === '已完成') {
      return 'rgb(0, 191, 165)';
    } else if (record.categoryCode === 'doing' || record === '处理中') {
      return 'rgb(77, 144, 254)';
    } else if (record.categoryCode === 'todo' || record === '待处理') {
      return 'rgb(255, 177, 0)';
    } else {
      return 'gray';
    }
  }

  renderTabTables(columns) {
    const urlParams = AppState.currentMenuType;
    return (
      <div>
        <div style={{
          padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        }}
        >
          <p>{`共${ReleaseStore.getVersionStatusIssues.length}个`}</p>
          <p
            style={{
              color: '#3F51B5',
              cursor: 'pointer',
            }}
            role="none"
            onClick={() => {
              const { history } = this.props;
              history.push(`/agile/issue?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&paramType=version&paramId=${ReleaseStore.getVersionDetail.versionId}&paramName=${encodeURIComponent(`${ReleaseStore.getVersionDetail.name}下的问题`)}&paramUrl=release/detail/${ReleaseStore.getVersionDetail.versionId}`);
            }}
          >
            {'在“问题管理中”查看'}
            <Icon style={{ fontSize: 13 }} type="open_in_new" />
          </p>
        </div>
        <Table
          ref={(node) => { this.Table = node; }}
          pagination={ReleaseStore.getVersionStatusIssues.length > 10}
          dataSource={ReleaseStore.getVersionStatusIssues}
          columns={columns}
          onRow={record => ({
            onClick: () => {
              this.setState({
                selectedIssue: record,
              });
            },
          })}
          rowKey="issueId"
        />
      </div>
    );
  }

  renderPopContent(type) {
    let name;
    let data;
    let background;
    if (type === 'done') {
      name = '已完成';
      data = ReleaseStore.getVersionDetail.doneCategoryIssueCount;
      background = 'rgb(0, 191, 165)';
    } else if (type === 'doing') {
      name = '处理中';
      data = ReleaseStore.getVersionDetail.doingCategoryIssueCount;
      background = 'rgb(77, 144, 254)';
    } else {
      name = '待处理';
      data = ReleaseStore.getVersionDetail.todoCategoryIssueCount;
      background = 'rgb(255, 177, 0)';
    }
    return (
      <div>
        <p>{name}</p>
        <p style={{ marginTop: 3 }}>
          {'类别'}
          <span style={{ color: '#3575DF' }}>{name}</span>
          {'中有'}
          {data ? data.length : 0}
          {'种状态'}
        </p>
        {data
          ? data.map(item => (
            <div key={item.id} style={{ margin: '14px 0' }}>
              <span
                style={{
                  background,
                  color: 'white',
                  padding: '1px 4px',
                  marginRight: 16,
                }}
              >
                {item.name}

              </span>
              <span>
                {item.issueCount}
                {'个'}
              </span>
            </div>
          )) : ''}
      </div>
    );
  }

  renderPriorityStyle(type, item) {
    if (type === 'color') {
      if (item.priorityName === '中') {
        return 'rgb(53, 117, 223)';
      } else if (item.priorityName === '高') {
        return 'rgb(255, 177, 0)';
      } else {
        return 'rgba(0, 0, 0, 0.36)';
      }
    } else if (item.priorityName === '中') {
      return 'rgba(77, 144, 254, 0.2)';
    } else if (item.priorityName === '高') {
      return 'rgba(255, 177, 0, 0.12)';
    } else {
      return 'rgba(0, 0, 0, 0.08)';
    }
  }

  render() {
    const urlParams = AppState.currentMenuType;
    const columns = [
      {
        width: '10%',
        title: '编码',
        dataIndex: 'issueNum',
        key: 'issueNum',
        render: text => <span className="textDisplayOneColumn">{text}</span>,
      },
      {
        width: '10%',
        title: '问题类型',
        dataIndex: 'typeCode',
        key: 'typeCode',
        render: (text, record) => (
          <div
            style={{
              width: 20,
              height: 20,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '4px',
              background: record.issueTypeDTO ? record.issueTypeDTO.colour : '#fab614',
            }}
          >
            <Icon
              style={{ color: 'white', fontSize: '16px' }}
              type={record.issueTypeDTO ? record.issueTypeDTO.icon : 'help'}
            />
          </div>
        ),
      },
      {
        width: '40%',
        title: '问题名称',
        dataIndex: 'summary',
        key: 'summary',
        render: text => <span className="textDisplayOneColumn">{text}</span>,
      },
      {
        width: '15%',
        title: '经办人',
        dataIndex: 'assigneeName',
        key: 'assigneeName',
        render: (text, record) => (text ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar style={{ marginRight: 8 }} size="small" src={record.imageUrl ? record.imageUrl : ''}>
              {
              record.imageUrl ? '' : text.substring(0, 1)
            }
            </Avatar>
            <span className="textDisplayOneColumn">{text}</span>
          </div>
        ) : '')
        ,
      },
      {
        width: '10%',
        title: '优先级',
        dataIndex: 'priorityName',
        key: 'priorityName',
        render: (text, record) => (
          <span
            style={{
              padding: '1px 4px',
              color: record.priorityDTO ? record.priorityDTO.colour : '#FFFFFF',
              background: `${record.priorityDTO ? record.priorityDTO.colour : '#FFFFFF'}4C`,
            }}
          >
            {record.priorityDTO ? record.priorityDTO.name : ''}
          </span>
        ),
      }, {
        width: '15%',
        title: '状态',
        dataIndex: 'statusName',
        render: (text, record) => (
          <span
            style={{
              padding: '4px 6px',
              color: 'white',
              background: STATUS[record.statusMapDTO.type],
              borderRadius: 2,
            }}
          >
            {record.statusMapDTO.name}
          </span>
        ),
      },
    ];
    return (
      <Page>
        <Header
          title={(
            <Tooltip title={`版本${ReleaseStore.getVersionDetail.name}`}>
              <div 
                style={{ 
                  display: 'inline-block',
                  maxWidth: '141px', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  marginTop: '23px',
                }}
              >
                {`版本 ${ReleaseStore.getVersionDetail.name}`}
              </div>
            </Tooltip>
 )}
          backPath={`/agile/release?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}`}
        >
          
          <div style={{
            marginLeft: 12, fontSize: 13, color: '#FFB100', padding: '1px 10px', background: 'rgba(255,177,0,0.08)', height: 20, lineHeight: '20px',
          }}
          >
            {ReleaseStore.getVersionDetail.statusName}

          </div>
               
          {
            ReleaseStore.getVersionDetail.statusCode === 'archived' ? '' : (
              <Permission service={ReleaseStore.getVersionDetail.statusCode === 'version_planning' ? ['agile-service.product-version.releaseVersion'] : ['agile-service.product-version.revokeReleaseVersion']}>
                <Button
                  funcType="flat"
                  style={{
                    marginLeft: 8,
                  }}
                  onClick={() => {
                    if (ReleaseStore.getVersionDetail.statusCode === 'version_planning') {
                      ReleaseStore.axiosGetPublicVersionDetail(
                        ReleaseStore.getVersionDetail.versionId,
                      )
                        .then((res) => {
                          ReleaseStore.setPublicVersionDetail(res);
                          this.setState({ publicVersion: true });
                        }).catch((error) => {
                        });
                    } else {
                      ReleaseStore.axiosUnPublicRelease(
                        ReleaseStore.getVersionDetail.versionId,
                      ).then((res2) => {
                        this.refresh();
                      }).catch((error) => {
                      });
                    }
                  }}
                >
                  <Icon type="publish2" />
                  <span>{ReleaseStore.getVersionDetail.statusCode === 'version_planning' ? '发布' : '撤销发布'}</span>
                </Button>
              </Permission>
            )
          }
          <Button
            funcType="flat"
            style={{
              marginLeft: 8,
            }}
            onClick={() => {
              const { history } = this.props;
              history.push(`/agile/release/logs/${this.props.match.params.id}?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}`);
            }}
          >
            <Icon type="find_in_page" />
            <span>版本日志</span>
          </Button>

        </Header>
        <Content className="c7n-versionDetail">
          <Spin spinning={this.state.loading}>
            <div style={{ display: 'flex', color: 'rgba(0,0,0,0.54)' }}>
              <div className="c7n-versionTime">
                <Icon style={{ fontSize: 20 }} type="date_range" />
                {'创建日期:'}
                <span className="c7n-version-timemoment">{ReleaseStore.getVersionDetail.startDate ? ReleaseStore.getVersionDetail.startDate.slice(0, 10) : '无'}</span>
              </div>
              <div className="c7n-versionTime" style={{ marginLeft: 80 }}>
                <Icon style={{ fontSize: 20 }} type="date_range" />
                {'更新日期:'}
                <span className="c7n-version-timemoment">{ReleaseStore.getVersionDetail.releaseDate ? ReleaseStore.getVersionDetail.releaseDate.slice(0, 10) : '无'}</span>
              </div>
            </div>
            <div className="c7n-release-issueClassify">
              <Popover
                placement="bottom"
                content={this.renderPopContent('done')}
              >
                <div
                  style={{
                    flex: ReleaseStore.getVersionDetail.doneIssueCount,
                    background: '#00BFA5',
                    ...this.renderBorderRadius('done'),
                  }}
                  className="c7n-release-issueDone"
                />
              </Popover>
              <Popover
                placement="bottom"
                content={this.renderPopContent('doing')}
              >
                <div
                  style={{
                    flex: ReleaseStore.getVersionDetail.doingIssueCount,
                    background: '#4D90FE',
                    ...this.renderBorderRadius('doing'),
                  }}
                  className="c7n-release-issueDoing"
                />
              </Popover>
              <Popover
                placement="bottom"
                content={this.renderPopContent('todo')}
              >
                <div
                  style={{
                    flex: ReleaseStore.getVersionDetail.todoIssueCount,
                    background: '#FFB100',
                    ...this.renderBorderRadius('todo'),
                  }}
                  className="c7n-release-issueTodo"
                />
              </Popover>
            </div>
            <div>
              <Tabs
                animated={false}
                onChange={this.handleChangeTab.bind(this)}
                style={{ marginTop: 28 }}
              >
                <TabPane
                  tab={(
                    <div className="c7n-release-tabTitle">
                      <span className="c7n-release-titleNum">{ReleaseStore.getVersionDetail.issueCount}</span>
                      <span>


                        {'当前版本'}
                        <br />
                        {'个问题'}
                      </span>
                    </div>
)}
                  key="0"
                >
                  {this.renderTabTables(columns)}
                </TabPane>
                <TabPane
                  tab={(
                    <div className="c7n-release-tabTitle">
                      <span style={{ color: 'rgb(0, 191, 165)' }} className="c7n-release-titleNum">{ReleaseStore.getVersionDetail.doneIssueCount}</span>
                      <span>
                        {'问题'}
                        <br />
                        {'已完成'}
                      </span>
                    </div>
                    )}
                  key="done"
                >
                  {this.renderTabTables(columns)}

                </TabPane>
                <TabPane
                  tab={(
                    <div className="c7n-release-tabTitle">
                      <span style={{ color: 'rgb(77, 144, 254)' }} className="c7n-release-titleNum">{ReleaseStore.getVersionDetail.doingIssueCount}</span>
                      <span>
                        {'问题'}
                        <br />


                        {'正在处理'}
                      </span>
                    </div>
)}
                  key="doing"
                >
                  {this.renderTabTables(columns)}

                </TabPane>
                <TabPane
                  tab={(
                    <div className="c7n-release-tabTitle">
                      <span style={{ color: 'rgb(255, 177, 0)' }} className="c7n-release-titleNum">{ReleaseStore.getVersionDetail.todoIssueCount}</span>
                      <span>
                        {'问题'}
                        <br />
                        {'待处理'}
                      </span>
                    </div>
                  )}
                  key="todo"
                >
                  {this.renderTabTables(columns)}

                </TabPane>
              </Tabs>
            </div>

            <PublicRelease
              visible={this.state.publicVersion}
              onCancel={() => {
                this.setState({
                  publicVersion: false,
                });
              }}
              refresh={this.refresh.bind(this)}
            />
          </Spin>

        </Content>
      </Page>
    );
  }
}

export default Form.create()(withRouter(ReleaseDetail));
