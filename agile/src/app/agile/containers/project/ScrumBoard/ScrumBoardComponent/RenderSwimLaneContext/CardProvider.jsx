import React from 'react';
import { observer } from 'mobx-react';
import { Draggable } from 'react-beautiful-dnd';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import Card from './Card';

@observer
export default class CardProvider extends React.Component {
  handleCardClick = (issue, index) => {
    const { keyId, id } = this.props;
    ScrumBoardStore.setClickedIssue(issue, keyId, id, index);
  };

  render() {
    const { keyId, id, issueProvider } = this.props;
    return ScrumBoardStore.getSwimLaneData[keyId][id].map(
      (issueObj, index) => issueObj && (
        <Draggable draggableId={`${keyId}/${issueObj.issueId}`} index={index} key={`${keyId}/${issueObj.issueId}`}>
          {(provided, snapshot) => (
            <div
              key={issueObj.issueId}
              className="c7n-swimlaneContext-itemBodyCard"
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <Card
                onClick={this.handleCardClick}
                clicked={issueObj.clicked}
                index={index}
                issue={issueObj}
                {...issueProvider}
              />
              {provided.placeholder}
            </div>
          )}
        </Draggable>
      ),
    );
  }
}
