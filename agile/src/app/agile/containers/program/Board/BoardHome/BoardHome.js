import React, { Component } from 'react';
import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import {
  Page, Header, stores,
} from 'choerodon-front-boot';
import { Button, Spin } from 'choerodon-ui';
import { find } from 'lodash';
import {
  StatusColumn, NoneSprint, CreateFeatureContainer, IssueDetail,
} from './components';
import { ProgramBoardSettingLink } from '../../../../common/utils';
import SwimLane from './components/RenderSwimLaneContext/SwimLane';
import BoardDataController from './BoardDataController';
import QuickSearch from '../../../../components/QuickSearch';
import CSSBlackMagic from '../../../../components/CSSBlackMagic/CSSBlackMagic';
import BoardStore from '../../../../stores/Program/Board/BoardStore';
import './BoardHome.scss';

const { AppState } = stores;
const style = swimLaneId => `
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn {
    background-color: rgba(140, 158, 255, 0.12) !important;
  }
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn > .c7n-swimlaneContext-itemBodyStatus >  .c7n-swimlaneContext-itemBodyStatus-container {
    border-width: 2px;
    border-style: dashed;
    border-color: #26348b;
  }
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn > .c7n-swimlaneContext-itemBodyStatus > .c7n-swimlaneContext-itemBodyStatus-container > .c7n-swimlaneContext-itemBodyStatus-container-statusName {
      visibility: visible !important;
  } 
`;
const cannotDrop = swimLaneId => `
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn {
    background-color: rgba(140, 158, 255, 0.12) !important;
  }
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn > .c7n-swimlaneContext-itemBodyStatus >  .c7n-swimlaneContext-itemBodyStatus-container {
    border-width: 2px;
    border-style: dashed;
    border-color: #26348b;
  }
  .${swimLaneId}.c7n-swimlaneContext-itemBodyColumn > .c7n-swimlaneContext-itemBodyStatus > .c7n-swimlaneContext-itemBodyStatus-container > .c7n-swimlaneContext-itemBodyStatus-container-statusName {
      visibility: visible !important;
  } 
`;
@CSSBlackMagic
@inject('AppState', 'HeaderStore')
@observer
class BoardHome extends Component {
  constructor() {
    super();
    this.dataConverter = new BoardDataController();
  }

  componentDidMount() {
    this.getBoard();
  }

  componentWillUnmount() {
    this.dataConverter = null;
    BoardStore.resetDataBeforeUnmount();
  }

  async getBoard() {    
    const boardListData = await BoardStore.axiosGetBoardList();
    const defaultBoard = boardListData.find(item => item.userDefault) || boardListData[0];
    if (defaultBoard.boardId) {
      this.refresh(defaultBoard, null, boardListData);
    }
  }

  handleCreateFeatureClick = () => {
    BoardStore.setCreateFeatureVisible(true);
  }

  handleSettingClick=() => {
    const { history } = this.props;
    history.push(ProgramBoardSettingLink());
  }

  onDragStart = (result) => {
    const { headerStyle } = this.props;
    const { draggableId } = result;
    const [SwimLaneId, issueId] = draggableId.split(['/']);
    headerStyle.changeStyle(style(SwimLaneId));
    BoardStore.setIsDragging(true);
  };

  onDragEnd = (result) => {
    const { headerStyle } = this.props;
    const { destination, source, draggableId } = result;
    const [SwimLaneId, issueId] = draggableId.split(['/']);
    const allDataMap = BoardStore.getAllDataMap;
    BoardStore.resetCanDragOn();
    BoardStore.setIsDragging(true);
    headerStyle.unMountStyle();
    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const [startStatus, startColumn, startStatusCode] = source.droppableId.split(['/']).map(id => (isNaN(id) ? id : parseInt(id, 10)));
    const startStatusIndex = source.index;

    const [destinationStatus, destinationColumn, destinationStatusCode] = destination.droppableId.split(['/']).map(id => (isNaN(id) ? id : parseInt(id, 10)));
    const destinationStatusIndex = destination.index;

    const issue = {
      ...allDataMap.get(+issueId),
      stayDay: 0,
    };
    // BoardStore.getSwimLaneData
    const destinationColumnData = find(toJS(BoardStore.getMapStructure.columnStructure), { columnId: destinationColumn });
    const { categoryCode: destinationColumnStatusCode } = destinationColumnData;
    const destinationSwimLineData = toJS(BoardStore.getSwimLaneData[SwimLaneId][destinationStatus]);
    const activePi = toJS(BoardStore.activePi);
    console.log(destinationSwimLineData, destinationColumnData, activePi);
    const rank = destinationColumnStatusCode !== 'prepare';
    let piId;

    if (destinationColumnStatusCode === 'prepare' && destinationColumnStatusCode === 'prepare') {
      piId = undefined;
    } else if (destinationSwimLineData.length > 0) {
      piId = destinationSwimLineData[0].piId;
    } else {
      piId = activePi ? activePi.id : undefined;
    }

    const [type, parentId] = SwimLaneId.split('-');
    const piChange = piId !== issue.piId;
    // debugger;
    BoardStore.updateIssue(issue, startStatus, startStatusIndex, destinationStatus, destinationStatusIndex, SwimLaneId, piId, rank, piChange).then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
        BoardStore.setSwimLaneData(SwimLaneId, startStatus, startStatusIndex, SwimLaneId, destinationStatus, destinationStatusIndex, issue, true);
      } else {
        if (BoardStore.getSwimLaneCode === 'parent_child' && parentId !== 'other') {
          BoardStore.judgeMoveParentToDone(destinationStatus, SwimLaneId, +parentId, BoardStore.getStatusMap.get(destinationStatus).categoryCode === 'done');
        }
        if (data.issueId === BoardStore.getCurrentClickId) {
          BoardStore.getEditRef.reloadIssue();
        }
        if (startColumn !== destinationColumn) {
          BoardStore.resetHeaderData(startColumn, destinationColumn, issue.issueTypeDTO.typeCode);
        }
        BoardStore.rewriteObjNumber(data, issueId, issue);
      }
    });
    BoardStore.setSwimLaneData(SwimLaneId, startStatus, startStatusIndex, SwimLaneId, destinationStatus, destinationStatusIndex, issue, false);
  };

  handleCreate=() => {
    BoardStore.setCreateFeatureVisible(false);
    this.refresh(BoardStore.getBoardList.get(BoardStore.getSelectedBoard));
  }

  refresh(defaultBoard, url, boardListData) {
    BoardStore.setSpinIf(true);
    Promise.all([BoardStore.axiosGetIssueTypes(), BoardStore.axiosGetStateMachine(), BoardStore.axiosGetBoardData(defaultBoard.boardId), BoardStore.axiosGetAllEpicData()]).then(([issueTypes, stateMachineMap, defaultBoardData, epicData]) => {
      this.dataConverter.setSourceData(epicData, defaultBoardData);
      const renderDataMap = new Map([
        ['parent_child', this.dataConverter.getParentWithSubData],
        ['swimlane_epic', this.dataConverter.getEpicData],
        ['assignee', this.dataConverter.getAssigneeData],
        ['feature', this.dataConverter.getFeatureData],
        ['swimlane_none', this.dataConverter.getAllData],
      ]);
      const renderData = renderDataMap.get(defaultBoard.userDefaultBoard)();
      const canDragOn = this.dataConverter.getCanDragOn();
      const statusColumnMap = this.dataConverter.getStatusColumnMap();
      const statusMap = this.dataConverter.getStatusMap();
      const mapStructure = this.dataConverter.getMapStructure();
      const allDataMap = this.dataConverter.getAllDataMap(defaultBoard.userDefaultBoard);
      const headerData = this.dataConverter.getHeaderData();
      BoardStore.scrumBoardInit(AppState, url, boardListData, defaultBoard, defaultBoardData, null, issueTypes, stateMachineMap, canDragOn, statusColumnMap, allDataMap, mapStructure, statusMap, renderData, headerData);
    });
  }


  render() {
    const { HeaderStore } = this.props;
    return (
      <Page
        className="c7nagile-board-page"
      >
        <Header title="项目群看板">
          <Button
            funcType="flat"
            icon="playlist_add"
            onClick={this.handleCreateFeatureClick}
          >
            创建特性
          </Button>
          <Button
            className="leftBtn2"
            funcType="flat"
            icon="refresh"
            onClick={() => {
              this.refresh(BoardStore.getBoardList.get(BoardStore.getSelectedBoard));
            }}
          >
            刷新
          </Button>
        </Header>
        <div style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="c7n-scrumTools">
            <div />
            <div
              className="c7n-scrumTools-right"
              style={{ display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.54)' }}
            >
              <Button
                funcType="flat"
                icon="settings"
                onClick={this.handleSettingClick}
              >
                配置
              </Button>
            </div>
          </div>
          <Spin spinning={BoardStore.getSpinIf}>
            <div style={{ display: 'flex', width: '100%' }}>
              <div className="c7n-scrumboard">
                <div className="c7n-scrumboard-header" style={HeaderStore.announcementClosed ? {} : { height: 'calc(100vh - 208px)' }}>
                  <StatusColumn />
                </div>
                {!BoardStore.didCurrentSprintExist ? (
                  <NoneSprint />
                ) : (
                  <div
                    className="c7n-scrumboard-content"
                  >
                    <div className="c7n-scrumboard-container">
                      <SwimLane
                        mode={BoardStore.getSwimLaneCode}
                        allDataMap={this.dataConverter.getAllDataMap()}
                        mapStructure={BoardStore.getMapStructure}
                        onDragEnd={this.onDragEnd}
                        onDragStart={this.onDragStart}
                      />
                    </div>
                  </div>
                )}
              </div>
              <IssueDetail
                refresh={this.refresh.bind(this)}
              />
            </div>

          </Spin>
        </div>
        <CreateFeatureContainer onCreate={this.handleCreate} />
      </Page>
    );
  }
}

BoardHome.propTypes = {

};

export default BoardHome;
