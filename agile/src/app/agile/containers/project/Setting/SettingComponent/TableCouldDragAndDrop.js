import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Button, Icon, Dropdown, Menu } from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import _ from 'lodash';

const { AppState } = stores;

class TableCanDragAndDrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      expand: [],
    };
  }
  
  componentWillMount() {
    this.setData();
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

  setData() {
    const data = [
      {
        id: 1,
        version: '1.0',
        circle: '敏捷发布测试',
        file: null,
        status: 'undo',
        bug: [],
        userId: 1,
        userName: 'admin管理员',
        imgUrl: '',
        time: '2018-07-11 18:20:00',
      },
    ];
    this.setState({ data }, () => {
      this.setState({ data });
    });
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
                  <span style={{ width: 73, display: 'inline-block', lineHeight: '34px', paddingLeft: 20 }}>
                    {item.version}
                  </span>
                  <span style={{ width: 114, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.circle}
                  </span>
                  <span style={{ width: 82, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.file || ''}
                  </span>
                  <span style={{ width: 91, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.status}
                  </span>
                  <span style={{ width: 54, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.bug.length ? item.bug.join(',') : '-'}
                  </span>
                  <span style={{ width: 135, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.userName}
                  </span>
                  <span style={{ width: 122, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.time}
                  </span>
                  <span style={{ display: 'inline-block', lineHeight: '34px' }}>
                    <Button icon="more_vert" shape="circle" />
                    <Button icon="more_vert" shape="circle" />
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
        <div style={{ width: 740 }}>
          <div style={{ width: '100%', height: 30, background: 'rgba(0, 0, 0, 0.04)', borderTop: '2px solid rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
            <span style={{ width: 73, display: 'inline-block', lineHeight: '30px', paddingLeft: 20 }}>
              版本
            </span>
            <span style={{ width: 114, display: 'inline-block', lineHeight: '30px' }}>
              测试循环
            </span>
            <span style={{ width: 82, display: 'inline-block', lineHeight: '30px' }}>
              文件夹
            </span>
            <span style={{ width: 91, display: 'inline-block', lineHeight: '30px' }}>
              状态
            </span>
            <span style={{ width: 54, display: 'inline-block', lineHeight: '30px' }}>
              缺陷
            </span>
            <span style={{ width: 135, display: 'inline-block', lineHeight: '30px' }}>
              执行方
            </span>
            <span style={{ width: 122, display: 'inline-block', lineHeight: '30px' }}>
              执行时间
            </span>
            <span />
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
