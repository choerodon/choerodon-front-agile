import React from 'react';
import { observer } from 'mobx-react';
import BoardStore from '../../../../../../stores/Program/Board/BoardStore';
import Card from './Card';

@observer
export default class CardProvider extends React.Component {
  render() {
    const {
      keyId, id, completed, statusName, categoryCode, columnCategoryCode,
    } = this.props;
    return BoardStore.getSwimLaneData[keyId][id].map(
      (issueObj, index) => issueObj && (
        <Card
          key={issueObj.issueId}
          draggableId={`${keyId}/${issueObj.issueId}/${columnCategoryCode}`}
          index={index}
          issue={issueObj}
          completed={completed}
          statusName={statusName}
          categoryCode={categoryCode}
        />
      ),
    );
  }
}
