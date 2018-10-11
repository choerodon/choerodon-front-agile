import React, { Component } from 'react';
import Calendar from 'rc-calendar';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import zh_CN from 'rc-calendar/lib/locale/zh_CN';
import 'rc-calendar/assets/index.css';
import './WorkCalendar.scss';

class WorkCalendar extends Component {
  constructor(props) {
    super(props);
    this.weekdays = ['Sa', 'Su'];
    this.state = {
      selectDates: [], // 非工作日期集（单独缓存，减少每次渲染内存开销）
      weekdays: Object.assign([], this.weekdays), // 默认周末为非工作日
    };
  }

  // 自定义渲染日期格式
  dateRender = (current, now) => {
    // 渲染当前页面可见月数据
    if (current.format('MM') !== now.format('MM')) {
      return null;
    }
    const format = 'YYYY-MM-DD';
    const date = current.format(format);
    const { weekdays, selectDates } = this.state;
    let dateStyle;
    const workDayStyle = {
      color: '#000', background: '#FFF',
    };
    const notWorkDayStyle = {
      color: '#EF2A26', background: '#FDF0EF',
    };
    const localData = moment.localeData();
    const isWeekDay = weekdays.includes(localData.weekdaysMin(current));
    // 特殊情况
    if (selectDates.includes(date)) {
      dateStyle = notWorkDayStyle;
      if (isWeekDay) { // 如果选定日期是周末（非工作日）
        dateStyle = workDayStyle;
      }
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
    if (!this.hasCreate) {
      message.info(HAP.getMessage('请先输入名称创建工作日历，再进行日历设置。', 'Please enter the name to create a working calendar and then set the calendar.'));
      return;
    }
    const now = moment();
    const format = 'YYYY-MM-DD';
    if (date && (date.isAfter(now) || date.format(format) === now.format(format))) {
      const { selectDates, selectDays, id, weekdays, holidayRefs, useHoliday } = this.state;
      const selectDate = date.format(format);
      const localData = moment.localeData();
      const dayOfWeek = localData.weekdaysMin(date);
      let isWorkDay = weekdays.includes(dayOfWeek); // 是否是周末
      if (useHoliday && holidayRefs.length) {
        _.forEach(holidayRefs, (item) => {
          if (item.day === selectDate) {
            isWorkDay = !item.workDay; // 是否是节假日及调休日期
          }
        });
      }
      const day = {
        calendarId: id,
        day: selectDate,
        workDay: isWorkDay,
        dayOfWeek,
      };
      if (selectDates.length === 0) {
        selectDates.push(selectDate);
        selectDays.push(day);
      } else {
        let index = 0;
        const length = selectDates.length;
        while (index < length) {
          if (selectDates[index] === selectDate) {
            selectDates.splice(index, 1);
            selectDays.splice(index, 1);
            break;
          } else if (index < length - 1) {
            index += 1;
          } else {
            selectDates.push(selectDate);
            selectDays.push(day);
            break;
          }
        }
      }
      this.setState({ selectDates, selectDays });
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
      </div>
    </div>
  );

  render() {
    return (
      <div className="c7n-workCalendar">
        <Calendar
          showDateInput={false}
          showToday={false}
          locale={{...zh_CN, Oct: '十月'}}
          dateRender={this.dateRender}
          onSelect={this.onSelectDate}
          renderFooter={this.renderFooter}
        />
      </div>
    );
  }
}

export default WorkCalendar;
