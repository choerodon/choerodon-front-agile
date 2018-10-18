import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Content, stores } from 'choerodon-front-boot';
import {
 Button, Select, Icon, message 
} from 'choerodon-ui';
import _ from 'lodash';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import WorkCalendar from './WorkCalendar';

const { AppState } = stores;
const Option = Select.Option;

@observer
class WorkCalendarPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectValue: '',
    };
  }

  onWorkDateChange = (data) => {
    const { sprintId } = ScrumBoardStore.getWorkDate;
    if (data.calendarId) {
      ScrumBoardStore.axiosDeleteCalendarData(data.calendarId).then(() => {
        ScrumBoardStore.axiosGetCalendarData();
      });
    } else {
      ScrumBoardStore.axiosCreateCalendarData(sprintId, data).then(() => {
        ScrumBoardStore.axiosGetCalendarData();
      });
    }
  };

  render() {
    const {
      saturdayWork,
      sundayWork,
      useHoliday,
      timeZoneWorkCalendarDTOS: selectDays,
      workHolidayCalendarDTOS: holidayRefs,
    } = ScrumBoardStore.getWorkSetting;
    const {
      sprintWorkCalendarRefDTOS: workDates,
      startDate,
      endDate,
    } = ScrumBoardStore.getWorkDate;

    return (
      <Content
        description="您可以设置当前冲刺的工作日历。"
        style={{
          padding: 0,
          height: '100%',
        }}
      >
        <WorkCalendar
          startDate={startDate}
          endDate={endDate}
          saturdayWork={saturdayWork}
          sundayWork={sundayWork}
          useHoliday={useHoliday}
          selectDays={selectDays}
          holidayRefs={holidayRefs}
          workDates={workDates}
          onWorkDateChange={this.onWorkDateChange}
        />
      </Content>
    );
  }
}

export default WorkCalendarPage;
