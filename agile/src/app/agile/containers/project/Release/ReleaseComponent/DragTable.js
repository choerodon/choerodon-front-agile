import React, { Component } from 'react';
import { Button, Table, Menu, Dropdown, Icon, Modal, Radio, Select, Spin } from 'choerodon-ui';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Permission } from 'choerodon-front-boot';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import isEqual from 'lodash/isEqual';
import './DrapSortingTable.scss';

const getMenu = record => (
  <Menu onClick={this.handleClickMenu.bind(this, record)}>
    {
      record.statusCode === 'archived' ? '' : (
        <Permission service={record.statusCode === 'version_planning' ? ['agile-service.product-version.releaseVersion'] : ['agile-service.product-version.revokeReleaseVersion']}>
          <Menu.Item key="0">
            {record.statusCode === 'version_planning' ? '发布' : '撤销发布'}
          </Menu.Item>
        </Permission>
      )
    }
    <Permission service={record.statusCode === 'archived' ? ['agile-service.product-version.revokeArchivedVersion'] : ['agile-service.product-version.archivedVersion']}>
      <Menu.Item key="3">
        {record.statusCode === 'archived' ? '撤销归档' : '归档'}
      </Menu.Item>
    </Permission>
    {
      record.statusCode === 'archived' ? '' : (
        <Permission service={['agile-service.product-version.deleteVersion']}>
          <Menu.Item key="4">
            删除
          </Menu.Item>
        </Permission>
      )
    }
    <Permission service={['agile-service.product-version.updateVersion']}>
      <Menu.Item key="5">
        编辑
      </Menu.Item>
    </Permission>
  </Menu>
);
let BodyRow = (props) => {
  const {
    isOver,
    connectDragSource,
    connectDropTarget,
    moveRow,
    dragRow,
    clientOffset,
    sourceClientOffset,
    initialClientOffset,
    ...restProps
  } = props;
  const style = { ...restProps.style, cursor: 'move' };

  const className = restProps.className;
  return (<Droppable droppableId="droppable">
    {(provided, snapshot) => (
      <React.Fragment ref={provided.innerRef}>
        {this.state.data.map((item, index) => (
          <Draggable draggableId={index} index={index}>
            {(provided, snapshot) => (
              <tr
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <td>{item.name}</td>
                <td>{item.status}</td>
                <td>{item.startDate}</td>
                <td>{item.releaseDate}</td>
                <td>{item.description}</td>
                <td>
                  <Dropdown overlay={getMenu(item)} trigger={['click']}>
                  <Button shape="circle" icon="more_vert" />
                </Dropdown></td>
              </tr>
            )}
          </Draggable>

        ))}
      </React.Fragment>
    )}
  </Droppable>);
};
class DragTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.dataSource,
      sourceData: props.dataSource,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.data, this.props.dataSource)) {
      this.setState({ data: this.props.dataSource, sourceData: this.props.dataSource });
    }
  }
  components = {
    body: {
      row: BodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const data = this.state.data || this.props.dataSource;
    const dragRow = data[dragIndex];
    let beforeSequence = null;
    let afterSequence = null;
    // 拖的方向
    if (hoverIndex === 0) {
      afterSequence = data[hoverIndex].sequence;
    } else if (hoverIndex === data.length - 1) {
      beforeSequence = data[hoverIndex].sequence;
    } else if (dragIndex > hoverIndex) {
      afterSequence = data[hoverIndex].sequence;
      beforeSequence = data[hoverIndex - 1].sequence;
    } else if (dragIndex < hoverIndex) {
      afterSequence = data[hoverIndex + 1].sequence;
      beforeSequence = data[hoverIndex].sequence;
    }
    const versionId = data[dragIndex].versionId;
    const { objectVersionNumber } = data[dragIndex];
    const postData = { afterSequence, beforeSequence, versionId, objectVersionNumber };
    window.console.log(postData);
    this.setState(
      update(this.state, {
        data: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
    );
    this.props.handleDrag(postData);
  };
  onDragEnd = () => {
    window.console.log("drag");
  };
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Table
          rowClassName={'table-row'}
          columns={this.props.columns}
          dataSource={this.state.data}
          pagination={this.props.pagination}
          onChange={this.props.onChange}
          components={this.components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
            onMouseEnter: (e) => {
              e.target.parentElement.className = 'hover-row';
            },
          })}
          rowKey={record => record.versionId}
        />
      </DragDropContext>
    );
  }
}

export default DragTable;

