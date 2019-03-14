import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import './CalendarHeader.scss';

const moment = extendMoment(Moment);
class CalendarHeader extends Component {
  caculateYearFlex = (years) => {
    if (years.length === 0) {
      return 1;
    } else {
      return years.map((year, i) => {
        if (i === 0) {
          // console.log(year.format('YYYY-MM-DD'), year.endOf('year').format('YYYY-MM-DD'), moment.range(year, year.endOf('year')).diff('days'));
          return moment.range(moment(year), moment(year).endOf('year')).diff('days');
        } else if (i === years.length - 1) {
          return moment.range(moment(year).startOf('year'), moment(year)).diff('days');
        } else {
          return moment.range(moment(year).startOf('year'), moment(year).endOf('year')).diff('days');
        }
      });
    }

    // moment().dayOfYear(Number);
  }

  calculateLastWeek=(week) => {
    const { startDate, endDate } = this.props;
    return moment.range(moment(week).startOf('day'), endDate).diff('days');
  }

  render() {
    const { startDate, endDate } = this.props;
    const range = moment.range(startDate, endDate);
    const totalDays = range.diff('days');

    const years = Array.from(range.by('years')).map(year => year.format('YYYY-MM-DD'));
    const weeks = Array.from(range.by('weeks'));
    console.log(years, weeks);
    const YearFlexs = this.caculateYearFlex(years);
    console.log(YearFlexs);
    return (
      <div className="c7nagile-CalendarHeader">
        {
          <div className="c7nagile-CalendarHeader-years">
            {
              years.map((year, i) => (
                <div style={{ flex: YearFlexs[i] }} className="c7nagile-CalendarHeader-year">
                  {`${moment(year).format('YYYY')}`}
                </div>
              ))
            }
          </div>
        }
        <div className="c7nagile-CalendarHeader-weeks">
          {
            weeks.map((week, i) => (
              <div className="c7nagile-CalendarHeader-week" style={{ flex: i === weeks.length - 1 ? this.calculateLastWeek(week) : 7 }}>
                <div>
                  {`${week.week()}周`}
                </div>
                {`${week.format('MM月DD日')}~${week.add(i === weeks.length - 1 ? this.calculateLastWeek(week) - 1 : 6, 'days').format('MM月DD日')}`}
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}

CalendarHeader.propTypes = {

};

export default CalendarHeader;
