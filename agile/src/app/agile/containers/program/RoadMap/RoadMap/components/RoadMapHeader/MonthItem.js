import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './MonthItem.scss';

class MonthItem extends Component {
  render() {
    const { startDate, endDate } = this.props;
    const days = endDate.diff(startDate, 'days');
    const isInner = moment(startDate).isSame(startDate.startOf('month'));    
    return (
      <div style={{ flex: days }} className="c7nagile-MonthItem">
        {isInner && <div className="c7nagile-MonthItem-content">{startDate.format('YYYY-MM-DD')}</div>}
        {isInner && <div className="c7nagile-MonthItem-head" />}
        <div className="c7nagile-MonthItem-tail" />        
      </div>
    );
  }
}

MonthItem.propTypes = {

};

export default MonthItem;
