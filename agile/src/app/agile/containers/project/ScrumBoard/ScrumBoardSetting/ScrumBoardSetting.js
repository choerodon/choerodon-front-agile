import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { Button, Spin, Modal, Form, Input, Select, Tabs, message, Icon } from 'choerodon-ui';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { withRouter } from 'react-router-dom';
import SettingColumn from '../ScrumBoardSettingComponent/SettingColumn/SettingColumn';
import './ScrumBoardSetting.scss';
import '../../../main.scss';
import ScrumBoardStore from '../../../../stores/project/scrumBoard/ScrumBoardStore';
import AddStatus from '../ScrumBoardSettingComponent/AddStatus/AddStatus';
import AddColumn from '../ScrumBoardSettingComponent/AddColumn/AddColumn';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const { AppState } = stores;

@observer
class ScrumBoardSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinIf: false,
      addStatus: false,
      addColumn: false,
    };
  }
  componentWillMount() {
    this.refresh();
  }
  refresh() {
    this.setState({
      spinIf: true,
    });
    ScrumBoardStore.axiosGetBoardData(ScrumBoardStore.getSelectedBoard).then((data) => {
      ScrumBoardStore.axiosGetUnsetData(ScrumBoardStore.getSelectedBoard).then((data2) => {
        const unsetColumn = {
          columnId: 'unset',
          name: '未对应的状态',
          subStatuses: data2,
        };
        data.columnsData.columns.push(unsetColumn);
        ScrumBoardStore.setBoardData(data.columnsData.columns);
        this.setState({
          spinIf: false,
        });
      }).catch((error2) => {
        window.console.log(error2);
      });
    }).catch((error) => {
      window.console.log(error);
    });
    ScrumBoardStore.axiosGetLookupValue('constraint').then((res) => {
      const oldLookup = ScrumBoardStore.getLookupValue;
      oldLookup.constraint = res.lookupValues;
      ScrumBoardStore.setLookupValue(oldLookup);
    }).catch((error) => {
      window.console.log(error);
    });
  }
  handleDragEnd(result) {
    if (!result.destination) {
      return;
    }
    // 移动列
    if (result.destination.droppableId === 'columndrop') {
      this.setState({
        spinIf: true,
      });
      const originState2 = JSON.parse(JSON.stringify(ScrumBoardStore.getBoardData));
      const newState2 = JSON.parse(JSON.stringify(ScrumBoardStore.getBoardData));
      let draggableData2 = {};
      draggableData2 = newState2.splice(result.source.index, 1)[0];
      newState2.splice(result.destination.index, 0, draggableData2);
      ScrumBoardStore.setBoardData(newState2);
      const data = {
        boardId: ScrumBoardStore.getSelectedBoard,
        columnId: JSON.parse(result.draggableId).columnId,        
        projectId: parseInt(AppState.currentMenuType.id, 10),
        sequence: result.destination.index,
        objectVersionNumber: JSON.parse(result.draggableId).objectVersionNumber,
      };
      ScrumBoardStore.axiosUpdateColumnSequence(
        ScrumBoardStore.getSelectedBoard, data).then((res) => {
        this.refresh();
      }).catch((error) => {
        ScrumBoardStore.setBoardData(originState2);
        window.console.log(error);
      });
    } else {
      // 移动状态
      this.setState({
        spinIf: true,
      });
      const originState = JSON.parse(JSON.stringify(ScrumBoardStore.getBoardData));
      const newState = JSON.parse(JSON.stringify(ScrumBoardStore.getBoardData));
      let draggableData = {};
      let columnIndex;
      _.forEach(newState, (item, index) => {
        if (String(item.columnId) === String(result.source.droppableId.split(',')[1])) {
          columnIndex = index;
          draggableData = newState[index].subStatuses.splice(result.source.index, 1)[0];
        }
      });
      if (result.destination.droppableId.split(',')[1] === 'unset') {
        const code = result.draggableId.split(',')[0];
        const columnId = result.source.droppableId.split(',')[1];
        const minNum = result.source.droppableId.split(',')[2];
        let totalNum = 0;
        if (ScrumBoardStore.getCurrentConstraint !== 'constraint_none') {
          _.forEach(newState[columnIndex].subStatuses, (sub) => {
            _.forEach(sub.issues, (iss) => {
              if (ScrumBoardStore.getCurrentConstraint === 'issue') {
                totalNum += 1;
              } else if (iss.typeCode !== 'sub_task') {
                totalNum += 1;
              }
            });
          });
          if (!isNaN(minNum)) {
            if (parseInt(totalNum, 10) < parseInt(minNum, 10)) {
              message.info('剩余状态issue数小于列的最小issue数，无法移动状态');
              return;
            }
          }
        }
        ScrumBoardStore.setBoardData(newState);
        ScrumBoardStore.moveStatusToUnset(code, {
          columnId,
        }).then((data) => {
          const newData = data;
          newData.issues = draggableData.issues;
          _.forEach(newState, (item, index) => {
            if (String(item.columnId) === String(result.destination.droppableId.split(',')[1])) {
              newState[index].subStatuses.splice(result.destination.index, 0, newData);
            }
          });
          ScrumBoardStore.setBoardData(newState);
          this.refresh();
        }).catch((error) => {
          ScrumBoardStore.setBoardData(originState);
          this.setState({
            spinIf: false,
          });
        });
      } else {
        const code = result.draggableId.split(',')[0];
        const categorycode = result.destination.droppableId.split(',')[0];
        const columnId = result.destination.droppableId.split(',')[1];
        const position = result.destination.index;
        const statusObjectVersionNumber = result.draggableId.split(',')[1];
        const originColumnId = result.source.droppableId.split(',')[1] === 'unset' ? 0 : result.source.droppableId.split(',')[1];
        const minNum = result.source.droppableId.split(',')[2];
        const maxNum = result.destination.droppableId.split(',')[3];
        let totalNum = 0;
        if (ScrumBoardStore.getCurrentConstraint !== 'constraint_none') {
          _.forEach(newState[columnIndex].subStatuses, (sub) => {
            _.forEach(sub.issues, (iss) => {
              if (ScrumBoardStore.getCurrentConstraint === 'issue') {
                totalNum += 1;
              } else if (iss.typeCode !== 'sub_task') {
                totalNum += 1;
              }
            });
          });
          if (!isNaN(minNum)) {
            if (parseInt(totalNum, 10) < parseInt(minNum, 10)) {
              message.info('剩余状态issue数小于列的最小issue数，无法移动状态');
              return;
            }
          }
          let destinationTotal = 0;
          _.forEach(newState, (newS) => {
            if (parseInt(newS.columnId, 10) === parseInt(columnId, 10)) {
              _.forEach(newS.subStatuses, (sub2) => {
                _.forEach(sub2.issues, (iss) => {
                  if (ScrumBoardStore.getCurrentConstraint === 'issue') {
                    destinationTotal += 1;
                  } else if (iss.typeCode !== 'sub_task') {
                    destinationTotal += 1;
                  }
                });
              });
            }
          });
          let draggableTotal = 0;
          _.forEach(draggableData.issues, (di) => {
            if (ScrumBoardStore.getCurrentConstraint === 'issue') {
              draggableTotal += 1;
            } else if (di.typeCode !== 'sub_task') {
              draggableTotal += 1;
            }
          });
          if ((destinationTotal + draggableTotal) > parseInt(maxNum, 10)) {
            message.info('移动至目标列后的issue数大于目标列的最大issue数，无法移动状态');
            return;
          }
        }
        ScrumBoardStore.setBoardData(newState);
        ScrumBoardStore.moveStatusToColumn(code, {
          // categorycode,
          columnId,
          position,
          statusObjectVersionNumber,
          originColumnId,
        }).then((data) => {
          const newData = data;
          newData.issues = draggableData.issues;
          _.forEach(newState, (item, index) => {
            if (String(item.columnId) === String(result.destination.droppableId.split(',')[1])) {
              newState[index].subStatuses.splice(result.destination.index, 0, newData);
            }
          });
          ScrumBoardStore.setBoardData(newState);
          this.refresh();
        }).catch((error) => {
          ScrumBoardStore.setBoardData(originState);
          this.setState({
            spinIf: false,
          });
        });
      }
    }
  }
  handleAddStatus() {
    this.setState({
      addStatus: true,
    });
    if (JSON.stringify(ScrumBoardStore.getStatusCategory) === '{}') {
      ScrumBoardStore.axiosGetStatusCategory().then((data) => {
        ScrumBoardStore.setStatusCategory(data);
      }).catch((error) => {
        window.console.log(error);
      });
    }
  }
  handleAddColumn() {
    this.setState({
      addColumn: true,
    });
    if (JSON.stringify(ScrumBoardStore.getStatusCategory) === '{}') {
      ScrumBoardStore.axiosGetStatusCategory().then((data) => {
        ScrumBoardStore.setStatusCategory(data);
      }).catch((error) => {
        window.console.log(error);
      });
    }
  }
  handleDeleteBoard() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    let name;
    _.forEach(ScrumBoardStore.getBoardList, (item) => {
      if (item.boardId === ScrumBoardStore.getSelectedBoard) {
        name = item.name;
      }
    });
    confirm({
      title: `删除看板${name}`,
      content: '确定要删除该看板吗?',
      onOk() {
        ScrumBoardStore.axiosDeleteBoard().then((res) => {
          history.push(`/agile/scrumboard?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
        }).catch((error) => {
          window.console.log(error);
        });
      },
      onCancel() {
        window.console.log('Cancel');
      },
    });
  }
  renderColumn(data) {
    const result = [];
    _.forEach(data, (item, index) => {
      result.push(
        <SettingColumn
          data={item}
          refresh={this.refresh.bind(this)}
          index={index}
          styleValue={`${parseFloat(parseFloat(1 / data.length) * 100)}%`}
        />,
      );
    });   
    return result;
  }
  renderUnsetColumn() {
    const BoardData = ScrumBoardStore.getBoardData;
    if (BoardData.length > 0) {
      if (BoardData[BoardData.length - 1].columnId === 'unset') {
        return (
          <SettingColumn
            data={BoardData[BoardData.length - 1]}
            refresh={this.refresh.bind(this)}
            index={BoardData.length - 1}
            disabled
          />
        );
      }
    }
    return '';
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const urlParams = AppState.currentMenuType;
    const contentDes = (
      <div>
        分栏可以添加、删除、重新排序和重命名。列是基于全局状态和可移动的列与列之间。最小和最大限制可设置为每个已映射的列中。
        <span>了解详情</span>
      </div>
    );
    const BoardData = JSON.parse(JSON.stringify(ScrumBoardStore.getBoardData));
    if (BoardData.length > 0) {
      if (BoardData[BoardData.length - 1].columnId === 'unset') {
        BoardData.splice(BoardData.length - 1, 1);
      }
    }
    return (
      <Page>
        <Header title="配置看板" backPath={`/agile/scrumboard?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>
          <Button funcTyp="flat" onClick={this.handleDeleteBoard.bind(this)} disabled={ScrumBoardStore.getBoardList.length === 1}>
            <Icon type="delete_forever icon" />
            <span>删除看板</span>
          </Button>
          <Button funcTyp="flat" onClick={this.refresh.bind(this)}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content style={{ height: '100%', paddingTop: 0 }}>
          <Tabs style={{ display: 'flex', flexDirection: 'column' }} defaultActiveKey="1">
            <TabPane tab="列配置" key="1">
              <Content 
                // title={`项目“${AppState.currentMenuType.name}”的应用部署`}
                description={contentDes}
                style={{
                  padding: 0,
                  overflow: 'unset',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Select
                    value={ScrumBoardStore.getCurrentConstraint}
                    label="列约束" 
                    style={{ width: 512 }}
                    onChange={(value) => {
                      let objectVersionNumber;
                      const oldData = ScrumBoardStore.getBoardList;
                      _.forEach(oldData, (item) => {
                        if (item.boardId === ScrumBoardStore.getSelectedBoard) {
                          objectVersionNumber = item.objectVersionNumber;
                        }
                      });
                      ScrumBoardStore.axiosUpdateBoard({
                        boardId: ScrumBoardStore.getSelectedBoard,
                        columnConstraint: value,
                        projectId: AppState.currentMenuType.id,
                        objectVersionNumber,
                      }).then((res) => {
                        _.forEach(oldData, (item, index) => {
                          if (item.boardId === ScrumBoardStore.getSelectedBoard) {
                            oldData.objectVersionNumber = res.objectVersionNumber;
                            oldData.columnConstraint = res.columnConstraint;
                          }
                        });
                        ScrumBoardStore.setBoardList(oldData);
                        ScrumBoardStore.setCurrentConstraint(value);
                      }).catch((error) => {
                        window.console.log(error);
                      });
                    }}
                  >
                    {
                      ScrumBoardStore.getLookupValue.constraint ? (
                        ScrumBoardStore.getLookupValue.constraint.map(item => (
                          <Option value={item.valueCode}>{item.name}</Option>
                        ))
                      ) : ''
                    }
                  </Select>
                  <div>
                    <Button 
                      funcTyp="flat"
                      type="primary"
                      onClick={this.handleAddStatus.bind(this)}
                    >
                      <Icon type="playlist_add" />
                      <span>添加状态</span>
                    </Button>
                    <Button 
                      funcTyp="flat"
                      type="primary"
                      onClick={this.handleAddColumn.bind(this)}
                    >
                      <Icon type="playlist_add" />
                      <span>添加列</span>
                    </Button>
                  </div>
                </div>
                <div
                  className="c7n-scrumsetting"
                  style={{
                    // height: 'calc(100vh - 247px)',
                    marginTop: 32,
                    flexGrow: 1,
                    height: '100%',
                  }}
                >
                  <DragDropContext
                    onDragEnd={
                      this.handleDragEnd.bind(this)
                    }
                  >
                    <Droppable droppableId="columndrop" direction="horizontal" type="columndrop">
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          style={{
                            display: 'flex',
                            flex: BoardData.length,
                          }}
                          {...provided.droppableProps}
                        >
                          {this.renderColumn(BoardData)}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    {this.renderUnsetColumn()}
                  </DragDropContext>
                </div>
              </Content>
            </TabPane>
          </Tabs>
        </Content>
          
        <AddStatus
          visible={this.state.addStatus}
          onChangeVisible={(data) => {
            this.setState({
              addStatus: data,
            });
          }}
          refresh={this.refresh.bind(this)}
        />
        <AddColumn
          visible={this.state.addColumn}
          onChangeVisible={(data) => {
            this.setState({
              addColumn: data,
            });
          }}
          refresh={this.refresh.bind(this)}
        />
      </Page>
    );
  }
}

export default Form.create()(withRouter(ScrumBoardSetting));

