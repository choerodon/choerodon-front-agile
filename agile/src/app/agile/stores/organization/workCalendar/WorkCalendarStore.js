import axios from 'axios';
import { observable, action, computed } from 'mobx';
import { store, stores } from 'choerodon-front-boot';

@store('WorkCalendarStore')
class WorkCalendarStore {
  @observable holidayRefs = [];
  @observable saturdayWork = false;
  @observable sundayWork = false;
  @observable useHoliday = false;
  @observable selectDays = [];

  @computed get getHolidayRefs() {
    return this.holidayRefs;
  }

  @action setHolidayRef(data) {
    this.holidayRefs = data;
  }

  @computed get getSaturdayWork() {
    return this.saturdayWork;
  }

  @action setSaturdayWork(data) {
    this.saturdayWork = data;
  }

  @computed get getSundayWork() {
    return this.sundayWork;
  }

  @action setSundayWork(data) {
    this.sundayWork = data;
  }

  @computed get getUseHoliday() {
    return this.useHoliday;
  }

  @action setUseHoliday(data) {
    this.useHoliday = data;
  }

  @computed get getSelectDays() {
    return this.selectDays.slice();
  }

  @action setSelectDays(data) {
    this.selectDays = data;
  }

  axiosGetCalendarData = () => {
    setTimeout(() => {
      this.setSelectDays([]);
      this.setSaturdayWork(false);
      this.setSundayWork(false);
      this.setUseHoliday(true);
    }, 300);
  };

  axiosPostCalendarData = (data) => {
    this.setSelectDays(data)
  };

  axiosGetHolidayData = (orgId, year) => {
    axios.get(`/agile/v1/organizations/${orgId}/work_calendar_holiday_refs?year=${year}`).then((data) => {
      this.setHolidayRef(data);
    });
  };
}

const workCalendarStore = new WorkCalendarStore();
export default workCalendarStore;
