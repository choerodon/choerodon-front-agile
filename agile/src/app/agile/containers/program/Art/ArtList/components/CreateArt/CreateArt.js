import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, Modal, DatePicker, Checkbox,
} from 'choerodon-ui';
import moment from 'moment';
import SelectFocusLoad from '../../../../../../components/SelectFocusLoad';

const FormItem = Form.Item;
const { Sidebar } = Modal;


const propTypes = {
  visible: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
class CreateArt extends Component {
  componentDidUpdate(prevProps, prevState) {
    const { form, visible } = this.props;
    if (!prevProps.visible && visible) {
      form.resetFields();
    }
  }

  handleOk = () => {
    const { onSubmit, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        window.console.log('Received values of form: ', values);
        onSubmit(values);
      }
    });
  }

  render() {
    const {
      visible, onCancel, loading, form,
    } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Sidebar
        title="创建ART"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={loading}
      >
        <Form>
          <FormItem>
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入ART名称!',
              }],
            })(
              <Input style={{ width: 500 }} maxLength={30} label="名称" placeholder="请输入ART名称" />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('description')(
              <Input style={{ width: 500 }} maxLength={30} label="描述" placeholder="请输入ART的详细描述" />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('rteId')(
              <SelectFocusLoad allowClear type="user" label="发布火车工程师" style={{ width: 500 }} />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('startDate', {
              rules: [{
                required: true,
                message: '请选择日期!',
              }],
            })(
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: 500 }}
                label="开始日期"
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('enabled', {
              valuePropName: 'checked',
            })(
              <Checkbox>启用</Checkbox>,
            )}
          </FormItem>
        </Form>
      </Sidebar>
    );
  }
}

CreateArt.propTypes = propTypes;

export default Form.create()(CreateArt);
