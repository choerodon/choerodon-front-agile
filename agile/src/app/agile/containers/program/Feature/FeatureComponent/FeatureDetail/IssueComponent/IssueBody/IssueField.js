import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Tooltip, Icon } from 'choerodon-ui';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import Field from './Field/Field';

const readOnly = ['lastUpdateDate', 'lastUpdateDate'];

@inject('AppState')
@observer class IssueField extends Component {
  constructor(props) {
    super(props);
    this.sign = false;
    this.state = {
      nav: 'detail',
      currentRae: '',
    };
  }

  componentDidMount() {

  }

  changeRae = (data) => {
    this.setState({
      currentRae: data,
    });
  };

  /**
   * 更新字段值
   * @param type
   * @param value
   */
  handleFieldChange = (field, value) => {

  };

  onInit = () => {

  };

  render() {
    const { currentRae } = this.state;
    const {
      typeCode, intl,
    } = this.props;

    const fields = [
      {
        code: 'status',
        name: '状态',
        system: true,
        required: true,
        type: 'select',
      }, {
        code: 'priority',
        name: '优先级',
        system: true,
        required: true,
      }, {
        code: 'component',
        name: '模块',
        system: true,
        required: true,
      }, {
        code: 'label',
        name: '标签',
        system: true,
        required: true,
      }, {
        code: 'influenceVersion',
        name: '影响的版本',
        system: true,
        required: true,
      }, {
        code: 'fixVersion',
        name: '版本',
        system: true,
        required: true,
      }, {
        code: 'epic',
        name: '史诗',
        system: true,
        required: true,
      }, {
        code: 'sprint',
        name: '冲刺',
        system: true,
        required: true,
      }, {
        code: 'epicName',
        name: '史诗名称',
        system: true,
        required: true,
      }, {
        code: 'reporter',
        name: '报告人',
        system: true,
        required: true,
      }, {
        code: 'assignee',
        name: '经办人',
        system: true,
        required: true,
      }, {
        code: 'creationDate',
        name: '创建时间',
        system: true,
        required: true,
      }, {
        code: 'lastUpdateDate',
        name: '更新时间',
        system: true,
        required: true,
      }, {
        code: 'benfitHypothesis',
        name: '特性价值',
        system: true,
        required: true,
      }, {
        code: 'acceptanceCritera',
        name: '验收标准',
        system: true,
        required: true,
      }, {
        code: 'featureType',
        name: '特性类型',
        system: true,
        required: true,
      },
    ];

    const featureFields = [
      {
        code: 'status',
        name: '状态',
        system: true,
        required: true,
        type: 'select',
      }, {
        code: 'pi',
        name: 'PI',
        system: true,
        required: true,
      }, {
        code: 'epic',
        name: '史诗',
        system: true,
        required: true,
      }, {
        code: 'reporter',
        name: '报告人',
        system: true,
        required: true,
      }, {
        code: 'benfitHypothesis',
        name: '特性价值',
        system: true,
        required: true,
      }, {
        code: 'acceptanceCritera',
        name: '验收标准',
        system: true,
        required: true,
      }, {
        code: 'creationDate',
        name: '创建时间',
        system: true,
        required: true,
      }, {
        code: 'lastUpdateDate',
        name: '更新时间',
        system: true,
        required: true,
      },
    ];

    return (
      <div className="c7n-content-wrapper">
        {featureFields.map(field => (
          <div className="line-start mt-10" key={field.code}>
            <div className="c7n-property-wrapper">
              <span className="c7n-property">
                {`${field.name}：`}
              </span>
            </div>
            <div className="c7n-value-wrapper">
              <Field
                field={field}
                readOnly={readOnly.indexOf(field.code) !== -1}
                changeRae={this.changeRae}
                currentRae={currentRae}
                onOk={this.handleFieldChange}
                onInit={this.onInit}
                renderReadMode={this.renderReadMode}
                renderOption={this.renderOption}
              />
            </div>
          </div>
        ))
        }
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueField));
