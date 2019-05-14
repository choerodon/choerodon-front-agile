import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { find } from 'lodash';
import BoardStore from '../../../../../../stores/program/Board/BoardStore';

import Cell from './Cell';
import './BoardBody.scss';


const dataMap = new Map([[1, new Map([[2, new Map([[3, []]])]])]]);
@observer
class BoardBody extends Component {
  render() {
    const { resizing } = BoardStore;
    const { sprints, projects } = this.props;
    return (
      <div className="c7nagile-BoardBody">
        <table>
          <thead>
            <tr>
              <th style={{ width: 140, minWidth: 140, textAlign: 'center' }}>
                PI-1
              </th>
              {
                sprints.map(sprint => <th>{sprint.name}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {
              projects.map((project) => {
                const { sprints: Sprints, projectName } = project;
                return (
                  <tr>
                    <td style={{ width: 140, minWidth: 140, textAlign: 'center' }}>
                      {projectName}
                    </td>
                    {Sprints.map((sprint, i) => (
                      <td>
                        <Cell project={project} data={sprint} sprintIndex={i} />
                      </td>
                    ))}
                  </tr>
                );
              })
            }
          </tbody>
        </table>
        {resizing && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9999,
            cursor: 'col-resize',
          }}
          />
        )}
      </div>
    );
  }
}

BoardBody.propTypes = {

};

export default BoardBody;
