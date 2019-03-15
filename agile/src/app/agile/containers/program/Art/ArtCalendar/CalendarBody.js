import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import PiItem from './PiItem';
import './CalendarBody.scss';

const moment = extendMoment(Moment);
class CalendarBody extends Component {
  render() {
    const { startDate, endDate, data } = this.props;
    const range = moment.range(startDate, endDate);
    const days = range.diff('days') - 1;
    const todayPos = moment.range(moment(startDate), moment()).diff('days');
    return (
      <div className="c7nagile-CalendarBody">
        <div className="c7nagile-CalendarBody-days">
          {
            Array(days).fill(0).map((a, i) => (
              <div className={i === todayPos ? 'c7nagile-CalendarBody-day today' : 'c7nagile-CalendarBody-day'} />
            ))
          }
        </div>
        <div className="c7nagile-CalendarBody-pis">
          {
            data.map(pi => <PiItem pi={pi} />)
          }
        </div>
      </div>
    );
  }
}

CalendarBody.propTypes = {

};

export default CalendarBody;
