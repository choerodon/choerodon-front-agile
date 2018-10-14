import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  stores, axios, Page, Header, Content, Permission,
} from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  Form, Button, Icon, Select, Checkbox,
} from 'choerodon-ui';
import WorkCalendar from './Component/WorkCalendar';

const { AppState } = stores;
const { Option } = Select;
const FormItem = Form.Item;

@observer
class WorkCalendarHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.getWorkCalendar();
  }

  getWorkCalendar = () => {
    const { WorkCalendarStore } = this.props;
    const proId = AppState.currentMenuType.id;
    WorkCalendarStore.axiosGetCalendarData();
    WorkCalendarStore.axiosGetHolidayData(20, 2018);
  };

  onUseHolidayChange = (e) => {
    const { WorkCalendarStore } = this.props;
    WorkCalendarStore.setUseHoliday(!!e.target.checked);
  };

  onSaturdayWorkChange = (e) => {
    const { WorkCalendarStore } = this.props;
    WorkCalendarStore.setSaturdayWork(!!e.target.checked);
  };

  onSundayWorkChange = (e) => {
    const { WorkCalendarStore } = this.props;
    WorkCalendarStore.setSundayWork(!!e.target.checked);
  };

  render() {
    const { WorkCalendarStore, form } = this.props;
    const { getFieldDecorator } = form;
    const { saturdayWork, sundayWork, useHoliday, selectDays, holidayRefs } = WorkCalendarStore;
    return (
      <Page>
        <Header title="工作日历">
          <Button funcType="flat" onClick={this.getWorkCalendar}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="工作日历"
          description="允许您将非工作日在报告或程序中设置为显示或隐藏。"
        >
          <Form layout="vertical">
            <FormItem style={{ width: 512 }}>
              {getFieldDecorator('region', {
                initialValue: 'Asia',
              })(
                <Select label="地区" placeholder="Please Select" style={{ width: 512 }}>
                  <Option value="Asia">亚洲</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem style={{ width: 512 }}>
              {getFieldDecorator('timezone', {
                initialValue: 'Asia/Shanghai',
              })(
                <Select label="时区" placeholder="Please Select" style={{ width: 512 }}>
                  <Option value="Asia/Shanghai">(GMT+08:00) Shanghai</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem style={{ width: 512, marginBottom: 5 }}>
              {getFieldDecorator('useHoliday', {
                valuePropName: 'checked',
                initialValue: useHoliday,
              })(
                <Checkbox onChange={this.onUseHolidayChange}>自动更新每年的法定节假日</Checkbox>,
              )}
            </FormItem>
            <FormItem style={{ width: 512, marginBottom: 5 }}>
              {getFieldDecorator('saturdayWork', {
                valuePropName: 'checked',
                initialValue: saturdayWork,
              })(
                <Checkbox onChange={this.onSaturdayWorkChange}>选定周六为工作日</Checkbox>,
              )}
            </FormItem>
            <FormItem style={{ width: 512, marginBottom: 5 }}>
              {getFieldDecorator('sundayWork', {
                valuePropName: 'checked',
                initialValue: sundayWork,
              })(
                <Checkbox onChange={this.onSundayWorkChange}>选定周日为工作日</Checkbox>,
              )}
            </FormItem>
          </Form>
          <WorkCalendar
            saturdayWork={saturdayWork}
            sundayWork={sundayWork}
            useHoliday={useHoliday}
            selectDays={selectDays}
            holidayRefs={holidayRefs}
            store={WorkCalendarStore}
          />
        </Content>
      </Page>
    );
  }
}
export default Form.create({})(withRouter(WorkCalendarHome));
