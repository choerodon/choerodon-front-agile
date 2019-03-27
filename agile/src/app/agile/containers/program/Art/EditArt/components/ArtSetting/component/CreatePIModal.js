import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Modal, DatePicker, Form,
} from 'choerodon-ui';

const FormItem = Form.Item;


const handleCreatePIOk = (props) => {
  const { form, onCreatePIOk } = props;
  form.validateFields((err, values) => {
    if (!err) {
      // onCreatePIOk(new Date(moment(values.PIStartDate)));
      onCreatePIOk(moment(values.PIStartDate).format('YYYY-MM-DD HH:mm:ss'));
    }
  });
};

const handleCreatePICancel = (props) => {
  const { form, onCreatePICancel } = props;
  form.setFieldsValue({
    PIStartDate: '',
  });
  onCreatePICancel();
};

const CreatePIModal = (props) => {
  const {
    visible, onCreatePIOk, onCreatePICancel, name, form, 
  } = props;
  const { getFieldDecorator } = form; 
  return (
    <Modal
      visible={visible}
      onOk={() => { handleCreatePIOk(props); }}
      onCancel={() => { handleCreatePICancel(props); }}
      title="添加PI"
    >
      <p style={{ marginTop: 20 }}>{`您正在为 ${name} 添加新的PI，请选择新PI的开始时间`}</p>
      <Form>
        <FormItem>
          {
              getFieldDecorator('PIStartDate', {
                rules: [{
                  required: true, message: '请选择PI开始时间!',
                }],
              })(<DatePicker
                style={{ width: '100%' }}
                label="添加PI开始时间"
                allowClear
                format="YYYY-MM-DD"
              />)
          }
        </FormItem>
      </Form>
       
    </Modal>
  );
};

CreatePIModal.prototype = {
  visible: PropTypes.bool.isRequired,
  onCreatePIOk: PropTypes.func.isRequired,
  onCreatePICancel: PropTypes.func.isRequired,
};

export default Form.create()(CreatePIModal);
