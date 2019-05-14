import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sumBy } from 'lodash';
import { observer } from 'mobx-react';
import Connector from './Connector';
import {
  CardHeight, CardWidth, CardMargin, ColumnMinHeight, ColumnWidth, basePosX, basePosY,
} from '../Constants';
import './Connectors.scss';


const sprints = [
  {
    width: 2,
  }, {
    width: 1,
  }, {
    width: 1,
  }];
const projects = [{
  height: 1,
}, {
  height: 1,
}];
@observer
class Connectors extends Component {
  getLeapWidth = ({
    sprintIndex,
    columnIndex,
    issueIndex,
  }) => {
    const preSprintsWidth = sumBy(sprints.slice(0, sprintIndex), 'width');
    console.log(preSprintsWidth);
    return preSprintsWidth * ColumnWidth + columnIndex * ColumnWidth + sprintIndex * 3;
  }

  getLeapHeight = ({
    projectIndex,
    sprintIndex,
    columnIndex,
    issueIndex,
  }) => {
    console.log(preProjectsHeight);
    const preProjectsHeight = sumBy(projects.slice(0, projectIndex), 'height');
    return preProjectsHeight * ColumnMinHeight + issueIndex * ColumnMinHeight;
  }

  calulatePoint = (connection) => {
    const {
      from: {
        projectIndex: fromProjectIndex,
        sprintIndex: fromSprintIndex,
        columnIndex: fromColumnIndex,
        issueIndex: fromIssueIndex,
      },
      to: {
        projectIndex: toProjectIndex,
        sprintIndex: toSprintIndex,
        columnIndex: toColumnIndex,
        issueIndex: toIssueIndex,
      },
    } = connection;
    const isToLeft = toSprintIndex < fromSprintIndex;
    return {
      from: isToLeft ? this.getRightPoint(connection.from) : this.getLeftPoint(connection.from),
      to: isToLeft ? this.getLeftPoint(connection.to) : this.getRightPoint(connection.to),
    };
  }

  getLeftPoint = left => ({
    x: basePosX + this.getLeapWidth(left) + ColumnWidth - CardMargin,
    y: basePosY + this.getLeapHeight(left) + CardHeight / 2,
  })

  getRightPoint = right => ({
    x: basePosX + this.getLeapWidth(right) + 2 + CardMargin,
    y: basePosY + this.getLeapHeight(right) + CardHeight / 2,
  })

  render() {
    const { connections } = this.props;
    return (
      <svg
        className="c7nagile-Connectors"
        xmlns="http://www.w3.org/2000/svg"
        // viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* <path     
        className="line"            
        onClick={this.handleClick}
        d="
        M120, 40
        L200, 120"
        // markerStart="url(#arrowhead)" 
        // markerMid="url(#arrowhead)" 
        markerEnd="url(#arrowhead)"
      /> */}
        <g fill="none" stroke="#BEC4E5" strokeWidth="1.5">
          {
            connections.map((connection) => {
              const { from, to, isToLeft } = this.calulatePoint(connection);
              return <Connector from={from} to={to} />;
            })
          }
          {/* <Connector
            from={{
              x: 120,
              y: 40,
            }}
            to={{
              x: 196,
              y: 120,
            }}
          /> */}
        </g>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path fill="#3f51b5" d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
          <marker
            id="StartMarker"
            viewBox="0 0 12 12"
            refX="5"
            refY="6"
            markerWidth="8"
            markerHeight="8"             
            fill="white"
            stroke="#BEC4E5"
            orient="auto"
          >
            <circle cx="6" cy="6" r="3" />
          </marker>
        </defs>

      </svg>
    );
  }
}

Connectors.propTypes = {

};

export default Connectors;
