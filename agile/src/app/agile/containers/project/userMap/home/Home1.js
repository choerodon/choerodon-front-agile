import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import {
  Page, Header, Content, stores, axios, 
} from 'choerodon-front-boot';
import { Button, Select, Popover, Tabs, Dropdown, Menu, Spin, Icon, Checkbox } from 'choerodon-ui';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './test.scss';
import CreateEpic from '../component/CreateEpic';
import Backlog from '../component/Backlog/Backlog.js';
import EpicCard from '../component/EpicCard/EpicCard.js';
import IssueCard from '../component/IssueCard/IssueCard.js';
import CreateVOS from '../component/CreateVOS';
import CreateIssue from '../component/CreateIssue/CreateIssue.js';
import epicPic from '../../../../assets/image/用户故事地图－空.svg';

const FileSaver = require('file-saver');

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { AppState } = stores;

@observer
class Home2 extends Component {
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
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.initData();
    const timer = setInterval(() => {
      if (document.getElementsByClassName('filter').length > 0) {
        if (document.getElementsByClassName('filter')[0].scrollHeight + 3 > document.getElementsByClassName('filter')[0].clientHeight) {
          this.setState({
            more: true,
          });
        }
        clearInterval(timer);
      }
    }, 1000);
    // window.addEventListener('scroll', this.handleScroll, true);
    // window.onscroll = this.handleScroll;
  }

  componentWillUnmount() {
    this.props.UserMapStore.setCurrentFilter([]);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  /**
   *键盘按起事件
   *
   * @param {*} event
   * @memberof Sprint
   */
  onKeyUp=(event) => {
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.className !== 'ql-editor') {
      this.setState({
        keydown: '',
      });
    }
  }

  /**
   *键盘按下事件
   *
   * @param {*} event
   * @memberof Sprint
   */
  onKeyDown=(event) => {
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.className !== 'ql-editor') {
      if (event.keyCode !== this.state.keydown) {
        this.setState({
          keydown: event.keyCode,
        });
      }
    }
  }
handleClickIssue = (issueId, epicId) => {
  const { UserMapStore } = this.props;
  const { selectIssueIds } = UserMapStore;
  let arr = _.cloneDeep(selectIssueIds);
  const index = arr.indexOf(issueId);
  const { keydown } = this.state;
  // command ctrl shift
  if (keydown === 91 || keydown === 17 || keydown === 16) {
    if (index === -1) {
      arr.push(issueId);
    } else {
      arr.splice(index, 1);
    }
  } else {
    arr = [];
    // arr.push(issueId);
  }
  UserMapStore.setSelectIssueIds(arr);
  window.console.log(arr);
};

  initData =() => {
    this.setState({ loading: true });
    this.props.UserMapStore.initData();
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
  }

  addFilter =(filter) => {
    const { UserMapStore } = this.props;
    const arr = _.cloneDeep(UserMapStore.currentFilters);
    const value = filter;
    const index = UserMapStore.currentFilters.indexOf(value);
    if (index !== -1) {
      arr.splice(index, 1);
    } else {
      arr.push(value);
    }
    UserMapStore.setCurrentFilter(arr);
    UserMapStore.loadIssues('usermap');

    if (UserMapStore.isApplyToEpic) {
      UserMapStore.loadEpic();
    }
  };

  changeMenuShow =(options) => {
    const { moreMenuShow } = this.state;
    this.setState({ moreMenuShow: !moreMenuShow });
  };

  handleShowDoneEpic =(e) => {
    const { UserMapStore } = this.props;
    UserMapStore.setShowDoneEpic(e.target.checked);
    UserMapStore.loadEpic();
  };

  handleFilterEpic =(e) => {
    const { UserMapStore } = this.props;
    UserMapStore.setIsApplyToEpic(e.target.checked);
    UserMapStore.loadEpic();
  }

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
    const { UserMapStore } = this.props;
    UserMapStore.changeShowBackLog(!UserMapStore.showBackLog);
  };

  handleCreateVOS=(type) => {
    this.props.UserMapStore.setCreateVOSType(type);
    this.props.UserMapStore.setCreateVOS(true);
  };  

  handleCreateOk=() => {
    const { UserMapStore } = this.props;
    UserMapStore.setCreateVOS(false);
    UserMapStore.getCreateVOSType === 'version' ? UserMapStore.loadVersions() : UserMapStore.loadSprints();
  };

  handleMouseColumn = (epicId, vosId) => {
    this.setState({ hoverId: epicId, hoverVOSId: vosId });
  };

  showCreateIssue = () => {
    this.setState({ createIssue: true });
  };

  exportExcel() {
    const projectId = AppState.currentMenuType.id;
    axios.post('url', { responseType: 'arraybuffer' })
      .then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `${AppState.currentMenuType.name}.xls`;
        FileSaver.saveAs(blob, fileName);
      });
  }

  renderColumn = () => {
    const { UserMapStore } = this.props;
    const dom = [];
    const epicData = UserMapStore.getEpics;
    const { issues, sprints, versions } = UserMapStore;
    const { mode } = UserMapStore;
    const vosData = UserMapStore[`${mode}s`] || [];
    const id = `${mode}Id`;
    if (epicData.length) {
      vosData.map((vos) => {
        const name = mode === 'sprint' ? `${mode}Name` : 'name';
        dom.push(<React.Fragment key={vos[id]}>
          <div className="swimlane-title">
            <p>{vos[name]}</p>
            <div style={{ display: 'flex' }}>
              <p className="point-span" style={{ background: '#4D90FE' }}>
                {_.reduce(_.filter(issues, issue => issue[id] === vos[id]), (sum, issue) => {
                  if (issue.statusCode === 'todo') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <p className="point-span" style={{ background: '#FFB100' }}>
                {_.reduce(_.filter(issues, issue => issue[id] === vos[id]), (sum, issue) => {
                  if (issue.statusCode === 'doing') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <p className="point-span" style={{ background: '#00BFA5' }}>
                {_.reduce(_.filter(issues, issue => issue[id] === vos[id]), (sum, issue) => {
                  if (issue.statusCode === 'done') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <p onClick={this.expandColumn.bind(this, vos[id])} role="none">
                <Icon type={`${this.state.expandColumns.includes(vos[id]) ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
              </p>
            </div>
          </div>
          <div style={{ display: this.state.expandColumns.includes(vos[id]) ? 'none' : 'flex' }}>
            {epicData.map((epic, index) => (
              <Droppable droppableId={`epic-${epic.issueId}_${vos[id]}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className="swimlane-column"
                    style={{
                      background: snapshot.isDraggingOver ? '#e9e9e9' : 'rgba(0,0,0,0.02)',
                      padding: 'grid',
                      // borderBottom: '1px solid rgba(0,0,0,0.12)'
                    }}
                  >
                    <React.Fragment>
                      {/*{vos[id]}*/}
                      {_.filter(issues, issue => issue.epicId === epic.issueId && issue[id] === vos[id]).map((item, indexs) => (
                        <Draggable draggableId={`${mode}-${item.issueId}`} index={indexs}>
                          {(provided1, snapshot1) => (
                            <div
                              ref={provided1.innerRef}
                              {...provided1.draggableProps}
                              {...provided1.dragHandleProps}
                              style={{
                                cursor: 'move',
                                ...provided1.draggableProps.style,
                              }}
                              role="none"
                            >
                              {/*{item.issueId}*/}
                              <IssueCard
                                handleClickIssue={this.handleClickIssue}
                                key={item.issueId}
                                issue={item}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      <div
                        onMouseOut={() => { this.setState({ hoverId: '', hoverVOSId: '', createIssue: false }); }}
                        style={{ background: !snapshot.isDraggingOver && this.state.hoverId === epic.issueId && this.state.hoverVOSId === vos[id] ? '#f5f5f5' : '', minHeight: 142 }}
                        onMouseOver={this.handleMouseColumn.bind(this, epic.issueId, vos[id])}
                      >
                        <div style={{ display: !snapshot.isDraggingOver && this.state.hoverId === epic.issueId && this.state.hoverVOSId === vos[id] && !this.state.createIssue ? 'block' : 'none' }}>


                          add
                          {' '}
                          <a role="none" onClick={this.showCreateIssue}>new</a>
                          {' '}


                          or
                          {' '}
                          <a role="none" onClick={this.showBackLog}>existing</a>
                        </div>
                        <CreateIssue
                          data={{ epicId: epic.issueId, [id]: vos[id] }}
                          style={{ display: this.state.hoverId === epic.issueId && this.state.hoverVOSId === vos[id] && this.state.createIssue ? 'block' : 'none' }}
                        />
                      </div>
                    </React.Fragment>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

            ))}
          </div>
        </React.Fragment>);
      });
      dom.push(
        <React.Fragment key="no-sprint">
          <div className="swimlane-title">
            <p>
              {mode === 'none' ? 'issue' : '未计划的' }
              {mode === 'none' ? null
                : (
                  <Button className="createSpringBtn" functyp="flat" onClick={this.handleCreateVOS.bind(this, mode)}>
                    <Icon type="playlist_add" />


                  创建
                    {mode === 'sprint' ? '冲刺' : '版本'}
                  </Button>
                ) }

            </p>
            <div style={{ display: 'flex' }}>
              <p className="point-span" style={{ background: '#4D90FE' }}>
                {_.reduce(_.filter(issues, issue => issue.sprintId == null || issue.versionId == null), (sum, issue) => {
                  if (issue.statusCode === 'todo') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <p className="point-span" style={{ background: '#FFB100' }}>
                {_.reduce(_.filter(issues, issue => issue.sprintId == null || issue.versionId == null), (sum, issue) => {
                  if (issue.statusCode === 'doing') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <p className="point-span" style={{ background: '#00BFA5' }}>
                {_.reduce(_.filter(issues, issue => issue.sprintId == null || issue.versionId == null), (sum, issue) => {
                  if (issue.statusCode === 'done') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <p onClick={this.expandColumn.bind(this, `-1-${mode}`)} role="none">
                <Icon type={`${this.state.expandColumns.includes(`-1-${mode}`) ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}`} />
              </p>

            </div>
          </div>
          <div style={{ display: this.state.expandColumns.includes(`-1-${mode}`) ? 'none' : 'flex' }}>
            {epicData.map((epic, index) => (
              <Droppable droppableId={`epic-${epic.issueId}_0`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className="swimlane-column"
                    style={{
                      background: snapshot.isDraggingOver ? '#e9e9e9' : 'rgba(0,0,0,0.02)',
                      padding: 'grid',
                      // borderBottom: '1px solid rgba(0,0,0,0.12)'
                    }}
                  >
                    <React.Fragment>
                      {_.filter(issues, issue => issue.epicId === epic.issueId && (mode !== 'none' && issue[id] == null || mode === 'none')).map((item, indexs) => (
                        <Draggable draggableId={`none-${item.issueId}`} index={indexs}>
                          {(provided1, snapshot1) => (
                            <div
                              ref={provided1.innerRef}
                              {...provided1.draggableProps}
                              {...provided1.dragHandleProps}
                              style={{
                                cursor: 'move',
                                ...provided1.draggableProps.style,
                              }}
                              role="none"
                            >
                              {/*{item.issueId}*/}
                              <IssueCard
                                handleClickIssue={this.handleClickIssue}
                                key={item.issueId}
                                issue={item}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      <div
                        onMouseLeave={() => { this.setState({ hoverId: '', createIssue: false }); }}
                        style={{ background: !snapshot.isDraggingOver && this.state.hoverId === epic.issueId ? '#f5f5f5' : '', minHeight: 142 }}
                        onMouseOver={this.handleMouseColumn.bind(this, epic.issueId)}
                      >
                        <div style={{ display: !snapshot.isDraggingOver && this.state.hoverId === epic.issueId && !this.state.createIssue ? 'block' : 'none' }}>


                          add
                          {' '}
                          <a role="none" onClick={this.showCreateIssue}>new</a>
                          {' '}


                          or
                          {' '}
                          <a role="none" onClick={this.showBackLog}>existing</a>
                        </div>
                        <CreateIssue
                          data={{ epicId: epic.issueId, versionId: null, sprintId: null }}
                          style={{ display: this.state.hoverId === epic.issueId && this.state.createIssue ? 'block' : 'none' }}
                        />
                      </div>
                    </React.Fragment>
                    {provided.placeholder}
                  </div>

                )}
              </Droppable>
            ))}
          </div>
        </React.Fragment>,
      );
    }

    return dom;
  };

  handleEpicDrag =(res) => {
    const { UserMapStore } = this.props;
    const data = UserMapStore.getEpics;
    const result = Array.from(data);
    const sourceIndex = res.source.index;
    const tarIndex = res.destination.index;
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(tarIndex, 0, removed);
    // return result;
    let beforeSequence = null;
    let afterSequence = null;
    if (tarIndex === 0) {
      afterSequence = result[1].epicSequence;
    } else if (tarIndex === data.length - 1) {
      beforeSequence = result[data.length - 2].epicSequence;
    } else {
      afterSequence = result[tarIndex + 1].epicSequence;
      beforeSequence = result[tarIndex - 1].epicSequence;
    }
    const epicId = data[sourceIndex].issueId;
    const { objectVersionNumber } = data[sourceIndex];
    const postData = { afterSequence, beforeSequence, epicId, objectVersionNumber };
    UserMapStore.setEpics(result);
    UserMapStore.handleEpicDrap(postData);
  };

  handleDragToMainBoard =(res) => {
    const { UserMapStore } = this.props;
    const { issues, mode, selectIssueIds } = UserMapStore;
    const epicId = parseInt(res.destination.droppableId.split('_')[0].split('-')[1], 10);
    const key = `${mode}Id`;
    const value = parseInt(res.destination.droppableId.split('_')[1], 10);
    const issueIds = selectIssueIds.length ? selectIssueIds : [parseInt(res.draggableId.split('-')[1], 10)];
    const before = res.destination.index === 0;
    const rankIndex = res.source.index > res.destination.index;
    let postData = {};
    const issueData = _.cloneDeep(issues);
    let outsetIssueId = null;
    _.map(issueIds, (issueId) => {
      const sourceIssue = _.filter(issueData, item => item.issueId === issueId)[0];
      const sourceIndex = _.indexOf(issueData, sourceIssue);
      before ? outsetIssueId = issueData[sourceIndex + 1].issueId : outsetIssueId = issueData[sourceIndex - 1].issueId;
      if (mode === 'none') {
        postData = { epicId, issueIds, before, rankIndex, outsetIssueId };
        sourceIssue.epicId = epicId;
        sourceIssue[key] = null;
      } else {
        postData = { epicId, issueIds, before, rankIndex, [key]: value, outsetIssueId };
        sourceIssue.epicId = epicId;
        value === 0 ? sourceIssue[key] = null : sourceIssue[key] = value;
      }
      UserMapStore.setIssues(issueData);
    });
    UserMapStore.handleMoveIssue(postData);
    UserMapStore.setSelectIssueIds([]);
    UserMapStore.setCurrentDraggableId(null);
  };

  handleDragToBacklog = (res) => {
    const { UserMapStore } = this.props;
    const { backlogIssues, mode, selectIssueIds, issues } = UserMapStore;
    const key = `${mode}Id`;
    const value = parseInt(res.destination.droppableId.split('-')[1], 10);
    const issueIds = selectIssueIds.length ? selectIssueIds : [parseInt(res.draggableId.split('-')[1], 10)];
    const before = res.destination.index === 0;
    const rankIndex = res.source.index > res.destination.index;
    const tarIndex = res.destination.index;
    const BacklogIssueData =  _.cloneDeep(backlogIssues);
    let postData = {};
    // backlog to backlog
    let outsetIssueId = null;
    if (res.source.droppableId.includes('backlog')) {
      const issueData = _.cloneDeep(backlogIssues);
      _.map(issueIds, (issueId) => {
        const sourceIssue = _.filter(issueData, item => item.issueId === issueId)[0];
        const sourceIndex = _.indexOf(issueData, sourceIssue);
        before ? outsetIssueId = issueData[sourceIndex + 1].issueId : outsetIssueId = issueData[sourceIndex - 1].issueId;
        value === 0 ? sourceIssue[key] = null : sourceIssue[key] = value;
        issueData.splice(sourceIndex, 1);
        issueData.splice(res.destination.index, 0, sourceIssue);
        postData = { issueIds, before, rankIndex, [key]: value, outsetIssueId };
        // UserMapStore.setBacklogIssues(issueData);
        // UserMapStore.setIssues(issueData);
      });
    } else {
      const issueData = _.cloneDeep(issues);
      _.map(issueIds, (issueId) => {
        const sourceIssue = _.filter(issueData, item => item.issueId === issueId)[0];
        const sourceIndex = _.indexOf(issueData, sourceIssue);
        sourceIssue.epicId = null;
        BacklogIssueData.splice(res.destination.index, 0, sourceIssue);
        issueData.splice(sourceIndex, 1);
        if (mode === 'none') {
          postData = { epicId: 0, issueIds, before, rankIndex, outsetIssueId };
        } else {
          postData = { issueIds, before, rankIndex, [key]: value, epicId: 0, outsetIssueId };
          value === 0 ? sourceIssue[key] = null : sourceIssue[key] = value;
        }
        // UserMapStore.setBacklogIssues(issueData);
        // UserMapStore.setIssues(issueData);
      });
    }
    UserMapStore.handleMoveIssue(postData, res.source.droppableId.includes('backlog') ? 'backlog' : 'userMap');
    UserMapStore.setSelectIssueIds([]);
    UserMapStore.setCurrentDraggableId(null);
  };

  handleEpicOrIssueDrag = (res) => {
    if (res.destination.droppableId === 'epic') {
      this.handleEpicDrag(res);
    } else if (res.destination.droppableId.includes('backlog')) {
      this.handleDragToBacklog(res);
    } else {
      this.handleDragToMainBoard(res);
    }
  };

  handleEpicOrIssueDragStart =(res) => {
    const { UserMapStore } = this.props;
    if (!(res.source.droppableId === 'epic') && UserMapStore.selectIssueIds.length) {
      UserMapStore.setCurrentDraggableId(parseInt(res.draggableId.split('-')[1], 10));
    }
  };
  
  render() {
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    _.sortBy(epicData, 'rink');
    const { filters, mode, createEpic, currentFilters, showBackLog } = UserMapStore;
    const swimlanMenu = (
      <Menu onClick={this.changeMode} selectable>
        <Menu.Item key="none">无泳道</Menu.Item>
        <Menu.Item key="version">版本泳道</Menu.Item>
        <Menu.Item key="sprint">冲刺泳道</Menu.Item>
      </Menu>
    );
    return (
      <Page
        className="c7n-userMap"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Header title="用户故事地图">
          <Button className="leftBtn" functyp="flat" onClick={this.handleCreateEpic}>
            <Icon type="playlist_add" />


创建史诗
</Button>
          <Dropdown overlay={swimlanMenu} trigger={['click']}>
            <Button>
              {mode === 'none' && '无泳道'}
              {mode === 'version' && '版本泳道'}
              {mode === 'sprint' && '冲刺泳道'}
              <Icon type="arrow_drop_down" />
            </Button>
          </Dropdown>
          <div style={{ marginLeft: 8 }}>
            <Popover
              overlayClassName="moreMenuPopover"
              arrowPointAtCenter={false}
              placement="bottomLeft"
              trigger="click"
              content={(
                <div>
                  <div className="menu-title">史诗过滤器</div>
                  <div style={{ height: 22, marginBottom: 20 }}>
                    <Checkbox onChange={this.handleShowDoneEpic}>已完成的史诗</Checkbox>
                  </div>
                  <div style={{ height: 22, marginBottom: 32 }}>
                    <Checkbox onChange={this.handleFilterEpic}>应用快速搜索到史诗</Checkbox>
                  </div>
                  <div className="menu-title">导出</div>
                  <div style={{ height: 22, marginBottom: 20, marginLeft: 26 }}>导出为excel</div>
                  <div style={{ height: 22, marginLeft: 26 }}>导出为图片</div>
                </div>
)}
            >
              <div style={{
                cursor: 'pointer', color: 'rgb(63, 81, 181)', fontWeight: 500, marginTop: 6, 
              }}
              >


                更多
{' '}
                <Icon type="arrow_drop_down" style={{ marginTop: -3 }} />
              </div>
            </Popover>
          </div>

          <Button
            style={{
              color: 'white', fontSize: 12, position: 'absolute', right: 24, 
            }}
            type="primary"
            funcType="raised"
            onClick={this.showBackLog}
          >
            <Icon type="layers" />


需求池
</Button>
        </Header>
        <div className="c7n-userMap-content">
          <DragDropContext onDragEnd={this.handleEpicOrIssueDrag} onDragStart={this.handleEpicOrIssueDragStart}>
            <div className="userMap-right" style={{ width: `${showBackLog ? 'calc(100% - 372px)' : 'calc(100% - 24px)'}` }}>
              <Spin spinning={false}>
                {epicData.length ? (<React.Fragment>
                  <div className="toolbar">
                    <div className="filter" style={{ height: this.state.expand ? '' : 27 }}>
                      <p style={{ padding: '3px 8px 3px 0' }}>快速搜索:</p>
                      <p
                        role="none"
                        style={{ background: `${currentFilters.includes('mine') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('mine') ? 'white' : '#3F51B5'}`, marginBottom: 3 }}
                        onClick={this.addFilter.bind(this,'mine')}
                      >仅我的问题</p>
                      <p
                        role="none"
                        style={{ background: `${currentFilters.includes('userStory') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('userStory') ? 'white' : '#3F51B5'}`, marginBottom: 3 }}
                        onClick={this.addFilter.bind(this,'userStory')}
                      >仅用户故事</p>
                      {filters.map(filter => <p role="none" style={{ background: `${currentFilters.includes(filter.filterId) ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes(filter.filterId) ? 'white' : '#3F51B5'}`, marginBottom: 3}} onClick={this.addFilter.bind(this,filter.filterId)}>{filter.name}</p>) }
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
                  <div className="epic">
                    <Droppable droppableId="epic" direction="horizontal">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          className="epic"
                          style={{
                            background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                            padding: 'grid',
                            // borderBottom: '1px solid rgba(0,0,0,0.12)'
                          }}
                        >
                          {epicData.map((epic, index) => (
                            <div>
                              {/*{epic.issueId}*/}
                              <EpicCard
                                index={index}
                                key={epic.issueId}
                                epic={epic}
                              />
                            </div>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                  <div className="swimlane" style={{ height: `calc(100vh - ${document.getElementById('autoRouter').offsetTop + 48 + 48 + 10 + 98 + 58}px)`}}>
                    {this.renderColumn()}
                  </div>
                </React.Fragment>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10%' }}>
                    <img src={epicPic} alt="" width="200" />
                    <div style={{ marginLeft: 50, width: 390 }}>
                      <span style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14 }}>欢迎使用敏捷用户故事地图</span>
                      <p style={{ fontSize: 20, marginTop: 10 }}>
                        用户故事地图是以史诗为基础，根据版本控制，迭代冲刺多维度对问题进行管理规划，点击 <a role={'none'} onClick={this.handleCreateEpic}>创建史诗</a> 进入用户故事地图。
                      </p>
                    </div>
                  </div>
                ) }
              </Spin>
            </div>
            <div className="usermap-left" style={{ display: showBackLog ? 'block' : 'none' }}>
              <Backlog handleClickIssue={this.handleClickIssue} />
            </div>
          </DragDropContext>
        </div>
        <CreateEpic
          visible={createEpic}
          onOk={() => UserMapStore.setCreateEpic(false)}
          onCancel={() => UserMapStore.setCreateEpic(false)}
        />
        <CreateVOS
          visible={UserMapStore.createVOS}
          // onOk={() => {UserMapStore.setCreateVOS(false)}}
          onOk={this.handleCreateOk}
          onCancel={() => { UserMapStore.setCreateVOS(false); }}
          type={UserMapStore.getCreateVOSType}
        />
      </Page>
    );
  }
}
export default Home2;
