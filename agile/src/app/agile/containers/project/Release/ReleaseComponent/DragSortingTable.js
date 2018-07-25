import { Table } from 'choerodon-ui';
import React, { Component } from 'react';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import isEqual from 'lodash/isEqual';
// import './test.scss';

const dragDirection = (
  dragIndex,
  hoverIndex,
  initialClientOffset,
  clientOffset,
  sourceClientOffset,
) => {
  const hoverMiddleY = (initialClientOffset.y - sourceClientOffset.y) / 2;
  const hoverClientY = clientOffset.y - sourceClientOffset.y;
  let type = '';
  if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
    type = 'downward';
  }
  if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
    type = 'upward';
  }
  return type;
};


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

  let className = restProps.className;
  if (isOver && initialClientOffset) {
    const direction = dragDirection(
      dragRow.index,
      restProps.index,
      initialClientOffset,
      clientOffset,
      sourceClientOffset,
    );
    if (direction === 'downward') {
      className += ' drop-over-downward';
    }
    if (direction === 'upward') {
      className += ' drop-over-upward';
    }
  }

  return connectDragSource(
    connectDropTarget(
      <tr
        {...restProps}
        className={className}
        style={style}
      />,
    ),
  );
};

const rowSource = {
  beginDrag(props) {
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};

BodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  sourceClientOffset: monitor.getSourceClientOffset(),
}))(
  DragSource('row', rowSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragRow: monitor.getItem(),
    clientOffset: monitor.getClientOffset(),
    initialClientOffset: monitor.getInitialClientOffset(),
  }))(BodyRow),
);

@DragDropContext(HTML5Backend)
class DragSortingTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.dataSource,
      sourceData: props.dataSource,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.sourceData, this.props.dataSource)) {
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
    window.console.log(dragIndex, hoverIndex);
    this.setState(
      update(this.state, {
        data: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
    );
  };
  render() {
    return (
      <Table
        columns={this.props.columns}
        dataSource={this.state.data}
        pagination={this.props.pagination}
        onChange={this.props.onChange}
        components={this.components}
        onRow={(record, index) => ({
          index,
          moveRow: this.moveRow,
        })}
        rowKey={record => record.versionId}
      />
    );
  }
}

export default DragSortingTable;
