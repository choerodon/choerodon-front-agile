import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { find } from 'lodash';
import Cell from './Cell';
import './BoardBody.scss';


const dataMap = new Map([[1, new Map([[2, new Map([[3, []]])]])]]);
@observer
class BoardBody extends Component {
  render() {
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
                const { sprints, projectName } = project;
                return (
                  <tr>
                    <td style={{ width: 140, minWidth: 140, textAlign: 'center' }}>
                      {projectName}
                    </td>
                    {sprints.map(sprint => (
                      <td>
                        <Cell project={project} data={sprint} />
                      </td>
                    ))}
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
}

BoardBody.propTypes = {

};

export default BoardBody;
