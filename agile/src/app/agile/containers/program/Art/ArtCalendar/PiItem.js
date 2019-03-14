import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { Popover, Progress } from 'choerodon-ui';
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
    sprintBorder: '#A2C1F6',
  },
  done: {
    borderColor: '#00BFA5',
    backgroundColor: '#E5F9F6',
    sprintBorder: '#98D8CF',
  },
};
const SprintItem = ({
  borderColor, sprint,
}) => (
  <div className="PiItem-pi-sprint" style={{ borderColor }}>
    <Popover
      content={<CardBody />}
      title={
        <CardTitle name={sprint.name} status="进行中" fromDate="2018-12-03" endDate="2018-12-03" />
      }
      placement="bottomLeft"
    >
      <div>
        {sprint.name}
      </div>
    </Popover>
  </div>
);
const CardTitle = ({
  name,
  status,
  fromDate,
  endDate,
}) => (
  <div>
    <div style={{ display: 'flex' }}>
      <div>{name}</div>
      <div>{status}</div>
    </div>
    {fromDate}    
    <span>~</span>   
    {endDate}
  </div>
);
const CardBody = () => (
  <div>
    <Progress percent={50} strokeColor="#4D90FE" />
  </div>
);
class PiItem extends Component {
  render() {
    const { pi } = this.props;
    const { startDate, endDate, name } = pi;
    const flex = moment.range(startDate, endDate).diff('days');
    const title = 'PI-001';
    const sprints = [{
      name: 'S-1',
    }];
    const style = STATUS.done;
    return (
      <div
        className="PiItem"
        style={{
          flex,
        }}
      >
        <div className="PiItem-pi">
          <div className="PiItem-pi-title" style={{ borderColor: style.borderColor, background: style.backgroundColor }}>
            {name}
          </div>
          <div className="PiItem-pi-sprints">
            {sprints.map(sprint => (
              <SprintItem borderColor={style.sprintBorder} sprint={sprint} />
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
