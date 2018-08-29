import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { toJS } from 'mobx';
import { Page, Header, Content } from 'choerodon-front-boot';
import {
  Button, Popover, Dropdown, Menu, Icon, Checkbox, Spin
} from 'choerodon-ui';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './test.scss';
import CreateEpic from '../component/CreateEpic';
import Backlog from '../component/Backlog/Backlog.js';
import EpicCard from '../component/EpicCard/EpicCard.js';
import IssueCard from '../component/IssueCard/IssueCard.js';
import CreateVOS from '../component/CreateVOS';
import CreateIssue from '../component/CreateIssue/CreateIssue.js';

@observer
class Home3 extends Component {
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
        if (document.getElementsByClassName('filter')[0].scrollHeight > document.getElementsByClassName('filter')[0].clientHeight) {
          this.setState({
            more: true,
          });
        }
      }
      if (document.getElementById('fixHead-body')) {
        document.getElementById('fixHead-body').addEventListener('scroll', this.handleScroll, { passive: true });
        this.getPrepareOffsetTops();
        clearInterval(timer);
      }
    }, 20);
  }
  componentWillUnmount() {
    this.props.UserMapStore.setCurrentFilter([]);
    this.props.UserMapStore.setMode('none');
    this.props.UserMapStore.setIssues([]);
    this.props.UserMapStore.setEpics([]);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  getPrepareOffsetTops = () => {
    setTimeout(() => {
      const lines = document.getElementsByClassName('fixHead-line-content');
      const offsetTops = [];
      for (let i = 1; i < lines.length - 1; i += 1) {
        offsetTops.push(lines[i].offsetTop);
      }
      // const ot = offsetTops.map(v => v);
      this.props.UserMapStore.setOffsetTops(offsetTops);
    }, 500);
  };

  // debounceHandleScroll = _.debounce((e) => {
  //   this.handleScroll(e);
  // }, 16);

  handleScroll = (e) => {
    const { scrollLeft, scrollTop } = e.target;
    const { UserMapStore } = this.props;
    const { left, top } = UserMapStore;
    const header = document.getElementById('fixHead-head');
    if (scrollLeft !== left) {
      UserMapStore.setLeft(scrollLeft);
      header.scrollLeft = scrollLeft;
    }
    if (scrollTop !== top) {
      const { offsetTops, currentIndex } = UserMapStore;
      UserMapStore.setTop(scrollTop);
      const index = _.findLastIndex(offsetTops, v => v < scrollTop);
      if (currentIndex !== index) {
        UserMapStore.setCurrentIndex(index);
      }
    }
  };


  /**
   *键盘按起事件
   *
   * @param {*} event
   * @memberof Sprint
   */
  onKeyUp=(event) => {
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
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
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      if (event.keyCode !== this.state.keydown) {
        this.setState({
          keydown: event.keyCode,
        });
        this.props.UserMapStore.setSelectIssueIds([]);
      }
    }
  }
  handleClickIssue = (issueId, epicId) => {
    const { UserMapStore } = this.props;
    const { selectIssueIds } = UserMapStore;
    let arr = _.cloneDeep(toJS(selectIssueIds));
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
      arr = [issueId];
      // arr.push(issueId);
    }
    UserMapStore.setSelectIssueIds(arr);
  };

  initData =() => {
    this.props.UserMapStore.initData(true);
  };

  changeMode =(options) => {
    this.props.UserMapStore.setMode(options.key);
    const mode = options.key;
    this.setState({ title: undefined, vosId: null });
    if (mode === 'sprint') {
      this.props.UserMapStore.loadSprints();
    } else if (mode === 'version') {
      this.props.UserMapStore.loadVersions();
    }
    this.props.UserMapStore.loadIssues('usermap');
    if (this.props.UserMapStore.showBackLog) {
      this.props.UserMapStore.loadBacklogIssues();
    }
    this.getPrepareOffsetTops();

    // this.props.UserMapStore.loadBacklogIssues();
  };

  handleCreateEpic = () => {
    this.props.UserMapStore.setCreateEpic(true);
  }

  addFilter =(filter) => {
    const { UserMapStore } = this.props;
    const arr = _.cloneDeep(toJS(UserMapStore.currentFilters));
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

  handleExpandColumn =(id) => {
    const { expandColumns } = this.state;
    const index = expandColumns.indexOf(id);
    if (index === -1) {
      expandColumns.push(id);
    } else {
      expandColumns.splice(index, 1);
    }
    this.setState({ expandColumns });
    this.getPrepareOffsetTops();
  };

  showBackLog =() => {
    const { UserMapStore } = this.props;
    UserMapStore.changeShowBackLog();
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

  handleAddIssue = (epicId, vosId) => {
    const { UserMapStore } = this.props;
    const { mode } = UserMapStore;
    const obj = { epicId, [`${mode}Id`]: vosId };
    this.setState({ showChild: null });
    UserMapStore.setCurrentNewObj(obj);
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

  handelDragToBoard = (res) => {
    const { UserMapStore } = this.props;
    const { mode, issues, backlogIssues, selectIssueIds } = UserMapStore;
    const sourceIndex = res.source.index;
    const tarIndex = res.destination.index;
    const tarEpicId = parseInt(res.destination.droppableId.split('_')[0].split('-')[1], 10);
    const key = `${mode}Id`;
    const value = parseInt(res.destination.droppableId.split('_')[1], 10);// 目标id;
    const issueIds = selectIssueIds.length ? toJS(selectIssueIds) : [parseInt(res.draggableId.split('-')[1], 10)];
    const before = res.destination.index === 0;
    const rankIndex = null;
    const issueData = _.cloneDeep(toJS(issues));
    const backlogData = _.cloneDeep(toJS(backlogIssues));
    let postData = {};
    let outsetIssueId = null;
    let tarBacklogData = backlogIssues;
    _.map(issueIds, (id) => {
      const tarIssue = _.filter(issueData, item => item.issueId === id)[0];
      const vosId = value === 0 ? null : value;
      let tarData = _.filter(issues, item => item.epicId === tarEpicId);
      if (mode !== 'none') {
        tarData = _.filter(issues, item => item.epicId === tarEpicId && item[key] === vosId);
      }
      if (before && tarData.length) {
        outsetIssueId = tarData[0].issueId;
      } else if (before && !tarData.length) {
        outsetIssueId = 0;
      } else {
        outsetIssueId = tarData[tarIndex - 1].issueId;
      }
      tarIssue.epicId = tarEpicId;
      if (mode !== 'none') {
        tarIssue[key] = vosId;
      }
      postData = { before, epicId: tarEpicId, outsetIssueId, rankIndex, issueIds };
      if (res.source.droppableId.includes('backlog')) {
        tarBacklogData = _.filter(backlogData, item => item.issueId === id)[0];
        const index = backlogData.indexOf(tarBacklogData);
        backlogData.splice(index, 1);
      }
      if (mode !== 'none') {
        postData[key] = value;
      }
    });
    if (res.source.droppableId.includes('backlog')) {
      UserMapStore.setBacklogIssues(backlogData);
    }
    UserMapStore.setIssues(issueData);
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
    const rankIndex = null;
    let backlogData = _.cloneDeep(toJS(backlogIssues));
    const issueData = _.cloneDeep(toJS(issues));
    let postData = {};
    const tarIndex = res.destination.index;
    let outsetIssueId = null;
    _.map(issueIds, (id) => {
      const vosId = value === 0 ? null : value;
      let tarData = _.filter(backlogIssues, item => item[key] === vosId);
      if (mode === 'none') {
        tarData = backlogData;
      }
      if (before && tarData.length) {
        outsetIssueId = tarData[0].issueId;
      } else if (before && !tarData.length) {
        outsetIssueId = 0;
      } else {
        outsetIssueId = tarData[tarIndex - 1].issueId;
      }
      let tarIssue = null;
      if (res.source.droppableId.includes('backlog')) {
        tarIssue = _.filter(backlogData, item => item.issueId === id)[0];
        postData = { before, outsetIssueId, rankIndex, issueIds, [key]: vosId };
        // const index = backlogIssues.indexOf(tarIssue);
      } else {
        tarIssue = _.filter(issueData, item => item.issueId === id)[0];
        tarIssue.epicId = 0;
        postData = { before, outsetIssueId, rankIndex, issueIds, epicId: 0 };
        tarData.splice(tarIndex, 0, tarIssue);
        if (mode !== 'none') {
          backlogData = backlogData.filter(item => item[key] !== vosId).concat(tarData);
        }
      }
      if (mode !== 'none') {
        tarIssue[key] = vosId;
        postData[key] = value;
      }
    });
    if (!res.source.droppableId.includes('backlog')) {
      UserMapStore.setIssues(issueData);
    }
    UserMapStore.setBacklogIssues(backlogData);
    UserMapStore.handleMoveIssue(postData);
    UserMapStore.setSelectIssueIds([]);
    UserMapStore.setCurrentDraggableId(null);
  };

  handleEpicOrIssueDrag = (res) => {
    if (!res.destination || res.destination.droppableId === res.source.droppableId) {
      this.props.UserMapStore.setSelectIssueIds([]);
      this.props.UserMapStore.setCurrentDraggableId(null);
      return;
    }
    if (res.destination.droppableId === 'epic') {
      this.handleEpicDrag(res);
    } else if (res.destination.droppableId.includes('backlog')) {
      this.handleDragToBacklog(res);
    } else {
      this.handelDragToBoard(res);
    }
  };

  handleEpicOrIssueDragStart =(res) => {
    const { UserMapStore } = this.props;
    if (!(res.source.droppableId === 'epic') && UserMapStore.selectIssueIds.length) {
      UserMapStore.setCurrentDraggableId(parseInt(res.draggableId.split('-')[1], 10));
    }
  };

  getHistoryCount = (id) => {
    const { UserMapStore } = this.props;
    const { issues, mode } = UserMapStore;
    const count = {};
    let issuesData = issues;
    if (mode !== 'none') {
      issuesData = _.filter(issues, issue => issue[`${mode}Id`] === id && issue.epicId !== 0);
    } else {
      issuesData = _.filter(issues, issue => issue.epicId !== 0);
    }
    count.todoCount = _.reduce(issuesData, (sum, issue) => {
      if (issue.statusCode === 'todo') {
        return sum + issue.storyPoints;
      } else {
        return sum;
      }
    }, 0);
    count.doneCount = _.reduce(issuesData, (sum, issue) => {
      if (issue.statusCode === 'done') {
        return sum + issue.storyPoints;
      } else {
        return sum;
      }
    }, 0);
    count.doingCount = _.reduce(issuesData, (sum, issue) => {
      if (issue.statusCode === 'doing') {
        return sum + issue.storyPoints;
      } else {
        return sum;
      }
    }, 0);
    return count;
  };

  renderHeader = () => {
    const { UserMapStore } = this.props;
    const {
      mode,
    } = UserMapStore;
    const swimlanMenu = (
      <Menu onClick={this.changeMode} selectable defaultSelectedKeys={['none']}>
        <Menu.Item key="none">无泳道</Menu.Item>
        <Menu.Item key="version">版本泳道</Menu.Item>
        <Menu.Item key="sprint">冲刺泳道</Menu.Item>
      </Menu>
    );
    return (
      <Header title="用户故事地图">
        <Button className="leftBtn" functyp="flat" onClick={this.handleCreateEpic}>
          <Icon type="playlist_add" />
          创建史诗
        </Button>
        <Dropdown overlay={swimlanMenu} trigger={['click']} overlayClassName="modeMenu" placement="bottomCenter">
          <Button>
            {mode === 'none' && '无泳道'}
            {mode === 'version' && '版本泳道'}
            {mode === 'sprint' && '冲刺泳道'}
            <Icon type="arrow_drop_down" />
          </Button>
        </Dropdown>
        <Popover
          overlayClassName="moreMenuPopover"
          arrowPointAtCenter={false}
          placement="bottomLeft"
          trigger={['click']}
          content={(
            <div>
              <div className="menu-title">史诗过滤器</div>
              <div style={{ height: 22, marginBottom: 20 }}>
                <Checkbox onChange={this.handleShowDoneEpic}>已完成的史诗</Checkbox>
              </div>
              <div style={{ height: 22, marginBottom: 32 }}>
                <Checkbox onChange={this.handleFilterEpic}>应用快速搜索到史诗</Checkbox>
              </div>
              {/* <div className="menu-title">导出</div> */}
              {/* <div style={{ height: 22, marginBottom: 20, marginLeft: 26 }}>导出为excel</div> */}
              {/* <div style={{ height: 22, marginLeft: 26 }}>导出为图片</div> */}
            </div>
          )}
        >
          <Button>
            更多
            <Icon type="arrow_drop_down" />
          </Button>
        </Popover>
        <Button className="leftBtn2" funcType="flat" onClick={this.initData.bind(this, true)}>
          <Icon type="refresh icon" />
          <span>刷新</span>
        </Button>

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
      </Header>);
  }

  renderBody = () => {
    const { UserMapStore } = this.props;
    const dom = [];
    const epicData = UserMapStore.getEpics;
    const { issues, sprints, versions, currentNewObj, left } = UserMapStore;
    const { epicId, versionId, sprintId } = currentNewObj;
    const { mode } = UserMapStore;
    const vosData = UserMapStore[`${mode}s`] || [];
    const id = `${mode}Id`;
    if (epicData.length) {
      vosData.map((vos, vosIndex) => {
        const name = mode === 'sprint' ? `${mode}Name` : 'name';
        dom.push(<div key={vos[id]} className="fixHead-line">
          <div
            className={`fixHead-line-title column-title ${vosIndex === 0 ? 'firstLine-title' : ''}`}
            style={{ marginLeft: left }}
            // data-title={vos[name]}
            // data-id={vos[id]}
          >
            <div>{vos[name]}</div>
            <div style={{ display: 'flex' }}>
              <p className="point-span" style={{ background: '#4D90FE' }}>
                {_.reduce(_.filter(issues, issue => issue[id] === vos[id] && issue.epicId !== 0), (sum, issue) => {
                  if (issue.statusCode === 'todo') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <p className="point-span" style={{ background: '#FFB100' }}>
                {_.reduce(_.filter(issues, issue => issue[id] === vos[id] && issue.epicId !== 0), (sum, issue) => {
                  if (issue.statusCode === 'doing') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <p className="point-span" style={{ background: '#00BFA5' }}>
                {_.reduce(_.filter(issues, issue => issue[id] === vos[id] && issue.epicId !== 0), (sum, issue) => {
                  if (issue.statusCode === 'done') {
                    return sum + issue.storyPoints;
                  } else {
                    return sum;
                  }
                }, 0)}
              </p>
              <Button shape={'circle'} className="expand-btn" onClick={this.handleExpandColumn.bind(this, vos[id])} role="none">
                <Icon type={`${this.state.expandColumns.includes(vos[id]) ? 'baseline-arrow_left' : 'baseline-arrow_drop_down'}`} />
              </Button>
            </div>
          </div>
          <div
            className="fixHead-line-content"
            style={{ display: this.state.expandColumns.includes(vos[id]) ? 'none' : 'flex' }}
            data-title={vos[name]}
            data-id={vos[id]}
          >
            {epicData.map((epic, index) => (
              <Droppable droppableId={`epic-${epic.issueId}_${vos[id]}`} key={epic.issueId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className="swimlane-column fixHead-block"
                    style={{
                      background: snapshot.isDraggingOver ? '#e9e9e9' : '',
                      padding: 'grid',
                      // borderBottom: '1px solid rgba(0,0,0,0.12)'
                    }}
                  >
                    <React.Fragment>
                      {/*{vos[id]}*/}
                      {_.filter(issues, issue => issue.epicId === epic.issueId && issue[id] === vos[id]).map((item, indexs) => (
                        <Draggable draggableId={`${mode}-${item.issueId}`} index={indexs} key={item.issueId}>
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
                      {
                        epicId === epic.issueId && currentNewObj[id] === vos[id] ? (
                          <CreateIssue
                            data={{ epicId: epic.issueId, [id]: vos[id] }}
                            onOk={() => {
                              this.handleAddIssue(0, 0);
                              this.initData();
                            }}
                            onCancel={() => {
                              this.handleAddIssue(0, 0);
                            }}
                          />
                        ) : null
                      }
                      <div
                        className={'maskIssue'}
                        onMouseLeave={() => { this.setState({ showChild: null }); }}
                        onMouseEnter={() => {
                          if (snapshot.isDraggingOver) return;
                          this.setState({ showChild: `${epic.issueId}-${vos[id]}` });
                        }}
                      >
                        <div style={{ display: !snapshot.isDraggingOver && this.state.showChild === `${epic.issueId}-${vos[id]}` ? 'block' : 'none' }}>
                          add
                          {' '}
                          <a role="none" onClick={this.handleAddIssue.bind(this, epic.issueId, vos[id])}>new</a>
                          {' '}or{' '}
                          <a role="none" onClick={this.showBackLog}>existing</a>
                        </div>
                      </div>
                    </React.Fragment>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

            ))}
          </div>
        </div>);
      });
      dom.push(
        <div key="no-sprint" className="fixHead-line" style={{ height: '100%' }}>
          <div style={{ transform: `translateX(${`${left}px`})` }}>
            <div
              className={`fixHead-line-title column-title ${vosData.length ? '' : 'firstLine-title'}`}
              title={mode === 'none' ? 'issue' : '未计划部分'}
              data-id={-1}
            >
              <div>
                {mode === 'none' ? 'issue' : '未计划部分' }
                {mode === 'none' ? null
                  : (
                    <Button className="createSpringBtn" functyp="flat" onClick={this.handleCreateVOS.bind(this, mode)}>
                      <Icon type="playlist_add" />


                      创建
                      {mode === 'sprint' ? '冲刺' : '版本'}
                    </Button>
                  ) }

              </div>
              <div style={{ display: 'flex' }}>
                <p className="point-span" style={{ background: '#4D90FE' }}>
                  {_.reduce(_.filter(issues, issue => issue.epicId !== 0 && ((mode !== 'none' && issue[id] == null) || mode === 'none')), (sum, issue) => {
                    if (issue.statusCode === 'todo') {
                      return sum + issue.storyPoints;
                    } else {
                      return sum;
                    }
                  }, 0)}
                </p>
                <p className="point-span" style={{ background: '#FFB100' }}>
                  {_.reduce(_.filter(issues, issue => issue.epicId !== 0 && ((mode !== 'none' && issue[id] == null) || mode === 'none')), (sum, issue) => {
                    if (issue.statusCode === 'doing') {
                      return sum + issue.storyPoints;
                    } else {
                      return sum;
                    }
                  }, 0)}
                </p>
                <p className="point-span" style={{ background: '#00BFA5' }}>
                  {_.reduce(_.filter(issues, issue => issue.epicId !== 0 && ((mode !== 'none' && issue[id] == null) || mode === 'none')), (sum, issue) => {
                    if (issue.statusCode === 'done') {
                      return sum + issue.storyPoints;
                    } else {
                      return sum;
                    }
                  }, 0)}
                </p>
                <Button className="expand-btn" shape={'circle'} onClick={this.handleExpandColumn.bind(this, `-1-${mode}`)} role="none">
                  <Icon type={`${this.state.expandColumns.includes(`-1-${mode}`) ? 'baseline-arrow_left' : 'baseline-arrow_drop_down'}`} />
                </Button>

              </div>
            </div>
          </div>

          <div
            className="fixHead-line-content"
            style={{ display: this.state.expandColumns.includes(`-1-${mode}`) ? 'none' : 'flex' }}
            data-title={mode === 'none' ? 'issue' : '未计划部分'}
            data-id={-1}
          >
            {epicData.map((epic, index) => (
              <Droppable droppableId={`epic-${epic.issueId}_0`} key={epic.issueId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    className="fixHead-block swimlane-column"
                    style={{
                      background: snapshot.isDraggingOver ? '#e9e9e9' : '',
                      padding: 'grid',
                      // borderBottom: '1px solid rgba(0,0,0,0.12)'
                    }}
                  >
                    <React.Fragment>
                      {_.filter(issues, issue => issue.epicId === epic.issueId && (mode !== 'none' && issue[id] == null || mode === 'none')).map((item, indexs) => (
                        <Draggable draggableId={`none-${item.issueId}`} index={indexs} key={item.issueId}>
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
                      {
                        epicId === epic.issueId && currentNewObj[id] === 0 ? (
                          <CreateIssue
                            data={{ epicId: epic.issueId, [`${mode}Id`]: 0 }}
                            onOk={() => {
                              this.handleAddIssue(0, 0);
                              this.initData();
                            }}
                            onCancel={() => {
                              this.handleAddIssue(0, 0);
                            }}
                          />
                        ) : null
                      }
                      <div
                        className={'maskIssue'}
                        // style={{ background: !snapshot.isDraggingOver && this.state.showChild === epic.issueId ? '' : '' }}
                        onMouseLeave={() => { this.setState({ showChild: null }); }}
                        onMouseEnter={() => {
                          if (snapshot.isDraggingOver) return;
                          this.setState({ showChild: epic.issueId });
                        }}
                      >
                        <div style={{ display: !snapshot.isDraggingOver && this.state.showChild === epic.issueId ? 'block' : 'none' }}>
                          add
                          {' '}
                          <a role="none" onClick={this.handleAddIssue.bind(this, epic.issueId, 0)}>new</a>
                          {' '}or{' '}
                          <a role="none" onClick={this.showBackLog}>existing</a>
                        </div>
                      </div>
                    </React.Fragment>
                    {provided.placeholder}
                  </div>

                )}
              </Droppable>
            ))}
          </div>
        </div>,
      );
    }
    return dom;
  }


  render() {
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    const {
      filters, mode, createEpic, currentFilters, selectIssueIds, showBackLog, left, isLoading,
    } = UserMapStore;
    let firstTitle = '';
    const count = this.getHistoryCount(UserMapStore.getVosId);
    const vosId = UserMapStore.getVosId === 0 ? `-1-${mode}` : UserMapStore.getVosId;

    return (
      <Page
        className="c7n-userMap"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        {this.renderHeader()}
        <Content style={{ padding: 0, height: '100%', paddingLeft: 24 }}>
          {isLoading ? <Spin spinning={isLoading} style={{ marginLeft: '40%', marginTop: '30%' }} size={'large'} />
            : <DragDropContext onDragEnd={this.handleEpicOrIssueDrag} onDragStart={this.handleEpicOrIssueDragStart}>
              <div style={{ width: showBackLog ? `calc(100% - ${350}px)` : '100%', height: '100%' }}>
                <div className="toolbar" style={{ minHeight: 52 }}>
                  <div className="filter" style={{ height: this.state.expand ? '' : 27 }}>
                    <p style={{ padding: '3px 8px 3px 0' }}>快速搜索:</p>
                    <p
                      role="none"
                      style={{ background: `${currentFilters.includes('mine') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('mine') ? 'white' : '#3F51B5'}`, marginBottom: 3 }}
                      onClick={this.addFilter.bind(this, 'mine')}
                    >仅我的问题</p>
                    <p
                      role="none"
                      style={{ background: `${currentFilters.includes('userStory') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('userStory') ? 'white' : '#3F51B5'}`, marginBottom: 3 }}
                      onClick={this.addFilter.bind(this,'userStory')}
                    >仅用户故事</p>
                    {filters.map(filter => (
                      <p
                        key={filter.filterId}
                        role="none"
                        style={{
                          background: `${currentFilters.includes(filter.filterId) ? 'rgb(63, 81, 181)' : 'white'}`,
                          color: `${currentFilters.includes(filter.filterId) ? 'white' : '#3F51B5'}`,
                          marginBottom: 3,
                        }}
                        onClick={this.addFilter.bind(this,filter.filterId)}
                      >{filter.name}</p>)) }
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
                      }, () => {
                        document.getElementsByClassName('fixHead')[0].style.height = `calc(100% - ${document.getElementsByClassName('fixHead')[0].offsetTop}px)`;
                      });
                    }}
                  >
                    {this.state.expand ? '...收起' : '...展开'}
                  </div>
                </div>
                <div className="fixHead" style={{ height: `calc(100% - ${52}px)` }}>
                  <div className="fixHead-head" id="fixHead-head">
                    <div className="fixHead-line">
                      <Droppable droppableId="epic" direction="horizontal">
                        {(provided, snapshot) => (
                          <div
                            className="fixHead-line-content"
                            ref={provided.innerRef}
                            style={{
                              background: snapshot.isDraggingOver ? '#e9e9e9' : '',
                              padding: 'grid',
                              // borderBottom: '1px solid rgba(0,0,0,0.12)'
                            }}
                          >
                            {epicData.map((epic, index) => (
                              <div className="fixHead-block" key={epic.issueId}>
                                <EpicCard
                                  index={index}
                                  // key={epic.issueId}
                                  epic={epic}
                                />
                              </div>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                    <div
                      className="fixHead-line fixHead-line-2"
                      style={{
                        height: 42,
                        transform: `translateX(${`${left}px`})`,
                      }}
                    >
                      <div className="fixHead-head-note">
                        <span className="column-title">
                          { UserMapStore.getTitle}
                        </span>
                        <div style={{ display: 'flex', float: 'right', justifyContent: 'baseline' }}>
                          <p className="point-span" style={{ background: '#4D90FE' }}>
                            {count.todoCount}
                          </p>
                          <p className="point-span" style={{ background: '#FFB100' }}>
                            {count.doingCount}
                          </p>
                          <p className="point-span" style={{ background: '#00BFA5' }}>
                            {count.doneCount}
                          </p>
                          <Button className="expand-btn" shape="circle" onClick={this.handleExpandColumn.bind(this, vosId)} role="none">
                            <Icon type={`${this.state.expandColumns.includes(vosId) ? 'baseline-arrow_left' : 'baseline-arrow_drop_down'}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fixHead-body" id="fixHead-body" style={{ flex: 1, position: 'relative' }}>
                    {this.renderBody()}
                  </div>
                </div>
              </div>
              <div style={{ display: showBackLog ? 'block' : 'none', width: 350 }}>
                <Backlog handleClickIssue={this.handleClickIssue} />
              </div>
            </DragDropContext>}
          <CreateEpic
            visible={createEpic}
            onOk={() => {
              UserMapStore.setCreateEpic(false);
              UserMapStore.loadEpic();
            }}
            onCancel={() => UserMapStore.setCreateEpic(false)}
          />
          <CreateVOS
            visible={UserMapStore.createVOS}
            // onOk={() => {UserMapStore.setCreateVOS(false)}}
            onOk={this.handleCreateOk}
            onCancel={() => { UserMapStore.setCreateVOS(false); }}
            type={UserMapStore.getCreateVOSType}
          />

        </Content>
      </Page>
    );
  }
}
export default Home3;
