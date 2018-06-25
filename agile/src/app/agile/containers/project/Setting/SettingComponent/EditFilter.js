import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon, Button } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';

const { Sidebar } = Modal;
const { TextArea } = Input;
const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;

class AddComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: {},
      arr: [],
      o: [],
      originUsers: [],
      originStatus: [],
      originPriorities: [],
      loading: false,
      filters: [
        {
          prop: undefined,
          rule: undefined,
          value: undefined,
        },
      ],
      quickFilterFiled: [],
      delete: [],
    };
  }

  componentDidMount() {
    this.loadQuickFilterFiled();
    this.loadFilter(this.props.filterId);
    this.loadQuickFilter();
  }

  loadFilter(filterId = this.props.filterId) {
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/quick_filter/${filterId}`)
      .then((res) => {
        const obj = JSON.parse(res.description);
        this.setState({
          arr: obj.arr || [],
          o: obj.o || [],
          origin: res,
        });
      });
  }

  loadQuickFilterFiled() {
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/quick_filter/fields`)
      .then((res) => {
        this.setState({
          quickFilterFiled: res,
        });
      });
  }

  loadQuickFilter() {
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/lookup_values/priority`)
      .then((res) => {
        this.setState({
          originPriorities: res.lookupValues,
        });
      });
    axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users`)
      .then((res) => {
        this.setState({
          originUsers: res.content,
        });
      });
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/lookup_values/status_category`)
      .then((res) => {
        this.setState({
          originStatus: res.lookupValues,
        });
      });
  }

  handleOk(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const arr = [];
        const expressQueryArr = [];
        const o = [];
        const f = this.state.arr.slice();
        f.forEach((v, i) => {
          if (this.state.delete.indexOf(i) !== -1) {
            return;
          }
          const a = {
            fieldId: values[`filter-${i}-prop`],
            operation: values[`filter-${i}-rule`],
            value: values[`filter-${i}-prop`] === 1 ? values[`filter-${i}-value`] : `'${values[`filter-${i}-value`]}'`,
          };
          if (i) {
            o.push(values[`filter-${i}-ao`]);
            expressQueryArr.push(values[`filter-${i}-ao`].toUpperCase());
          }
          arr.push(a);
          expressQueryArr.push(_.find(this.state.quickFilterFiled, { fieldId: a.fieldId }).name);
          expressQueryArr.push(a.operation);
          expressQueryArr.push(values[`filter-${i}-prop`] === 1 ? `${_.find(this.state.originUsers, { id: values[`filter-${i}-value`] }).loginName} ${_.find(this.state.originUsers, { id: values[`filter-${i}-value`] }).realName}` : values[`filter-${i}-value`]);
        });
        const d = new Date();
        const obj = {
          objectVersionNumber: this.state.origin.objectVersionNumber,
          expressQuery: expressQueryArr.join(' '),
          name: values.name,
          description: JSON.stringify({
            arr,
            o,
          }),
          projectId: AppState.currentMenuType.id,
          quickFilterValueDTOList: arr,
          relationOperations: o,
        };
        this.setState({
          loading: true,
        });
        axios.put(`/agile/v1/project/${AppState.currentMenuType.id}/quick_filter/${this.props.filterId}`, obj)
          .then((res) => {
            this.setState({
              loading: false,
            });
            this.props.onOk();
          });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        className="c7n-component-component"
        title="修改快速搜索"
        okText="修改"
        cancelText="取消"
        visible
        confirmLoading={this.state.loading}
        onOk={this.handleOk.bind(this)}
        onCancel={this.props.onCancel}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title={`在项目"${AppState.currentMenuType.name}"中修改快速搜索`}
          description="请在下面输入模块名称、模块概要、负责人和默认经办人策略，创建新模版。"
        >
          <Form layout="vertical">
            <FormItem>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                }],
                initialValue: this.state.origin.name,
              })(
                <Input
                  label="名称"
                  maxLength={30}
                />,
              )}
            </FormItem>
            {
              this.state.arr.map((filter, index) => (
                <div>
                  {
                    this.state.delete.indexOf(index) === -1 && (
                      <div>
                        {
                          index !== 0 && (
                            <FormItem style={{ width: 50, display: 'inline-block', marginRight: 10 }}>
                              {getFieldDecorator(`filter-${index}-ao`, {
                                rules: [{
                                  required: true,
                                }],
                                initialValue: this.state.o[index - 1],
                              })(
                                <Select label="关系">
                                  <Option key="and" value="and">AND</Option>
                                  <Option key="or" value="or">OR</Option>  
                                </Select>,
                              )}
                            </FormItem>
                          )
                        }
                        <FormItem style={{ width: 100, display: 'inline-block', marginRight: 10 }}>
                          {getFieldDecorator(`filter-${index}-prop`, {
                            rules: [{
                              required: true,
                            }],
                            initialValue: this.state.arr[index].fieldId,
                          })(
                            <Select label="属性">
                              {
                                this.state.quickFilterFiled.map(v => (
                                  <Option key={v.fieldId} value={v.fieldId}>{v.name}</Option>
                                ))
                              }
                            </Select>,
                          )}
                        </FormItem>
                        <FormItem style={{ width: 100, display: 'inline-block', marginRight: 10 }}>
                          {getFieldDecorator(`filter-${index}-rule`, {
                            rules: [{
                              required: true,
                            }],
                            initialValue: this.state.arr[index].operation,
                          })(
                            <Select label="关系">
                              <Option key="=" value="=">=</Option>
                              <Option key="!=" value="!=">!=</Option>  
                              <Option key="isNot" value="isNot">is not</Option>
                              <Option key="is" value="is">is</Option>  
                              <Option key="notIn" value="notIn">notIn</Option>
                              <Option key="in" value="in">in</Option>
                              <Option key="was" value="was">was</Option>
                              <Option key="notIn" value="notIn">notIn</Option>  
                              <Option key="wasNotIn" value="wasNotIn">wasNotIn</Option>
                              <Option key="changed" value="changed">changed</Option>  
                            </Select>,
                          )}
                        </FormItem>
                        <FormItem style={{ width: 100, display: 'inline-block' }}>
                          {getFieldDecorator(`filter-${index}-value`, {
                            rules: [{
                              required: true,
                            }],
                            initialValue: this.state.arr[index].value,
                          })(
                            <Select label="值">
                              {
                                this.props.form.getFieldValue(`filter-${index}-prop`) === 1 && this.state.originUsers.map(v => (
                                  <Option
                                    key={v.id}
                                    value={v.id}
                                  >
                                    {v.realName}
                                  </Option>
                                ))
                              }
                              {
                                this.props.form.getFieldValue(`filter-${index}-prop`) === 2 && this.state.originPriorities.map(v => (
                                  <Option
                                    key={v.valueCode}
                                    value={v.valueCode}
                                  >
                                    {v.name}
                                  </Option>
                                ))
                              }
                              {
                                this.props.form.getFieldValue(`filter-${index}-prop`) === 3 && this.state.originStatus.map(v => (
                                  <Option
                                    key={v.valueCode}
                                    value={v.valueCode}
                                  >
                                    {v.name}
                                  </Option>
                                ))
                              }
                            </Select>,
                          )}
                        </FormItem>
                        <Button
                          shape="circle"
                          style={{ margin: 10 }}
                          onClick={() => {
                            const arr = this.state.delete.slice();
                            arr.push(index);
                            this.setState({
                              delete: arr,
                            });
                          }}
                        >
                          <Icon type="delete" />
                        </Button>
                      </div>
                    )
                  }
                  
                </div>
              ))
            }
            <Button
              type="primary"
              funcTyp="flat"
              onClick={() => {
                const arr = this.state.arr.slice();
                arr.push({
                  prop: undefined,
                  rule: undefined,
                  value: undefined,
                });
                this.setState({
                  arr,
                });
              }}
            >
              <Icon type="add icon" />
              <span>添加属性</span>
            </Button>
            <FormItem>
              {getFieldDecorator('description', {})(
                <TextArea label="描述" autosize maxLength={30} />,
              )}
            </FormItem>
          </Form>
          
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(AddComponent);
