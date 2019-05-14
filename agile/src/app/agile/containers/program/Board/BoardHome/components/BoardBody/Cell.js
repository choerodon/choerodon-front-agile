import React, { Component } from 'react';
import PropTypes from 'prop-types';
import IssueCard from './IssueCard';
import { ColumnWidth } from '../Constants';
import './Cell.scss';

class Cell extends Component {
  render() {
    const { data, project } = this.props;
    const { issues, width, id } = data;
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
