import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { toJS } from 'mobx';
import {
  Page, Header, Content, Permission, 
} from 'choerodon-front-boot';
import {
  Button, Popover, Dropdown, Menu, Icon, Checkbox, Spin,
} from 'choerodon-ui';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import html2canvas from 'html2canvas';
import Canvas2Image from '../../../../../../../node_modules/canvas2image/canvas2image';
import './test.scss';
import CreateEpic from '../component/CreateEpic';
import Backlog from '../component/Backlog/Backlog.js';
import EpicCard from '../component/EpicCard/EpicCard.js';
import IssueCard from '../component/IssueCard/IssueCard.js';
import CreateVOS from '../component/CreateVOS';
import CreateIssue from '../component/CreateIssue/CreateIssue.js';
import epicPic from '../../../../assets/image/用户故事地图－空.svg';

// let scrollL;
// let isFirstScroll = false;

function toFullScreen(dom) {
  if (dom.requestFullscreen) {
    return dom.requestFullScreen();
  } else if (dom.webkitRequestFullScreen) {
    return dom.webkitRequestFullScreen();
  } else if (dom.mozRequestFullScreen) {
    return dom.mozRequestFullScreen();
  } else {
    return dom.msRequestFullscreen();
  }
}

function exitFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

function transformNull2Zero (val) {
  if (val === null) {
    return 0;
  }
  return val;
}

@observer
class Home3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      more: false,
      expand: false,
      expandColumns: [],
      showBackLog: false,
      position: 'absolute',
      isFullScreen: false,
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
    document.addEventListener('fullscreenchange', this.handleChangeFullScreen);
    document.addEventListener('webkitfullscreenchange', this.handleChangeFullScreen);
    document.addEventListener('mozfullscreenchange', this.handleChangeFullScreen);
    document.addEventListener('MSFullscreenChange', this.handleChangeFullScreen);
  }

  componentWillUnmount() {
    this.props.UserMapStore.setCurrentFilter([]);
    this.props.UserMapStore.setMode('none');
    this.props.UserMapStore.setIssues([]);
    this.props.UserMapStore.setEpics([]);
    this.props.UserMapStore.setTop(0);
    this.props.UserMapStore.setLeft(0);
    this.props.UserMapStore.setCurrentIndex(0);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  handleChangeFullScreen = (e) => {
    // const node = e.target;
    const isFullScreen = document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement;
    this.setState({
      isFullScreen: !isFullScreen ? false : true,
    });
  }

  getPrepareOffsetTops = (isExpand = false) => {
    setTimeout(() => {
      const lines = document.getElementsByClassName('fixHead-line-content');
      const body = document.getElementById('fixHead-body');
      const offsetTops = [];
      for (let i = 0; i < lines.length; i += 1) {
        offsetTops.push(lines[i].offsetTop);
      }
      this.props.UserMapStore.setOffsetTops(offsetTops);
      // window.console.log('when change mode, the offsetTops is: ' + offsetTops);
      if (!isExpand) {
        const { UserMapStore } = this.props;
        const bodyTop = body.scrollTop;
        if (bodyTop) {
          body.scrollTop = 0;
          UserMapStore.setTop(0);
        }
        const { top, currentIndex } = UserMapStore;
        // window.console.log('when change mode, the top is: ' + top);
        const index = _.findLastIndex(offsetTops, v => v <= 0 + 42);
        if (currentIndex !== index && index !== -1) {
          UserMapStore.setCurrentIndex(index);
        }
      } else {
        const { UserMapStore } = this.props;
        const bodyTop = body.scrollTop;
        UserMapStore.setTop(bodyTop);
        const { top, currentIndex } = UserMapStore;
        // window.console.log('when change mode, the top is: ' + bodyTop);
        const index = _.findLastIndex(offsetTops, v => v <= top + 42);
        if (currentIndex !== index && index !== -1) {
          UserMapStore.setCurrentIndex(index);
        }
      }
    }, 1000);
  };

  // debounceHandleScroll = _.debounce((e) => {
  //   this.handleScroll(e);
  // }, 16);

  // checkIsFirstLeftScroll() {
  //   if (!isFirstScroll) {
  //     isFirstScroll = true;
  //     // do someting
  //   }
  // }

  // debounceSetLeft = _.debounce((left) => {
  //   const { UserMapStore } = this.props;
  //   window.console.log(left);
  //   UserMapStore.setLeft(left);
  //   // do other thing
  //   isFirstScroll = false;
  // }, 300);

  handleScroll = (e) => {
    const { scrollLeft, scrollTop } = e.target;
    const { UserMapStore } = this.props;
    const {
      left, top, offsetTops, currentIndex, 
    } = UserMapStore;
    const header = document.getElementById('fixHead-head');
    if (scrollLeft !== left) {
      // scrollL = scrollLeft;
      // this.checkIsFirstLeftScroll();
      // this.debounceSetLeft(scrollLeft);
      document.querySelector('.fixHead-line-2').style.setProperty('--left', `${scrollLeft}px`);
      UserMapStore.setLeft(scrollLeft);
      header.scrollLeft = scrollLeft;
    } else {
      // UserMapStore.setTop(scrollTop);
      const index = _.findLastIndex(offsetTops, v => v <= scrollTop + 42);
      if (currentIndex !== index && index !== -1) {
        UserMapStore.setCurrentIndex(index);
      }
      // window.console.log(scrollTop);
    }
    // if (scrollTop !== top) {
    //   let s;
    //   const { offsetTops, currentIndex } = UserMapStore;
    //   // s = scrollTop <=9 ? 0 : scrollTop;
    //   // UserMapStore.setTop(s);
    //   // // window.console.log('when scroll v, the top is: ' + s);
    //   // const index = _.findLastIndex(offsetTops, v => v <= s + 42);
    //   // if (currentIndex !== index && index !== -1) {
    //   //   UserMapStore.setCurrentIndex(index);
    //   // }
    // }
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
    if (issueId === 0) {
      arr = [];
    }
    UserMapStore.setSelectIssueIds(arr);
  };

  initData =() => {
    this.props.UserMapStore.initData(true);
  };

  handleFullScreen = () => {
    const isFullScreen = document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement;
    if (!isFullScreen) {
      this.fullScreen();
    } else {
      this.exitFullScreen();
    }
  }

  fullScreen = () => {
    const target = document.querySelector('.content');
    toFullScreen(target);
  };

  exitFullScreen = () => {
    exitFullScreen();
  }

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
    this.getPrepareOffsetTops(true);
    // this.handleScroll();
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
    const postData = {
      afterSequence, beforeSequence, epicId, objectVersionNumber, 
    };
    UserMapStore.setEpics(result);
    UserMapStore.handleEpicDrag(postData);
  };

  getSprintIdAndEpicId(str) {
    const epicId = parseInt(str.split('_')[0].split('-')[1], 10);
    const modeId = parseInt(str.split('_')[1], 10);// [sprint || version]id;
    return { epicId, modeId };
  }

  transformDateToPostDate = (ids, originIssues, mode, targetEpicId, targetModeId) => {
    const res = {
      epicIssueIds: [],
      sprintIssueIds: [],
      versionIssueIds: [],
    };
    const key = `${mode}Id`;
    ids.forEach((issueId) => {
      const issue = originIssues.find(v => v.issueId === issueId);
      if (transformNull2Zero(targetEpicId) !== transformNull2Zero(issue.epicId)) {
        res.epicIssueIds.push(issueId);
      }
      if (mode !== 'none' && transformNull2Zero(issue[key]) !== transformNull2Zero(targetModeId)) {
        res[`${mode}IssueIds`].push(issueId);
      }
    });
    return res;
  }

  handleDataWhenMove = (ids, before, outsetIssueId, mode, desEpicId, desModeId) => {
    const { UserMapStore } = this.props;
    const { issues, backlogIssues } = UserMapStore;
    const issuesCopy = _.cloneDeep(toJS(issues));
    const backlogIssuesCopy = _.cloneDeep(toJS(backlogIssues));
    const issuesDragged = [];
    let resIssues = [];
    let resBacklogIssues = [];
    ids.forEach((issueId) => {
      const issue = issuesCopy.find(v => v.issueId === issueId);
      issue.epicId = desEpicId;
      if (mode !== 'none') {
        issue[`${mode}Id`] = desModeId;
      }
      issuesDragged.push(issue);
      const issuesIssueIndex = issuesCopy.findIndex(v => v.issueId === issueId);
      const backlogIssueIndex = backlogIssuesCopy.findIndex(v => v.issueId === issueId);
      if (issuesIssueIndex !== -1) {
        issuesCopy.splice(issuesIssueIndex, 1);
      }
      if (backlogIssueIndex !== -1) {
        backlogIssuesCopy.splice(backlogIssueIndex, 1);
      }
    });
    if (outsetIssueId === 0 && before) {
      if (desEpicId === 0 || desEpicId === null) {
        resIssues = issuesCopy;
        resBacklogIssues = issuesDragged.concat(backlogIssuesCopy);
      } else {
        resIssues = issuesDragged.concat(issuesCopy);
        resBacklogIssues = backlogIssuesCopy;
      }
    } else if (outsetIssueId === 0 && !before) {
      if (desEpicId === 0 || desEpicId === null) {
        resIssues = issuesCopy;
        resBacklogIssues = backlogIssuesCopy.concat(issuesDragged);
      } else {
        resIssues = issuesCopy.concat(issuesDragged);
        resBacklogIssues = backlogIssuesCopy;
      }
    } else if (before) {
      if (desEpicId === 0 || desEpicId === null) {
        resIssues = issuesCopy;
        const backlogInsertIndex = backlogIssuesCopy.findIndex(v => v.issueId === outsetIssueId);
        if (backlogInsertIndex !== -1) {
          if (backlogInsertIndex === 0) {
            resBacklogIssues = issuesDragged.concat(backlogIssuesCopy);
          } else {
            resBacklogIssues = [
              ...backlogIssuesCopy.slice(0, backlogInsertIndex),
              ...issuesDragged,
              ...backlogIssuesCopy.slice(backlogInsertIndex),
            ];
          }
        }
      } else {
        resBacklogIssues = backlogIssuesCopy;
        const issuesInsertIndex = issuesCopy.findIndex(v => v.issueId === outsetIssueId);
        if (issuesInsertIndex !== -1) {
          if (issuesInsertIndex === 0) {
            resIssues = issuesDragged.concat(issuesCopy);
          } else {
            resIssues = [
              ...issuesCopy.slice(0, issuesInsertIndex),
              ...issuesDragged,
              ...issuesCopy.slice(issuesInsertIndex),
            ];
          }
        }
      }
    } else if (true) {
      if (desEpicId === 0 || desEpicId === null) {
        resIssues = issuesCopy;
        const backlogInsertIndex = issuesCopy.findIndex(v => v.issueId === outsetIssueId);
        if (backlogInsertIndex !== -1) {
          resBacklogIssues = [
            ...backlogIssuesCopy.slice(0, backlogInsertIndex + 1),
            ...issuesDragged,
            ...backlogIssuesCopy.slice(backlogInsertIndex + 1),
          ];
        }
      } else {
        resBacklogIssues = backlogIssuesCopy;
        const issuesInsertIndex = issuesCopy.findIndex(v => v.issueId === outsetIssueId);
        if (issuesInsertIndex !== -1) {
          resIssues = [
            ...issuesCopy.slice(0, issuesInsertIndex + 1),
            ...issuesDragged,
            ...issuesCopy.slice(issuesInsertIndex + 1),
          ];
        }
      }
    }
    UserMapStore.setBacklogIssues(resBacklogIssues);
    UserMapStore.setIssues(resIssues);
  }

  // handelDragToBoard = (res) => {
  //   const { UserMapStore } = this.props;
  //   const {
  //     mode, issues, backlogIssues, selectIssueIds,
  //   } = UserMapStore;
  //   const sourceIndex = res.source.index;
  //   const tarIndex = res.destination.index;
  //   const tarEpicId = parseInt(res.destination.droppableId.split('_')[0].split('-')[1], 10);
  //   const key = `${mode}Id`;
  //   const value = parseInt(res.destination.droppableId.split('_')[1], 10);// 目标id;
  //   const issueIds = selectIssueIds.length ? toJS(selectIssueIds) : [parseInt(res.draggableId.split('-')[1], 10)];
  //   const before = res.destination.index === 0;
  //   const rankIndex = null;
  //   const issueData = _.cloneDeep(toJS(issues));
  //   const backlogData = _.cloneDeep(toJS(backlogIssues));
  //   let postData = {};
  //   let outsetIssueId = null;
  //   let tarBacklogData = backlogIssues;
  //   _.map(issueIds, (id) => {
  //     const tarIssue = _.filter(issueData, item => item.issueId === id)[0];
  //     const vosId = value === 0 ? null : value;
  //     let tarData = _.filter(issues, item => item.epicId === tarEpicId);
  //     if (mode !== 'none') {
  //       tarData = _.filter(issues, item => item.epicId === tarEpicId && item[key] === vosId);
  //     }
  //     if (before && tarData.length) {
  //       outsetIssueId = tarData[0].issueId;
  //     } else if (before && !tarData.length) {
  //       outsetIssueId = 0;
  //     } else {
  //       outsetIssueId = tarData[tarIndex - 1].issueId;
  //     }
  //     // 拖到冲刺泳道的未规划时outIssueId取值
  //     const data = issues.filter(item => item.sprintId === 0 || item.sprintId === null);
  //     if (mode === 'sprint' && before && outsetIssueId === 0 && value === 0) {
  //       if (data.length) {
  //         outsetIssueId = data[0].issueId;
  //       }
  //     }
  //     tarIssue.epicId = tarEpicId;
  //     if (mode !== 'none') {
  //       tarIssue[key] = vosId;
  //     }
  //     postData = { before, epicId: tarEpicId, outsetIssueId, rankIndex, issueIds };
  //     if (res.source.droppableId.includes('backlog')) {
  //       tarBacklogData = _.filter(backlogData, item => item.issueId === id)[0];
  //       const index = backlogData.indexOf(tarBacklogData);
  //       backlogData.splice(index, 1);
  //     }
  //     if (mode !== 'none') {
  //       postData[key] = value;
  //     }
  //   });
  //   if (res.source.droppableId.includes('backlog')) {
  //     UserMapStore.setBacklogIssues(backlogData);
  //   }
  //   UserMapStore.setIssues(issueData);
  //   UserMapStore.handleMoveIssue(postData);
  //   UserMapStore.setSelectIssueIds([]);
  //   UserMapStore.setCurrentDraggableId(null);
  // };

  handleMultipleDragToBoard = (res) => {
    const { UserMapStore } = this.props;
    const {
      mode, issues, backlogIssues, selectIssueIds, 
    } = UserMapStore;
    const sourceIndex = res.source.index;
    const tarIndex = res.destination.index;
    const tarEpicId = parseInt(res.destination.droppableId.split('_')[0].split('-')[1], 10);
    const key = `${mode}Id`;
    const desIndex = res.destination.index;
    const dragIssueId = parseInt(res.draggableId.split('-')[1], 10);
    const desEpicId = this.getSprintIdAndEpicId(res.destination.droppableId).epicId;
    const desModeId = this.getSprintIdAndEpicId(res.destination.droppableId).modeId;
    const souModeId = this.getSprintIdAndEpicId(res.source.droppableId).modeId;
    const souEpicId = this.getSprintIdAndEpicId(res.source.droppableId).epicId;
    const issueIds = toJS(selectIssueIds);
    const issueData = _.cloneDeep(toJS(issues));
    const backlogData = _.cloneDeep(toJS(backlogIssues));
    let desEpicAndModeIssues;
    if (desModeId === 0) {
      const desEpicIssues = _.filter(issueData, issue => issue.epicId === desEpicId);
      if (mode === 'none') {
        desEpicAndModeIssues = desEpicIssues.slice();
      } else {
        desEpicAndModeIssues = _.filter(desEpicIssues, issue => issue[key] === 0 
          || issue[key] === null);
      }
    } else {
      desEpicAndModeIssues = _.filter(issueData, issue => issue.epicId === desEpicId
        && issue[key] === desModeId);
    }
    let desModeIssues;
    if (desModeId === 0) {
      if (mode === 'none') {
        desModeIssues = issueData;
      } else {
        desModeIssues = _.filter(issueData, issue => issue[key] === 0 || issue[key] === null);
      }
    } else {
      desModeIssues = _.filter(issueData, issue => issue[key] === desModeId);
    }
    let before;
    let outsetIssueId;
    if (desEpicAndModeIssues.length) {
      // 移到有卡的块中
      if (desEpicAndModeIssues.every(v => issueIds.includes(v.issueId))) {
        // 该块中所有卡均被选中
        if (desModeIssues.every(v => issueIds.includes(v.issueId))) {
          // 该行中所有卡均被选中
          before = true;
          outsetIssueId = 0;
        } else {
          // 该行中有未被选中的卡
          before = true;
          outsetIssueId = desModeIssues.find(v => !issueIds.includes(v.issueId)).issueId;
        }
      } else if (true) {
        // 该块中有未被选中的卡
        if (!desEpicAndModeIssues.every(v => !issueIds.includes(v.issueId))) {
          // 该块中存在有块被选中
          if (desEpicAndModeIssues.includes(dragIssueId)) {
            if (desIndex === desEpicAndModeIssues.length - 1) {
              before = false;
              outsetIssueId = _.findLast(desEpicAndModeIssues, v => !issueIds.includes(v.issueId)).issueId;
            } else {
              before = true;
              if (desIndex > res.source.index) {
                outsetIssueId = desEpicAndModeIssues[desIndex + 1].issueId;
              } else {
                outsetIssueId = desEpicAndModeIssues[desIndex].issueId;
              }
            }
          } else if (true) {
            if (desIndex === desEpicAndModeIssues.length) {
              before = false;
              outsetIssueId = _.findLast(desEpicAndModeIssues, v => !issueIds.includes(v.issueId)).issueId;
            } else {
              before = true;
              outsetIssueId = desEpicAndModeIssues[desIndex].issueId;
            }
          }
        } else if (true) {
          // 该块中所有块都未被选中
          if (desIndex === desEpicAndModeIssues.length) {
            before = false;
            outsetIssueId = desEpicAndModeIssues[desEpicAndModeIssues.length - 1].issueId;
          } else {
            before = true;
            outsetIssueId = desEpicAndModeIssues[desIndex].issueId;
          }
        }
      }
    } else if (true) {
      // 移到无卡的块中
      if (!desModeIssues.length) {
        // 同行长度为0
        outsetIssueId = 0;
        if (souModeId && desModeId) {
          const modeData = UserMapStore[`${mode}s`] || [];
          const souModeIndex = _.findIndex(modeData, v => v[key] === souModeId);
          const desModeIndex = _.findIndex(modeData, v => v[key] === desModeId);
          before = desModeIndex < souModeIndex;
        } else if (!souModeId) {
          before = true;
        } else {
          before = false;
        }
      } else if (true) {
        // 同行长度不为0
        if (desModeIssues.every(v => issueIds.includes(v.issueId))) {
          // 所有选中都在同行中
          before = true;
          outsetIssueId = 0;
        } else {
          // 同行中有未被选中的
          before = true;
          outsetIssueId = desModeIssues.find(v => !issueIds.includes(v.issueId)).issueId;
        }
      }
    }
    const rankIndex = null;
    const transformData = this.transformDateToPostDate(issueIds, issues, mode, desEpicId, desModeId);
    const postData = {
      before,
      epicId: transformData.epicIssueIds.length ? desEpicId : undefined,
      outsetIssueId,
      rankIndex,
      issueIds,
      versionIssueIds: transformData.versionIssueIds.length ? transformData.versionIssueIds : undefined,
      sprintIssueIds: transformData.sprintIssueIds.length ? transformData.sprintIssueIds : undefined,
      epicIssueIds: transformData.epicIssueIds.length ? transformData.epicIssueIds : undefined,
    };
    if (mode !== 'none' && transformData[`${mode}IssueIds`].length) {
      postData[key] = desModeId;
    }
    let tarBacklogData = backlogIssues;
    this.handleDataWhenMove(issueIds, before, outsetIssueId, mode, desEpicId, desModeId);
    // _.map(issueIds, (id) => {
    //   const currentIssue = _.find(issueData, item => item.issueId === id);
    //   const vosId = desModeId === 0 ? null : desModeId;
    //   currentIssue.epicId = desEpicId;
    //   if (mode !== 'none') {
    //     currentIssue[key] = vosId;
    //   }
    //   // postData = {
    //   //   before, epicId: desEpicId, outsetIssueId, rankIndex, issueIds,
    //   // };
    //   if (res.source.droppableId.includes('backlog')) {
    //     tarBacklogData = _.find(backlogData, item => item.issueId === id);
    //     const index = backlogData.indexOf(tarBacklogData);
    //     backlogData.splice(index, 1);
    //   }
    //   if (mode !== 'none') {
    //     // postData[key] = desModeId;
    //   }
    // });
    // if (res.source.droppableId.includes('backlog')) {
    //   UserMapStore.setBacklogIssues(backlogData);
    // }
    // UserMapStore.setIssues(issueData);
    UserMapStore.handleMoveIssue(postData);
    UserMapStore.setSelectIssueIds([]);
    UserMapStore.setCurrentDraggableId(null);
  }

  handleMultipleDragToBacklog = (res) => {
    const { UserMapStore } = this.props;
    const {
      mode, issues, backlogIssues, selectIssueIds, 
    } = UserMapStore;
    const sourceIndex = res.source.index;
    const tarIndex = res.destination.index;
    const tarEpicId = parseInt(res.destination.droppableId.split('_')[0].split('-')[1], 10);
    const key = `${mode}Id`;
    const desIndex = res.destination.index;
    const dragIssueId = parseInt(res.draggableId.split('-')[1], 10);
    const desEpicId = this.getSprintIdAndEpicId(res.destination.droppableId).epicId;
    const desModeId = this.getSprintIdAndEpicId(res.destination.droppableId).modeId;
    const souModeId = this.getSprintIdAndEpicId(res.source.droppableId).modeId;
    const souEpicId = this.getSprintIdAndEpicId(res.source.droppableId).epicId;
    const issueIds = toJS(selectIssueIds);
    const issueData = _.cloneDeep(toJS(issues));
    const backlogData = _.cloneDeep(toJS(backlogIssues));
    let desModeIssues;
    if (desModeId === 0) {
      // const desEpicIssues = _.filter(issueData, issue => issue.epicId === desEpicId);
      if (mode === 'none') {
        desModeIssues = backlogData.slice();
        // desEpicAndModeIssues = desEpicIssues.slice();
      } else {
        desModeIssues = _.filter(backlogData, issue => issue[key] === 0 
          || issue[key] === null);
      }
    } else {
      desModeIssues = _.filter(backlogData, issue => issue[key] === desModeId);
    }
    let desModeIssuesAll;
    if (desModeId === 0) {
      if (mode === 'none') {
        desModeIssuesAll = issueData;
      } else {
        desModeIssuesAll = _.filter(issueData, issue => issue[key] === 0 || issue[key] === null);
      }
    } else {
      desModeIssuesAll = _.filter(issueData, issue => issue[key] === desModeId);
    }
    let before;
    let outsetIssueId;
    if (desModeIssues.length) {
      // 移到有卡的块中
      if (desModeIssues.every(v => issueIds.includes(v.issueId))) {
        // 该块中所有卡均被选中
        if (desModeIssuesAll.every(v => issueIds.includes(v.issueId))) {
          // 该行中所有卡均被选中
          before = true;
          outsetIssueId = 0;
        } else {
          // 该行中有未被选中的卡
          before = true;
          outsetIssueId = desModeIssuesAll.find(v => !issueIds.includes(v.issueId)).issueId;
        }
      } else if (true) {
        // 该块中有未被选中的卡
        if (!desModeIssues.every(v => !issueIds.includes(v.issueId))) {
          // 该块中存在有卡被选中，也有卡未被选中
          if (_.map(desModeIssues, 'issueId').includes(dragIssueId)) {
            if (desIndex === desModeIssues.length - 1) {
              before = false;
              outsetIssueId = _.findLast(desModeIssues, v => !issueIds.includes(v.issueId)).issueId;
            } else {
              before = true;
              if (desIndex > res.source.index) {
                outsetIssueId = desModeIssues[desIndex + 1].issueId;
              } else {
                outsetIssueId = desModeIssues[desIndex].issueId;
              }
            }
          } else if (true) {
            if (desIndex === desModeIssues.length) {
              before = false;
              outsetIssueId = _.findLast(desModeIssues, v => !issueIds.includes(v.issueId)).issueId;
            } else {
              before = true;
              outsetIssueId = desModeIssues[desIndex].issueId;
            }
          }
        } else if (true) {
          // 该块中所有块都未被选中
          if (desIndex === desModeIssues.length) {
            before = false;
            outsetIssueId = desModeIssues[desModeIssues.length - 1].issueId;
          } else {
            before = true;
            outsetIssueId = desModeIssues[desIndex].issueId;
          }
        }
      }
    } else if (true) {
      // 移到无卡的块中
      if (!desModeIssuesAll.length) {
        // 同行长度为0
        outsetIssueId = 0;
        if (souModeId && desModeId) {
          const modeData = UserMapStore[`${mode}s`] || [];
          const souModeIndex = _.findIndex(modeData, v => v[key] === souModeId);
          const desModeIndex = _.findIndex(modeData, v => v[key] === desModeId);
          before = desModeIndex < souModeIndex;
        } else if (!souModeId) {
          before = true;
        } else {
          before = false;
        }
      } else if (true) {
        // 同行长度不为0
        if (desModeIssuesAll.every(v => issueIds.includes(v.issueId))) {
          // 同行中均被选中
          before = true;
          outsetIssueId = 0;
        } else {
          // 同行中有未被选中的
          before = true;
          outsetIssueId = desModeIssuesAll.find(v => !issueIds.includes(v.issueId)).issueId;
        }
      }
    }
    const rankIndex = null;
    const transformData = this.transformDateToPostDate(issueIds, issues, mode, 0, desModeId);
    const postData = {
      before,
      epicId: transformData.epicIssueIds.length ? 0 : undefined,
      outsetIssueId,
      rankIndex,
      issueIds,
      versionIssueIds: transformData.versionIssueIds.length ? transformData.versionIssueIds : undefined,
      sprintIssueIds: transformData.sprintIssueIds.length ? transformData.sprintIssueIds : undefined,
      epicIssueIds: transformData.epicIssueIds.length ? transformData.epicIssueIds : undefined,
    };
    if (mode !== 'none' && transformData[`${mode}IssueIds`].length) {
      postData[key] = desModeId;
    }
    let tarBacklogData = backlogIssues;
    this.handleDataWhenMove(issueIds, before, outsetIssueId, mode, 0, desModeId);
    // _.map(issueIds, (id) => {
    //   // const currentIssue = _.find(issueData, item => item.issueId === id);
    //   // const vosId = desModeId === 0 ? null : desModeId;
    //   // currentIssue.epicId = 0;
    //   // if (mode !== 'none') {
    //   //   currentIssue[key] = vosId;
    //   // }
    //   // postData = {
    //   //   before, epicId: souEpicId ? 0 : undefined, outsetIssueId, rankIndex, issueIds, [key]: desModeId,
    //   // };
    // });
    // window.console.log(postData);
    UserMapStore.handleMoveIssue(postData);
    UserMapStore.setSelectIssueIds([]);
    UserMapStore.setCurrentDraggableId(null);
  }

  handelDragToBoard = (res) => {
    const { UserMapStore } = this.props;
    const {
      mode, issues, backlogIssues, selectIssueIds,
    } = UserMapStore;
    if (selectIssueIds.length < 2) {
      const key = `${mode}Id`;
      const desIndex = res.destination.index;
      const desEpicId = this.getSprintIdAndEpicId(res.destination.droppableId).epicId;
      const desModeId = this.getSprintIdAndEpicId(res.destination.droppableId).modeId;
      const souModeId = this.getSprintIdAndEpicId(res.source.droppableId).modeId;
      const souEpicId = this.getSprintIdAndEpicId(res.source.droppableId).epicId;
      const issueIds = selectIssueIds.length ? toJS(selectIssueIds) : [parseInt(res.draggableId.split('-')[1], 10)];
      const issueData = _.cloneDeep(toJS(issues));
      const backlogData = _.cloneDeep(toJS(backlogIssues));
      let desEpicAndModeIssues;
      if (desModeId === 0) {
        const desEpicIssues = _.filter(issueData, issue => issue.epicId === desEpicId);
        if (mode === 'none') {
          desEpicAndModeIssues = desEpicIssues.slice();
        } else {
          desEpicAndModeIssues = _.filter(desEpicIssues, issue => issue[key] === 0 
            || issue[key] === null);
        }
      } else {
        desEpicAndModeIssues = _.filter(issueData, issue => issue.epicId === desEpicId
          && issue[key] === desModeId);
      }
      let before;
      let outsetIssueId;
      if (desEpicAndModeIssues.length) {
        // 目的地块中有卡，判断所放位置是否为0
        if (!desIndex) {
          before = true;
          outsetIssueId = desEpicAndModeIssues[0].issueId;
        } else if (desEpicId === souEpicId && desModeId === souModeId) {
          // 同块之间移动，判断是否放在最后
          if (desIndex === desEpicAndModeIssues.length - 1) {
            before = false;
            outsetIssueId = desEpicAndModeIssues[desEpicAndModeIssues.length - 1].issueId;
          } else {
            before = true;
            if (desIndex > res.source.index) {
              outsetIssueId = desEpicAndModeIssues[desIndex + 1].issueId;
            } else {
              outsetIssueId = desEpicAndModeIssues[desIndex].issueId;
            }
          }
        } else if (true) {
          // 不同块之间移动，判断是否放在最后
          if (desIndex === desEpicAndModeIssues.length) {
            before = false;
            outsetIssueId = desEpicAndModeIssues[desEpicAndModeIssues.length - 1].issueId;
          } else {
            before = true;
            outsetIssueId = desEpicAndModeIssues[desIndex].issueId;
          }
        }
      } else {
        // 目的地块中无卡，判断同行是否为空
        let desModeIssues;
        if (desModeId === 0) {
          if (mode === 'none') {
            desModeIssues = issueData;
          } else {
            desModeIssues = _.filter(issueData, issue => issue[key] === 0 || issue[key] === null);
          }
        } else {
          desModeIssues = _.filter(issueData, issue => issue[key] === desModeId);
        }
        if (desModeId === souModeId) {
          // 同行之间移动
          if (desModeIssues.length === 1) {
            // 长度为1，该行只有一张卡，就是移动的卡
            before = true;
            outsetIssueId = 0;
          } else {
            // 该行有除了移动卡的卡，放在之前
            before = true;
            outsetIssueId = desModeIssues[0].issueId === parseInt(res.draggableId.split('-')[1], 10)
              ? desModeIssues[1].issueId : desModeIssues[0].issueId;
          }
        } else if (true) {
          if (desModeIssues.length) {
            before = true;
            outsetIssueId = desModeIssues[0].issueId;
          } else {
            outsetIssueId = 0;
            if (souModeId && desModeId) {
              const modeData = UserMapStore[`${mode}s`] || [];
              const souModeIndex = _.findIndex(modeData, v => v[key] === souModeId);
              const desModeIndex = _.findIndex(modeData, v => v[key] === desModeId);
              before = desModeIndex < souModeIndex;
            } else if (!souModeId) {
              before = true;
            } else {
              before = false;
            }
          }
        }
      }
      const rankIndex = null;
      const transformData = this.transformDateToPostDate(issueIds, issues, mode, desEpicId, desModeId);
      const postData = {
        before,
        epicId: transformData.epicIssueIds.length ? desEpicId : undefined,
        outsetIssueId,
        rankIndex,
        issueIds,
        versionIssueIds: transformData.versionIssueIds.length ? transformData.versionIssueIds : undefined,
        sprintIssueIds: transformData.sprintIssueIds.length ? transformData.sprintIssueIds : undefined,
        epicIssueIds: transformData.epicIssueIds.length ? transformData.epicIssueIds : undefined,
      };
      if (mode !== 'none' && transformData[`${mode}IssueIds`].length) {
        postData[key] = desModeId;
      }
      let tarBacklogData = backlogIssues;

      this.handleDataWhenMove(issueIds, before, outsetIssueId, mode, desEpicId, desModeId);
      // _.map(issueIds, (id) => {
      //   const currentIssue = _.find(issueData, item => item.issueId === id);
      //   const vosId = desModeId === 0 ? null : desModeId;
      //   currentIssue.epicId = desEpicId;
      //   if (mode !== 'none') {
      //     currentIssue[key] = vosId;
      //   }
      //   // postData = {
      //   //   before, epicId: desEpicId, outsetIssueId, rankIndex, issueIds,
      //   // };
      //   if (res.source.droppableId.includes('backlog')) {
      //     tarBacklogData = _.find(backlogData, item => item.issueId === id);
      //     const index = backlogData.indexOf(tarBacklogData);
      //     backlogData.splice(index, 1);
      //   }
      //   if (mode !== 'none') {
      //     // postData[key] = desModeId;
      //   }
      // });
      // if (res.source.droppableId.includes('backlog')) {
      //   UserMapStore.setBacklogIssues(backlogData);
      // }
      // UserMapStore.setIssues(issueData);
      UserMapStore.handleMoveIssue(postData);
      UserMapStore.setSelectIssueIds([]);
      UserMapStore.setCurrentDraggableId(null);
    } else {
      this.handleMultipleDragToBoard(res);
    }
  };

  handleDragToBacklog = (res) => {
    const { UserMapStore } = this.props;
    const {
      mode, issues, backlogIssues, selectIssueIds,
    } = UserMapStore;
    if (selectIssueIds.length < 2) {
      const key = `${mode}Id`;
      const desIndex = res.destination.index;
      // const desEpicId = this.getSprintIdAndEpicId(res.destination.droppableId).epicId;
      const desModeId = this.getSprintIdAndEpicId(res.destination.droppableId).modeId;
      const souModeId = this.getSprintIdAndEpicId(res.source.droppableId).modeId;
      const souEpicId = this.getSprintIdAndEpicId(res.source.droppableId).epicId;
      const issueIds = selectIssueIds.length ? toJS(selectIssueIds) : [parseInt(res.draggableId.split('-')[1], 10)];
      const issueData = _.cloneDeep(toJS(issues));
      const backlogData = _.cloneDeep(toJS(backlogIssues));
      // let desEpicAndModeIssues;
      let desModeIssues;
      if (mode === 'none') {
        desModeIssues = backlogData.slice()
      } else if (true) {
        if (desModeId === 0) {
          desModeIssues = _.filter(backlogData, issue => issue[key] === 0 || issue[key] === null);
        } else {
          desModeIssues = _.filter(backlogData, issue => issue[key] === desModeId);
        }
      }
      // if (desModeId === 0) {
      //   const desEpicIssues = _.filter(issueData, issue => issue.epicId === desEpicId);
      //   if (mode === 'none') {
      //     desEpicAndModeIssues = desEpicIssues.slice();
      //   } else {
      //     desEpicAndModeIssues = _.filter(desEpicIssues, issue => issue[key] === 0 
      //       || issue[key] === null);
      //   }
      // } else {
      //   desEpicAndModeIssues = _.filter(issueData, issue => issue.epicId === desEpicId
      //     && issue[key] === desModeId);
      // }
      let before;
      let outsetIssueId;
      if (desModeIssues.length) {
        // 目的地块中有卡，判断所放位置是否为0
        if (!desIndex) {
          before = true;
          outsetIssueId = desModeIssues[0].issueId;
        } else if (desModeId === souModeId) {
          // 同块之间移动，判断是否放在最后
          if (desIndex === desModeIssues.length - 1) {
            before = false;
            outsetIssueId = desModeIssues[desModeIssues.length - 1].issueId;
          } else {
            before = true;
            if (desIndex > res.source.index) {
              outsetIssueId = desModeIssues[desIndex + 1].issueId;
            } else {
              outsetIssueId = desModeIssues[desIndex].issueId;
            }
          }
        } else if (true) {
          // 不同块之间移动，判断是否放在最后
          if (desIndex === desModeIssues.length) {
            before = false;
            outsetIssueId = desModeIssues[desModeIssues.length - 1].issueId;
          } else {
            before = true;
            outsetIssueId = desModeIssues[desIndex].issueId;
          }
        }
      } else {
        // 目的地块中无卡，判断同行是否为空
        let desModeAllIssues;
        if (desModeId === 0) {
          if (mode === 'none') {
            desModeAllIssues = issueData;
          } else {
            desModeAllIssues = _.filter(issueData, issue => issue[key] === 0 || issue[key] === null);
          }
        } else {
          desModeAllIssues = _.filter(issueData, issue => issue[key] === desModeId);
        }
        if (desModeId === souModeId) {
          // 同行之间移动
          if (desModeAllIssues.length === 1) {
            // 长度为1，该行只有一张卡，就是移动的卡
            before = true;
            outsetIssueId = 0;
          } else {
            // 该行有除了移动卡的卡，放在之前
            before = true;
            outsetIssueId = desModeAllIssues[0].issueId === parseInt(res.draggableId.split('-')[1], 10)
              ? desModeAllIssues[1].issueId : desModeAllIssues[0].issueId;
          }
        } else if (true) {
          // 不同行之间移动，放到空块里
          if (desModeAllIssues.length) {
            before = true;
            outsetIssueId = desModeAllIssues[0].issueId;
          } else {
            outsetIssueId = 0;
            if (souModeId && desModeId) {
              const modeData = UserMapStore[`${mode}s`] || [];
              const souModeIndex = _.findIndex(modeData, v => v[key] === souModeId);
              const desModeIndex = _.findIndex(modeData, v => v[key] === desModeId);
              before = desModeIndex < souModeIndex;
            } else if (!souModeId) {
              before = true;
            } else {
              before = false;
            }
          }
        }
      }
      const rankIndex = null;
      const transformData = this.transformDateToPostDate(issueIds, issues, mode, 0, desModeId);
      const postData = {
        before,
        epicId: transformData.epicIssueIds.length ? 0 : undefined,
        outsetIssueId,
        rankIndex,
        issueIds,
        versionIssueIds: transformData.versionIssueIds.length ? transformData.versionIssueIds : undefined,
        sprintIssueIds: transformData.sprintIssueIds.length ? transformData.sprintIssueIds : undefined,
        epicIssueIds: transformData.epicIssueIds.length ? transformData.epicIssueIds : undefined,
      };
      if (mode !== 'none' && transformData[`${mode}IssueIds`].length) {
        postData[key] = desModeId;
      }
      let tarBacklogData = backlogIssues;
      this.handleDataWhenMove(issueIds, before, outsetIssueId, mode, 0, desModeId);
      // _.map(issueIds, (id) => {
      //   const currentIssue = _.find(issueData, item => item.issueId === id);
      //   const vosId = desModeId === 0 ? null : desModeId;
      //   currentIssue.epicId = 0;
      //   if (mode !== 'none') {
      //     // currentIssue[key] = vosId;
      //   }
      //   // postData = {
      //   //   before, epicId: souEpicId ? 0 : undefined, outsetIssueId, rankIndex, issueIds, [key]: desModeId,
      //   // };
      //   // if (res.source.droppableId.includes('backlog')) {
      //   //   tarBacklogData = _.find(backlogData, item => item.issueId === id);
      //   //   const index = backlogData.indexOf(tarBacklogData);
      //   //   backlogData.splice(index, 1);
      //   // }
      //   // if (mode !== 'none') {
      //   //   postData[key] = desModeId;
      //   // }
      // });
      // if (res.source.droppableId.includes('backlog')) {
      //   UserMapStore.setBacklogIssues(backlogData);
      // }
      // UserMapStore.setIssues(issueData);
      // window.console.log(postData);
      UserMapStore.handleMoveIssue(postData);
      UserMapStore.setSelectIssueIds([]);
      UserMapStore.setCurrentDraggableId(null);
    } else {
      this.handleMultipleDragToBacklog(res);
    }
  };

  // handleDragToBacklog = (res) => {
  //   const { UserMapStore } = this.props;
  //   const {
  //     backlogIssues, mode, selectIssueIds, issues, 
  //   } = UserMapStore;
  //   const key = `${mode}Id`;
  //   const value = parseInt(res.destination.droppableId.split('-')[1], 10);
  //   const issueIds = selectIssueIds.length ? selectIssueIds : [parseInt(res.draggableId.split('-')[1], 10)];
  //   const before = res.destination.index === 0;
  //   const rankIndex = null;
  //   let backlogData = _.cloneDeep(toJS(backlogIssues));
  //   const issueData = _.cloneDeep(toJS(issues));
  //   let postData = {};
  //   const tarIndex = res.destination.index;
  //   let outsetIssueId = null;
  //   _.map(issueIds, (id) => {
  //     const vosId = value === 0 ? null : value;
  //     let tarData = _.filter(backlogIssues, item => item[key] === vosId);
  //     if (mode === 'none') {
  //       tarData = backlogData;
  //     }
  //     if (before && tarData.length) {
  //       outsetIssueId = tarData[0].issueId;
  //     } else if (before && !tarData.length) {
  //       outsetIssueId = 0;
  //     } else {
  //       outsetIssueId = tarData[tarIndex - 1].issueId;
  //     }
  //     let tarIssue = null;
  //     if (res.source.droppableId.includes('backlog')) {
  //       tarIssue = _.filter(backlogData, item => item.issueId === id)[0];
  //       postData = {
  //         before, outsetIssueId, rankIndex, issueIds, [key]: vosId, 
  //       };
  //       // const index = backlogIssues.indexOf(tarIssue);
  //     } else {
  //       tarIssue = _.filter(issueData, item => item.issueId === id)[0];
  //       tarIssue.epicId = 0;
  //       postData = {
  //         before, outsetIssueId, rankIndex, issueIds, epicId: 0, 
  //       };
  //       tarData.splice(tarIndex, 0, tarIssue);
  //       if (mode !== 'none') {
  //         backlogData = backlogData.filter(item => item[key] !== vosId).concat(tarData);
  //       }
  //     }
  //     if (mode !== 'none') {
  //       tarIssue[key] = vosId;
  //       postData[key] = value;
  //     }
  //   });
  //   if (!res.source.droppableId.includes('backlog')) {
  //     UserMapStore.setIssues(issueData);
  //   }
  //   UserMapStore.setBacklogIssues(backlogData);
  //   UserMapStore.handleMoveIssue(postData);
  //   UserMapStore.setSelectIssueIds([]);
  //   UserMapStore.setCurrentDraggableId(null);
  // };

  handleEpicOrIssueDrag = (res) => {
    if (!res.destination) {
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

  handleSaveAsImage = () => {
    const shareContent = document.querySelector('.fixHead');// 需要截图的包裹的（原生的）DOM 对象
    const opts = {
      useCORS: true, // 【重要】开启跨域配置
    };
    shareContent.style.width = `${Math.max(document.querySelector('.fixHead-head').scrollWidth, document.querySelector('.fixHead-body').scrollWidth)}px`;
    html2canvas(shareContent, opts)
      .then((canvas) => {
        this.downLoadImage(canvas, '用户故事地图.png');
      });
  }

  /**
   * 
   * @param {canvas} canvas 
   * @param {filename} name 
   */
  downLoadImage(canvas, name) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL();
    a.download = name;
    a.click();
  }

  getStyle(element, attr) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(element, null)[attr];
    } else {
      return element.currentStyle[attr];
    }
  }

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
      <Menu onClick={this.changeMode} selectable defaultSelectedKeys={[mode]}>
        <Menu.Item key="none">无泳道</Menu.Item>
        <Menu.Item key="version">版本泳道</Menu.Item>
        <Menu.Item key="sprint">冲刺泳道</Menu.Item>
      </Menu>
    );
    return (
      <Header title="用户故事地图">
        <Button className="leftBtn" functyp="flat" onClick={this.handleCreateEpic}>
          <Icon type="playlist_add" />
          {'创建史诗'}
        </Button>
        <Dropdown
          overlay={swimlanMenu}
          trigger={['click']}
          overlayClassName="modeMenu"
          placement="bottomCenter"
          getPopupContainer={triggerNode => triggerNode}
        >
          <Button>
            {mode === 'none' && '无泳道'}
            {mode === 'version' && '版本泳道'}
            {mode === 'sprint' && '冲刺泳道'}
            <Icon type="arrow_drop_down" />
          </Button>
        </Dropdown>
        <Popover
          getPopupContainer={triggerNode => triggerNode}
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
              <div style={{ height: 22, marginBottom: 20 }}>
                <Checkbox onChange={this.handleFilterEpic}>应用快速搜索到史诗</Checkbox>
              </div>
              <div className="menu-title">导出</div>
              {/* <div style={{ height: 22, marginBottom: 20, marginLeft: 26 }}>导出为excel</div> */}
              <div onClick={this.handleSaveAsImage} role="none" style={{ height: 22, marginLeft: 26, cursor: 'pointer' }}>导出为图片</div>
            </div>
          )}
        >
          <Button>
            {'更多'}
            <Icon type="arrow_drop_down" />
          </Button>
        </Popover>
        <Button className="leftBtn2" funcType="flat" onClick={this.initData.bind(this, true)}>
          <Icon type="refresh icon" />
          <span>刷新</span>
        </Button>
        <Button className="leftBtn2" funcType="flat" onClick={this.handleFullScreen.bind(this)}>
          <Icon type="refresh icon" />
          <span>{this.state.isFullScreen ? '退出全屏' : '全屏'}</span>
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
          {'需求池'}
        </Button>
      </Header>);
  }

  renderBody = () => {
    const { UserMapStore } = this.props;
    const dom = [];
    const epicData = UserMapStore.getEpics;
    const {
      issues, sprints, versions, currentNewObj, left, top, 
    } = UserMapStore;
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
            // style={{ transform: `translateX(${`${left}px`}) translateZ(0)` }}
            style={{ marginLeft: left }}
            // data-title={vos[name]}
            // data-id={vos[id]}
          >
            <div>{vos[name]}</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
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
              <Button shape="circle" className="expand-btn" onClick={this.handleExpandColumn.bind(this, vos[id])} role="none">
                <Icon type={`${this.state.expandColumns.includes(vos[id]) ? 'baseline-arrow_left' : 'baseline-arrow_drop_down'}`} />
              </Button>
            </div>
          </div>
          <div
            className="fixHead-line-content"
            style={{ display: 'flex', height: this.state.expandColumns.includes(vos[id]) ? 1 : '', overflow: this.state.expandColumns.includes(vos[id]) ? 'hidden' : 'visible' }}
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
                      background: snapshot.isDraggingOver ? '#f0f0f0' : '',
                      padding: 'grid',
                      // borderBottom: '1px solid rgba(0,0,0,0.12)'
                    }}
                  >
                    <React.Fragment>
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
                              {item.issueId}
                              <IssueCard
                                handleClickIssue={this.handleClickIssue}
                                issue={item}
                                borderTop={indexs === 0}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {
                        epicId === epic.issueId && currentNewObj[id] === vos[id] ? (
                          <CreateIssue
                            data={{ epicId: epic.issueId, [id]: vos[id] }}
                            onOk={(res) => {
                              const data = _.cloneDeep(issues).push(res);
                              UserMapStore.setIssues(data);
                              this.handleAddIssue(0, 0);
                              UserMapStore.initData(false);
                            }}
                            onCancel={() => {
                              this.handleAddIssue(0, 0);
                            }}
                          />
                        ) : null
                      }
                      <div
                        role="none"
                        onClick={this.handleClickIssue.bind(this, 0)}
                        className="maskIssue"
                        onMouseLeave={() => { this.setState({ showChild: null }); }}
                        onMouseEnter={() => {
                          if (snapshot.isDraggingOver) return;
                          this.setState({ showChild: `${epic.issueId}-${vos[id]}` });
                        }}
                      >
                        <div style={{ fontWeight: '500', display: !snapshot.isDraggingOver && this.state.showChild === `${epic.issueId}-${vos[id]}` ? 'block' : 'none' }}>

                          
                          {'Add'}
                          <a role="none" onClick={this.handleAddIssue.bind(this, epic.issueId, vos[id])}>new</a>
                          {' '}


                          {'or '}
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
          <div style={{ transform: `translateX(${`${left}px`}) translateZ(0)` }}>
            <div
              className={`fixHead-line-title column-title ${vosData.length ? '' : 'firstLine-title'}`}
              title={mode === 'none' ? 'issue' : '未计划部分'}
              data-id={-1}
            >
              <div>
                {mode === 'none' ? 'issue' : '未计划部分' }
                {mode === 'none' ? null
                  : (
                    <React.Fragment>
                      {mode === 'version' ? (
                        <Permission service={['agile-service.product-version.createVersion']}>
                          <Button className="createSpringBtn" functyp="flat" onClick={this.handleCreateVOS.bind(this, mode)}>
                            <Icon type="playlist_add" />


                            {'创建'}
                            {mode === 'sprint' ? '冲刺' : '版本'}
                          </Button>
                        </Permission>
                      )
                        : (
                          <Button className="createSpringBtn" functyp="flat" onClick={this.handleCreateVOS.bind(this, mode)}>
                            <Icon type="playlist_add" />


                            {'创建'}
                            {mode === 'sprint' ? '冲刺' : '版本'}
                          </Button>
                        )}
                    </React.Fragment>

                  ) }

              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
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
              </div>
            </div>
          </div>

          <div
            className="fixHead-line-content"
            style={{ display: 'flex', height: this.state.expandColumns.includes(`-1-${mode}`) ? 1 : '', overflow: this.state.expandColumns.includes(`-1-${mode}`) ? 'hidden' : 'visible' }}
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
                      background: snapshot.isDraggingOver ? '#f0f0f0' : '',
                      padding: 'grid',
                      // borderBottom: '1px solid rgba(0,0,0,0.12)'
                    }}
                  >
                    <React.Fragment>
                      {_.filter(issues, issue => issue.epicId === epic.issueId && (mode !== 'none' && (issue[id] == null || issue[id] === 0) || mode === 'none')).map((item, indexs) => (
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
                              {item.issueId}
                              <IssueCard
                                handleClickIssue={this.handleClickIssue}
                                key={item.issueId}
                                issue={item}
                                borderTop={indexs === 0}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {
                        epicId === epic.issueId && currentNewObj[id] === 0 ? (
                          <CreateIssue
                            data={{ epicId: epic.issueId, [`${mode}Id`]: 0 }}
                            onOk={(res) => {
                              const data = _.cloneDeep(issues).push(res);
                              // UserMapStore.setIssues(data);
                              UserMapStore.initData(false);
                              this.setState({ showChild: null });
                              // this.handleAddIssue(0, 0);
                            }}
                            onCancel={() => {
                              this.handleAddIssue(0, 0);
                            }}
                          />
                        ) : null
                      }
                      <div
                        className="maskIssue"
                        // style={{ background: !snapshot.isDraggingOver && this.state.showChild === epic.issueId ? '' : '' }}
                        onMouseLeave={() => { this.setState({ showChild: null }); }}
                        onMouseEnter={() => {
                          if (snapshot.isDraggingOver) return;
                          this.handleClickIssue(0);
                          this.setState({ showChild: epic.issueId });
                        }}
                      >
                        <div style={{ fontWeight: '500', display: !snapshot.isDraggingOver && this.state.showChild === epic.issueId ? 'block' : 'none' }}>

                          
                          {'Add'}
                          <a role="none" onClick={this.handleAddIssue.bind(this, epic.issueId, 0)}>new</a>
                          {' '}


                          {'or '}
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
    const firstTitle = '';
    const count = this.getHistoryCount(UserMapStore.getVosId);
    const vosId = UserMapStore.getVosId === 0 ? `-1-${mode}` : UserMapStore.getVosId;
    let showDone = true;
    if (UserMapStore.getVosId === 0) {
      showDone = false;
    }

    return (
      <Page
        className="c7n-userMap"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        {this.renderHeader()}
        { epicData.length ? (
          <Content style={{ padding: 0, height: '100%', paddingLeft: 24 }}>
            {isLoading ? <Spin spinning={isLoading} style={{ marginLeft: '40%', marginTop: '30%' }} size="large" />
              : (
                <DragDropContext onDragEnd={this.handleEpicOrIssueDrag} onDragStart={this.handleEpicOrIssueDragStart}>
                  <div style={{ width: showBackLog ? `calc(100% - ${350}px)` : '100%', height: '100%' }}>
                    <div className="toolbar" style={{ minHeight: 52 }}>
                      <div className="filter" style={{ height: this.state.expand ? '' : 27 }}>
                        <p style={{ padding: '3px 8px 3px 0' }}>快速搜索:</p>
                        <p
                          role="none"
                          style={{ background: `${currentFilters.includes('mine') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('mine') ? 'white' : '#3F51B5'}`, marginBottom: 3 }}
                          onClick={this.addFilter.bind(this, 'mine')}
                        >
                          {'仅我的问题'}
                        </p>
                        <p
                          role="none"
                          style={{ background: `${currentFilters.includes('userStory') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('userStory') ? 'white' : '#3F51B5'}`, marginBottom: 3 }}
                          onClick={this.addFilter.bind(this, 'userStory')}
                        >
                          {'仅用户故事'}

                        </p>
                        {filters.map(filter => (
                          <p
                            key={filter.filterId}
                            role="none"
                            style={{
                              background: `${currentFilters.includes(filter.filterId) ? 'rgb(63, 81, 181)' : 'white'}`,
                              color: `${currentFilters.includes(filter.filterId) ? 'white' : '#3F51B5'}`,
                              marginBottom: 3,
                            }}
                            onClick={this.addFilter.bind(this, filter.filterId)}
                          >
                            {filter.name}

                          </p>)) }
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
                    { showBackLog ? (
                      <div style={{ display: showBackLog ? 'block' : 'none', width: 350 }}>
                        <Backlog handleClickIssue={this.handleClickIssue} />
                      </div>
                    ) : null }
                    <div className="fixHead" style={{ height: `calc(100% - ${52}px)` }}>
                      <div className="fixHead-head" id="fixHead-head">
                        <div className="fixHead-line">
                          <Droppable droppableId="epic" direction="horizontal">
                            {(provided, snapshot) => (
                              <div
                                className="fixHead-line-epic"
                                ref={provided.innerRef}
                                style={{
                                  background: snapshot.isDraggingOver ? '#f0f0f0' : 'white',
                                  padding: 'grid',
                                  // borderBottom: '1px solid rgba(0,0,0,0.12)'
                                }}
                              >
                                {epicData.map((epic, index) => (
                                  <div className="fixHead-block" key={epic.issueId}>
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
                        <div
                          className="fixHead-line fixHead-line-2 transform-left"
                          style={{
                            height: 42,
                            // transform: `translateX(${`${left}px`})`,
                          }}
                        >
                          <div className="fixHead-head-note">
                            <span className="column-title">
                              { UserMapStore.getTitle}
                            </span>
                            <div style={{
                              display: 'flex', float: 'right', justifyContent: 'baseline', alignItems: 'center', 
                            }}
                            >
                              <p className="point-span" style={{ background: '#4D90FE' }}>
                                {count.todoCount}
                              </p>
                              <p className="point-span" style={{ background: '#FFB100' }}>
                                {count.doingCount}
                              </p>
                              {showDone && (
                              <p className="point-span" style={{ background: '#00BFA5' }}>
                                {count.doneCount}
                              </p>
                              )}
                              {showDone && (
                              <Button className="expand-btn" shape="circle" onClick={this.handleExpandColumn.bind(this, vosId)} role="none">
                                <Icon type={`${this.state.expandColumns.includes(vosId) ? 'baseline-arrow_left' : 'baseline-arrow_drop_down'}`} />
                              </Button>
                              )}

                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="fixHead-body" id="fixHead-body" style={{ flex: 1, position: 'relative' }}>
                        {this.renderBody()}
                      </div>
                    </div>
                  </div>
                </DragDropContext>
              )}
            <CreateEpic
              getContainer={() => document.querySelector('.c7n-userMap')}
              visible={createEpic}
              onOk={() => {
                UserMapStore.setCreateEpic(false);
                UserMapStore.loadEpic();
              }}
              onCancel={() => UserMapStore.setCreateEpic(false)}
            />
            <CreateVOS
              getContainer={() => document.querySelector('.c7n-userMap')}
              visible={UserMapStore.createVOS}
            // onOk={() => {UserMapStore.setCreateVOS(false)}}
              onOk={this.handleCreateOk}
              onCancel={() => { UserMapStore.setCreateVOS(false); }}
              type={UserMapStore.getCreateVOSType}
            />
          </Content>
        ) : (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10%', 
          }}
          >
            <img src={epicPic} alt="" width="200" />
            <div style={{ marginLeft: 50, width: 390 }}>
              <span style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14 }}>欢迎使用敏捷用户故事地图</span>
              <p style={{ fontSize: 20, marginTop: 10 }}>
                {'用户故事地图是以史诗为基础，根据版本控制，迭代冲刺多维度对问题进行管理规划，点击'}
                <a role="none" onClick={this.handleCreateEpic}>创建史诗</a>
                {'进入用户故事地图。'}
              </p>
            </div>
          </div>
        )}
      </Page>
    );
  }
}
export default Home3;
