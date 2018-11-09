import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import Calendar from 'choerodon-ui/lib/rc-components/calendar/';
import _ from 'lodash';
import moment from 'moment';
import 'moment/locale/zh-cn';
import zhCN from 'rc-calendar/lib/locale/zh_CN';
import 'rc-calendar/assets/index.css';
import './WorkCalendar.scss';

@observer
class WorkCalendar extends Component {
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
      workDates,
    } = this.props;
    const format = 'YYYY-MM-DD';
    // 渲染当前月，当前迭代可见数据
    if (current.format('MM') !== now.format('MM')
      || !startDate
      || !endDate
      || moment(current.format(format)).isBefore(moment(moment(startDate).format(format)))
      || moment(current.format(format)).isAfter(moment(moment(endDate).format(format)))) {
      return (
        <div className="rc-calendar-date not-current-month">
          {current.date()}
        </div>
      );
    }
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
      color: '#EF2A26', background: '#FFE7E7',
    };
    const sprintDayStyle = {
      color: '#FFF', background: '#3F51B5',
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

    let holidayTag = null;
    if (startDate.includes(date) || endDate.includes(date)) {
      if (useHoliday && holidayInfo.length) {
        if (workDate.length && (workDate[0].status === 1 || holidayInfo[0].status === 1)) {
          holidayTag = (
            <React.Fragment>
              <span className="tag tag-work">班</span>
              <span className="des">{holidayInfo[0].name}</span>
            </React.Fragment>
          );
        } else {
          holidayTag = (
            <React.Fragment>
              <span className="tag tag-notwork">休</span>
              <span className="des">{holidayInfo[0].name}</span>
            </React.Fragment>
          );
        }
      }
      dateStyle = sprintDayStyle;
    } else if (workDate.length) {
      dateStyle = workDate[0].status === 1 ? workDayStyle : notWorkDayStyle;
    } else if (selectDay.length) {
      dateStyle = selectDay[0].status === 1 ? workDayStyle : notWorkDayStyle;
    } else if (useHoliday && holidayInfo.length) {
      holidayTag = holidayInfo[0].status === 1 ? (
        <span className="tag tag-work">班</span>
      ) : (
        <React.Fragment>
          <span className="tag tag-notwork">休</span>
          <span className="des">{holidayInfo[0].name}</span>
        </React.Fragment>
      );
      dateStyle = notWorkDayStyle;
    } else if (isWeekDay) {
      dateStyle = notWorkDayStyle;
    } else {
      dateStyle = workDayStyle;
    }
    return (
      <div className="rc-calendar-date" style={dateStyle}>
        {holidayTag}
        {current.date()}
      </div>
    );
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
      workDates = [],
    } = this.props;
    const weekdays = [
      saturdayWork ? null : '六',
      sundayWork ? null : '日',
    ];
    // 如果不是当前冲刺
    if (!date || !startDate || !endDate
      || moment(date.format(format)).isBefore(moment(moment(startDate).format(format)))
      || moment(date.format(format)).isAfter(moment(moment(endDate).format(format)))) {
      return;
    }
    if (date) {
      const selectDate = date.format(format);
      const workDate = workDates.filter(d => d.workDay === selectDate);
      if (workDate.length) {
        onWorkDateChange(workDate[0]);
      } else if (selectDays.length && selectDays.map(d => d.workDay).indexOf(selectDate) !== -1) {
        const selectDay = selectDays.filter(d => d.workDay === selectDate);
        onWorkDateChange({
          status: selectDay[0].status ? 0 : 1,
          workDay: selectDay[0].workDay,
        });
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
        onWorkDateChange({
          workDay: selectDate,
          status: isWorkDay ? 0 : 1,
        });
      }
    }
  };

  renderTag = (title, color = '#000', fontColor = '#FFF', text) => (
    <div style={{ marginTop: 5, display: 'flex', alignItem: 'center' }}>
      <span
        className="legend-tag"
        style={{
          backgroundColor: color,
          color: fontColor,
        }}
      >
        {text}
      </span>
      <span className="legend-text">{title}</span>
    </div>
  );

  renderFooter = () => (
    <div>
      <div style={{
        display: 'flex', padding: '0 16px', flexWrap: 'wrap',
      }}
      >
        {this.renderTag('起始日/结束日', '#3F51B5', '#FFF', 'N')}
        {this.renderTag('工作日', '#F5F5F5', '#000', 'N')}
        {this.renderTag('休息日', '#FEF3F2', '#EF2A26', 'N')}
        {this.renderTag('法定节假日补班', '#000', '#FFF', '班')}
        {this.renderTag('法定节假日', '#EF2A26', '#FFF', '休')}
      </div>
    </div>
  );

  render() {
    return (
      <div className="c7n-workCalendar">
        <Calendar
          showDateInput={false}
          showToday={false}
          locale={zhCN}
          dateRender={this.dateRender}
          onSelect={this.onSelectDate}
          renderFooter={this.renderFooter}
        />
      </div>
    );
  }
}

export default WorkCalendar;
