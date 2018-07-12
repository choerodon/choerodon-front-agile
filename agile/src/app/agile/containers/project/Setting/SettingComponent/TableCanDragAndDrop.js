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
        step: '问题创建',
        data: 'zephyr测试工具安装',
        result: '成功安装',
        attachment: [
          {
            id: 1, 
            name: '测试测试测试测试测试测试测试测试测试测试测试测试测试.txt',
          },
          {
            id: 2,
            name: '安装文件.txt',
          },
          {
            id: 3,
            name: '安装文件.txt',
          },
          {
            id: 4,
            name: '安装文件.txt',
          },
          {
            id: 5,
            name: '安装文件.txt',
          },
        ],
      },
      {
        id: 2,
        step: '问题创建问题创建问题创建问题创建',
        data: 'zephyr测试工具安装zephyr测试工具安装zephyr测试工具安装zephyr测试工具安装',
        result: '成功安装成功安装成功安装成功安装成功安装成功安装成功安装',
        attachment: [
          {
            id: 2,
            name: '安装文件.txt',
          },
        ],
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
                  <span style={{ width: 56, display: 'inline-block', lineHeight: '34px', paddingLeft: 20 }}>
                    {item.id}
                  </span>
                  <span style={{ width: 146, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.step}
                  </span>
                  <span style={{ width: 184, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.data}
                  </span>
                  <span style={{ width: 99, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.result}
                  </span>
                  <span style={{ width: 216, display: 'inline-block', overflow: 'hidden', position: 'relative' }} role="none" onClick={this.handleChangeExpand.bind(this, item.id)}>
                    <div className={`${item.id}-attachment`} style={{ }}>
                      {
                        item.attachment.map(attachment => (
                          <span style={{ padding: '3px 12px', display: 'inline-block', maxWidth: 192, marginTop: 4, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRadius: '100px', background: 'rgba(0, 0, 0, 0.08)', marginRight: 6 }}>
                            {attachment.name}
                          </span>
                        ))
                      }
                    </div>
                    {
                      window.console.log(item.attachment && item.attachment.length && document.getElementsByClassName(`${item.id}-attachment`)[0] && parseInt(window.getComputedStyle(document.getElementsByClassName(`${item.id}-attachment`)[0]).height, 10) > 34)
                    }
                    {
                      item.attachment && item.attachment.length && document.getElementsByClassName(`${item.id}-attachment`)[0] && parseInt(window.getComputedStyle(document.getElementsByClassName(`${item.id}-attachment`)[0]).height, 10) > 34
                        ? <span style={{ position: 'absolute', top: 10, right: 0 }} className={_.indexOf(this.state.expand, item.id) !== -1 ? 'icon icon-keyboard_arrow_up' : 'icon icon-keyboard_arrow_down'} /> : null
                    }
                  </span>
                  <span style={{ display: 'inline-block', lineHeight: '34px' }}>
                    <Dropdown overlay={this.getMenu()} trigger={['click']}>
                      <Button icon="more_vert" shape="circle" />
                    </Dropdown>
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
            <span style={{ width: 56, display: 'inline-block', lineHeight: '30px' }} />
            <span style={{ width: 146, display: 'inline-block', lineHeight: '30px' }}>
              测试步骤
            </span>
            <span style={{ width: 184, display: 'inline-block', lineHeight: '30px' }}>测试数据</span>
            <span style={{ width: 99, display: 'inline-block', lineHeight: '30px' }}>预期结果</span>
            <span style={{ width: 216, display: 'inline-block', lineHeight: '30px' }}>分布附件</span>
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
