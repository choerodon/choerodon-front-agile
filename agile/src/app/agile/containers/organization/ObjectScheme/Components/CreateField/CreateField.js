import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import {
  Modal, Form, Select, Input, message,
} from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
  stores,
} from 'choerodon-front-boot';
import './CreateField.scss';
import * as images from '../../../../../assets/image';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 100 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 26 },
  },
};

const regex = /^[0-9a-zA-Z_]+$/;

@observer
class CreateField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
    };
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    const { store } = this.props;
    Promise.all([
      store.loadLookupValue('field_type'),
      store.loadLookupValue('object_scheme_field_context'),
    ]).then(([fieldType, fieldContext]) => {
      store.initLookupValue(fieldType, fieldContext);
    });
  };

  handleClose = () => {
    const { form, onClose } = this.props;
    form.resetFields();
    if (onClose) {
      onClose();
    }
  };

  handleOk = () => {
    const { form, onOk } = this.props;
    form.resetFields();
    if (onOk) {
      onOk();
    }
  };

  handleSubmit = () => {
    const {
      store, intl, form, schemeCode,
    } = this.props;
    form.validateFieldsAndScroll((err, data) => {
      if (!err) {
        const postData = data;
        postData.schemeCode = schemeCode;
        this.setState({
          submitting: true,
        });
        store.createField(postData)
          .then((field) => {
            Choerodon.prompt(intl.formatMessage({ id: 'createSuccess' }));
            this.setState({
              submitting: false,
            });
            this.handleOk();
          }).catch(() => {
            Choerodon.prompt(intl.formatMessage({ id: 'createFailed' }));
            this.setState({
              submitting: false,
            });
          });
      }
    });
  };

  checkName = (rule, value, callback) => {
    const { store, intl } = this.props;
    if (!value) {
      callback();
    } else {
      store.checkName(value)
        .then((data) => {
          if (data) {
            callback(intl.formatMessage({ id: 'field.name.exist' }));
          } else {
            callback();
          }
        }).catch((error) => {
          callback();
        });
    }
  };

  checkCode = (rule, value, callback) => {
    const { store, intl } = this.props;
    if (!value) {
      callback();
    } else if (!regex.test(value)) {
      callback(intl.formatMessage({ id: 'field.code.rule' }));
    } else {
      store.checkCode(value)
        .then((data) => {
          if (data) {
            callback(intl.formatMessage({ id: 'field.code.exist' }));
          } else {
            callback();
          }
        }).catch((error) => {
          callback(intl.formatMessage({ id: 'network.error' }));
        });
    }
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    const {
      visible, intl, store,
    } = this.props;
    const { submitting } = this.state;
    const fieldType = store.getFieldType;
    const fieldContext = store.getFieldContext;

    return (
      <Sidebar
        title={<FormattedMessage id="field.create" />}
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleClose}
        okText={<FormattedMessage id="save" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={submitting}
      >
        <div className="issue-region">
          <Form layout="vertical" onSubmit={this.handleOk} className="c7n-sidebar-form">
            <FormItem
              {...formItemLayout}
              className="issue-sidebar-form"
            >
              {getFieldDecorator('code', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '显示范围为必填项！',
                }, {
                  validator: this.checkCode,
                }],
              })(
                <Input
                  maxLength={10}
                  label={<FormattedMessage id="code" />}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              className="issue-sidebar-form"
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '显示范围为必填项！',
                }, {
                  validator: this.checkName,
                }],
              })(
                <Input
                  maxLength={15}
                  label={<FormattedMessage id="name" />}
                />,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              className="issue-sidebar-form"
            >
              {getFieldDecorator('fieldType', {
                rules: [{
                  required: true,
                  message: '显示范围为必填项！',
                }],
              })(
                <Select
                  style={{ width: 520 }}
                  label={<FormattedMessage id="field.type" />}
                  dropdownMatchSelectWidth
                  size="default"
                  optionLabelProp="name"
                >
                  {fieldType.filter(item => item.valueCode !== 'member').map(type => (
                    <Option
                      value={type.valueCode}
                      key={type.valueCode}
                      name={intl.formatMessage({ id: `field.${type.valueCode}` })}
                    >
                      <img src={images[type.valueCode]} alt="" className="issue-field-img" />
                      <span>
                        <FormattedMessage id={`field.${type.valueCode}`} />
                      </span>
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              className="issue-sidebar-form"
            >
              {getFieldDecorator('context', {
                rules: [{
                  required: true,
                  message: '显示范围为必填项！',
                }],
              })(
                <Select
                  style={{ width: 520 }}
                  label={<FormattedMessage id="field.context" />}
                  dropdownMatchSelectWidth
                  size="default"
                  mode="multiple"
                >
                  {fieldContext.map(ctx => (
                    <Option
                      value={ctx.valueCode}
                      key={ctx.valueCode}
                    >
                      {ctx.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          </Form>
        </div>
      </Sidebar>
    );
  }
}

export default Form.create({})(withRouter(injectIntl(CreateField)));
