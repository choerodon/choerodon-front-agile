import React, { Component } from 'react';
import { Modal, Form, Input, Select, message, Icon } from 'choerodon-ui';
import { Content, stores, axios } from 'choerodon-front-boot';

const { Sidebar } = Modal;
const { TextArea } = Input;
const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;

class AddComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: [
        {
          prop: undefined,
          rule: undefined,
          value: undefined,
        },
        {
          prop: undefined,
          rule: undefined,
          value: undefined,
        },
      ],
      quickFilterFiled: [],
      origin: [],
    };
  }

  componentDidMount() {
    this.loadQuickFilterFiled();
  }

  loadQuickFilterFiled() {
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/quick_filter_filed`)
      .then((res) => {
        this.setState({
          quickFilterFiled: res,
        });
      });
  }

  loadQuickFilter(filterId) {
    if (filterId === 2) {
      axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/lookup_values/priority`)
        .then((res) => {
          this.setState({
            origin: res.lookupValues,
          });
        });
    } else if (filterId === 1) {
      axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users`)
        .then((res) => {
          this.setState({
            origin: res.content,
          });
        });
    } else {
      axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/lookup_values/status_category`)
        .then((res) => {
          this.setState({
            origin: res.lookupValues,
          });
        });
    }
  }

  handleOk(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        window.console.log(values);
        const arr = [];
        const o = [];
        const f = this.state.filters.slice();
        f.forEach((v, i) => {
          const a = {
            filedId: values[`filter-${i}-prop`],
            operation: values[`filter-${i}-rule`],
            value: values[`filter-${i}-prop`] === 1 ? values[`filter-${i}-value`] : `'${values[`filter-${i}-value`]}'`,
          };
          arr.push(a);
          if (i) {
            o.push(values[`filter-${i}-ao`]);
          }
        });
        window.console.log(o);
        window.console.log(arr);
        const d = new Date();
        const obj = {
          expressQuery: `${d.toGMTString()}测试`,
          name: `${d.toGMTString()}测试`,
          projectId: AppState.currentMenuType.id,
          quickFilterValueDTOList: arr,
          relationOperations: o,
        };
        axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/quick_filter`, obj);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        className="c7n-component-component"
        title="筛选器"
        okText="创建"
        cancelText="取消"
        visible={false}
        onOk={this.handleOk.bind(this)}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title={`在项目"${AppState.currentMenuType.name}"中创建筛选器`}
          description="xxxxxxxxxxxxxxxxxxx。"
        >
          <Form layout="vertical">
            {
              this.state.filters.map((filter, index) => (
                <div>
                  {
                    index !== 0 && (
                      <FormItem style={{ width: 50, display: 'inline-block', marginRight: 10 }}>
                        {getFieldDecorator(`filter-${index}-ao`, {
                          rules: [{
                            required: true,
                          }],
                        })(
                          <Select>
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
                    })(
                      <Select>
                        {
                          this.state.quickFilterFiled.map(v => (
                            <Option key={v.filedId} value={v.filedId}>{v.name}</Option>
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
                    })(
                      <Select>
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
                    })(
                      <Select
                        onFocus={() => {
                          this.loadQuickFilter(this.props.form.getFieldValue(`filter-${index}-prop`));
                        }}
                      >
                        {
                          this.state.origin.map(v => (
                            <Option
                              key={v.valueCode || v.id}
                              value={v.valueCode || v.id}
                            >
                              {v.realName || v.name}
                            </Option>
                          ))
                        }
                      </Select>,
                    )}
                  </FormItem>
                  <Icon
                    role="none"
                    type="add"
                    onClick={() => {
                      const arr = this.state.filters.slice();
                      arr.push({
                        prop: undefined,
                        rule: undefined,
                        value: undefined,
                      });
                      this.setState({
                        filters: arr,
                      });
                    }}
                  />
                  <Icon
                    role="none"
                    type="delete"
                  />
                </div>
              ))
            }
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(AddComponent);
