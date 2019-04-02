import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import {
  Checkbox, Select, Input, TimePicker, Row, Col, Radio, DatePicker, InputNumber,
} from 'choerodon-ui';
import { injectIntl } from 'react-intl';
import { ReadAndEdit } from '../../../../../../../../components/CommonComponent';

const { TextArea } = Input;
const { Option } = Select;

@inject('AppState')
@observer class IssueField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldValue: props.optionId,
    };
  }

  componentDidMount() {

  }

  renderField = () => {
    const { field, renderOption } = this.props;
    const { fieldValue } = this.state;
    if (field.fieldType === 'radio') {
      return (
        <Radio.Group label={field.fieldName} value={fieldValue}>
          {field.fieldOptions && field.fieldOptions.length > 0
          && field.fieldOptions.map(item => (
            <Radio
              className="radioStyle"
              value={item.id}
            >
              {renderOption ? renderOption(item.value) : item.value}
            </Radio>
          ))}
        </Radio.Group>
      );
    } else if (field.fieldType === 'checkbox') {
      return (
        <Checkbox.Group label={field.fieldName} value={fieldValue}>
          <Row>
            {field.fieldOptions && field.fieldOptions.length > 0
            && field.fieldOptions.map(item => (
              <Col
                span={24}
              >
                <Checkbox
                  value={String(item.id)}
                  className="checkboxStyle"
                >
                  {renderOption ? renderOption(item.value) : item.value}
                </Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      );
    } else if (field.fieldType === 'time') {
      return (
        <TimePicker
          label={field.fieldName}
          className="fieldWith"
          defaultOpenValue={moment('00:00:00', 'HH:mm:ss')}
          allowEmpty
          value={fieldValue}
        />
      );
    } else if (field.fieldType === 'datetime') {
      return (
        <DatePicker
          label={field.fieldName}
          format="YYYY-MM-DD HH:mm:ss"
          className="fieldWith"
          allowClear
          value={fieldValue}
        />
      );
    } else if (field.fieldType === 'single') {
      return (
        <Select
          label={field.fieldName}
          dropdownMatchSelectWidth
          className="fieldWith"
          allowClear
          value={fieldValue}
        >
          {field.fieldOptions && field.fieldOptions.length > 0
          && field.fieldOptions.map(item => (
            <Option
              value={item.id}
              key={item.id}
            >
              {renderOption ? renderOption(item.value) : item.value}
            </Option>
          ))}
        </Select>
      );
    } else if (field.fieldType === 'multiple') {
      return (
        <Select
          label={field.fieldName}
          dropdownMatchSelectWidth
          mode="multiple"
          className="fieldWith"
          value={fieldValue}
        >
          {field.fieldOptions && field.fieldOptions.length > 0
          && field.fieldOptions.map(item => (
            <Option
              value={String(item.id)}
              key={String(item.id)}
            >
              {renderOption ? renderOption(item.value) : item.value}
            </Option>
          ))}
        </Select>
      );
    } else if (field.fieldType === 'number') {
      return (
        <InputNumber
          label={field.fieldName}
          step={field.extraConfig === '1' ? 0.1 : 1}
          value={fieldValue}
        />
      );
    } else if (field.fieldType === 'text') {
      return (
        <TextArea
          label={field.fieldName}
          value={fieldValue}
        />
      );
    } else {
      return (
        <Input
          label={field.fieldName}
          value={fieldValue}
        />
      );
    }
  };

  /**
   * 只读模式，默认展示字段值
   * @returns {XML}
   */
  renderReadMode = () => {
    const { renderReadMode, field } = this.props;
    if (renderReadMode) {
      return renderReadMode(field);
    } else {
      return (
        <span>{field.value || '无'}</span>
      );
    }
  };

  resetValue = (value) => {
    this.setState({
      fieldValue: value,
    });
  };

  render() {
    const {
      field, readOnly, currentRae, onOk,
    } = this.props;
    return (
      <ReadAndEdit
        readOnly={readOnly}
        callback={this.changeRae}
        thisType={field.code}
        current={currentRae}
        handleEnter
        origin={field.optionId || field.value}
        onOk={onOk}
        onCancel={this.resetValue}
        onInit={this.onInit}
        readModeContent={this.renderReadMode()}
      >
        {readOnly ? '' : this.renderField()}
      </ReadAndEdit>
    );
  }
}

export default withRouter(injectIntl(IssueField));
