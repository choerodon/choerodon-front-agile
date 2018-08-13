import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import { Table, Button, Select, Popover, Tabs, Tooltip, Input, Dropdown, Menu, Pagination, Spin, Icon, Card, Checkbox } from 'choerodon-ui';
import './Home.scss';
import CreateEpic from '../component/CreateEpic';
import Backlog from '../component/Backlog/Backlog.js';
import EpicCard from '../component/EpicCard/EpicCard.js';
import IssueCard from '../component/IssueCard/IssueCard.js';
import CreateIssue from '../component/CreateIssue/CreateIssue.js';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { AppState } = stores;

@observer
class Home1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      more: false,
      expand: false,
      expandColumns: [],
      showBackLog: false,
    };
  }
  componentDidMount() {
    this.initData();
    const timer = setInterval(() => {
      if (document.getElementsByClassName('filter').length > 0) {
        if (document.getElementsByClassName('filter')[0].scrollHeight > document.getElementsByClassName('filter')[0].clientHeight) {
          this.setState({
            more: true,
          });
        }
        clearInterval(timer);
      }
    }, 1000);
  }
  initData =() => {
    this.setState({ loading: true });
    this.props.UserMapStore.initData();
  };

  addFilter = () => {

  };
  changeMode =(options) => {
    this.props.UserMapStore.setMode(options.key);
    const mode = options.key;
    if (mode === 'sprint') {
      this.props.UserMapStore.loadSprints();
    } else if (mode === 'version') {
      this.props.UserMapStore.loadVersions();
    }
    this.props.UserMapStore.loadIssues(options.key, 'usermap');
    this.props.UserMapStore.loadBacklogIssues();
  };
  handleCreateEpic = () => {
    this.props.UserMapStore.setCreateEpic(true);
  };

  addFilter =(e) => {
    const { currentFilters } = this.props.UserMapStore;
    const arr = _.cloneDeep(currentFilters);
    const value = e._dispatchInstances.key;
    if (currentFilters.includes(value)) {
      const index = arr.indexOf(value);
      arr.splice(index, 1);
    } else {
      arr.push(value);
    }
    this.props.UserMapStore.setCurrentFilter(arr);
  };

  changeMenuShow =(options) => {
    const { moreMenuShow } = this.state;
    this.setState({ moreMenuShow: !moreMenuShow });
  };

  filterIssue =(e) => {
    e.stopPropagation();
  };

  expandColumn =(id) => {
    const { expandColumns } = this.state;
    const index = expandColumns.indexOf(id);
    if (index === -1) {
      expandColumns.push(id);
    } else {
      expandColumns.splice(index, 1);
    }
    this.setState({ expandColumns });
  };
  showBackLog =() => {
    this.setState({ showBackLog: !this.state.showBackLog });
  };

  render() {
    window.console.log(this.state.expandColumns);
    const { showBackLog } = this.state;
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    const { filters, mode, issues, createEpic, currentFilters, sprints, versions } = UserMapStore;
    const swimlanMenu = (
      <Menu onClick={this.changeMode} selectable>
        <Menu.Item key="none">无泳道</Menu.Item>
        <Menu.Item key="version">版本泳道</Menu.Item>
        <Menu.Item key="sprint">冲刺泳道</Menu.Item>
      </Menu>
    );
    return (
      <Page
        className="c7n-map"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Header title="用户故事地图">
          <Dropdown overlay={swimlanMenu} trigger={['click']}>
            <Button>
              {mode === 'none' && '无泳道'}
              {mode === 'version' && '版本泳道'}
              {mode === 'sprint' && '冲刺泳道'}
              <Icon type="arrow_drop_down" />
            </Button>
          </Dropdown>
          <Popover
            className={'moreMenu-popover'}
            trigger={'click'}
            content={<div style={{ padding: '2px -4px' }} className="moreMenu">
              <div className="menu-title">史诗过滤器</div>
              <div style={{ height: 22, marginBottom: 10 }}>
                <Checkbox>已完成的史诗</Checkbox>
              </div>
              <div style={{ height: 22 }} >
                <Checkbox>应用快速搜索到史诗</Checkbox>
              </div>
              <div className="menu-title">导出</div>
              <div style={{ height: 22, marginBottom: 10, marginLeft: 26 }}>导出为excel</div>
              <div style={{ height: 22, marginBottom: 10, marginLeft: 26 }}>导出为图片</div>
            </div>}
          >
            <div style={{ cursor: 'pointer', color: 'rgb(63, 81, 181)', fontWeight: 500, marginTop: 6 }}>
              更多 <Icon type="arrow_drop_down" />
            </div>
          </Popover>
          <Button className="leftBtn" functyp="flat" onClick={this.handleCreateEpic}>
            <Icon type="playlist_add" />创建史诗
          </Button>
          <Button style={{ marginLeft: '60%', color: 'white' }} type="primary" funcType="raised" onClick={this.showBackLog}>
            <Icon type="playlist_add" />需求池
          </Button>
        </Header>
        <div style={{ display: 'flex' }}>
          <div style={{ position: 'relative', width: `${showBackLog ? 'calc(100% - 396px)' : '100%'}` }}>
            <div style={{ position: 'absolute', width: `${showBackLog ? `calc(100% - 396px)` : '100%'}`, display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }} className="map-content">
              <div style={{ width: '100%', background: 'white', position: 'relative', padding: '10px 24px 10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="filter" style={{ height: this.state.expand ? '' : 27 }}>
                  <p>快速搜索:</p>
                  <p role="none" style={{ background: `${currentFilters.includes('onlyMe') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('onlyMe') ? 'white' : '#3F51B5'}`, marginBottom: 3 }} onClick={this.addFilter} key={'onlyMe'}>仅我的问题</p>
                  <p role="none" style={{ background: `${currentFilters.includes('onlyStory') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('onlyStory') ? 'white' : '#3F51B5'}`, marginBottom: 3 }} onClick={this.addFilter} key={'onlyStory'}>仅用户故事</p>
                  {filters.map(filter => <p role="none" style={{ background: `${currentFilters.includes(filter.filterId.toString()) ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes(filter.filterId.toString()) ? 'white' : '#3F51B5'}`, marginBottom: 3}} onClick={this.addFilter} key={filter.filterId}>{filter.name}</p>) }
                </div>
                <div
                  style={{
                    display: this.state.more ? 'block' : 'none',
                    color: 'rgb(63, 81, 181)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  role="none"
                  onClick={() => {
                    this.setState({
                      expand: !this.state.expand,
                    });
                  }}
                >
                  {this.state.expand ? '...收起' : '...展开'}
                </div>
              </div>
              <div style={{ display: 'flex', height: 98 }} >
                {epicData.map(epic => (
                  <EpicCard
                    epic={epic}
                  />
                ))}
              </div>
              <div className="swimlane-container" style={{ overflowY: 'scroll', height: `calc(100vh - ${document.getElementById('autoRouter').offsetTop + 48 + 48 + 10 + 98 + 58}px)`}}>
                {mode === 'none' && (<React.Fragment>
                  <div style={{ width: '100%', height: 42, position: 'relative' }}>
                    <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                      <span style={{ float: 'left' }}>issue</span>
                      <div style={{ right: 10, display: 'flex', marginTop: 10, float: 'left', marginLeft: `${showBackLog ? `calc(100vw - ${327 + 250 + 25 + 24 + 100}px)` : '100%'}` }}>
                        <p className="point-span" style={{ background: '#4D90FE' }}>
                          {_.reduce(issues, (sum, issue) => {
                            if (issue.statusCode === 'todo') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p className="point-span" style={{ background: '#FFB100' }}>
                          {_.reduce(issues, (sum, issue) => {
                            if (issue.statusCode === 'doing') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p className="point-span" style={{ background: '#00BFA5' }}>
                          {_.reduce(issues, (sum, issue) => {
                            if (issue.statusCode === 'done') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p onClick={this.expandColumn.bind(this, '-1-none')} role="none">
                          <Icon type={`${this.state.expandColumns.includes('-1-none') ? 'baseline-arrow_right' : 'baseline-arrow_drop_down'}`} />
                        </p>

                      </div>
                    </div>
                  </div>
                  <div style={{ display: this.state.expandColumns.includes('-1-none') ? 'none' : 'flex' }}>
                    {epicData.map((epic, index) => (<div className="swimlane-column">
                      <React.Fragment>
                        {_.filter(issues, issue => issue.epicId === epic.issueId).map(item => (
                          <IssueCard
                            issue={item}
                          />
                        ))}
                      </React.Fragment>
                    </div>))}
                  </div>
                </React.Fragment>
                )}
                {mode === 'sprint' && issues.length &&
                <React.Fragment>
                  {sprints.map(sprint => (<React.Fragment key={'sprint'}>
                    <div style={{ width: '100%', height: 42, position: 'relative' }}>
                      <div style={{ position: 'relative', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                        <span style={{ position: 'fixed', left: 274 }}>{sprint.sprintName}</span>
                        <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                          <p className="point-span" style={{ background: '#4D90FE' }}>
                            {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
                              if (issue.statusCode === 'todo') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p className="point-span" style={{ background: '#FFB100' }}>
                            {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
                              if (issue.statusCode === 'doing') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p className="point-span" style={{ background: '#00BFA5' }}>
                            {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
                              if (issue.statusCode === 'done') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p onClick={this.expandColumn.bind(this, sprint.sprintId)} role="none">
                            <Icon type={`${this.state.expandColumns.includes(sprint.sprintId) ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
                          </p>

                        </div>
                      </div>
                    </div>
                    <div style={{ display: this.state.expandColumns.includes(sprint.sprintId) ? 'none' : 'flex' }}>
                      {epicData.map((epic, index) => (<div className="swimlane-column">
                        <React.Fragment>
                          {_.filter(issues, issue => issue.epicId === epic.issueId && issue.sprintId === sprint.sprintId).map(item => (
                            <div className="issue-card">{item.epicId}</div>
                          ))}
                        </React.Fragment>
                      </div>))}
                    </div>
                  </React.Fragment>))}
                  <React.Fragment key={'no-sprint'}>
                    <div style={{ width: '100%', height: 42, position: 'relative' }}>
                      <div style={{ position: 'fixed', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                        <span style={{ position: 'fixed', left: 274 }}>未计划的</span>
                        <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                          <p className="point-span" style={{ background: '#4D90FE' }}>
                            {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
                              if (issue.statusCode === 'todo') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p className="point-span" style={{ background: '#FFB100' }}>
                            {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
                              if (issue.statusCode === 'doing') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p className="point-span" style={{ background: '#00BFA5' }}>
                            {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
                              if (issue.statusCode === 'done') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p onClick={this.expandColumn.bind(this, '-1-sprint')} role="none">
                            <Icon type={`${this.state.expandColumns.includes('-1-sprint') ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
                          </p>

                        </div>
                      </div>
                    </div>
                    <div style={{ display: this.state.expandColumns.includes('-1-sprint') ? 'none' : 'flex' }}>
                      {epicData.map((epic, index) => (<div className="swimlane-column">
                        <React.Fragment>
                          {_.filter(issues, issue => issue.epicId === epic.issueId && issue.sprintId == null).map(item => (
                            <div className="issue-card">{item.epicId}</div>
                          ))}
                        </React.Fragment>
                      </div>))}
                    </div>
                  </React.Fragment>
                </React.Fragment>
                }
                {mode === 'version' && issues.length && <React.Fragment>
                  {versions.map(version => (<React.Fragment>
                    <div style={{ width: '100%', height: 42, position: 'relative' }}>
                      <div style={{ position: 'fixed', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                        <span style={{ position: 'fixed', left: 274 }}>{version.name}</span>
                        <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                          <p className="point-span" style={{ background: '#4D90FE' }}>
                            {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
                              if (issue.statusCode === 'todo') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p className="point-span" style={{ background: '#FFB100' }}>
                            {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
                              if (issue.statusCode === 'doing') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p className="point-span" style={{ background: '#00BFA5' }}>
                            {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
                              if (issue.statusCode === 'done') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p onClick={this.expandColumn.bind(this, version.versionId)} role="none">
                            <Icon type={`${this.state.expandColumns.includes(version.versionId) ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
                          </p>

                        </div>
                      </div>
                    </div>
                    <div style={{ display: this.state.expandColumns.includes(version.versionId) ? 'none' : 'flex' }}>
                      {epicData.map((epic, index) => (<div className="swimlane-column">
                        <React.Fragment>
                          {_.filter(issues, issue => issue.epicId === epic.issueId && issue.versionId === version.versionId).map(item => (
                            <div className="issue-card">{item.epicId}</div>
                          ))}
                        </React.Fragment>
                      </div>))}
                    </div>
                  </React.Fragment>))}
                  <React.Fragment key={'no-sprint'}>
                    <div style={{ width: '100%', height: 42, position: 'relative' }}>
                      <div style={{ position: 'fixed', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                        <span style={{ position: 'fixed', left: 274 }}>未计划的</span>
                        <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                          <p className="point-span" style={{ background: '#4D90FE' }}>
                            {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
                              if (issue.statusCode === 'todo') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p className="point-span" style={{ background: '#FFB100' }}>
                            {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
                              if (issue.statusCode === 'doing') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p className="point-span" style={{ background: '#00BFA5' }}>
                            {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
                              if (issue.statusCode === 'done') {
                                return sum + issue.storyPoints;
                              } else {
                                return sum;
                              }
                            }, 0)}
                          </p>
                          <p onClick={this.expandColumn.bind(this, '-1-version')} role="none">
                            <Icon type={`${this.state.expandColumns.includes('-1-version') ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
                          </p>

                        </div>
                      </div>
                    </div>
                    <div style={{ display: this.state.expandColumns.includes('-1-version') ? 'none' : 'flex' }}>
                      {epicData.map((epic, index) => (<div className="swimlane-column">
                        <React.Fragment>
                          {_.filter(issues, issue => issue.epicId === epic.issueId && issue.versionId == null).map(item => (
                            <div className="issue-card">{item.epicId}</div>
                          ))}
                        </React.Fragment>
                      </div>))}
                    </div>
                  </React.Fragment>
                </React.Fragment>
                }
              </div>
            </div>
          </div>
          <div style={{ width: 372, display: this.state.showBackLog ? 'block' : 'none' }}>
            <Backlog />
          </div>
        </div>

        <CreateEpic visible={createEpic} />

      </Page>
    );
  }
}
export default Home1;
