import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { CardHeight, CardWidth, CardMargin } from '../Constants';
import BoardStore from '../../../../../../stores/program/Board/BoardStore';
import './IssueCard.scss';


@observer
class IssueCard extends Component {
  render() {
    const { issue } = this.props;
    return (
      <div style={{ height: CardHeight + CardMargin * 2, width: CardWidth + CardMargin * 2, padding: CardMargin }} className="c7nagile-IssueCard">
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
