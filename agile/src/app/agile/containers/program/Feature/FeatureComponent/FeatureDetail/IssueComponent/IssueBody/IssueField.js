import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import Field from './Field/Field';
import { returnBeforeTextUpload } from '../../../../../../../common/utils';
import { updateStatus, updateIssue } from '../../../../../../../api/NewIssueApi';
import { DatetimeAgo } from '../../../../../../../components/CommonComponent';
import { STATUS } from '../../../../../../../common/Constant';
import { getSelf } from '../../../../../../../api/CommonApi';
import UserHead from '../../../../../../../components/UserHead';

const readOnly = ['creationDate', 'lastUpdateDate'];

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

  handleFieldChange = (field, value) => {
    const { state } = this;
    const { onUpdate, store, reloadIssue } = this.props;
    const { code, system } = field;
    const issue = store.getIssue;
    const {
      issueId, objectVersionNumber,
    } = issue;

    const obj = {
      issueId,
      objectVersionNumber,
    };
    if ((code === 'description') || (code === 'editDes')) {
      if (state[code]) {
        returnBeforeTextUpload(state[code], obj, updateIssue, 'description')
          .then((res) => {
            this.reloadIssue(state.origin.issueId);
          });
      }
    } else if (code === 'assigneeId') {
      obj[code] = state[code] ? JSON.parse(state[code]).id || 0 : 0;
      updateIssue(obj)
        .then((res) => {
          if (reloadIssue) {
            reloadIssue();
          }
          if (onUpdate) {
            onUpdate();
          }
        });
    } else if (code === 'reporterId') {
      obj[code] = value || 0;
      updateIssue(obj)
        .then((res) => {
          if (reloadIssue) {
            reloadIssue();
          }
          if (onUpdate) {
            onUpdate();
          }
        });
    } else if (code === 'statusId') {
      if (value) {
        updateStatus(value, issueId, objectVersionNumber)
          .then((res) => {
            if (reloadIssue) {
              reloadIssue();
            }
            if (onUpdate) {
              onUpdate();
            }
            this.setState({
              transformId: false,
            });
          });
      }
    } else {
      obj[code] = state[code] || 0;
      updateIssue(obj)
        .then((res) => {
          if (reloadIssue) {
            reloadIssue();
          }
          if (onUpdate) {
            onUpdate();
          }
        });
    }
  };

  onInit = () => {

  };

  setCurrentRae = (data) => {
    const { store } = this.props;
    store.setCurrentRae(data);
  };

  render() {
    const { store } = this.props;
    const issue = store.getIssue;
    const {
      statusMapDTO = {}, activePi = {}, epicName, reporterName,
      featureDTO = {}, creationDate, lastUpdateDate, assigneeId,
      reporterId, reporterImageUrl,
    } = issue;

    const currentRae = store.getCurrentRae;

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
        value: statusMapDTO.name,
        renderReadMode: data => (
          <div
            style={{
              background: STATUS[statusMapDTO.code],
              color: '#fff',
              borderRadius: '2px',
              padding: '0 8px',
              display: 'inline-block',
              margin: '2px auto 2px 0',
            }}
          >
            {data.value}
          </div>
        ),
      }, {
        code: 'pi',
        name: 'PI',
        system: true,
        required: true,
        value: activePi.name,
      }, {
        code: 'epic',
        name: '史诗',
        system: true,
        required: true,
        value: epicName,
      }, {
        code: 'reporter',
        name: '报告人',
        system: true,
        required: true,
        value: reporterName,
        renderReadMode: data => (
          <UserHead
            user={{
              id: reporterId,
              loginName: '',
              realName: reporterName,
              avatar: reporterImageUrl,
            }}
          />
        ),
        suffix: (
          <span
            role="none"
            style={{
              color: '#3f51b5',
              cursor: 'pointer',
              marginTop: '-3px',
              display: 'inline-block',
            }}
            onClick={() => {
              getSelf().then((res) => {
                if (res.id !== assigneeId) {
                  this.setState({
                    currentRae: undefined,
                    assigneeId: JSON.stringify(res),
                    assigneeName: `${res.loginName}${res.realName}`,
                    assigneeImageUrl: res.imageUrl,
                  }, () => {
                    this.handleFieldChange({ code: 'assigneeId' });
                  });
                }
              });
            }}
          >
            {'分配给我'}
          </span>
        ),
      }, {
        code: 'benfitHypothesis',
        name: '特性价值',
        system: true,
        required: true,
        value: featureDTO.benfitHypothesis,
      }, {
        code: 'acceptanceCritera',
        name: '验收标准',
        system: true,
        required: true,
        value: featureDTO.acceptanceCritera,
      }, {
        code: 'creationDate',
        name: '创建时间',
        system: true,
        required: true,
        value: creationDate,
        renderReadMode: data => (<DatetimeAgo date={data.value} />),
      }, {
        code: 'lastUpdateDate',
        name: '更新时间',
        system: true,
        required: true,
        value: lastUpdateDate,
        renderReadMode: data => (<DatetimeAgo date={data.value} />),
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
                changeRae={this.setCurrentRae}
                currentRae={currentRae}
                onOk={this.handleFieldChange}
                onInit={this.onInit}
                renderReadMode={field.renderReadMode}
                renderOption={this.renderOption}
                suffix={field.suffix}
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
