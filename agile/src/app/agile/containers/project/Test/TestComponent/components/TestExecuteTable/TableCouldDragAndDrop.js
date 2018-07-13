import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Button, Icon, Dropdown, Menu, Popconfirm } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import TimeAgo from 'timeago-react';

const { AppState } = stores;

class TableCanDragAndDrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      expand: [],
    };
  }
  
  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && nextProps.data) {
      this.setState({ data: nextProps.data });
    }
  }

  confirm(executeId, e) {
    this.handleDeleteCircle(executeId);
  }

  cancel(e) {
  }

  handleDeleteCircle(executeId) {
    axios.delete(`/test/v1/projects/${AppState.currentMenuType.id}/cycle/case?cycleCaseId=${executeId}`)
      .then((res) => {
        this.props.onOk();
      });
  }

  onDragEnd(result) {
    window.console.log(result);
    const arr = this.state.data.slice();
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    const drag = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, drag);
    this.setState({ data: arr });
  }

  getMenu = () => (
    <Menu onClick={this.handleClickMenu.bind(this)}>
      <Menu.Item key="edit">
        编辑
      </Menu.Item>
      <Menu.Item key="clone">
        克隆
      </Menu.Item>
      <Menu.Item key="delete">
        删除
      </Menu.Item>
      <Menu.Item key="add">
        添加附件
      </Menu.Item>
    </Menu>
  );

  handleClickMenu(e) {
    if (e.key === 'edit') {
      window.console.log('edit');
    } else if (e.key === 'clone') {
      window.console.log('clone');
    } else if (e.key === 'delete') {
      window.console.log('delete');
    } else if (e.key === 'add') {
      window.console.log('add');
    }
  }

  handleChangeExpand(id) {
    let expand = this.state.expand.slice();
    if (_.find(expand, v => v === id)) {
      expand = _.remove(expand, id);
      document.getElementsByClassName(`${id}-list`)[0].style.height = '34px';
    } else {
      expand.push(id);
      document.getElementsByClassName(`${id}-list`)[0].style.height = 'auto';
    }
    this.setState({ expand });
  }

  renderIssueOrIntro(issues) {
    if (issues) {
      if (issues.length >= 0) {
        return this.renderSprintIssue(issues);
      }
    }
    return '';
  }

  renderSprintIssue(data, sprintId) {
    const result = [];
    _.forEach(data, (item, index) => {
      result.push(
        <Draggable key={item.id} draggableId={item.id} index={index}>
          {(provided1, snapshot1) => 
            (
              <div
                ref={provided1.innerRef}
                {...provided1.draggableProps}
                {...provided1.dragHandleProps}
              >
                <div className={`${item.id}-list`} style={{ width: '100%', display: 'flex', height: 34, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  <span style={{ width: 50, display: 'inline-block', lineHeight: '34px', paddingLeft: 10 }}>
                    {item.version}
                  </span>
                  <span style={{ width: 90, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.circle}
                  </span>
                  <span style={{ width: 90, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.caseAttachment.length}
                  </span>
                  <span style={{ width: 90, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.executionStatusName}
                  </span>
                  <span style={{ width: 90, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.defects.length}
                  </span>
                  <span style={{ width: 90, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.assignedTo}
                  </span>
                  <span style={{ width: 90, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    <TimeAgo
                      datetime={item.lastUpdateDate}
                      locale={Choerodon.getMessage('zh_CN', 'en')}
                    />
                  </span>
                  <span style={{ width: 90, display: 'inline-block', lineHeight: '34px' }}>
                    <Button icon="explicit2" shape="circle" onClick={() => window.console.log('跳转')} />
                    <Popconfirm
                      title="确认要删除该测试执行吗?"
                      placement="left"
                      onConfirm={this.confirm.bind(this, item.executeId)}
                      onCancel={this.cancel}
                      okText="删除"
                      cancelText="取消"
                      okType="danger"
                    >
                      <Icon type="delete_forever mlr-3 pointer" />
                    </Popconfirm>
                  </span>
                </div>
              </div>
            )
          }
        </Draggable>,
      );
    });
    return result;
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
        <div style={{ width: 680 }}>
          <div style={{ width: '100%', height: 30, background: 'rgba(0, 0, 0, 0.04)', borderTop: '2px solid rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
            <span style={{ width: 50, display: 'inline-block', lineHeight: '30px', paddingLeft: 10 }}>
              版本
            </span>
            <span style={{ width: 90, display: 'inline-block', lineHeight: '30px' }}>
              测试循环
            </span>
            <span style={{ width: 90, display: 'inline-block', lineHeight: '30px' }}>
              文件夹
            </span>
            <span style={{ width: 90, display: 'inline-block', lineHeight: '30px' }}>
              状态
            </span>
            <span style={{ width: 90, display: 'inline-block', lineHeight: '30px' }}>
              缺陷
            </span>
            <span style={{ width: 90, display: 'inline-block', lineHeight: '30px' }}>
              执行方
            </span>
            <span style={{ width: 90, display: 'inline-block', lineHeight: '30px' }}>
              执行时间
            </span>
            <span style={{ width: 90, display: 'inline-block' }} />
          </div>
          <Droppable droppableId="dropTable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                  padding: 'grid',
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
                  marginBottom: 0,
                }}
              >
                {this.renderIssueOrIntro(this.state.data)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    );
  }
}

export default TableCanDragAndDrop;
