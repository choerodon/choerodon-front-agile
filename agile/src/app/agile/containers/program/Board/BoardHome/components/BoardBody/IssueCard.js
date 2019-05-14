import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CardHeight, CardWidth, CardMargin } from '../Constants';
import BoardStore from '../../../../../../stores/program/Board/BoardStore';
import './IssueCard.scss';

class IssueCard extends Component {
  saveRef=(element) => {
    const { sprintId, projectId, issue } = this.props;
    BoardStore.setIssueRef(sprintId, projectId, issue.issueId, element);
  }

  render() {
    const { issue } = this.props;
    return (
      <div style={{ height: CardHeight + CardMargin * 2, width: CardWidth + CardMargin * 2, padding: CardMargin }} className="c7nagile-IssueCard" ref={this.saveRef}>
        <div className="c7nagile-IssueCard-inner">
          {issue.summary}
        </div>        
      </div>
    );
  }
}

IssueCard.propTypes = {

};

export default IssueCard;
