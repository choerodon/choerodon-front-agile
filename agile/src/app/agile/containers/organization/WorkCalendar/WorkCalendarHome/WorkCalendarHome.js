import React, { Component } from 'react';
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

  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Page>
        <Header title="工作日历">
          <Button funcType="flat" onClick={() => this.getWorkCalendar()}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title="工作日历"
          description="允许您将非工作日在报告或程序中设置为显示或隐藏。"
        >
          <Form layout="vertical">
            <FormItem label="项目编码" style={{ width: 512 }}>
              {getFieldDecorator('region', {
                initialValue: 'Asia',
              })(
                <Select label="地区" placeholder="Please Select" style={{ width: 512 }}>
                  <Option value="Asia">亚洲</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem label="项目编码" style={{ width: 512 }}>
              {getFieldDecorator('timezone', {
                initialValue: 'Asia/Shanghai',
              })(
                <Select label="时区" placeholder="Please Select" style={{ width: 512 }}>
                  <Option value="Asia/Shanghai">(GMT+08:00) Shanghai</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem label="项目编码" style={{ width: 512 }}>
              {getFieldDecorator('saturdayWork', {
                valuePropName: 'checked',
                initialValue: false,
              })(
                <Checkbox>选定周六为工作日</Checkbox>,
              )}
            </FormItem>
            <FormItem label="项目编码" style={{ width: 512 }}>
              {getFieldDecorator('sundayWork', {
                valuePropName: 'checked',
                initialValue: false,
              })(
                <Checkbox>选定周日为工作日</Checkbox>,
              )}
            </FormItem>
          </Form>
          <WorkCalendar />
        </Content>
      </Page>
    );
  }
}
export default Form.create({})(withRouter(WorkCalendarHome));
