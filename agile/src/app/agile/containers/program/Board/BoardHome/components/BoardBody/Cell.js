import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import BoardStore from '../../../../../../stores/program/Board/BoardStore';
import IssueCard from './IssueCard';
import { ColumnWidth } from '../Constants';
import './Cell.scss';


@observer
class Cell extends Component {
  render() {
    const { data, project, sprintIndex } = this.props;
    const { width } = BoardStore.sprints[sprintIndex];
    const { issues, id } = data;
    return (
      <div className="c7nagile-Cell" style={{ width: ColumnWidth * width }}>
        {issues.map(issue => <IssueCard issue={issue} sprintId={id} projectId={project.id} />)}
      </div>
    );
  }
}

Cell.propTypes = {

};

export default Cell;
