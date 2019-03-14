import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import './PiItem.scss';

const moment = extendMoment(Moment);
const STATUS = {
  cancel: {
    borderColor: '#393E46',
    backgroundColor: '#EBEBEB',
    sprintBorder: '#C0C0C0',
  },
  todo: {
    borderColor: '#FFB100',
    backgroundColor: '#FFF8E7',
    sprintBorder: '#F9D88E',
  },
  doing: {
    borderColor: '#4D90FE',
    backgroundColor: '#E9F1FF',
    sprintBorder: '#F9D88E',
  },
  done: {
    borderColor: '#00BFA5',
    backgroundColor: '#E5F9F6',
    sprintBorder: '#9CB9EA',
  },
};
class PiItem extends Component {
  render() {
    const { pi } = this.props;
    const { startDate, endDate, name } = pi;
    const flex = moment.range(startDate, endDate).diff('days');
    const title = 'PI-001';
    const sprints = [{
      name: 'S-1',
    }];
    return (
      <div
        className="PiItem"
        style={{
          flex,
        }}
      >
        <div className="PiItem-pi">
          <div className="PiItem-pi-title">
            {name}
          </div>
          <div className="PiItem-pi-sprints">
            {sprints.map(sprint => (
              <div className="PiItem-pi-sprint">
                {sprint.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

PiItem.propTypes = {

};

export default PiItem;
