import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Button, Icon, Dropdown, Menu, Modal } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import EditTest from '../EditTest';

const { AppState } = stores;
const confirm = Modal.confirm;

class TableCanDragAndDrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      expand: [],
      issueId: undefined,
      editTestStepShow: false,
      currentTestStepId: undefined,
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && nextProps.data) {
      this.setState({ data: nextProps.data });
    }
  }

  onDragEnd(result) {
    window.console.log(result);
    const arr = this.state.data.slice();
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    if (fromIndex === toIndex) {
      return;
    }
    const drag = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, drag);
    this.setState({ data: arr });
    const testCaseStepDTO = {
      ...drag,
      lastRank: arr[toIndex].rank,
    };
    const projectId = AppState.currentMenuType.id;
    axios.put(`/test/v1/projects/${projectId}/case/step/change`, testCaseStepDTO)
      .then((res) => {
        // save success
      });
  }

  getMenu = () => (
    <Menu onClick={this.handleClickMenu.bind(this)}>
      <Menu.Item key="edit">
        编辑
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
      this.setState({
        editTestStepShow: true,
      });
    } else if (e.key === 'delete') {
      this.handleDeleteTestStep();
    } else if (e.key === 'add') {
      this.setState({
        editTestStepShow: true,
      });
    }
  }

  handleDeleteTestStep() {
    const testStepId = this.state.currentTestStepId;
    const that = this;
    confirm({
      width: 560,
      title: '删除测试步骤',
      content: <div style={{ marginBottom: 32 }}>
        <p style={{ marginBottom: 10 }}>请确认您要删除这个测试步骤。</p>
        <p style={{ marginBottom: 10 }}>这个测试步骤将会被彻底删除。包括所有附件。</p>
      </div>,
      onOk() {
        return axios.delete('/test/v1/projects/{project_id}/case/step', { data: { stepId: testStepId } })
          .then((res) => {
            that.props.onOk();
          });
      },
      onCancel() {},
      okText: '删除',
      okType: 'danger',
    });
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
        <Draggable key={item.stepId} draggableId={item.stepId} index={index}>
          {(provided1, snapshot1) => 
            (
              <div
                ref={provided1.innerRef}
                {...provided1.draggableProps}
                {...provided1.dragHandleProps}
              >
                <div className={`${item.id}-list`} style={{ width: '100%', display: 'flex', height: 34, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  <span style={{ width: 50, display: 'inline-block', lineHeight: '34px', paddingLeft: 20 }}>
                    {item.stepId}
                  </span>
                  <span style={{ width: 115, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.testStep}
                  </span>
                  <span style={{ width: 115, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.testData}
                  </span>
                  <span style={{ width: 115, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.expectedResult}
                  </span>
                  <span style={{ width: 250, display: 'inline-block', overflow: 'hidden', position: 'relative' }} role="none" onClick={this.handleChangeExpand.bind(this, item.id)}>
                    <div className={`${item.id}-attachment`} style={{ }}>
                      {
                        item.attachments.map(attachment => (
                          <span style={{ padding: '3px 12px', display: 'inline-block', maxWidth: 192, marginTop: 4, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRadius: '100px', background: 'rgba(0, 0, 0, 0.08)', marginRight: 6 }}>
                            {attachment.name}
                          </span>
                        ))
                      }
                    </div>
                    {
                      item.attachments && item.attachments.length && document.getElementsByClassName(`${item.id}-attachment`)[0] && parseInt(window.getComputedStyle(document.getElementsByClassName(`${item.id}-attachment`)[0]).height, 10) > 34
                        ? <span style={{ position: 'absolute', top: 10, right: 0 }} className={_.indexOf(this.state.expand, item.id) !== -1 ? 'icon icon-keyboard_arrow_up' : 'icon icon-keyboard_arrow_down'} /> : null
                    }
                  </span>
                  <span style={{ display: 'inline-block', lineHeight: '34px' }}>
                    <Dropdown overlay={this.getMenu()} trigger={['click']} onClick={() => this.setState({ currentTestStepId: item.stepId })}>
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
        <div style={{ width: 680 }}>
          <div style={{ width: '100%', height: 30, background: 'rgba(0, 0, 0, 0.04)', borderTop: '2px solid rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
            <span style={{ width: 50, display: 'inline-block', lineHeight: '30px' }} />
            <span style={{ width: 115, display: 'inline-block', lineHeight: '30px' }}>
              测试步骤
            </span>
            <span style={{ width: 115, display: 'inline-block', lineHeight: '30px' }}>测试数据</span>
            <span style={{ width: 115, display: 'inline-block', lineHeight: '30px' }}>预期结果</span>
            <span style={{ width: 250, display: 'inline-block', lineHeight: '30px' }}>分步附件</span>
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
        {
          this.state.editTestStepShow ? (
            <EditTest
              issueId={this.props.issueId}
              stepId={this.state.currentTestStepId}
              visible={this.state.editTestStepShow}
              onCancel={() => this.setState({ editTestStepShow: false })}
              onOk={() => {
                this.setState({ editTestStepShow: false });
                this.props.onOk();
              }}
            />
          ) : null
        }
      </DragDropContext>
    );
  }
}

export default TableCanDragAndDrop;
