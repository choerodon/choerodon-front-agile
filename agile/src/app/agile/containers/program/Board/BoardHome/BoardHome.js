import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import {
  Button, Select, Spin, message, Icon, Modal, Input, Form, Tooltip,
} from 'choerodon-ui';
import { StatusColumn, NoneSprint, CreateFeatureContainer } from './components';
import SwimLane from './components/RenderSwimLaneContext/SwimLane';
import BoardDataController from './BoardDataController';
import QuickSearch from '../../../../components/QuickSearch';

import BoardStore from '../../../../stores/Program/Board/BoardStore';
import './BoardHome.scss';

const { AppState } = stores;
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
    const { location } = this.props;
    
    const boardListData = await BoardStore.axiosGetBoardList();
    const defaultBoard = boardListData.find(item => item.userDefault) || boardListData[0];
    if (defaultBoard.boardId) {
      this.refresh(defaultBoard, null, boardListData);
    }
  }

  handleCreateFeatureClick=() => {
    BoardStore.setCreateFeatureVisible(true);
  }

  refresh(defaultBoard, url, boardListData) {
    BoardStore.setSpinIf(true);
    Promise.all([BoardStore.axiosGetIssueTypes(), BoardStore.axiosGetStateMachine(), BoardStore.axiosGetBoardData(defaultBoard.boardId), BoardStore.axiosGetAllEpicData()]).then(([issueTypes, stateMachineMap, defaultBoardData, epicData]) => {
      this.dataConverter.setSourceData(epicData, defaultBoardData);
      const renderDataMap = new Map([
        ['parent_child', this.dataConverter.getParentWithSubData],
        ['swimlane_epic', this.dataConverter.getEpicData],
        ['assignee', this.dataConverter.getAssigneeData],
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
    const { history, HeaderStore } = this.props;
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
            <QuickSearch
              // onQuickSearchChange={this.onQuickSearchChange}
              // onAssigneeChange={this.onAssigneeChange}
              style={{ height: 32 }}
            />
            <div
              className="c7n-scrumTools-right"
              style={{ display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.54)' }}
            >
              <Button
                funcType="flat"
                onClick={() => {
                  const urlParams = AppState.currentMenuType;
                  // history.push(`/agile/scrumboard/setting?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&boardId=${ScrumBoardStore.getSelectedBoard}`);
                }}
              >
                <Icon type="settings icon" />
                <span style={{ marginLeft: 0 }}>配置</span>
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
              {/* <IssueDetail
                refresh={this.refresh.bind(this)}
              /> */}
            </div>
            
          </Spin>   
        </div>
        <CreateFeatureContainer />
      </Page>
    );
  }
}

BoardHome.propTypes = {

};

export default BoardHome;
