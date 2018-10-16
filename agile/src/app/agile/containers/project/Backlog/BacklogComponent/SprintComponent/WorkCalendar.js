import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Calendar from 'rc-calendar';
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/zh-cn';
import classNames from 'classnames';
import zh_CN from 'rc-calendar/lib/locale/zh_CN';
import 'rc-calendar/assets/index.css';
import './WorkCalendar.scss';

@observer
class WorkCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workDates: [],
    };
  }

  /**
   * 自定义渲染日期格式
   * @param current
   * @param now
   * @returns {*}
   */
  dateRender = (current, now) => {
    const {
      saturdayWork,
      sundayWork,
      useHoliday,
      selectDays,
      holidayRefs,
      startDate,
      endDate,
    } = this.props;
    const { workDates } = this.state;
    // 渲染当前月，当前迭代可见数据
    if (current.format('MM') !== now.format('MM') || current.isBefore(startDate) || current.isAfter(endDate)) {
      return (<div className="rc-calendar-date not-current-month">
        {current.date()}
      </div>);
    }
    const format = 'YYYY-MM-DD';
    const date = current.format(format);
    const weekdays = [
      saturdayWork ? null : '六',
      sundayWork ? null : '日',
    ];
    let dateStyle;
    const workDayStyle = {
      color: '#000', background: '#FFF',
    };
    const notWorkDayStyle = {
      color: '#EF2A26', background: '#FDF0EF',
    };
    const localData = moment.localeData();
    // 通过日期缩写判断是否为周六日
    const isWeekDay = weekdays.includes(localData.weekdaysMin(current));
    // 判断是否为法定假期
    let holidayInfo = [];
    if (useHoliday && holidayRefs.length) {
      holidayInfo = holidayRefs.filter(d => d.holiday === date);
    }
    // 冲刺自定义设置
    const workDate = workDates.filter(d => d.workDay === date);
    // 组织自定义设置
    const selectDay = selectDays.filter(d => d.workDay === date);

    if (workDate.length) {
      dateStyle = workDate[0].status === 1 ? workDayStyle : notWorkDayStyle;
    } else if (selectDay.length) {
      dateStyle = selectDay[0].status === 1 ? workDayStyle : notWorkDayStyle;
    } else if (useHoliday && holidayInfo.length) {
      return holidayInfo[0].status === 1 ? (
          <div data-day={holidayInfo[0]} className={'rc-calendar-date workday'}>
            <span className="tag">班</span>
            {current.date()}
          </div>
        ) :
        (
          <div data-day={holidayInfo[0]} className={'rc-calendar-date restday'}>
            <span className="tag">休</span>
            {current.date()}
            <span className="des">{holidayInfo[0].name}</span>
          </div>
        );
    } else if (isWeekDay) {
      dateStyle = notWorkDayStyle;
    } else {
      dateStyle = workDayStyle;
    }
    return (<div className="rc-calendar-date" style={dateStyle}>
      {current.date()}
    </div>);
  };

  onSelectDate = (date, source) => {
    if (source && source.source === 'todayButton') {
      return;
    }
    const now = moment();
    const format = 'YYYY-MM-DD';
    const {
      saturdayWork,
      sundayWork,
      useHoliday,
      selectDays,
      holidayRefs,
      startDate,
      endDate,
      onWorkDateChange,
    } = this.props;
    const { workDates } = this.state;
    const weekdays = [
      saturdayWork ? null : '六',
      sundayWork ? null : '日',
    ];
    if (date && date.format('MM') === now.format('MM') && date.isAfter(startDate) && date.isBefore(endDate)) {
      const selectDate = date.format(format);
      let data = workDates;
      if (workDates.length && workDates.map(d => d.workDay).indexOf(selectDate) !== -1) {
        data = workDates.filter(d => d.workDay !== selectDate);
      } else if (selectDays.length && selectDays.map(d => d.workDay).indexOf(selectDate) !== -1) {
        const selectDay = selectDays.filter(d => d.workDay === selectDate);
        data.push(
          {
            status: selectDay.status ? 0 : 1,
            workDay: selectDay.workDay,
          }
        );
      } else {
        const localData = moment.localeData();
        const dayOfWeek = localData.weekdaysMin(date);
        let isWorkDay = !weekdays.includes(dayOfWeek); // 是否是周末
        if (useHoliday && holidayRefs.length) {
          _.forEach(holidayRefs, (item) => {
            if (item.holiday === selectDate) {
              isWorkDay = item.status === 1; // 是否是节假日及调休日期
            }
          });
        }
        data.push({
          workDay: selectDate,
          status: isWorkDay ? 0 : 1,
        });
      }
      this.setState({
        workDates: data,
      });
      onWorkDateChange(data);
    }
  };

  renderTag = (color='#000', fontColor='#FFF', text) => {
    return (
      <div
        className="legend-tag"
        style={{
          backgroundColor: color,
          color: fontColor,
        }}
      >
        {text}
      </div>
    );
  };

  renderFooter = () => (
    <div>
      <div>
        {this.renderTag('#F5F5F5', '#000', 'N')}
        <span className="legend-text">工作日</span>
        {this.renderTag('#FEF3F2', '#EF2A26', 'N')}
        <span className="legend-text">休息日</span>
        {this.renderTag('#000', '#FFF', '班')}
        <span className="legend-text">法定节假日补班</span>
        {this.renderTag('#EF2A26', '#FFF', '休')}
        <span className="legend-text">法定节假日</span>
      </div>
    </div>
  );

  render() {
    return (
      <div className="c7n-workCalendar">
        <Calendar
          showDateInput={false}
          showToday={false}
          locale={zh_CN}
          dateRender={this.dateRender}
          onSelect={this.onSelectDate}
          renderFooter={this.renderFooter}
        />
      </div>
    );
  }
}

export default WorkCalendar;
