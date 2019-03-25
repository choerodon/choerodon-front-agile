import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, Select, Modal, Radio, 
} from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import SelectFocusLoad from '../SelectFocusLoad';
import WYSIWYGEditor from '../WYSIWYGEditor';
import UploadControl from '../UploadControl';
import SelectNumber from '../SelectNumber';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const { Option } = Select;
const RadioGroup = Radio.Group;
const defaultProps = {

};

const propTypes = {
  visible: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};
@Form.create()
class CreateFeature extends Component {
  handleOk = () => {
    const { onSubmit, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
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
        title="创建特性"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={loading}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
          title="在项目群中创建特性"
          description="请在下面输入问题的详细信息，包含详细描述、特性价值、验收标准等等。您可以通过丰富的问题描述帮助相关人员更快更全面的理解任务，同时更好的把控问题进度。"
        >
          <Form>
            <FormItem>
              {getFieldDecorator('statusType', {
                initialValue: 'CYCLE_CASE',
                rules: [{
                  required: true, message: '请选择类型!',
                }],
              })(
                <Select label="问题类型" style={{ width: 500 }}>
                  <Option value="CYCLE_CASE">特性</Option>
                  <Option value="CASE_STEP">步骤状态</Option>
                </Select>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('featureType', {
                rules: [{
                  required: true, message: '请选择特性类型!',
                }],
                initialValue: '1',
              })(
                <RadioGroup label="特性类型">
                  <Radio value="1" style={radioStyle}>业务</Radio>
                  <Radio value="2" style={radioStyle}>使能</Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('statusName', {
                rules: [{
                  required: true, message: '请输入状态名称',
                }, {
                  validator: this.handleCheckStatusRepeat,
                }],
              })(
                <Input style={{ width: 500 }} maxLength={30} label="特性名称" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('description', {
              })(
                <WYSIWYGEditor />,
              )}
            </FormItem>

            <FormItem>
              {getFieldDecorator('epicId', {

              })(
                <SelectFocusLoad type="epic" style={{ width: 500 }} label="史诗" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('storyPoints', {

              })(
                <SelectNumber style={{ width: 500 }} label="故事点" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('featureWorth', {
              })(
                <Input style={{ width: 500 }} maxLength={30} label="特性价值" />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('limit', {
              })(
                <Input style={{ width: 500 }} maxLength={30} label="验收标准" />,
              )}
            </FormItem>
            <Form.Item>                       
              {getFieldDecorator('upload', {
                valuePropName: 'fileList',                
              })(
                <UploadControl />,                 
              )}              
            </Form.Item>            
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

CreateFeature.propTypes = propTypes;
CreateFeature.defaultProps = defaultProps;


export default CreateFeature;
