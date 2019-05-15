import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { DragSource, DropTarget } from 'react-dnd';
import BoardStore from '../../../../../../stores/program/Board/BoardStore';
// import './FeatureItem.scss';


@observer
class FeatureItem extends Component {
  render() {
    const {
      feature, connectDragSource, connectDropTarget, 
    } = this.props;
    // const opacity = isDragging ? 0 : 1;
    return (
      connectDragSource(
        connectDropTarget(          
          <div>
            {feature.summary}
          </div>, 
        ),
      )
    );
  }
}

FeatureItem.propTypes = {

};

export default DropTarget(
  'card',
  {
    canDrop: () => false,
  },
  connect => ({
    connectDropTarget: connect.dropTarget(),
  }),
)(
  DragSource(
    'card',
    {
      beginDrag: props => ({
        type: 'side',
        issue: props.feature,        
      }),
      endDrag(props, monitor) {
        const source = monitor.getItem();
        const didDrop = monitor.didDrop();
        console.log(source, monitor.getDropResult());
        const result = monitor.getDropResult();
        if (result) {
          const {
            dropType, teamProjectId, sprintId, index, 
          } = result;
          // if (dropType === 'outer') {
          BoardStore.fromSideToBoard({
            dropType,
            index,
            teamProjectId, 
            sprintId, 
            featureId: props.feature.issueId,
          });
          // }
        } else {
          
        }
        if (!didDrop) {
          // props.moveCard(source, { index: props.index });
        }
      },
    },
    (connect, monitor) => ({
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
    }),
  )(FeatureItem),
);
